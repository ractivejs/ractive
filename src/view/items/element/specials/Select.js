import Element from '../../Element';
import { toArray } from '../../../../utils/array';
import { isArray } from '../../../../utils/is';
import getSelectedOptions from '../../../../utils/getSelectedOptions';

function valueContains ( selectValue, optionValue ) {
	let i = selectValue.length;
	while ( i-- ) {
		if ( selectValue[i] == optionValue ) return true;
	}
}

export default class Select extends Element {
	constructor ( options ) {
		super( options );
		this.options = [];
	}

	foundNode ( node ) {
		if ( this.binding ) {
			const selectedOptions = getSelectedOptions( node );

			if ( selectedOptions.length > 0 ) {
				this.selectedOptions = selectedOptions;
			}
		}
	}

	render ( target, occupants ) {
		super.render( target, occupants );
		this.sync();

		const node = this.node;

		let i = node.options.length;
		while ( i-- ) {
			node.options[i].defaultSelected = node.options[i].selected;
		}

		this.rendered = true;
	}

	sync () {
		const selectNode = this.node;

		if ( !selectNode ) return;

		const options = toArray( selectNode.options );

		if ( this.selectedOptions ) {
			options.forEach( o => {
				if ( this.selectedOptions.indexOf( o ) >= 0 ) o.selected = true;
				else o.selected = false;
			});
			this.binding.setFromNode( selectNode );
			delete this.selectedOptions;
			return;
		}

		const selectValue = this.getAttribute( 'value' );
		const isMultiple = this.getAttribute( 'multiple' );
		const array = isMultiple && isArray( selectValue );

		// If the <select> has a specified value, that should override
		// these options
		if ( selectValue !== undefined ) {
			let optionWasSelected;

			options.forEach( o => {
				const optionValue = o._ractive ? o._ractive.value : o.value;
				const shouldSelect = isMultiple ? array && valueContains( selectValue, optionValue ) : selectValue == optionValue;

				if ( shouldSelect ) {
					optionWasSelected = true;
				}

				o.selected = shouldSelect;
			});

			if ( !optionWasSelected && !isMultiple ) {
				if ( this.binding ) {
					this.binding.forceUpdate();
				}
			}
		}

		// Otherwise the value should be initialised according to which
		// <option> element is selected, if twoway binding is in effect
		else if ( this.binding ) {
			this.binding.forceUpdate();
		}
	}

	update () {
		super.update();
		this.sync();
	}
}
