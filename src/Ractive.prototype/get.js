// TODO use dontNormalise
// TODO refactor this shitball

(function ( proto ) {

	var wrapProperty;

	proto.get = function ( keypath ) {
		var cache, cacheMap, keys, normalised, key, parentKeypath, parentValue, value, ignoreUndefined;

		if ( !keypath ) {
			return this.data;
		}

		cache = this._cache;

		if ( isArray( keypath ) ) {
			if ( !keypath.length ) {
				return this.data;
			}

			keys = keypath.slice(); // clone
			normalised = keys.join( '.' );

			ignoreUndefined = true; // because this should be a branch, sod the cache
		}

		else {
			// cache hit? great
			if ( hasOwn.call( cache, keypath ) && cache[ keypath ] !== UNSET ) {
				return cache[ keypath ];
			}

			keys = splitKeypath( keypath );
			normalised = keys.join( '.' );
		}

		// we may have a cache hit now that it's been normalised
		if ( hasOwn.call( cache, normalised ) && cache[ normalised ] !== UNSET ) {
			if ( cache[ normalised ] === undefined && ignoreUndefined ) {
				// continue
			} else {
				return cache[ normalised ];
			}
		}

		// is this an uncached evaluator value?
		if ( this._evaluators[ normalised ] ) {
			value = this._evaluators[ normalised ].value;
			cache[ normalised ] = value;
			return value;
		}

		// otherwise it looks like we need to do some work
		key = keys.pop();
		parentKeypath = keys.join( '.' );
		parentValue = ( keys.length ? this.get( keys ) : this.data );

		if ( parentValue === null || parentValue === undefined || parentValue === UNSET ) {
			return;
		}

		// if we're in magic mode, wrap values if necessary
		if ( this.magic && typeof parentValue === 'object' && hasOwn.call( parentValue, key ) ) {
			if ( !this._wrapped[ normalised ] ) {
				this._wrapped[ normalised ] = wrapProperty( parentValue, key, this, normalised );
			}
		}

		// update cache map
		if ( !( cacheMap = this._cacheMap[ parentKeypath ] ) ) {
			this._cacheMap[ parentKeypath ] = [ normalised ];
		} else {
			if ( cacheMap.indexOf( normalised ) === -1 ) {
				cacheMap[ cacheMap.length ] = normalised;
			}
		}

		value = parentValue[ key ];

		// Is this an array that needs to be wrapped?
		if ( this.modifyArrays ) {
			// if it's not an expression, is an array, and we're not here because it sent us here, wrap it
			if ( ( normalised.charAt( 0 ) !== '(' ) && isArray( value ) && ( !value._ractive || !value._ractive.setting ) ) {
				registerKeypathToArray( value, normalised, this );
			}
		}

		// Update cache
		cache[ normalised ] = value;

		return value;
	};


	// wrap object for magic get/set
	wrapProperty = function ( obj, prop, ractive, keypath ) {
		var value, descriptor, get, set, oldGet, oldSet, ractives, keypathsByGuid;

		descriptor = Object.getOwnPropertyDescriptor( obj, prop );

		if ( descriptor ) {
			if ( descriptor.set && ( ractives = descriptor.set.ractives ) ) {
				// register this ractive to this object
				if ( ractives.indexOf( ractive ) === -1 ) {
					ractives[ ractives.length ] = ractive;
				}

				// register this keypath to this object
				keypathsByGuid = descriptor.set[ ractive._guid ] || ( descriptor.set[ ractive._guid ] = []);

				if ( keypathsByGuid.indexOf( keypath ) === -1 ) {
					keypathsByGuid[ keypathsByGuid.length ] = keypath;
				}

				return; // already wrapped
			}

			if ( !descriptor.configurable ) {
				throw new Error( 'Cannot configure property' );
			}
		}

		if ( !descriptor || hasOwn.call( descriptor, 'value' ) ) {
			if ( descriptor ) {
				value = descriptor.value;
			}
			
			get = function () {
				return value;
			};

			set = function ( newValue ) {
				var ractives, ractive, keypaths, i, j;

				value = newValue;

				ractives = set.ractives;

				i = ractives.length;
				while ( i-- ) {
					ractive = ractives[i];

					if ( !ractive.muggleSet ) {	
						ractive.magicSet = true;

						keypaths = set[ ractive._guid ];
						j = keypaths.length;

						while ( j-- ) {
							ractive.set( keypaths[j], newValue );
						}

						ractive.magicSet = false;
					}
				}
			};

			// prevent rewrapping
			set.ractives = [ ractive ];
			set[ ractive._guid ] = [ keypath ];

			Object.defineProperty( obj, prop, { get: get, set: set, enumerable: true, configurable: true });
		}

		else {
			if ( ( descriptor.set && !descriptor.get ) || ( !descriptor.set && descriptor.get ) ) {
				throw new Error( 'Property with getter but no setter, or vice versa. I am confused.' );
			}

			if ( descriptor.set._ractive ) {
				return; // already wrapped
			}

			oldGet = descriptor.get;
			oldSet = descriptor.set;

			set = function ( newValue ) {
				oldSet( newValue );

				if ( !ractive.muggleSet ) {
					ractive.magicSet = true;
					ractive.set( keypath, oldGet() );
					ractive.magicSet = false;
				}
			};

			// prevent rewrapping
			set[ ractive._guid + keypath ] = true;

			Object.defineProperty( obj, prop, { get: oldGet, set: set, enumerable: true, configurable: true });
		}

		return {
			teardown: function () {
				var value = obj[ prop ];

				Object.defineProperty( obj, prop, descriptor );
				obj[ prop ] = value;
			}
		};
	};

}( proto ));