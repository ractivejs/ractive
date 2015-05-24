import runloop from 'global/runloop';
import { isEqual } from 'utils/is';

export default function getObserver ( context, callback, options, keys ) {
	if ( options.type === 'list' ) {
		return new ListObserver( context, callback, options, keys );
	}
	else {
		return new ValueObserver( context, callback, options, keys );
	}
}

class Observer {

	constructor ( bindingContext, callback, options, args, keys ) {

		const context = this.context = bindingContext;
		this.callback = callback;
		this.callbackContext = options.context;
		this.defer = options.defer;
		this.strict = options.strict;
		this.updating = false;

		this.args = ( keys && keys.length ) ? args.concat( keys ) : args;
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
		// no-op
	}
}

const NEW_VALUE = 0, OLD_VALUE = 1;

class ValueObserver extends Observer {

	constructor ( bindingContext, callback, options, keys ) {

		const args = [ void 0, void 0, bindingContext.getKeypath() ];

		super( bindingContext, callback, options, args, keys );

		bindingContext.register( 'setValue', this, true );

		this.captureValues( bindingContext.get() );

		if ( options.init ) {
			this.fire();
		}

	}

	captureValues ( value ) {
		const args = this.args;
		args[ OLD_VALUE ] = args[ NEW_VALUE ];
		args[ NEW_VALUE ] = value;
	}

	setValue ( value ) {

		this.captureValues( value );

		if ( this.hasChanged() ) {
			this.fire();
		}
	}

	hasChanged () {
		const args = this.args;
		if ( this.strict ) {
			return args[ NEW_VALUE ] !== args[ OLD_VALUE ];
		}
		else {
			return !isEqual( args[ NEW_VALUE ], args[ OLD_VALUE ] );
		}
	}

	cancel () {
		this.context.unregister( 'setValue', this );
	}
}

class ListObserver extends Observer {

	constructor ( bindingContext, callback, options, keys ) {

		const args = [ void 0, bindingContext.getKeypath() ];

		super( bindingContext, callback, options, args, keys );

		bindingContext.register( 'updateMembers', this, true );
	}

	updateMembers ( shuffle ) {
		this.args[ NEW_VALUE ] = shuffle;
		this.fire();
	}


}
