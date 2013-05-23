utils.Mustache = function ( options ) {

	var keypath, index;

	this.root           = options.root;
	this.descriptor     = options.descriptor;
	this.parentFragment = options.parentFragment;
	this.contextStack   = options.contextStack || [];
	this.index          = options.index || 0;
	this.priority       = options.descriptor.p || 0;

	// DOM only
	if ( options.parentNode || options.anchor ) {
		this.parentNode = options.parentNode;
		this.anchor = options.anchor;
	}

	this.type = options.descriptor.t;


	// if this is a simple mustache, with a reference, we just need to resolve
	// the reference to a keypath
	if ( options.descriptor.r ) {
		if ( this.parentFragment.indexRefs && this.parentFragment.indexRefs.hasOwnProperty( options.descriptor.r ) ) {
			index = this.parentFragment.indexRefs[ options.descriptor.r ];
			this.render( index );
		}

		else {
			keypath = utils.resolveRef( this.root, options.descriptor.r, this.contextStack );
			if ( keypath ) {
				this.resolve( keypath );
			} else {
				this.ref = options.descriptor.r;
				this.root._pendingResolution[ this.root._pendingResolution.length ] = this;

				// inverted section? initialise
				if ( this.descriptor.n ) {
					this.render( false );
				}
			}
		}
	}

	// if it's an expression, we have a bit more work to do
	if ( options.descriptor.x ) {
		this.evaluator = utils.getEvaluator( this.root, this, this.contextStack, this.parentFragment.indexRefs, options.descriptor.x );
	}

};

utils.Mustache.prototype = {
	update: function () {
		var value;

		if ( this.keypath ) {
			value = this.root.get( this.keypath, true );
		} else if ( this.expression ) {
			value = this.evaluate();
		}

		if ( !utils.isEqual( value, this._lastValue ) ) {
			this.render( value );
			this._lastValue = value;
		}
	},

	resolve: function ( keypath ) {
		// TEMP
		this.keypath = keypath;

		utils.registerDependant( this.root, keypath, this, this.priority );
		this.update();
	},

	evaluate: function () {
		var args, i;

		args = [];

		i = this.refs.length;
		while ( i-- ) {
			args[i] = this.root.get( this.refs[i] );
		}

		return this.evaluator.apply( null, args );
	}
};