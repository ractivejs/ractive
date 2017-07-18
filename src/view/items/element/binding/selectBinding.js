import { INTERPOLATOR, TRIPLE } from '../../../../config/types';
import { warnIfDebug } from '../../../../utils/log';
import CheckboxBinding from './CheckboxBinding';
import CheckboxNameBinding from './CheckboxNameBinding';
import ContentEditableBinding from './ContentEditableBinding';
import FileBinding from './FileBinding';
import GenericBinding from './GenericBinding';
import MultipleSelectBinding from './MultipleSelectBinding';
import NumericBinding from './NumericBinding';
import RadioBinding from './RadioBinding';
import RadioNameBinding from './RadioNameBinding';
import SingleSelectBinding from './SingleSelectBinding';

export function isBindable ( attribute ) {

	// The fragment must be a single non-string fragment
	if ( !attribute || !attribute.template.f || attribute.template.f.length !== 1 || attribute.template.f[0].s ) return false;

	// A binding is an interpolator `{{ }}`, yey.
	if ( attribute.template.f[0].t === INTERPOLATOR ) return true;

	// The above is probably the only true case. For the rest, show an appropriate
	// warning before returning false.

	// You can't bind a triple curly. HTML values on an attribute makes no sense.
	if ( attribute.template.f[0].t === TRIPLE ) warnIfDebug( 'It is not possible create a binding using a triple mustache.' );

	return false;
}

export default function selectBinding ( element ) {
	const name = element.name;
	const attributes = element.attributeByName;
	const isBindableByValue = isBindable( attributes.value );
	const isBindableByContentEditable = isBindable( attributes.contenteditable );
	const isContentEditable =  element.getAttribute( 'contenteditable' );

	// contenteditable
	// Bind if the contenteditable is true or a binding that may become true.
	if ( ( isContentEditable || isBindableByContentEditable ) && isBindableByValue ) return ContentEditableBinding;

	// <input>
	if ( name === 'input' ) {
		const type = element.getAttribute( 'type' );

		if ( type === 'radio' ) {
			const isBindableByName = isBindable( attributes.name );
			const isBindableByChecked = isBindable( attributes.checked );

			// For radios we can either bind the name or checked, but not both.
			// Name binding is handed instead.
			if ( isBindableByName && isBindableByChecked ) {
				warnIfDebug( 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both', { ractive: element.root });
				return RadioNameBinding;
			}

			if ( isBindableByName ) return RadioNameBinding;

			if ( isBindableByChecked ) return RadioBinding;

			// Dead end. Unknown binding on radio input.
			return null;
		}

		if ( type === 'checkbox' ) {
			const isBindableByName = isBindable( attributes.name );
			const isBindableByChecked = isBindable( attributes.checked );

			// A checkbox with bindings for both name and checked. Checked treated as
			// the checkbox value, name is treated as a regular binding.
			//
			// See https://github.com/ractivejs/ractive/issues/1749
			if ( isBindableByName && isBindableByChecked ) return CheckboxBinding;

			if ( isBindableByName ) return CheckboxNameBinding;

			if ( isBindableByChecked ) return CheckboxBinding;

			// Dead end. Unknown binding on checkbox input.
			return null;
		}

		if ( type === 'file' && isBindableByValue ) return FileBinding;

		if ( type === 'number' && isBindableByValue ) return NumericBinding;

		if ( type === 'range' && isBindableByValue ) return NumericBinding;

		// Some input of unknown type (browser usually falls back to text).
		if ( isBindableByValue ) return GenericBinding;

		// Dead end. Some unknown input and an unbindable.
		return null;
	}

	// <select>
	if ( name === 'select' && isBindableByValue ){
		return element.getAttribute( 'multiple' ) ? MultipleSelectBinding : SingleSelectBinding;
	}

	// <textarea>
	if ( name === 'textarea' && isBindableByValue ) return GenericBinding;

	// Dead end. Some unbindable element.
	return null;
}
