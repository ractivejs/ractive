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

function LazyDispatcher ( self ) {
	return function lazyDispatcher () {
		// any lazy setting for this element overrides the root
		// if the value is a number, it's a timeout
		let lazy = self.ractive.lazy;
		let timeout = false;

		lazy = this.attributes.lazy.value;

		if ( lazy === 'false' ) lazy = false;

		if ( isNumeric( lazy ) ) {
			timeout = +lazy;
			lazy = false;
		}

		const handler = timeout ? handleDelay( timeout ) : handleDomEvent;
		
		if( !lazy )
			handler.apply( this, arguments );
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

		const node = this.node;
		
		this.handler = LazyDispatcher( this );

		node.addEventListener( 'input', this.handler, false );
		if ( node.attachEvent ) {
			node.addEventListener( 'keyup', this.handler, false );
		}
		
		node.addEventListener( 'change', handleDomEvent, false );
		node.addEventListener( 'blur', handleBlur, false );
	}

	unrender () {
		const node = this.element.node;
		this.rendered = false;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'input', this.handler, false );
		node.removeEventListener( 'keyup', this.handler, false );
		node.removeEventListener( 'blur', handleBlur, false );
	}
}
