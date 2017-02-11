import Element from '../../Element';
import { removeFromArray } from '../../../../utils/array';
import findElement from '../../shared/findElement';

export default class Option extends Element {
	constructor ( options ) {
		const template = options.template;
		if ( !template.a ) template.a = {};

		// If the value attribute is missing, use the element's content,
		// as long as it isn't disabled
		if ( template.a.value === undefined && !( 'disabled' in template.a ) ) {
			template.a.value = template.f || '';
		}

		super( options );

		this.select = findElement( this.parent || this.parentFragment, false, 'select' );
	}

	bind () {
		if ( !this.select ) {
			super.bind();
			return;
		}

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

	bubble () {
		// if we're using content as value, may need to update here
		const value = this.getAttribute( 'value' );
		if ( this.node && this.node.value !== value ) {
			this.node._ractive.value = value;
		}
		super.bubble();
	}

	getAttribute ( name ) {
		const attribute = this.attributeByName[ name ];
		return attribute ? attribute.getValue() : name === 'value' && this.fragment ? this.fragment.valueOf() : undefined;
	}

	isSelected () {
		const optionValue = this.getAttribute( 'value' );

		if ( optionValue === undefined || !this.select ) {
			return false;
		}

		const selectValue = this.select.getAttribute( 'value' );

		if ( this.select.compare( selectValue, optionValue ) ) {
			return true;
		}

		if ( this.select.getAttribute( 'multiple' ) && Array.isArray( selectValue ) ) {
			let i = selectValue.length;
			while ( i-- ) {
				if ( this.select.compare( selectValue[i], optionValue ) ) {
					return true;
				}
			}
		}
	}

	render ( target, occupants ) {
		super.render( target, occupants );

		if ( !this.attributeByName.value ) {
			this.node._ractive.value = this.getAttribute( 'value' );
		}
	}

	unbind () {
		super.unbind();

		if ( this.select ) {
			removeFromArray( this.select.options, this );
		}
	}
}
