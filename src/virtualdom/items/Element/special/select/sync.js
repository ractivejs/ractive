import toArray from 'utils/toArray';
import runloop from 'global/runloop';

export default function syncSelect ( selectElement ) {
	var selectNode, selectValue, isMultiple, options, i, optionWasSelected, result;

	selectNode = selectElement.node;

	if ( !selectNode ) {
		return;
	}

	options = toArray( selectNode.options );

	selectValue = selectElement.getAttribute( 'value' );
	isMultiple = selectElement.getAttribute( 'multiple' );

	// If the <select> has a specified value, that should override
	// these options
	if ( selectValue !== undefined ) {
		options.forEach( o => {
			var optionValue, shouldSelect;

			optionValue = o._ractive ? o._ractive.value : o.value;
			shouldSelect = isMultiple ? valueContains( selectValue, optionValue ) : selectValue == optionValue;

			if ( shouldSelect ) {
				optionWasSelected = true;
			}

			o.selected = shouldSelect;
		});

		if ( !optionWasSelected ) {
			if ( options[0] ) {
				options[0].selected = true;
			}

			if ( selectElement.binding ) {
				result = isMultiple ? [] : ( options[0] ? ( options[0]._ractive ? options[0]._ractive.value : options[0].value ) : undefined );
			}
		}
	}

	// Otherwise the value should be initialised according to which
	// <option> element is selected, if twoway binding is in effect
	else if ( selectElement.binding ) {
		if ( isMultiple ) {
			result = options.reduce( ( array, o ) => {
				if ( o.selected ) {
					array.push( o.value );
				}

				return array;
			}, [] );
		} else {
			i = options.length;
			while ( i-- ) {
				if ( options[i].selected ) {
					result = options[i].value;
					break;
				}
			}
		}
	}

	if ( result !== undefined ) {
		selectElement.attributes.value.locked = true;
		runloop.addViewmodel( selectElement.root.viewmodel );
		runloop.afterViewUpdate( () => selectElement.attributes.value.locked = false );
		selectElement.root.viewmodel.set( selectElement.binding.keypath, result );
	}
}

function valueContains ( selectValue, optionValue ) {
	var i = selectValue.length;
	while ( i-- ) {
		if ( selectValue[i] == optionValue ) {
			return true;
		}
	}
}
