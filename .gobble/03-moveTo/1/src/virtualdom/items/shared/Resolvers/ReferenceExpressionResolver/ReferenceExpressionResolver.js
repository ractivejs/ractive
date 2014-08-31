define(['shared/resolveRef','shared/Unresolved','virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/MemberResolver'],function (resolveRef, Unresolved, MemberResolver) {

	'use strict';
	
	var ReferenceExpressionResolver = function ( mustache, template, callback ) {var this$0 = this;
		var resolver = this, ractive, ref, keypath, parentFragment;
	
		parentFragment = mustache.parentFragment;
	
		resolver.root = ractive = mustache.root;
		resolver.mustache = mustache;
		resolver.priority = mustache.priority;
	
		resolver.ref = ref = template.r;
		resolver.callback = callback;
	
		resolver.unresolved = [];
	
		// Find base keypath
		if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
			resolver.base = keypath;
		} else {
			resolver.baseResolver = new Unresolved( ractive, ref, parentFragment, function ( keypath ) {
				resolver.base = keypath;
				resolver.baseResolver = null;
				resolver.bubble();
			});
		}
	
		// Find values for members, or mark them as unresolved
		resolver.members = template.m.map( function(template ) {return new MemberResolver( template, this$0, parentFragment )} );
	
		resolver.ready = true;
		resolver.bubble(); // trigger initial resolution if possible
	};
	
	ReferenceExpressionResolver.prototype = {
		getKeypath: function () {
			var values = this.members.map( getValue );
	
			if ( !values.every( isDefined ) || this.baseResolver ) {
				return null;
			}
	
			return this.base + '.' + values.join( '.' );
		},
	
		bubble: function () {
			if ( !this.ready || this.baseResolver ) {
				return;
			}
			this.callback( this.getKeypath() );
		},
	
		unbind: function () {
			this.members.forEach( unbind );
		},
	
		rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
			var changed;
	
			this.members.forEach( function(members ) {
				if ( members.rebind( indexRef, newIndex, oldKeypath, newKeypath ) ) {
					changed = true;
				}
			});
	
			if ( changed ) {
				this.bubble();
			}
		},
	
		forceResolution: function () {
			if ( this.baseResolver ) {
				this.base = this.ref;
	
				this.baseResolver.unbind();
				this.baseResolver = null;
			}
	
			this.members.forEach( function(m ) {return m.forceResolution()} );
			this.bubble();
		}
	};
	
	function getValue ( member ) {
		return member.value;
	}
	
	function isDefined ( value ) {
		return value != undefined;
	}
	
	function unbind ( member ) {
		member.unbind();
	}
	
	return ReferenceExpressionResolver;

});