import GenericBinding from './GenericBinding';

export default GenericBinding.extend({
	getInitialValue: () => undefined,

	getValue: function () {
		var value = parseFloat( this.element.node.value );
		return isNaN( value ) ? undefined : value;
	}
});
