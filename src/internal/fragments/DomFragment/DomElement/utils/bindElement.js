bindElement = function ( element, attributes ) {
	element.ractify();

	if ( element.node.getAttribute( 'contenteditable' ) ) {
		if ( attributes.value ) {
			attributes.value.bind();
		}

		return;
	}

	// an element can only have one two-way attribute
	switch ( element.descriptor.e ) {
		case 'select':
		case 'textarea':
		if ( attributes.value ) {
			attributes.value.bind();
		}
		return;

		case 'input':

		if ( element.node.type === 'radio' || element.node.type === 'checkbox' ) {
			// we can either bind the name attribute, or the checked attribute - not both
			if ( attributes.name && attributes.name.bind() ) {
				return;
			}

			if ( attributes.checked && attributes.checked.bind() ) {
				return;
			}
		}

		if ( attributes.value && attributes.value.bind() ) {
			return;
		}
	}
};