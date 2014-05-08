export default function Attribute$updateEverythingElse () {
	var node, value, binding;

	node = this.node;
	value = this.fragment.getValue();

	// store actual value, so it doesn't get coerced to a string
	if ( this.isValueAttribute ) {
		node._ractive.value = value;
	}

	if ( value == undefined ) {
		value = '';
	}

	if ( value !== this.value ) {
		if ( this.useProperty ) {

			// with two-way binding, only update if the change wasn't initiated by the user
			// otherwise the cursor will often be sent to the wrong place
			if ( !this.active ) {
				node[ this.propertyName ] = value;
			}

			// special case - a selected option whose select element has two-way binding
			if ( node.tagName === 'OPTION' && node.selected && ( binding = this.element.select.binding ) ) {
				binding.update();
			}

			this.value = value;

			return this;
		}

		if ( this.namespace ) {
			node.setAttributeNS( this.namespace, this.name, value );
			this.value = value;

			return this;
		}

		if ( this.lcName === 'id' ) {
			if ( this.value !== undefined ) {
				this.root.nodes[ this.value ] = undefined;
			}

			this.root.nodes[ value ] = node;
		}

		node.setAttribute( this.name, value );

		this.value = value;
	}

	return this;
}
