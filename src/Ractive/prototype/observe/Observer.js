import runloop from 'global/runloop';
import { isEqual } from 'utils/is';

const NEW_VALUE = 0, OLD_VALUE = 1

class Observer {

	constructor ( bindingContext, callback, options, keys ) {

		this.context = bindingContext;
		this.callback = callback;
		this.callbackContext = options.context;
		this.defer = options.defer;
		this.init = options.init;

		this.args = [ null, null, this.context.getKeypath() ];
		if ( keys && keys.length ) {
			this.args = this.args.concat( keys );
		}

		this.updating = false;

		this.initing = true;
		this.context.registerObserver( this );
		this.initing = false;
	}

	setValue ( value ) {

		const args = this.args;
		args[ OLD_VALUE ] = args[ NEW_VALUE ];
		args[ NEW_VALUE ] = value;

		if ( this.initing && !this.init ) {
			return;
		}

		if ( !isEqual( value, args[ OLD_VALUE ] ) ) {

			if ( this.defer ) {
				runloop.scheduleTask( () => this.update() );
			} else {
				this.update();
			}
		}
	}

	update () {
		// Prevent infinite loops
		if ( this.updating ) {
			return;
		}

		this.updating = true;
		this.callback.apply( this.callbackContext, this.args );
		this.updating = false;
	}

	cancel () {
		this.context.unregisterObserver( this );
	}
}

export default Observer;
