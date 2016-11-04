import config from '../config/config';
import Hook from '../../events/Hook';
import runloop from '../../global/runloop';
import dataConfigurator from '../config/custom/data';

const shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ];

const completeHook = new Hook( 'complete' );
const resetHook = new Hook( 'reset' );
const renderHook = new Hook( 'render' );
const unrenderHook = new Hook( 'unrender' );

export default function Ractive$reset ( data ) {
	data = data || {};

	if ( typeof data !== 'object' ) {
		throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
	}

	// TEMP need to tidy this up
	data = dataConfigurator.init( this.constructor, this, { data });

	const promise = runloop.start( this, true );

	// If the root object is wrapped, try and use the wrapper's reset value
	const wrapper = this.viewmodel.wrapper;
	if ( wrapper && wrapper.reset ) {
		if ( wrapper.reset( data ) === false ) {
			// reset was rejected, we need to replace the object
			this.viewmodel.set( data );
		}
	} else {
		this.viewmodel.set( data );
	}

	// reset config items and track if need to rerender
	const changes = config.reset( this );
	let rerender;

	let i = changes.length;
	while ( i-- ) {
		if ( shouldRerender.indexOf( changes[i] ) > -1 ) {
			rerender = true;
			break;
		}
	}

	if ( rerender ) {
		unrenderHook.fire( this );
		this.fragment.resetTemplate( this.template );
		renderHook.fire( this );
		completeHook.fire( this );
	}

	runloop.end();

	resetHook.fire( this, data );

	return promise;
}
