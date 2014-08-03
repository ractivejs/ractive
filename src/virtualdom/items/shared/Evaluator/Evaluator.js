import log from 'utils/log';
import isEqual from 'utils/isEqual';
import defineProperty from 'utils/defineProperty';
import diff from 'viewmodel/Computation/diff'; // TODO this is a red flag... should be treated the same?
import 'legacy'; // for fn.bind()

var Evaluator, cache = {}, bind = Function.prototype.bind;

Evaluator = function ( root, keypath, uniqueString, functionStr, args, priority ) {
	var evaluator = this, viewmodel = root.viewmodel;

	evaluator.root = root;
	evaluator.viewmodel = viewmodel;
	evaluator.uniqueString = uniqueString;
	evaluator.keypath = keypath;
	evaluator.priority = priority;

	evaluator.fn = getFunctionFromString( functionStr, args.length );
	evaluator.explicitDependencies = [];
	evaluator.dependencies = []; // created by `this.get()` within functions

	evaluator.argumentGetters = args.map( arg => {
		var keypath, index;

		if ( !arg ) {
			return void 0;
		}

		if ( arg.indexRef ) {
			index = arg.value;
			return index;
		}

		keypath = arg.keypath;
		evaluator.explicitDependencies.push( keypath );
		viewmodel.register( keypath, evaluator, 'computed' );

		return function () {
			var value = viewmodel.get( keypath );
			return typeof value === 'function' ? wrap( value, root ) : value;
		};
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
		var args, value, newImplicitDependencies;

		args = this.argumentGetters.map( call );

		if ( this.updating ) {
			// Prevent infinite loops caused by e.g. in-place array mutations
			return;
		}

		this.updating = true;

		this.viewmodel.capture();

		try {
			value = this.fn.apply( null, args );
		} catch ( err ) {
			if ( this.root.debug ) {
				log.warn({
					debug: this.root.debug,
					message: 'evaluationError',
					args: {
						uniqueString: this.uniqueString,
						err: err.message || err
					}
				});
			}

			value = undefined;
		}

		newImplicitDependencies = this.viewmodel.release();
		diff( this, this.dependencies, newImplicitDependencies );

		this.updating = false;

		return value;
	},

	update: function () {
		var value = this.getValue();

		if ( !isEqual( value, this.value ) ) {
			this.value = value;
			this.root.viewmodel.mark( this.keypath );
		}

		return this;
	},

	// TODO should evaluators ever get torn down? At present, they don't...
	teardown: function () {
		this.explicitDependencies.concat( this.dependencies ).forEach( keypath => this.viewmodel.unregister( keypath, this, 'computed' ) );
		this.root.viewmodel.evaluators[ this.keypath ] = null;
	}
};

export default Evaluator;

function getFunctionFromString ( str, i ) {
	var fn, args;

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
	var wrapped, prop, key;

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
			value: bind.call( fn, ractive )
		});

		// Add properties/methods to wrapped function
		for ( key in fn ) {
			if ( fn.hasOwnProperty( key ) ) {
				fn[ prop ][ key ] = fn[ key ];
			}
		}

		return fn[ prop ];
	}

	defineProperty( fn, '__ractive_nowrap', {
		value: fn
	});

	return fn.__ractive_nowrap;
}

function call ( arg ) {
	return typeof arg === 'function' ? arg() : arg;
}
