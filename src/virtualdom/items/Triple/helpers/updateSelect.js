import { toArray } from 'utils/array';

export default function updateSelect ( parentElement ) {
	var selectedOptions, option, value;

	if ( !parentElement || parentElement.name !== 'select' || !parentElement.binding ) {
		return;
	}

	selectedOptions = toArray( parentElement.node.options ).filter( isSelected );

	// If one of them had a `selected` attribute, we need to sync
	// the model to the view
	if ( parentElement.getAttribute( 'multiple' ) ) {
		value = selectedOptions.map( o => o.value );
	} else if ( option = selectedOptions[0] ) {
		value = option.value;
	}

	if ( value !== undefined ) {
		parentElement.binding.setValue( value );
	}

	parentElement.bubble();
}

function isSelected ( option ) {
	return option.selected;
}
