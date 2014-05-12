export default function Attribute$updateRadioName () {
	var node, value;

	node = this.node;
	value = this.value;

	node.checked = ( value == node._ractive.value );
}
