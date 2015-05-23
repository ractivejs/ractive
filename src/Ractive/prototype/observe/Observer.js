import runloop from 'global/runloop';
import { isEqual } from 'utils/is';

const NEW_VALUE = 0, OLD_VALUE = 1

class Observer {

	constructor ( bindingContext, callback, options, keys ) {

		const context = this.context = bindingContext;
		this.callback = callback;
		this.callbackContext = options.context;
		this.defer = options.defer;
		this.init = options.init;
		this.updating = false;

		this.args = [ void 0, void 0, context.getKeypath() ];

		if ( keys && keys.length ) {
			this.args = this.args.concat( keys );
		}

		context.register( 'setValue', this, true );

		this.captureValues( context.get() );

		if ( options.init ) {
			this.fire();
		}

	}

	captureValues ( value ) {
		const args = this.args;
		args[ OLD_VALUE ] = args[ NEW_VALUE ];
		args[ NEW_VALUE ] = value;
	}

	setValue ( value, initing ) {

		this.captureValues( value );

		if ( this.hasChanged() ) {
			this.fire();
		}
	}

	hasChanged () {
		const args = this.args;
		return !isEqual( args[ NEW_VALUE ], args[ OLD_VALUE ] );
	}

	fire () {
		if ( this.defer ) {
			runloop.scheduleTask( () => this.update() );
		} else {
			this.update();
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
		this.context.unregister( 'setValue', this );
	}
}

export default Observer;
