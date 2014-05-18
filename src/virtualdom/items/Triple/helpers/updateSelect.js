var selector = 'option[selected]';

export default function updateSelect ( parentElement ) {
	var options, option, value;

	if ( !parentElement || parentElement.name !== 'select' || !parentElement.binding ) {
		return;
	}

	// If one of them had a `selected` attribute, we need to sync
	// the model to the view
	if ( parentElement.getAttribute( 'multiple' ) ) {
		options = parentElement.findAll( selector );
		value = options.map( o => o.value );
	} else if ( option = parentElement.find( selector ) ) {
		value = option.value;
	}

	if ( value !== undefined ) {
		parentElement.binding.setValue( value );
	}

	parentElement.bubble();
}
