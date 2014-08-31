export default function Attribute$updateContentEditableValue () {
	var value = this.value;

	if ( value === undefined ) {
		value = '';
	}

	if ( !this.locked ) {
		this.node.innerHTML = value;
	}
}
