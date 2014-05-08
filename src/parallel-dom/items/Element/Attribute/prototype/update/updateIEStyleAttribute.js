export default function Attribute$updateIEStyleAttribute () {
	var node, value;

	node = this.node;
	value = this.value;

	if ( value === undefined ) {
		value = '';
	}

	node.style.setAttribute( 'cssText', value );
}
