import Element from '../../Element';
import { removeFromArray } from 'utils/array';

function findParentSelect ( element ) {
	while ( element ) {
		if ( element.name === 'select' ) return element;
		element = element.parent;
	}
}

export default class Option extends Element {
	constructor ( options ) {
		super( options );

		this.select = findParentSelect( this.parent );

		// we might be inside a <datalist> element
		if ( !this.select ) return;

		const template = options.template;
		if ( !template.a ) template.a = {};

		// If the value attribute is missing, use the element's content,
		// as long as it isn't disabled
		if ( template.a.value === undefined && !( 'disabled' in template ) ) {
			template.a.value = template.f;
		}
	}

	bind () {
		// If the select has a value, it overrides the `selected` attribute on
		// this option - so we delete the attribute
		const selectedAttribute = this.attributeByName.selected;
		if ( selectedAttribute && this.select.getAttribute( 'value' ) !== undefined ) {
			const index = this.attributes.indexOf( selectedAttribute );
			this.attributes.splice( index, 1 );
			delete this.attributeByName.selected;
		}

		super.bind();
		this.select.options.push( this );
	}

	unbind () {
		super.unbind();
		removeFromArray( this.select.options, this );
	}
}
