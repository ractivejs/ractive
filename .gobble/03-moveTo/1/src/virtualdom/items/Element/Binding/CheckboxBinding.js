define(['virtualdom/items/Element/Binding/Binding','virtualdom/items/Element/Binding/shared/handleDomEvent'],function (Binding, handleDomEvent) {

	'use strict';
	
	var CheckboxBinding = Binding.extend({
		name: 'checked',
	
		render: function () {
			var node = this.element.node;
	
			node.addEventListener( 'change', handleDomEvent, false );
	
			if ( node.attachEvent ) {
				node.addEventListener( 'click', handleDomEvent, false );
			}
		},
	
		unrender: function () {
			var node = this.element.node;
	
			node.removeEventListener( 'change', handleDomEvent, false );
			node.removeEventListener( 'click', handleDomEvent, false );
		},
	
		getValue: function () {
			return this.element.node.checked;
		}
	});
	
	return CheckboxBinding;

});