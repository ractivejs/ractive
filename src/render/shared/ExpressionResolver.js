define([
	'shared/resolveRef',
	'shared/teardown',
	'render/shared/Evaluator/_Evaluator'
], function (
	resolveRef,
	teardown,
	Evaluator
) {

	'use strict';

	var ExpressionResolver, ReferenceScout, getKeypath;

	ExpressionResolver = function ( mustache ) {

		var expression, i, len, ref, indexRefs;

		this.root = mustache.root;
		this.mustache = mustache;
		this.args = [];
		this.scouts = [];

		expression = mustache.descriptor.x;
		indexRefs = mustache.parentFragment.indexRefs;

		this.str = expression.s;

		// send out scouts for each reference
		len = this.unresolved = this.args.length = ( expression.r ? expression.r.length : 0 );

		if ( !len ) {
			this.resolved = this.ready = true;
			this.bubble(); // some expressions don't have references. edge case, but, yeah.
			return;
		}

		for ( i=0; i<len; i+=1 ) {
			ref = expression.r[i];

			// is this an index ref?
			if ( indexRefs && indexRefs[ ref ] !== undefined ) {
				this.resolveRef( i, true, indexRefs[ ref ] );
			}

			else {
				this.scouts[ this.scouts.length ] = new ReferenceScout( this, ref, mustache.contextStack, i );
			}
		}

		this.ready = true;
		this.bubble();
	};

	ExpressionResolver.prototype = {
		bubble: function () {
			if ( !this.ready ) {
				return;
			}

			this.keypath = getKeypath( this.str, this.args );
			this.createEvaluator();

			this.mustache.resolve( this.keypath );
		},

		teardown: function () {
			while ( this.scouts.length ) {
				this.scouts.pop().teardown();
			}
		},

		resolveRef: function ( argNum, isIndexRef, value ) {
			this.args[ argNum ] = [ isIndexRef, value ];
			this.bubble();

			// when all references have been resolved, we can flag the entire expression
			// as having been resolved
			this.resolved = !( --this.unresolved );
		},

		createEvaluator: function () {
			// only if it doesn't exist yet!
			if ( !this.root._evaluators[ this.keypath ] ) {
				this.root._evaluators[ this.keypath ] = new Evaluator( this.root, this.keypath, this.str, this.args, this.mustache.priority );
			}

			else {
				// we need to trigger a refresh of the evaluator, since it
				// will have become de-synced from the model if we're in a
				// reassignment cycle
				this.root._evaluators[ this.keypath ].refresh();
			}
		}
	};


	ReferenceScout = function ( resolver, ref, contextStack, argNum ) {
		var keypath, root;

		root = this.root = resolver.root;

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
			this.keypath = keypath;
			this.resolver.resolveRef( this.argNum, false, keypath );
		},

		teardown: function () {
			// if we haven't found a keypath yet, we can
			// stop the search now
			if ( !this.keypath ) {
				teardown( this );
			}
		}
	};

	getKeypath = function ( str, args ) {
		var unique;

		// get string that is unique to this expression
		unique = str.replace( /\$\{([0-9]+)\}/g, function ( match, $1 ) {
			return args[ $1 ] ? args[ $1 ][1] : 'undefined';
		});

		// then sanitize by removing any periods or square brackets. Otherwise
		// we can't split the keypath into keys!
		return '(' + unique.replace( /[\.\[\]]/g, '-' ) + ')';
	};

	return ExpressionResolver;

});