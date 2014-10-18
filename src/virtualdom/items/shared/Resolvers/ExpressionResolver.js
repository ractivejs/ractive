import defineProperty from 'utils/defineProperty';
import isNumeric from 'utils/isNumeric';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import getFunctionFromString from 'shared/getFunctionFromString';
import 'legacy'; // for fn.bind()

var ExpressionResolver, bind = Function.prototype.bind;

ExpressionResolver = function ( owner, parentFragment, expression, callback ) {

	var resolver = this, ractive, indexRefs;

	ractive = owner.root;

	resolver.root = ractive;
	resolver.parentFragment = parentFragment;
	resolver.callback = callback;
	resolver.owner = owner;
	resolver.str = expression.s;
	resolver.keypaths = [];

	indexRefs = parentFragment.indexRefs;

	// Create resolvers for each reference
	resolver.pending = expression.r.length;
	resolver.refResolvers = expression.r.map( ( ref, i ) => {
		return createReferenceResolver( resolver, ref, function ( keypath ) {
			resolver.resolve( i, keypath );
		});
	});

	resolver.ready = true;
	resolver.bubble();
};

ExpressionResolver.prototype = {
	bubble: function () {
		if ( !this.ready ) {
			return;
		}

		this.uniqueString = getUniqueString( this.str, this.keypaths );
		this.keypath = getKeypath( this.uniqueString );

		this.createEvaluator();
		this.callback( this.keypath );
	},

	unbind: function () {
		var resolver;

		while ( resolver = this.refResolvers.pop() ) {
			resolver.unbind();
		}
	},

	resolve: function ( index, keypath ) {
		this.keypaths[ index ] = keypath;
		this.bubble();
	},

	createEvaluator: function () {
		var self = this, computation, valueGetters, signature, keypath, fn;

		computation = this.root.viewmodel.computations[ this.keypath ];

		// only if it doesn't exist yet!
		if ( !computation ) {
			fn = getFunctionFromString( this.str, this.keypaths.length );

			valueGetters = this.keypaths.map( keypath => {
				var value;

				if ( keypath === 'undefined' ) {
					return () => undefined;
				}

				// 'special' keypaths encode a value
				if ( keypath[0] === '@' ) {
					value = keypath.slice( 1 );
					return isNumeric( value ) ? () => +value : () => value;
				}

				return () => {
					var value = this.root.viewmodel.get( keypath );
					if ( typeof value === 'function' ) {
						value = wrapFunction( value, self.root );
					}
					return value;
				};
			});

			signature = {
				deps: this.keypaths.filter( isValidDependency ),
				get: function () {
					var args = valueGetters.map( call );
					return fn.apply( null, args );
				}
			};

			computation = this.root.viewmodel.compute( this.keypath, signature );
		} else {
			this.root.viewmodel.mark( this.keypath );
		}
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		// TODO only bubble once, no matter how many references are affected by the rebind
		this.refResolvers.forEach( r => r.rebind( indexRef, newIndex, oldKeypath, newKeypath ) );
	}
};

export default ExpressionResolver;

function call ( value ) {
	return value.call();
}

function getUniqueString ( str, keypaths ) {
	// get string that is unique to this expression
	return str.replace( /_([0-9]+)/g, function ( match, $1 ) {
		var keypath, value;

		keypath = keypaths[ $1 ];

		if ( keypath === undefined ) {
			return 'undefined';
		}

		if ( keypath[0] === '@' ) {
			value = keypath.slice( 1 );
			return isNumeric( value ) ? value : '"' + value + '"';
		}

		return keypath;
	});
}

function getKeypath ( uniqueString ) {
	// Sanitize by removing any periods or square brackets. Otherwise
	// we can't split the keypath into keys!
	return '${' + uniqueString.replace( /[\.\[\]]/g, '-' ) + '}';
}

function isValidDependency ( keypath ) {
	return keypath !== undefined && keypath[0] !== '@';
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
