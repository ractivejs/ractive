export default function Attribute$updateRadioName () {
	var { node, value } = this;
	node.checked = ( value == node._ractive.value );
}
