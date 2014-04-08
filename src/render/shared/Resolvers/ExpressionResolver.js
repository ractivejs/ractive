define([
	'utils/removeFromArray',
	'shared/resolveRef',
	'shared/Unresolved',
	'render/shared/Evaluator/_Evaluator',
	'render/shared/utils/getNewKeypath'
], function (
	removeFromArray,
	resolveRef,
	Unresolved,
	Evaluator,
	getNewKeypath
) {

	'use strict';

	var ExpressionResolver = function ( owner, parentFragment, expression, callback ) {

		var expressionResolver = this, ractive, indexRefs, args;

		ractive = owner.root;

		this.root = ractive;
		this.callback = callback;
		this.owner = owner;
		this.str = expression.s;
		this.args = args = [];

		this.unresolved = [];
		this.pending = 0;

		indexRefs = parentFragment.indexRefs;

		// some expressions don't have references. edge case, but, yeah.
		if ( !expression.r || !expression.r.length ) {
			this.resolved = this.ready = true;
			this.bubble();
			return;
		}

		// Create resolvers for each reference
		expression.r.forEach( function ( reference, i ) {
			var index, keypath, unresolved;

			// Is this an index reference?
			if ( indexRefs && ( index = indexRefs[ reference ] ) !== undefined ) {
				args[i] = {
					indexRef: reference,
					value: index
				};
				return;
			}

			// Can we resolve it immediately?
			if ( keypath = resolveRef( ractive, reference, parentFragment ) ) {
				args[i] = { keypath: keypath };
				return;
			}

			// Couldn't resolve yet
			args[i] = undefined;
			expressionResolver.pending += 1;

			unresolved = new Unresolved( ractive, reference, parentFragment, function ( keypath ) {
				expressionResolver.resolve( i, keypath );
				removeFromArray( expressionResolver.unresolved, unresolved );
			});

			expressionResolver.unresolved.push( unresolved );
		});

		this.ready = true;
		this.bubble();
	};

	ExpressionResolver.prototype = {
		bubble: function () {
			if ( !this.ready ) {
				return;
			}

			this.uniqueString = getUniqueString( this.str, this.args );
			this.keypath = getKeypath( this.uniqueString );

			this.createEvaluator();
			this.callback( this.keypath );
		},

		teardown: function () {
			var unresolved;

			while ( unresolved = this.unresolved.pop() ) {
				unresolved.teardown();
			}
		},

		resolve: function ( index, keypath ) {
			this.args[ index ] = { keypath: keypath };
			this.bubble();

			// when all references have been resolved, we can flag the entire expression
			// as having been resolved
			this.resolved = !( --this.pending );
		},

		createEvaluator: function () {
			var evaluator;

			// only if it doesn't exist yet!
			if ( !this.root._evaluators[ this.keypath ] ) {
				evaluator = new Evaluator( this.root, this.keypath, this.uniqueString, this.str, this.args, this.owner.priority );

				this.root._evaluators[ this.keypath ] = evaluator;
				evaluator.update();
			}

			else {
				// we need to trigger a refresh of the evaluator, since it
				// will have become de-synced from the model if we're in a
				// reassignment cycle
				this.root._evaluators[ this.keypath ].refresh();
			}
		},

		reassign: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
			var changed;

			this.args.forEach( function ( arg ) {
				var changedKeypath;

				if ( arg.keypath && ( changedKeypath = getNewKeypath( arg.keypath, oldKeypath, newKeypath ) ) ) {
					arg.keypath = changedKeypath;
					changed = true;
				}

				else if ( arg.indexRef === indexRef ) {
					arg.value = newIndex;
					changed = true;
				}
			});

			if ( changed ) {
				this.bubble();
			}
		}
	};

	return ExpressionResolver;

	function getUniqueString ( str, args ) {
		// get string that is unique to this expression
		return str.replace( /\$\{([0-9]+)\}/g, function ( match, $1 ) {
			return args[ $1 ] ? args[ $1 ].value || args[ $1 ].keypath : 'undefined';
		});
	}

	function getKeypath ( uniqueString ) {
		// Sanitize by removing any periods or square brackets. Otherwise
		// we can't split the keypath into keys!
		return '${' + uniqueString.replace( /[\.\[\]]/g, '-' ) + '}';
	}

});
