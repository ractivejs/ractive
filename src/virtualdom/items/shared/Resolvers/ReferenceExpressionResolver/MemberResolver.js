import { REFERENCE } from 'config/types';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';

var MemberResolver = function ( template, resolver, parentFragment ) {
	this.resolver = resolver;
	this.root = resolver.root;
	this.parentFragment = parentFragment;
	this.viewmodel = resolver.root.viewmodel;

	if ( typeof template === 'string' ) {
		this.value = template;
	}

	// Simple reference?
	else if ( template.t === REFERENCE ) {
		this.refResolver = createReferenceResolver( this, template.n, ( keypath, newValue ) => {
			this.resolve( keypath, newValue === undefined ? true : newValue );
		});
	}

	// Otherwise we have an expression in its own right
	else {
		new ExpressionResolver( resolver, parentFragment, template, ( keypath, newValue ) => {
			this.resolve( keypath, newValue === undefined ? true : newValue );
		});
	}
};

MemberResolver.prototype = {
	resolve: function ( keypath, newValue = true ) {
		if ( this.keypath ) {
			this.viewmodel.unregister( this.keypath, this );
		}

		this.keypath = keypath;
		this.value = this.viewmodel.get( keypath );

		this.bind();

		this.resolver.bubble( newValue );
	},

	bind: function () {
		this.viewmodel.register( this.keypath, this );
	},

	rebind: function ( oldKeypath, newKeypath, newValue = true ) {
		if ( this.refResolver ) {
			this.refResolver.rebind( oldKeypath, newKeypath, newValue );
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
