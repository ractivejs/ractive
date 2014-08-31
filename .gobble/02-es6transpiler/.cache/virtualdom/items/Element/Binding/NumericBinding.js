define(['virtualdom/items/Element/Binding/GenericBinding'],function (GenericBinding) {

	'use strict';
	
	return GenericBinding.extend({
		getInitialValue: function()  {return undefined},
	
		getValue: function () {
			var value = parseFloat( this.element.node.value );
			return isNaN( value ) ? undefined : value;
		}
	});

});