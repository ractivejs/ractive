import resolveRef from 'shared/resolveRef';
import { unbind } from 'shared/methodCallers';
import { getKeypath } from 'shared/keypaths';
import ReferenceResolver from '../ReferenceResolver';
import MemberResolver from './MemberResolver';

var ReferenceExpressionResolver = function ( mustache, template, callback ) {
	var ractive, ref, keypath, parentFragment;

	this.parentFragment = parentFragment = mustache.parentFragment;
	this.root = ractive = mustache.root;
	this.mustache = mustache;

	this.ref = ref = template.r;
	this.callback = callback;

	this.unresolved = [];

	// Find base keypath
	if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
		this.base = keypath;
	} else {
		this.baseResolver = new ReferenceResolver( this, ref, keypath => {
			this.base = keypath;
			this.baseResolver = null;
			this.bubble();
		});
	}

	// Find values for members, or mark them as unresolved
	this.members = template.m.map( template => new MemberResolver( template, this, parentFragment ) );

	this.ready = true;
	this.bubble(); // trigger initial resolution if possible
};

ReferenceExpressionResolver.prototype = {
	getKeypath: function () {
		var values = this.members.map( getValue );

		if ( !values.every( isDefined ) || this.baseResolver ) {
			return null;
		}

		return this.base.join( values.join( '.' ) );
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

	rebind: function ( oldKeypath, newKeypath ) {
		var changed;

		this.members.forEach( members => {
			if ( members.rebind( oldKeypath, newKeypath ) ) {
				changed = true;
			}
		});

		if ( changed ) {
			this.bubble();
		}
	},

	forceResolution: function () {
		if ( this.baseResolver ) {
			this.base = getKeypath( this.ref );

			this.baseResolver.unbind();
			this.baseResolver = null;
		}

		this.members.forEach( forceResolution );
		this.bubble();
	}
};

function getValue ( member ) {
	return member.value;
}

function isDefined ( value ) {
	return value != undefined;
}

function forceResolution ( member ) {
	member.forceResolution();
}

export default ReferenceExpressionResolver;
