import Element from '../../Element';
import runloop from 'global/runloop';
import { toArray } from 'utils/array';

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

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;

			runloop.scheduleTask( () => {
				this.sync();
				this.dirty = false;
			});
		}

		this.parentFragment.bubble(); // default behaviour
	}

	render ( target ) {
		super.render( target );
		this.sync();

		const node = this.node;

		let i = node.options.length;
		while ( i-- ) {
			node.options[i].defaultSelected = node.options[i].selected;
		}
	}

	sync () {
		const selectNode = this.node;

		if ( !selectNode ) return;

		const options = toArray( selectNode.options );

		const selectValue = this.getAttribute( 'value' );
		const isMultiple = this.getAttribute( 'multiple' );

		// If the <select> has a specified value, that should override
		// these options
		if ( selectValue !== undefined ) {
			let optionWasSelected;

			options.forEach( o => {
				const optionValue = o._ractive ? o._ractive.value : o.value;
				const shouldSelect = isMultiple ? valueContains( selectValue, optionValue ) : selectValue == optionValue;

				if ( shouldSelect ) {
					optionWasSelected = true;
				}

				o.selected = shouldSelect;
			});

			if ( !optionWasSelected && !isMultiple ) {
				if ( options[0] ) {
					options[0].selected = true;
				}

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
