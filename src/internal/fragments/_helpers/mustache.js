var initMustache, updateMustache, resolveMustache, evaluateMustache;

initMustache = function ( mustache, options ) {

	var keypath, index;

	mustache.root           = options.root;
	mustache.descriptor     = options.descriptor;
	mustache.parentFragment = options.parentFragment;
	mustache.contextStack   = options.contextStack || [];
	mustache.index          = options.index || 0;
	mustache.priority       = options.descriptor.p || 0;

	// DOM only
	if ( options.parentNode || options.anchor ) {
		mustache.parentNode = options.parentNode;
		mustache.anchor = options.anchor;
	}

	mustache.type = options.descriptor.t;


	// if this is a simple mustache, with a reference, we just need to resolve
	// the reference to a keypath
	if ( options.descriptor.r ) {
		if ( mustache.parentFragment.indexRefs && mustache.parentFragment.indexRefs.hasOwnProperty( options.descriptor.r ) ) {
			index = mustache.parentFragment.indexRefs[ options.descriptor.r ];
			mustache.render( index );
		}

		else {
			keypath = resolveRef( mustache.root, options.descriptor.r, mustache.contextStack );
			if ( keypath ) {
				mustache.resolve( keypath );
			} else {
				mustache.ref = options.descriptor.r;
				mustache.root._pendingResolution[ mustache.root._pendingResolution.length ] = mustache;

				// inverted section? initialise
				if ( mustache.descriptor.n ) {
					mustache.render( false );
				}
			}
		}
	}

	// if it's an expression, we have a bit more work to do
	if ( options.descriptor.x ) {
		mustache.evaluator = new Evaluator( mustache.root, mustache, mustache.contextStack, mustache.parentFragment.indexRefs, options.descriptor.x );
	}

};


// methods to add to individual mustache prototypes
updateMustache = function () {
	var value;

	if ( this.keypath ) {
		value = this.root.get( this.keypath, true );
	} else if ( this.expression ) {
		value = this.evaluate();
	}

	if ( !isEqual( value, this._lastValue ) ) {
		this.render( value );
		this._lastValue = value;
	}
};

resolveMustache = function ( keypath ) {
	// TEMP
	this.keypath = keypath;

	registerDependant( this.root, keypath, this, this.priority );
	this.update();
};

evaluateMustache = function () {
	var args, i;

	args = [];

	i = this.refs.length;
	while ( i-- ) {
		args[i] = this.root.get( this.refs[i] );
	}

	return this.evaluator.apply( null, args );
};