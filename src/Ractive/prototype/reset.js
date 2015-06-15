import config from 'Ractive/config/config';
import Fragment from 'virtualdom/Fragment';
import Hook from './shared/hooks/Hook';
import runloop from 'global/runloop';

var shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ],
	resetHook = new Hook( 'reset' );

export default function Ractive$reset ( data ) {
	data = data || {};

	if ( typeof data !== 'object' ) {
		throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
	}

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
		let component;

		// Is this is a component, we need to set the `shouldDestroy`
	 	// flag, otherwise it will assume by default that a parent node
	 	// will be detached, and therefore it doesn't need to bother
	 	// detaching its own nodes
	 	if ( component = this.component ) {
	 		component.shouldDestroy = true;
	 	}

		this.unrender();

		if ( component ) {
			component.shouldDestroy = false;
		}

		// If the template changed, we need to destroy the parallel DOM
		// TODO if we're here, presumably it did?
		if ( this.fragment.template !== this.template ) {
			this.fragment.unbind();

			this.fragment = new Fragment({
				template: this.template,
				root: this,
				owner: this
			});
		}

		// change return value. TODO this seems kinda hacky
		promise = this.render( this.el, this.anchor );
	}

	runloop.end();

	resetHook.fire( this, data );

	return promise;
}
