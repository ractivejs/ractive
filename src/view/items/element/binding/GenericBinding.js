import Binding from './Binding';
import { isNumeric } from '../../../../utils/is';
import handleDomEvent from './handleDomEvent';

function handleBlur () {
	handleDomEvent.call( this );

	const value = this._ractive.binding.model.get();
	this.value = value == undefined ? '' : value;
}

function handleDelay ( delay ) {
	let timeout;

	return function () {
		if ( timeout ) clearTimeout( timeout );

		timeout = setTimeout( () => {
			const binding = this._ractive.binding;
			if ( binding.rendered ) handleDomEvent.call( this );
			timeout = null;
		}, delay );
	};
}

export default class GenericBinding extends Binding {
	getInitialValue () {
		return '';
	}

	getValue () {
		return this.node.value;
	}

	render () {
		super.render();

		// any lazy setting for this element overrides the root
		// if the value is a number, it's a timeout
		let lazy = this.ractive.lazy;
		let timeout = false;
		const el = this.element;

		if ( 'lazy' in this.element ) {
			lazy = this.element.lazy;
		}

		if ( isNumeric( lazy ) ) {
			timeout = +lazy;
			lazy = false;
		}

		this.handler = timeout ? handleDelay( timeout ) : handleDomEvent;

		const node = this.node;

		el.on( 'change', handleDomEvent );

		if ( node.type !== 'file' ) {
			if ( !lazy ) {
				el.on( 'input', this.handler );

				// IE is a special snowflake
				if ( node.attachEvent ) {
					el.on( 'keyup', this.handler );
				}
			}

			el.on( 'blur', handleBlur );
		}
	}

	unrender () {
		const el = this.element;
		this.rendered = false;

		el.off( 'change', handleDomEvent );
		el.off( 'input', this.handler );
		el.off( 'keyup', this.handler );
		el.off( 'blur', handleBlur );
	}
}
