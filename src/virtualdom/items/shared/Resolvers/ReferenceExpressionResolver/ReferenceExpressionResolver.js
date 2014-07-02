import removeFromArray from 'utils/removeFromArray';
import resolveRef from 'shared/resolveRef';
import Unresolved from 'shared/Unresolved';
import MemberResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/MemberResolver';

var ReferenceExpressionResolver = function ( mustache, template, callback ) {
	var resolver = this, parentFragment;

	parentFragment = mustache.parentFragment;

	resolver.root = mustache.root;
	resolver.mustache = mustache;
	resolver.priority = mustache.priority;

	resolver.callback = callback;

	resolver.unresolved = [];

	// Find base keypath. TODO treat the base as just another member?
	resolveBase( resolver, mustache.root, template.r, parentFragment );

	// Find values for members, or mark them as unresolved
	resolver.members = template.m.map( template => new MemberResolver( template, this, parentFragment ) );

	resolver.ready = true;
	resolver.bubble(); // trigger initial resolution if possible
};

ReferenceExpressionResolver.prototype = {
	getKeypath: function () {
		var values = this.members.map( getValue );

		if ( !values.every( isDefined ) ) {
			return;
		}

		return this.base + '.' + values.join( '.' );
	},

	bubble: function () {
		if ( !this.ready || this.unresolved.length ) {
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
	}
};

function resolveBase ( resolver, ractive, ref, parentFragment ) {
	var keypath, unresolved;

	if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
		resolver.base = keypath;
	} else {
		unresolved = new Unresolved( ractive, ref, parentFragment, function ( keypath ) {
			resolver.base = keypath;
			removeFromArray( resolver.unresolved, unresolved );
			resolver.bubble();
		});

		resolver.unresolved.push( unresolved );
	}
}

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
