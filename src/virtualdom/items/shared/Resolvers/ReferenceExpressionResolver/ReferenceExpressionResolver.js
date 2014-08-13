import resolveRef from 'shared/resolveRef';
import Unresolved from 'shared/Unresolved';
import MemberResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/MemberResolver';

var ReferenceExpressionResolver = function ( mustache, template, callback ) {
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
	resolver.members = template.m.map( template => new MemberResolver( template, this, parentFragment ) );

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

	teardown: function () {
		this.members.forEach( unbind );
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var changed;

		this.members.forEach( members => {
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

			this.baseResolver.teardown();
			this.baseResolver = null;
		}

		this.members.forEach( m => m.forceResolution() );
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

export default ReferenceExpressionResolver;
