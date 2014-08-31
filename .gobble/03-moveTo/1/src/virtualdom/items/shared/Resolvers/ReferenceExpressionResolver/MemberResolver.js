define(['config/types','shared/resolveRef','shared/Unresolved','virtualdom/items/shared/utils/getNewKeypath','virtualdom/items/shared/Resolvers/ExpressionResolver'],function (types, resolveRef, Unresolved, getNewKeypath, ExpressionResolver) {

	'use strict';
	
	var MemberResolver = function ( template, resolver, parentFragment ) {
		var member = this, ref, indexRefs, index, ractive, keypath;
	
		member.resolver = resolver;
		member.root = resolver.root;
		member.viewmodel = resolver.root.viewmodel;
	
		if ( typeof template === 'string' ) {
			member.value = template;
		}
	
		// Simple reference?
		else if ( template.t === types.REFERENCE ) {
			ref = member.ref = template.n;
	
			// If it's an index reference, our job is simple
			if ( ( indexRefs = parentFragment.indexRefs ) && ( index = indexRefs[ ref ] ) !== undefined ) {
				member.indexRef = ref;
				member.value = index;
			}
	
			// Otherwise we need to resolve the reference, and observe the keypath
			else {
				ractive = resolver.root;
	
				// Can we resolve the reference immediately?
				if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
					member.resolve( keypath );
				}
	
				else {
					// Couldn't resolve yet
					member.unresolved = new Unresolved( ractive, ref, parentFragment, function ( keypath ) {
						member.unresolved = null;
						member.resolve( keypath );
					});
				}
			}
		}
	
		// Otherwise we have an expression in its own right
		else {
			new ExpressionResolver( resolver, parentFragment, template, function ( keypath ) {
				member.resolve( keypath );
			});
		}
	};
	
	MemberResolver.prototype = {
		resolve: function ( keypath ) {
			this.keypath = keypath;
			this.value = this.viewmodel.get( keypath );
	
			this.bind();
	
			this.resolver.bubble();
		},
	
		bind: function () {
			this.viewmodel.register( this.keypath, this );
		},
	
		rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
			var keypath;
	
			if ( indexRef && this.indexRef === indexRef ) {
				if ( newIndex !== this.value ) {
					this.value = newIndex;
					return true;
				}
			}
	
			else if ( this.keypath && ( keypath = getNewKeypath( this.keypath, oldKeypath, newKeypath ) ) ) {
				this.unbind();
	
				this.keypath = keypath;
				this.value = this.root.viewmodel.get( keypath );
	
				this.bind();
	
				return true;
			}
		},
	
		setValue: function ( value ) {
			this.value = value;
			this.resolver.bubble();
		},
	
		unbind: function () {
			if ( this.keypath ) {
				this.root.viewmodel.unregister( this.keypath, this );
			}
	
			if ( this.unresolved ) {
				this.unresolved.unbind();
			}
		},
	
		forceResolution: function () {
			if ( this.unresolved ) {
				this.unresolved.unbind();
				this.unresolved = null;
	
				this.keypath = this.ref;
				this.value = this.viewmodel.get( this.ref );
	
				this.bind();
			}
		}
	};
	
	return MemberResolver;

});