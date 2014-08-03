import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import createComponentBinding from 'shared/createComponentBinding';

var ReferenceExpressionParameter = function ( component, childKeypath, template, toBind ) {
	this.root = component.root;
	this.parentFragment = component.parentFragment;

	this.ready = false;
	this.hash = null;

	this.resolver = new ReferenceExpressionResolver( this, template, keypath => {
		if ( this.hash && component.bindings[ this.hash ] ) {
			component.bindings[ this.hash ].unbind();
			component.bindings[ this.hash ] = null;
		}

		if ( !this.ready ) {
			toBind.push({
				childKeypath: childKeypath,
				parentKeypath: keypath
			});
		} else {
			createComponentBinding( component, component.root, keypath, childKeypath );
		}

		this.hash = keypath + '=' + childKeypath; // so we can unbind if it changes
		this.value = component.root.viewmodel.get( keypath );
	});
};

ReferenceExpressionParameter.prototype = {
	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		this.resolver.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	},

	unbind: function () {
		this.resolver.unbind();
	}
};

export default ReferenceExpressionParameter;
