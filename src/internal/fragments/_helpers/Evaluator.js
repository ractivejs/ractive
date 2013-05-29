(function ( evaluators, functionCache ) {

	var Reference, getFunctionFromString;

	getFunctionFromString = function ( functionString, i ) {
		var fn, args;

		if ( functionCache[ functionString ] ) {
			return functionCache[ functionString ];
		}

		args = [];
		while ( i-- ) {
			args[i] = '_' + i;
		}

		fn = new Function( args.join( ',' ), 'return(' + functionString + ')' );

		functionCache[ functionString ] = fn;
		return fn;
	};

	Evaluator = function ( root, mustache, contextStack, indexRefs, descriptor ) {

		var i;

		this.root = root;
		this.mustache = mustache;
		this.priority = mustache.priority;

		this.str = descriptor.s;
		this.keypaths = [];
		this.override = []; // need to override index refs when creating a keypath
		this.values = [];

		if ( !descriptor.r ) {
			// no references - we can init immediately
			this.init();
		}

		else {
			
			this.resolvers = [];
			this.unresolved = this.numRefs = i = descriptor.r.length;
			
			while ( i-- ) {
				// index ref?
				if ( indexRefs && indexRefs.hasOwnProperty( descriptor.r[i] ) ) {
					this.values[i] = this.override[i] = indexRefs[ descriptor.r[i] ];
					this.unresolved -= 1; // because we don't need to resolve the reference
				}

				else {
					this.resolvers[ this.resolvers.length ] = new Reference( root, descriptor.r[i], contextStack, i, this );
				}
			}

			// if this only has one reference (and therefore only one dependency) it can
			// update its mustache whenever that dependency changes. Otherwise, it should
			// wait until all the information is in before re-evaluating (same principle
			// as element attributes)
			if ( this.resolvers.length <= 1 ) {
				this.selfUpdating = true;
			}

			// if we have no unresolved references, but we haven't initialised (because
			// one or more of the references were index references), initialise now
			if ( !this.unresolved && !this.resolved ) {
				this.init();
			}
		}
	};

	Evaluator.prototype = {
		init: function () {
			var self = this, functionString;

			// we're ready!
			this.resolved = true;

			this.keypath = '(' + this.str.replace( /❖([0-9]+)/g, function ( match, $1 ) {
				if ( self.override.hasOwnProperty( $1 ) ) {
					return self.override[ $1 ];
				}

				return self.keypaths[ $1 ];
			}) + ')';

			// is this the first of its kind?
			if ( this.root._expressions.indexOf( this.keypath ) === -1 ) {
				// yes
				functionString = this.str.replace( /❖([0-9]+)/g, function ( match, $1 ) {
					return '_' + $1;
				});

				this.fn = getFunctionFromString( functionString, this.numRefs || 0 );

				this.update();

				this.root._expressions.push( this.keypath );
			} else {
				// no. tear it down! our mustache will be taken care of by the other expression
				// with the same virtual keypath
				this.teardown();
			}
			
			this.mustache.resolve( this.keypath );
		},

		teardown: function () {
			if ( this.resolvers ) {
				while ( this.resolvers.length ) {
					this.resolvers.pop().teardown();
				}
			}
		},

		resolve: function ( ref, argNum, keypath ) {
			var self = this;

			this.keypaths[ argNum ] = keypath;

			this.unresolved -= 1;
			if ( !this.unresolved ) {
				this.init();
			}
		},

		bubble: function () {
			// If we only have one reference, we can update immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// ...otherwise we want to register it as a deferred item, to be
			// updated once all the information is in, to prevent unnecessary
			// cascading. Only if we're already resovled, obviously
			else if ( !this.deferred && this.resolved ) {
				this.root._def[ this.root._def.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value;

			if ( !this.resolved ) {
				return this;
			}

			try {
				value = this.getter();
			} catch ( err ) {
				if ( this.root.debug ) {
					throw err;
				} else {
					value = undefined;
				}
			}

			if ( !isEqual( value, this._lastValue ) ) {
				clearCache( this.root, this.keypath );
				this.root._cache[ this.keypath ] = value;
				notifyDependants( this.root, this.keypath );

				this._lastValue = value;
			}

			return this;
		},

		getter: function () {
			return this.fn.apply( null, this.values );
		}
	};



	Reference = function ( root, ref, contextStack, argNum, evaluator ) {
		var keypath;

		this.ref = ref;
		this.root = root;
		this.evaluator = evaluator;
		this.priority = evaluator.priority;
		this.argNum = argNum;

		keypath = resolveRef( root, ref, contextStack );
		if ( keypath ) {
			this.resolve( keypath );
		} else {
			this.contextStack = contextStack;
			root._pendingResolution[ root._pendingResolution.length ] = this;
		}
	};

	Reference.prototype = {
		teardown: function () {
			teardown( this );
		},

		resolve: function ( keypath ) {
			this.keypath = keypath;

			registerDependant( this.root, keypath, this, this.priority );
			
			this.update();
			this.evaluator.resolve( this.ref, this.argNum, keypath );
		},

		update: function () {
			var value = this.root.get( this.keypath );

			if ( !isEqual( value, this._lastValue ) ) {
				this.evaluator.values[ this.argNum ] = value;
				this.evaluator.bubble();

				this._lastValue = value;
			}
		}
	};

}({}, {}));