import runloop from 'global/runloop';
import { isEqual } from 'utils/is';

export default function getObserver ( context, callback, options, keys ) {
	const Observer = options.type === 'list' ? ListObserver : ValueObserver;
	return new Observer( context, callback, options, keys );
}

class Observer {

	constructor ( context, callback, options, method, args, keys ) {

		this.context = context;
		this.callback = callback;
		this.thisArg = options.context;
		this.defer = options.defer;
		this.strict = options.strict;
		this.method = method;
		this.args = ( keys && keys.length ) ? args.concat( keys ) : args;
		this.updating = false;

		context.register( method, this, true );
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
		this.callback.apply( this.thisArg, this.args );
		this.updating = false;
	}

	cancel () {
		this.context.unregister( this.method, this );
	}
}

const NEW_VALUE = 0, OLD_VALUE = 1;

class ValueObserver extends Observer {

	constructor ( context, callback, options, keys ) {

		super( context, callback, options, 'setValue',
			[ void 0, void 0, context.getKeypath() ], keys );

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
}

class ListObserver extends Observer {

	constructor ( context, callback, options, keys ) {
		super( context, callback, options, 'setMembers',
			[ void 0, context.getKeypath() ], keys );

		this.oldArraySliced = null;

		this.captureValues({ inserted: this.getSliceOfCurrent() });

		if ( options.init ) {
			this.fire();
		}
	}

	captureValues ( shuffle ) {

		const currentValue = this.getSliceOfCurrent() || [],
			  argValue = {
			  	  inserted: shuffle.inserted || currentValue,
				  deleted: shuffle.deleted
			  };

		if ( shuffle.mergeMap ) {
			argValue.mergeMap = shuffle.mergeMap;
		}
		else if ( shuffle.splice ) {
			argValue.start = shuffle.splice.start;
		}
		else {
			argValue.deleted = this.oldArraySliced || [];
		}

		this.args[ NEW_VALUE ] = argValue;
		this.oldArraySliced = currentValue;
	}

	getSliceOfCurrent () {
		const value = this.context.get();
		return ( value && value.slice ) ? value.slice() : [];
	}

	setMembers ( shuffle ) {
		this.captureValues( shuffle );
		this.fire();
	}
}
