export default function () {

    var attributes = this.attributes;

    if ( !this.node ) {
        // we're not in a browser!
        return;
    }

    // if this is a late binding, and there's already one, it
    // needs to be torn down
    if ( this.binding ) {
        this.binding.teardown();
        this.binding = null;
    }

    // contenteditable
    if ( this.node.getAttribute( 'contenteditable' ) && attributes.value && attributes.value.bind() ) {
        return;
    }

    // an element can only have one two-way attribute
    switch ( this.lcName ) {
        case 'select':
        case 'textarea':
        if ( attributes.value ) {
            attributes.value.bind();
        }
        return;

        case 'input':

        if ( this.node.type === 'radio' || this.node.type === 'checkbox' ) {
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
