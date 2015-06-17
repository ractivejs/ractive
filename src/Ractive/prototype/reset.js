import config from 'Ractive/config/config';
import Fragment from 'virtualdom/Fragment';
import Hook from 'events/Hook';
import runloop from 'global/runloop';
import dataConfigurator from 'Ractive/config/custom/data';

var shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ],
	resetHook = new Hook( 'reset' );

export default function Ractive$reset ( data ) {
	data = data || {};

	if ( typeof data !== 'object' ) {
		throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
	}

	// TEMP need to tidy this up
	data = dataConfigurator.init( this.constructor, this, { data });

	let promise = runloop.start( this, true );

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
		this.fragment.resetTemplate( this.template );
	}

	runloop.end();

	resetHook.fire( this, data );

	return promise;
}
