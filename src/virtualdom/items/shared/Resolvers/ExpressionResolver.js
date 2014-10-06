import removeFromArray from 'utils/removeFromArray';
import defineProperty from 'utils/defineProperty';
import resolveRef from 'shared/resolveRef';
import Unresolved from 'shared/Unresolved';
import Evaluator from 'virtualdom/items/shared/Evaluator/Evaluator';
import getFunctionFromString from 'shared/getFunctionFromString';
import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';
import 'legacy'; // for fn.bind()

var ExpressionResolver, bind = Function.prototype.bind;

ExpressionResolver = function ( owner, parentFragment, expression, callback ) {

	var expressionResolver = this, ractive, indexRefs, args;

	ractive = owner.root;

	this.root = ractive;
	this.callback = callback;
	this.owner = owner;
	this.str = expression.s;
	this.args = args = [];

	this.unresolved = [];
	this.pending = 0;

	indexRefs = parentFragment.indexRefs;

	// some expressions don't have references. edge case, but, yeah.
	if ( !expression.r || !expression.r.length ) {
		this.resolved = this.ready = true;
		this.bubble();
		return;
	}

	// Create resolvers for each reference
	expression.r.forEach( function ( reference, i ) {
		var index, keypath, unresolved;

		// Is this an index reference?
		if ( indexRefs && ( index = indexRefs[ reference ] ) !== undefined ) {
			args[i] = {
				indexRef: reference,
				value: index
			};
			return;
		}

		// Can we resolve it immediately?
		if ( keypath = resolveRef( ractive, reference, parentFragment ) ) {
			args[i] = { keypath: keypath };
			return;
		} else if ( reference === '.' ) { // special case of context reference to root
			args[i] = { '': '' };
			return;
		}

		// Couldn't resolve yet
		args[i] = null;
		expressionResolver.pending += 1;

		unresolved = new Unresolved( ractive, reference, parentFragment, function ( keypath ) {
			expressionResolver.resolve( i, keypath );
			removeFromArray( expressionResolver.unresolved, unresolved );
		});

		expressionResolver.unresolved.push( unresolved );
	});

	this.ready = true;
	this.bubble();
};

ExpressionResolver.prototype = {
	bubble: function () {
		if ( !this.ready ) {
			return;
		}

		this.uniqueString = getUniqueString( this.str, this.args );
		this.keypath = getKeypath( this.uniqueString );

		this.createEvaluator();
		this.callback( this.keypath );
	},

	unbind: function () {
		var unresolved;

		while ( unresolved = this.unresolved.pop() ) {
			unresolved.unbind();
		}
	},

	resolve: function ( index, keypath ) {
		this.args[ index ] = { keypath: keypath };
		this.bubble();

		// when all references have been resolved, we can flag the entire expression
		// as having been resolved
		this.resolved = !( --this.pending );
	},

	createEvaluator: function () {
		var self = this, computation, signature, keypaths = [], i, args, arg, fn;

		computation = this.root.viewmodel.computations[ this.keypath ];

		// only if it doesn't exist yet!
		if ( !computation ) {
			i = this.args.length;
			while ( i-- ) {
				arg = this.args[i];

				if ( arg && arg.keypath ) {
					keypaths.push( arg.keypath );
				}
			}

			fn = getFunctionFromString( this.str, this.args.length );

			signature = {
				deps: keypaths,
				get: function () {
					args = self.args.map( arg => {
						var value;

						if ( !arg ) {
							console.log( 'TODO no arg' );
							return undefined;
						} else if ( arg.indexRef ) {
							value = arg.value;
						} else {
							value = self.root.viewmodel.get( arg.keypath );

							if ( typeof value === 'function' ) {
								value = wrapFunction( value, self.root );
							}
						}

						return value;
					});

					return fn.apply( null, args );
				}
			};

			computation = this.root.viewmodel.compute( this.keypath, signature );
		}

		// TODO is this necessary?
		this.root.viewmodel.mark( this.keypath );
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var changed;

		this.args.forEach( function ( arg ) {
			var changedKeypath;

			if ( !arg ) return;

			if ( arg.keypath && ( changedKeypath = getNewKeypath( arg.keypath, oldKeypath, newKeypath ) ) ) {
				arg.keypath = changedKeypath;
				changed = true;
			}

			else if ( arg.indexRef && ( arg.indexRef === indexRef ) ) {
				arg.value = newIndex;
				changed = true;
			}
		});

		if ( changed ) {
			this.bubble();
		}
	}
};

export default ExpressionResolver;

function getUniqueString ( str, args ) {
	// get string that is unique to this expression
	return str.replace( /_([0-9]+)/g, function ( match, $1 ) {
		var arg = args[ $1 ];

		if ( !arg ) return 'undefined';
		if ( arg.indexRef ) return arg.value;
		return arg.keypath;
	});
}

function getKeypath ( uniqueString ) {
	// Sanitize by removing any periods or square brackets. Otherwise
	// we can't split the keypath into keys!
	return '${' + uniqueString.replace( /[\.\[\]]/g, '-' ) + '}';
}

function wrapFunction ( fn, ractive ) {
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
