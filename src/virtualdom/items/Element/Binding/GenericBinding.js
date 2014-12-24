import Binding from './Binding';
import handleDomEvent from './shared/handleDomEvent';
import { isNumeric } from 'utils/is';

var GenericBinding;

GenericBinding = Binding.extend({
	getInitialValue: () => '',

	getValue: function () {
		return this.element.node.value;
	},

	render: function () {
		var node = this.element.node, lazy, timeout = false;
		this.rendered = true;

		// any lazy setting for this element overrides the root
		// if the value is a number, it's a timeout
		lazy = this.root.lazy;
		if ( this.element.lazy === true ) {
			lazy = true;
		} else if ( this.element.lazy === false ) {
			lazy = false;
		} else if ( isNumeric( this.element.lazy ) ) {
			lazy = false;
			timeout = +this.element.lazy;
		} else if ( isNumeric( ( lazy || '' ) ) ) {
			lazy = false;
			timeout = +lazy;
		}

		this.handler = timeout ? handleDelay : handleDomEvent;

		node.addEventListener( 'change', handleDomEvent, false );

		if ( !lazy ) {
			node.addEventListener( 'input', this.handler, false );

			if ( node.attachEvent ) {
				node.addEventListener( 'keyup', this.handler, false );
			}
		}

		node.addEventListener( 'blur', handleBlur, false );
	},

	unrender: function () {
		var node = this.element.node;
		this.rendered = false;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'input', this.handler, false );
		node.removeEventListener( 'keyup', this.handler, false );
		node.removeEventListener( 'blur', handleBlur, false );
	}
});

export default GenericBinding;


function handleBlur () {
	var value;

	handleDomEvent.call( this );

	value = this._ractive.root.viewmodel.get( this._ractive.binding.keypath );
	this.value = value == undefined ? '' : value;
}

function handleDelay () {
	var binding = this._ractive.binding, el = this;

	if ( !!binding._timeout ) clearTimeout( binding._timeout );

	binding._timeout = setTimeout( () => {
		if ( binding.rendered ) handleDomEvent.call( el );
		binding._timeout = undefined;
	}, binding.element.lazy );
}
