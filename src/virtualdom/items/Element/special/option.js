import { removeFromArray } from 'utils/array';

export function init ( option, template ) {
	option.select = findParentSelect( option.parent );

	// we might be inside a <datalist> element
	if ( !option.select ) {
		return;
	}

	option.select.options.push( option );

	// If the value attribute is missing, use the element's content
	if ( !template.a ) {
		template.a = {};
	}

	// ...as long as it isn't disabled
	if ( template.a.value === undefined && !template.a.hasOwnProperty( 'disabled' ) ) {
		template.a.value = template.f;
	}

	// If there is a `selected` attribute, but the <select>
	// already has a value, delete it
	if ( 'selected' in template.a && option.select.getAttribute( 'value' ) !== undefined ) {
		delete template.a.selected;
	}
}

export function unbind ( option ) {
	if ( option.select ) {
		removeFromArray( option.select.options, option );
	}
}

function findParentSelect ( element ) {
	if ( !element ) { return; }

	do {
		if ( element.name === 'select' ) {
			return element;
		}
	} while ( element = element.parent );
}
