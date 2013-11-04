define([
	'config/types',
	'utils/isEqual',
	'utils/defineProperty',
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	types,
	isEqual,
	defineProperty,
	registerDependant,
	unregisterDependant
) {
	
	'use strict';

	var Reference, thisPattern;

	thisPattern = /this/;

	Reference = function ( root, keypath, evaluator, argNum, priority ) {
		var value;

		this.evaluator = evaluator;
		this.keypath = keypath;
		this.root = root;
		this.argNum = argNum;
		this.type = types.REFERENCE;
		this.priority = priority;

		value = root.get( keypath );

		if ( typeof value === 'function' ) {
			value = value._wrapped || wrapFunction( value, root, evaluator );
		}

		this.value = evaluator.values[ argNum ] = value;

		registerDependant( this );
	};

	Reference.prototype = {
		update: function () {
			var value = this.root.get( this.keypath );

			if ( typeof value === 'function' && !value._nowrap ) {
				value = value[ '_' + this.root._guid ] || wrapFunction( value, this.root, this.evaluator );
			}

			if ( !isEqual( value, this.value ) ) {
				this.evaluator.values[ this.argNum ] = value;
				this.evaluator.bubble();

				this.value = value;
			}
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};

	return Reference;


	function wrapFunction ( fn, ractive, evaluator ) {
		var prop;

		// if the function doesn't refer to `this`, we don't need
		// to set the context
		if ( !thisPattern.test( fn.toString() ) ) {
			defineProperty( fn, '_nowrap', { // no point doing this every time
				value: true
			});
			return fn;
		}

		// otherwise, we do
		defineProperty( fn, '_' + ractive._guid, {
			value: function () {
				var originalGet, result, softDependencies;

				originalGet = ractive.get;
				ractive.get = function ( keypath ) {
					if ( !softDependencies ) {
						softDependencies = [];
					}

					if ( !softDependencies[ keypath ] ) {
						softDependencies[ softDependencies.length ] = keypath;
						softDependencies[ keypath ] = true;
					}
					
					return originalGet.call( ractive, keypath );
				};
				
				result = fn.apply( ractive, arguments );
				
				if ( softDependencies ) {
					evaluator.updateSoftDependencies( softDependencies );
				}

				// reset
				ractive.get = originalGet;
				
				return result;
			},
			writable: true
		});

		for ( prop in fn ) {
			if ( fn.hasOwnProperty( prop ) ) {
				fn[ '_' + ractive._guid ][ prop ] = fn[ prop ];
			}
		}

		return fn[ '_' + ractive._guid ];
	}

});