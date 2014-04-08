define([
	'config/types',
	'utils/removeFromArray',
	'shared/resolveRef',
	'shared/Unresolved',
	'shared/registerDependant',
	'shared/unregisterDependant',
	'render/shared/Resolvers/ExpressionResolver'
], function (
	types,
	removeFromArray,
	resolveRef,
	Unresolved,
	registerDependant,
	unregisterDependant,
	ExpressionResolver
) {

	'use strict';

	var KeypathExpressionResolver = function ( mustache, descriptor, callback ) {
		var resolver = this, ractive, parentFragment, keypath, dynamic, members;

		ractive = mustache.root;
		parentFragment = mustache.parentFragment;

		this.ref = descriptor.r;
		this.root = mustache.root;
		this.mustache = mustache;

		this.callback = callback;


		this.pending = 0;
		this.unresolved = [];
		members = this.members = [];
		this.indexRefMembers = [];
		this.keypathObservers = [];
		this.expressionResolvers = [];

		descriptor.m.forEach( function ( member, i ) {
			var ref, indexRefs, index, createKeypathObserver, unresolved, expressionResolver;

			if ( typeof member === 'string' ) {
				resolver.members[i] = member;
				return;
			}

			// simple reference?
			if ( member.t === types.REFERENCE ) {
				ref = member.n;

				indexRefs = parentFragment.indexRefs;
				if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
					members[i] = index;

					// make a note of it, in case of reassignments
					resolver.indexRefMembers.push({
						ref: ref,
						index: i
					});

					return;
				}

				dynamic = true;

				createKeypathObserver = function ( keypath ) {
					var keypathObserver = new KeypathObserver( ractive, keypath, mustache.priority, resolver, i );
					resolver.keypathObservers.push( keypathObserver );
				};

				// Can we resolve the reference immediately?
				if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
					createKeypathObserver( keypath );
					return;
				}

				// Couldn't resolve yet
				members[i] = undefined;
				resolver.pending += 1;

				unresolved = new Unresolved( ractive, ref, parentFragment, function ( keypath ) {
					resolver.resolve( i, keypath );
					removeFromArray( resolver.unresolved, unresolved );
				});

				resolver.unresolved.push( unresolved );

				return null;
			}

			// Otherwise we have an expression in its own right
			dynamic = true;

			resolver.pending += 1;
			expressionResolver = new ExpressionResolver( resolver, parentFragment, member, function ( keypath ) {
				resolver.resolve( i, keypath );
				removeFromArray( resolver.unresolved, expressionResolver );
			});
			resolver.unresolved.push( expressionResolver );
		});

		// Some keypath expressions (e.g. foo["bar"], or foo[i] where `i` is an
		// index reference) won't change. So we don't need to register any watchers
		if ( !dynamic ) {
			keypath = this.getKeypath();
			callback( keypath );

			return;
		}

		this.ready = true;
		this.bubble(); // trigger initial resolution if possible
	};

	KeypathExpressionResolver.prototype = {
		getKeypath: function () {
			return this.ref + '.' + this.members.join( '.' );
		},

		bubble: function () {
			if ( !this.ready || this.pending ) {
				return;
			}

			this.callback( this.getKeypath() );
		},

		resolve: function ( index, value ) {
			var keypathObserver = new KeypathObserver( this.root, value, this.mustache.priority, this, index );
			keypathObserver.update();

			this.keypathObservers.push( keypathObserver );

			// when all references have been resolved, we can flag the entire expression
			// as having been resolved
			this.resolved = !( --this.pending );
			this.bubble();
		},

		teardown: function () {
			var unresolved;

			while ( unresolved = this.unresolved.pop() ) {
				unresolved.teardown();
			}
		},

		reassign: function ( indexRef, newIndex ) {
			var changed, i, member;

			i = this.indexRefMembers.length;
			while ( i-- ) {
				member = this.indexRefMembers[i];
				if ( member.ref === indexRef ) {
					changed = true;
					this.members[ member.index ] = newIndex;
				}
			}

			if ( changed ) {
				this.bubble();
			}
		}
	};

	var KeypathObserver = function ( ractive, keypath, priority, resolver, index ) {
		this.root = ractive;
		this.keypath = keypath;
		this.priority = priority;

		this.resolver = resolver;
		this.index = index;

		registerDependant( this );

		this.update();
	};

	KeypathObserver.prototype = {
		update: function () {
			var resolver = this.resolver;

			resolver.members[ this.index ] = this.root.get( this.keypath );
			resolver.bubble();
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};

	return KeypathExpressionResolver;

});
