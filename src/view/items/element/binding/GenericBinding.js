import Binding from './Binding';
import { isNumeric } from 'utils/is';
import handleDomEvent from './handleDomEvent';

function handleBlur () {
	var value;

	handleDomEvent.call( this );

	value = this._ractive.binding.model.value;
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

		// TODO handle at parse time
		if ( this.element.template.a && ( 'lazy' in this.element.template.a ) ) {
			lazy = this.element.template.a.lazy;
			if ( lazy === 0 ) lazy = true; // empty attribute
		}

		if ( isNumeric( lazy ) ) {
			lazy = false;
			timeout = +lazy;
		}

		this.handler = timeout ? handleDelay( timeout ) : handleDomEvent;

		const node = this.node;

		node.addEventListener( 'change', handleDomEvent, false );

		if ( !lazy ) {
			node.addEventListener( 'input', this.handler, false );

			if ( node.attachEvent ) {
				node.addEventListener( 'keyup', this.handler, false );
			}
		}

		node.addEventListener( 'blur', handleBlur, false );
	}

	unrender () {
		var node = this.element.node;
		this.rendered = false;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'input', this.handler, false );
		node.removeEventListener( 'keyup', this.handler, false );
		node.removeEventListener( 'blur', handleBlur, false );
	}
}
