(function ( cache ) {

	var Reference, SoftReference, getFunctionFromString, thisPattern, wrapFunction;

	Evaluator = function ( root, keypath, functionStr, args, priority ) {
		var i, arg;

		this.root = root;
		this.keypath = keypath;
		this.priority = priority;

		this.fn = getFunctionFromString( functionStr, args.length );
		this.values = [];
		this.refs = [];

		i = args.length;
		while ( i-- ) {
			if ( arg = args[i] ) {
				if ( arg[0] ) {
					// this is an index ref... we don't need to register a dependant
					this.values[i] = arg[1];
				}

				else {
					this.refs[ this.refs.length ] = new Reference( root, arg[1], this, i, priority );
				}
			}
			
			else {
				this.values[i] = undefined;
			}
		}

		this.selfUpdating = ( this.refs.length <= 1 );
		this.update();
	};

	Evaluator.prototype = {
		bubble: function () {
			// If we only have one reference, we can update immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// ...otherwise we want to register it as a deferred item, to be
			// updated once all the information is in, to prevent unnecessary
			// cascading. Only if we're already resolved, obviously
			else if ( !this.deferred ) {
				this.root._defEvals[ this.root._defEvals.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value;

			// prevent infinite loops
			if ( this.evaluating ) {
				return this;
			}

			this.evaluating = true;
				
			try {
				value = this.fn.apply( null, this.values );
			} catch ( err ) {
				if ( this.root.debug ) {
					throw err;
				} else {
					value = undefined;
				}
			}

			if ( !isEqual( value, this.value ) ) {
				clearCache( this.root, this.keypath );
				this.root._cache[ this.keypath ] = value;
				notifyDependants( this.root, this.keypath );

				this.value = value;
			}

			this.evaluating = false;

			return this;
		},

		// TODO should evaluators ever get torn down? At present, they don't...
		teardown: function () {
			while ( this.refs.length ) {
				this.refs.pop().teardown();
			}

			clearCache( this.root, this.keypath );
			this.root._evaluators[ this.keypath ] = null;
		},

		// This method forces the evaluator to sync with the current model
		// in the case of a smart update
		refresh: function () {
			if ( !this.selfUpdating ) {
				this.deferred = true;
			}

			var i = this.refs.length;
			while ( i-- ) {
				this.refs[i].update();
			}

			if ( this.deferred ) {
				this.update();
				this.deferred = false;
			}
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
					this.softRefs[ this.softRefs.length ] = ref;
					this.softRefs[ keypath ] = true;
				}
			}

			this.selfUpdating = ( this.refs.length + this.softRefs.length <= 1 );
		}
	};


	Reference = function ( root, keypath, evaluator, argNum, priority ) {
		var value;

		this.evaluator = evaluator;
		this.keypath = keypath;
		this.root = root;
		this.argNum = argNum;
		this.type = REFERENCE;
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

	SoftReference = function ( root, keypath, evaluator ) {
		this.root = root;
		this.keypath = keypath;
		this.priority = evaluator.priority;

		this.evaluator = evaluator;

		registerDependant( this );
	};

	SoftReference.prototype = {
		update: function () {
			var value = this.root.get( this.keypath );

			if ( !isEqual( value, this.value ) ) {
				this.evaluator.bubble();
				this.value = value;
			}
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};


	getFunctionFromString = function ( str, i ) {
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
	};

	thisPattern = /this/;

	wrapFunction = function ( fn, ractive, evaluator ) {
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
			if ( hasOwn.call( fn, prop ) ) {
				fn[ '_' + ractive._guid ][ prop ] = fn[ prop ];
			}
		}

		return fn[ '_' + ractive._guid ];
	};

}({}));