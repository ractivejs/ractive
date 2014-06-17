import runloop from 'global/runloop';
import log from 'utils/log';
import isEqual from 'utils/isEqual';
import notifyDependants from 'shared/notifyDependants';
import Reference from 'virtualdom/items/shared/Evaluator/Reference';
import SoftReference from 'virtualdom/items/shared/Evaluator/SoftReference';

var Evaluator, cache = {};

Evaluator = function ( root, keypath, uniqueString, functionStr, args, priority ) {
	var evaluator = this;

	evaluator.root = root;
	evaluator.uniqueString = uniqueString;
	evaluator.keypath = keypath;
	evaluator.priority = priority;

	evaluator.fn = getFunctionFromString( functionStr, args.length );
	evaluator.values = [];
	evaluator.refs = [];

	evaluator.dependants = 0;

	args.forEach( function ( arg, i ) {
		if ( !arg ) {
			return;
		}

		if ( arg.indexRef ) {
			// this is an index ref... we don't need to register a dependant
			evaluator.values[i] = arg.value;
		}

		else {
			evaluator.refs.push( new Reference( root, arg.keypath, evaluator, i, priority ) );
		}
	});
};

Evaluator.prototype = {
	wake: function () {
		this.awake = true;
	},

	sleep: function () {
		this.awake = false;
		runloop.modelUpdate( this, true ); // cancel pending update, if there is one
	},

	bubble: function () {
		if ( !this.dirty && this.awake ) {
			// Re-evaluate once all changes have propagated
			this.dirty = true;
			runloop.modelUpdate( this );
		}
	},

	getValue: function () {
		var value;

		try {
			value = this.fn.apply( null, this.values );
		} catch ( err ) {

			log.warn({
				debug: this.root.debug,
				message: 'evaluationError',
				args: {
					uniqueString: this.uniqueString,
					err: err.message || err
				}
			});

			value = undefined;
		}

		return value;
	},

	update: function () {
		var value = this.getValue();

		if ( !isEqual( value, this.value ) ) {
			this.value = value;

			this.root.viewmodel.clearCache( this.keypath );

			this.root.viewmodel.adapt( this.keypath, value, true );
			notifyDependants( this.root, this.keypath );
		}

		return this;
	},

	// TODO should evaluators ever get torn down? At present, they don't...
	teardown: function () {
		while ( this.refs.length ) {
			this.refs.pop().teardown();
		}

		this.root.viewmodel.clearCache( this.keypath );
		this.root.viewmodel.evaluators[ this.keypath ] = null;
	},

	invalidate: function () {
		this.refs.forEach( ref => ref.invalidate() );

		this.root.viewmodel.clearCache( this.keypath );
		this.value = this.getValue();
	},

	updateSoftDependencies: function ( softDeps ) {
		var i, keypath, ref;

		if ( !this.softRefs ) {
			this.softRefs = [];
		}

		// teardown any references that are no longer relevant
		i = this.softRefs.length;
		while ( i-- ) {
			ref = this.softRefs[i];
			if ( !softDeps[ ref.keypath ] ) {
				this.softRefs.splice( i, 1 );
				this.softRefs[ ref.keypath ] = false;
				ref.teardown();
			}
		}

		// add references for any new soft dependencies
		i = softDeps.length;
		while ( i-- ) {
			keypath = softDeps[i];
			if ( !this.softRefs[ keypath ] ) {
				ref = new SoftReference( this.root, keypath, this );
				this.softRefs.push( ref );
				this.softRefs[ keypath ] = true;
			}
		}
	}
};

export default Evaluator;

function getFunctionFromString ( str, i ) {
	var fn, args;

	str = str.replace( /\$\{([0-9]+)\}/g, '_$1' );

	if ( cache[ str ] ) {
		return cache[ str ];
	}

	args = [];
	while ( i-- ) {
		args[i] = '_' + i;
	}

	fn = new Function( args.join( ',' ), 'return(' + str + ')' );

	cache[ str ] = fn;
	return fn;
}
