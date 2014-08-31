import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import createComponentBinding from 'shared/createComponentBinding';

var ReferenceExpressionParameter = function ( component, childKeypath, template, toBind ) {
	this.root = component.root;
	this.parentFragment = component.parentFragment;

	this.ready = false;
	this.hash = null;

	this.resolver = new ReferenceExpressionResolver( this, template, keypath => {
		// Are we updating an existing binding?
		if ( this.binding || ( this.binding = component.bindings[ this.hash ] ) ) {
			component.bindings[ this.hash ] = null;

			this.binding.rebind( keypath );

			this.hash = keypath + '=' + childKeypath;
			component.bindings[ this.hash ];
		}

		else {
			if ( !this.ready ) {
				// The child instance isn't created yet, we need to create the binding later
				toBind.push({
					childKeypath: childKeypath,
					parentKeypath: keypath
				});
			} else {
				createComponentBinding( component, component.root, keypath, childKeypath );
			}
		}

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
