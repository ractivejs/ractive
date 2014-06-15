import runloop from 'global/runloop';
import warn from 'utils/warn';
import isEqual from 'utils/isEqual';
import defineProperty from 'utils/defineProperty';

var Evaluator, cache = {};

Evaluator = function ( root, keypath, uniqueString, functionStr, args, priority ) {
	var evaluator = this, viewmodel = root.viewmodel;

	evaluator.root = root;
	evaluator.uniqueString = uniqueString;
	evaluator.keypath = keypath;
	evaluator.priority = priority;

	evaluator.fn = getFunctionFromString( functionStr, args.length );
	evaluator.dependencies = [];

	evaluator.argumentGetters = args.map( arg => {
		var keypath;

		if ( !arg ) {
			return () => undefined;
		}

		if ( arg.indexRef ) {
			return () => arg.value;
		}

		keypath = arg.keypath;
		evaluator.dependencies.push( keypath );
		viewmodel.register( keypath, evaluator, 'computed' );

		return function () {
			var value = viewmodel.get( keypath );
			return typeof value === 'function' ? wrap( value, root ) : value;
		}
	});
};

Evaluator.prototype = {
	wake: function () {
		this.awake = true;
	},

	sleep: function () {
		this.awake = false;
	},

	getValue: function () {
		var args, value;

		args = this.argumentGetters.map( fn => fn() );

		try {
			value = this.fn.apply( null, args );
		} catch ( err ) {
			if ( this.root.debug ) {
				warn( 'Error evaluating "' + this.uniqueString + '": ' + err.message || err );
			}

			value = undefined;
		}

		return value;
	},

	update: function () {
		var value = this.getValue();

		if ( !isEqual( value, this.value ) ) {
			this.value = value;

			this.root.viewmodel.adapt( this.keypath, value, true );
			this.root.viewmodel.mark( this.keypath );
		}

		return this;
	},

	// TODO should evaluators ever get torn down? At present, they don't...
	teardown: function () {
		this.dependencies.forEach( keypath => this.viewmodel.unregister( keypath, this, 'computed' ) );
		this.root.viewmodel.evaluators[ this.keypath ] = null;
	},

	invalidate: function () {
		this.root.viewmodel.mark( this.keypath );
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

function wrap ( fn, ractive ) {
	var wrapped, prop;

	if ( fn._noWrap ) {
		return fn;
	}

	prop = '__ractive_' + ractive._guid;
	wrapped = fn[ prop ];

	if ( wrapped ) {
		return wrapped;
	}

	else if ( /this/.test( fn.toString() ) ) {
		defineProperty( fn, prop, {
			value: fn.bind( ractive )
		});

		return fn[ prop ];
	}

	defineProperty( fn, '__ractive_nowrap', {
		value: fn
	});

	return fn.__ractive_nowrap;
}
