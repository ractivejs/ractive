import runloop from 'global/runloop';
import toArray from 'utils/toArray';
import set from 'shared/set';

export default function Triple$render () {
	var parentElement;

	if ( this.rendered ) {
		throw new Error( 'Attempted to render an item that was already rendered' );
	}

	this.docFrag = document.createDocumentFragment();

	this.update();

	// Special case - we're inserting the contents of a <select>
	parentElement = this.pElement;
	if ( parentElement && parentElement.name === 'select' ) {
		//processSelect( parentElement, this.docFrag );
	}

	this.rendered = true;

	return this.docFrag;
}

function processSelect ( selectElement, docFrag ) {
	var selectValue, isMultiple, options, value, i;

	selectValue = selectElement.getAttribute( 'value' );
	isMultiple = selectElement.getAttribute( 'multiple' );

	options = toArray( docFrag.querySelectorAll( 'option' ) );

	// If the <select> has a specified value, that should override
	// these options
	if ( selectValue !== undefined ) {
		options.forEach( o => {
			o.selected = isMultiple ? valueContains( selectValue, o.value ) : selectValue == o.value;
		});
	}

	// Otherwise the value should be initialised according to which
	// <option> element is selected, if twoway binding is in effect
	else if ( selectElement.binding ) {
		if ( isMultiple ) {
			value = options.reduce( ( array, o ) => {
				if ( o.selected ) {
					array.push( o.value );
				}

				return array;
			}, [] );
		} else {
			i = options.length;
			while ( i-- ) {
				if ( options[i].selected ) {
					value = options[i].value;
					break;
				}
			}
		}

		runloop.lockAttribute( selectElement.attributes.value );
		set( selectElement.root, selectElement.binding.keypath );
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
