define(['virtualdom/items/Element/Binding/Binding','virtualdom/items/Element/Binding/shared/handleDomEvent'],function (Binding, handleDomEvent) {

	'use strict';
	
	var FileListBinding = Binding.extend({
		render: function () {
			this.element.node.addEventListener( 'change', handleDomEvent, false );
		},
	
		unrender: function () {
			this.element.node.removeEventListener( 'change', handleDomEvent, false );
		},
	
		getValue: function () {
			return this.element.node.files;
		}
	});
	
	return FileListBinding;

});