import types from 'config/types';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';

var MemberResolver = function ( template, resolver, parentFragment ) {
	var member = this, keypath;

	member.resolver = resolver;
	member.root = resolver.root;
	member.parentFragment = parentFragment;
	member.viewmodel = resolver.root.viewmodel;

	if ( typeof template === 'string' ) {
		member.value = template;
	}

	// Simple reference?
	else if ( template.t === types.REFERENCE ) {
		member.refResolver = createReferenceResolver( this, template.n, keypath => {
			member.resolve( keypath );
		});
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
		if ( this.keypath ) {
			this.viewmodel.unregister( this.keypath, this );
		}

		this.keypath = keypath;
		this.value = this.viewmodel.get( keypath );

		this.bind();

		this.resolver.bubble();
	},

	bind: function () {
		this.viewmodel.register( this.keypath, this );
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		if ( this.refResolver ) {
			this.refResolver.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	},

	setValue: function ( value ) {
		this.value = value;
		this.resolver.bubble();
	},

	unbind: function () {
		if ( this.keypath ) {
			this.viewmodel.unregister( this.keypath, this );
		}

		if ( this.refResolver ) {
			this.refResolver.unbind();
		}
	},

	forceResolution: function () {
		if ( this.refResolver ) {
			this.refResolver.forceResolution();
		}
	}
};

export default MemberResolver;
