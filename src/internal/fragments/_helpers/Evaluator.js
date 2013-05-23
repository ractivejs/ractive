(function ( evaluators, functions ) {

	var Reference, getFn;

	getFn = function ( fnStr, refs ) {
		var fn;

		if ( functions[ fnStr ] ) {
			return functions[ fnStr ];
		}

		fn = new Function( refs ? refs.join( ',' ) : '', 'return(' + fnStr + ')' );

		functions[ fnStr ] = fn;
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
			this.unresolved = descriptor.r.length;
			this.refs = descriptor.r.slice();

			i = descriptor.r.length;
			while ( i-- ) {
				// index ref?
				if ( indexRefs && indexRefs.hasOwnProperty( descriptor.r[i] ) ) {
					this.values[i] = this.override[i] = indexRefs[ descriptor.r[i] ];
					this.unresolved -= 1; // because we don't need to resolve the reference
				}

				else {
					new Reference( root, descriptor.r[i], contextStack, i, this );
				}
			}

			// if we have no unresolved references, but we haven't initialised (because
			// one or more of the references were index references), initialise now
			if ( !this.unresolved && !this.resolved ) {
				this.init();
			}
		}
	};

	Evaluator.prototype = {
		// TODO teardown

		init: function () {
			var self = this;

			// we're ready!
			this.resolved = true;

			this.keypath = this.str.replace( /❖([0-9]+)/g, function ( match, $1 ) {
				if ( self.override.hasOwnProperty( $1 ) ) {
					return self.override[ $1 ];
				}

				return self.keypaths[ $1 ];
			});

			this.fnStr = this.str.replace( /❖([0-9]+)/g, function ( match, $1 ) {
				return self.refs[ $1 ];
			});

			this.fn = getFn( this.fnStr, this.refs );

			this.update();
			this.mustache.resolve( this.keypath );

			// TODO some cleanup, delete unneeded bits
		},

		resolve: function ( ref, argNum, keypath ) {
			var self = this;

			this.keypaths[ argNum ] = keypath;

			this.unresolved -= 1;
			if ( !this.unresolved ) {
				this.init();
			}
		},

		update: function () {
			var value;

			if ( !this.resolved ) {
				return;
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
				this.root.set( this.keypath, value );

				this._lastValue = value;
			}
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
		// TODO teardown

		resolve: function ( keypath ) {

			this.keypath = keypath;

			registerDependant( this.root, keypath, this, this.evaluator.priority );
			this.update();
			this.evaluator.resolve( this.ref, this.argNum, keypath );
		},

		update: function () {
			var value = this.root.get( this.keypath );

			if ( !isEqual( value, this._lastValue ) ) {
				this.evaluator.values[ this.argNum ] = value;
				this.evaluator.update();

				this._lastValue = value;
			}
		}
	};

}({}, {}));