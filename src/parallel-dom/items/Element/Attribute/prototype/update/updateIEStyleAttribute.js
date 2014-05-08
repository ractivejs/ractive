export default function Attribute$updateIEStyleAttribute () {
	var node, value;

	node = this.node;
	value = this.fragment.getValue();

	if ( value === undefined ) {
		value = '';
	}

	if ( value !== this.value ) {
		node.style.setAttribute( 'cssText', value );
		this.value = value;
	}

	return this;
}
