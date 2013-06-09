var ExpressionResolver;

(function () {

	var IndexRefScout, ReferenceScout, getKeypath;

	ExpressionResolver = function ( mustache ) {

		var expression, i, len, ref, indexRefs, args;

		this.root = mustache.root;
		this.mustache = mustache;
		this.numRefs = 0;
		this.args = [];

		expression = mustache.descriptor.x;
		indexRefs = mustache.parentFragment.indexRefs;

		this.str = expression.s;

		// send out scouts for each reference
		len = this.unresolved = ( expression.r ? expression.r.length : 0 );

		for ( i=0; i<len; i+=1 ) {
			ref = expression.r[i];
			
			// is this an index ref?
			if ( indexRefs && indexRefs.hasOwnProperty( ref ) ) {
				new IndexRefScout( this, indexRefs[ ref ], i );
			}

			else {
				this.numRefs += 1;
				new ReferenceScout( this, ref, mustache.contextStack, i );
			}
		}

		if ( !this.unresolved ) {
			this.init();
		}
	};

	ExpressionResolver.prototype = {
		init: function () {
			this.keypath = getKeypath( this.str, this.args );
			this.createEvaluator();

			this.mustache.resolve( this.keypath );
		},

		resolveRef: function ( argNum, isIndexRef, value ) {
			this.args[ argNum ] = [ isIndexRef, value ];

			// can we initialise yet?
			if ( --this.unresolved ) {
				// no;
				return;
			}

			this.init();
		},

		createEvaluator: function () {
			// only if it doesn't exist yet!
			if ( !this.root._evaluators[ this.keypath ] ) {
				this.root._evaluators[ this.keypath ] = new Evaluator( this.root, this.keypath, this.str, this.args, this.mustache.priority );
			}
		}
	};


	// TODO this is absurd
	IndexRefScout = function ( resolver, indexRef, argNum ) {
		this.resolver = resolver;
		this.argNum = argNum;

		resolver.resolveRef( argNum, true, indexRef.index );
	};


	ReferenceScout = function ( resolver, ref, contextStack, argNum ) {
		var keypath, root;

		root = resolver.root;

		keypath = resolveRef( root, ref, contextStack );
		if ( keypath ) {
			resolver.resolveRef( argNum, false, keypath );
		} else {
			this.ref = ref;
			this.argNum = argNum;
			this.resolver = resolver;
			this.contextStack = contextStack;

			root._pendingResolution[ root._pendingResolution.length ] = this;
		}
	};

	ReferenceScout.prototype = {
		resolve: function ( keypath ) {
			this.resolver.resolveRef( this.argNum, false, keypath );
		}
	};

	getKeypath = function ( str, args ) {
		var unique;

		// get string that is unique to this expression
		unique = str.replace( /❖([0-9]+)/g, function ( match, $1 ) {
			return args[ $1 ][1];
		});

		// then sanitize by removing any periods or square brackets. Otherwise
		// splitKeypath will go mental!
		return '(' + unique.replace( /[\.\[\]]/g, '-' ) + ')';
	};

}());