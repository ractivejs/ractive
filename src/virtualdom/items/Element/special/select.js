import { toArray } from 'utils/array';
import runloop from 'global/runloop';

export function bubble () {
	if ( !this.dirty ) {
		this.dirty = true;

		runloop.scheduleTask( () => {
			sync( this );
			this.dirty = false;
		});
	}

	this.parentFragment.bubble(); // default behaviour
}

function sync ( selectElement ) {
	var selectNode, selectValue, isMultiple, options, optionWasSelected;

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
				selectElement.binding.forceUpdate();
			}
		}
	}

	// Otherwise the value should be initialised according to which
	// <option> element is selected, if twoway binding is in effect
	else if ( selectElement.binding ) {
		selectElement.binding.forceUpdate();
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
