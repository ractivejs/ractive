import GenericBinding from './GenericBinding';

var ContentEditableBinding = GenericBinding.extend({
	getInitialValue: function () {
		return this.element.fragment ? this.element.fragment.toString() : '';
	},

	getValue: function () {
		return this.element.node.innerHTML;
	}
});

export default ContentEditableBinding;
