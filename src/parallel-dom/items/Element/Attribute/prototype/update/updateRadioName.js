export default function Attribute$updateRadioName () {
	var node, value;

	node = this.node;
	value = this.fragment.getValue();

	node.checked = ( value == node._ractive.value );

	return this;
}
