define(['virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver','shared/createComponentBinding'],function (ReferenceExpressionResolver, createComponentBinding) {

	'use strict';
	
	var ReferenceExpressionParameter = function ( component, childKeypath, template, toBind ) {var this$0 = this;
		this.root = component.root;
		this.parentFragment = component.parentFragment;
	
		this.ready = false;
		this.hash = null;
	
		this.resolver = new ReferenceExpressionResolver( this, template, function(keypath ) {
			// Are we updating an existing binding?
			if ( this$0.binding || ( this$0.binding = component.bindings[ this$0.hash ] ) ) {
				component.bindings[ this$0.hash ] = null;
	
				this$0.binding.rebind( keypath );
	
				this$0.hash = keypath + '=' + childKeypath;
				component.bindings[ this$0.hash ];
			}
	
			else {
				if ( !this$0.ready ) {
					// The child instance isn't created yet, we need to create the binding later
					toBind.push({
						childKeypath: childKeypath,
						parentKeypath: keypath
					});
				} else {
					createComponentBinding( component, component.root, keypath, childKeypath );
				}
			}
	
			this$0.value = component.root.viewmodel.get( keypath );
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
	
	return ReferenceExpressionParameter;

});