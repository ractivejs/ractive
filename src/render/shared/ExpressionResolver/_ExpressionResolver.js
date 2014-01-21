define([
	'render/shared/Evaluator/_Evaluator',
	'render/shared/ExpressionResolver/ReferenceScout',
	'render/shared/ExpressionResolver/getUniqueString',
	'render/shared/ExpressionResolver/getKeypath',
	'render/shared/ExpressionResolver/reassignDependants'
], function (
	Evaluator,
	ReferenceScout,
	getUniqueString,
	getKeypath,
	reassignDependants
) {

	'use strict';

	var ExpressionResolver = function ( mustache ) {

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
			var oldKeypath;

			if ( !this.ready ) {
				return;
			}

			oldKeypath = this.keypath;
			this.uniqueString = getUniqueString( this.str, this.args );
			this.keypath = getKeypath( this.uniqueString );

			if ( this.keypath.substr( 0, 2 ) === '${' ) {
				this.createEvaluator();
			}

			if ( oldKeypath ) {
				// need to reassign all dependants, inc. downstream, of
				// old keypath to the new one
				reassignDependants( this.root, oldKeypath, this.keypath );
			}

			else {
				this.mustache.resolve( this.keypath );
			}
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
				this.root._evaluators[ this.keypath ] = new Evaluator( this.root, this.keypath, this.uniqueString, this.str, this.args, this.mustache.priority );
			}

			else {
				// we need to trigger a refresh of the evaluator, since it
				// will have become de-synced from the model if we're in a
				// reassignment cycle
				this.root._evaluators[ this.keypath ].refresh();
			}
		}
	};

	return ExpressionResolver;

});