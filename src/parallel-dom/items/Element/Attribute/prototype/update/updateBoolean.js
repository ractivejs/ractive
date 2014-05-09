export default function Attribute$updateBooleanAttribute () {
	var node, value, binding;

	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		this.node[ this.propertyName ] = this.value;
	}

	// special case - a selected option whose select element has two-way binding
	if ( this.element.name === 'option' && this.node.selected && ( binding = this.element.select.binding ) ) {
		binding.dirty();
	}

}
