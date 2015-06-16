import Element from '../../Element';
import { removeFromArray } from 'utils/array';

function findParentSelect ( element ) {
	while ( element ) {
		if ( element.name === 'select' ) return element;
		element = element.parent;
	}
}

export default class Select extends Element {
	constructor ( options ) {
		super( options );

		this.select = findParentSelect( this.parent );

		const template = options.template;

		// If the value attribute is missing, use the element's content
		if ( !template.a ) {
			template.a = {};
		}

		// ...as long as it isn't disabled
		if ( template.a.value === undefined && !( 'disabled' in template ) ) {
			template.a.value = template.f;
		}

		// If there is a `selected` attribute, but the <select>
		// already has a value, delete it
		// TODO the value won't have been bound yet... how do we get round this?
		if ( 'selected' in template.a && this.select.getAttribute( 'value' ) !== undefined ) {
			delete template.a.selected;
		}
	}

	bind () {
		super.bind();
		this.select.options.push( this );
	}

	unbind () {
		super.unbind();
		removeFromArray( this.select.options, this );
	}
}
