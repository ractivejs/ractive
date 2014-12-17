import { defineProperty } from 'utils/object';
import { getKeypath } from 'shared/keypaths';
import getFunctionFromString from 'shared/getFunctionFromString';
import createReferenceResolver from './createReferenceResolver';
import 'legacy'; // for fn.bind()

var ExpressionResolver, bind = Function.prototype.bind;

ExpressionResolver = function ( owner, parentFragment, expression, callback ) {
	var ractive;

	ractive = owner.root;

	this.root = ractive;
	this.parentFragment = parentFragment;
	this.callback = callback;
	this.owner = owner;
	this.str = expression.s;
	this.keypaths = [];

	// Create resolvers for each reference
	this.pending = expression.r.length;
	this.refResolvers = expression.r.map( ( ref, i ) => {
		return createReferenceResolver( this, ref, keypath => {
			this.resolve( i, keypath );
		});
	});

	this.ready = true;
	this.bubble();
};

ExpressionResolver.prototype = {
	bubble () {
		if ( !this.ready ) {
			return;
		}

		this.uniqueString = getUniqueString( this.str, this.keypaths );
		this.keypath = createExpressionKeypath( this.uniqueString );

		this.createEvaluator();
		this.callback( this.keypath );
	},

	unbind () {
		var resolver;

		while ( resolver = this.refResolvers.pop() ) {
			resolver.unbind();
		}
	},

	resolve ( index, keypath ) {
		this.keypaths[ index ] = keypath;
		this.bubble();
	},

	createEvaluator () {
		var computation, valueGetters, signature, keypath, fn;

		keypath = this.keypath;
		computation = this.root.viewmodel.computations[ keypath.str ];

		// only if it doesn't exist yet!
		if ( !computation ) {
			fn = getFunctionFromString( this.str, this.refResolvers.length );

			valueGetters = this.keypaths.map( keypath => {
				var value;

				if ( keypath === 'undefined' ) {
					return () => undefined;
				}

				// 'special' keypaths encode a value
				if ( keypath.isSpecial ) {
					value = keypath.value;
					return () => value;
				}

				return () => {
					var value = this.root.viewmodel.get( keypath, { noUnwrap: true });
					if ( typeof value === 'function' ) {
						value = wrapFunction( value, this.root );
					}
					return value;
				};
			});

			signature = {
				deps: this.keypaths.filter( isValidDependency ),
				get () {
					var args = valueGetters.map( call );
					return fn.apply( null, args );
				}
			};

			computation = this.root.viewmodel.compute( keypath, signature );
		} else {
			this.root.viewmodel.mark( keypath );
		}
	},

	rebind ( oldKeypath, newKeypath ) {
		// TODO only bubble once, no matter how many references are affected by the rebind
		this.refResolvers.forEach( r => r.rebind( oldKeypath, newKeypath ) );
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

		if ( keypath.isSpecial ) {
			value = keypath.value;
			return typeof value === 'number' ? value : '"' + value + '"';
		}

		return keypath.str;
	});
}

function createExpressionKeypath ( uniqueString ) {
	// Sanitize by removing any periods or square brackets. Otherwise
	// we can't split the keypath into keys!
	// Remove asterisks too, since they mess with pattern observers
	return getKeypath( '${' + uniqueString.replace( /[\.\[\]]/g, '-' ).replace( /\*/, '#MUL#' ) + '}' );
}

function isValidDependency ( keypath ) {
	return keypath !== undefined && keypath[0] !== '@';
}

function wrapFunction ( fn, ractive ) {
	var wrapped, prop, key;

	if ( fn.__ractive_nowrap ) {
		return fn;
	}

	prop = '__ractive_' + ractive._guid;
	wrapped = fn[ prop ];

	if ( wrapped ) {
		return wrapped;
	}

	else if ( /this/.test( fn.toString() ) ) {
		defineProperty( fn, prop, {
			value: bind.call( fn, ractive ),
			configurable: true
		});

		// Add properties/methods to wrapped function
		for ( key in fn ) {
			if ( fn.hasOwnProperty( key ) ) {
				fn[ prop ][ key ] = fn[ key ];
			}
		}

		ractive._boundFunctions.push({
			fn: fn,
			prop: prop
		});

		return fn[ prop ];
	}

	defineProperty( fn, '__ractive_nowrap', {
		value: fn
	});

	return fn.__ractive_nowrap;
}
