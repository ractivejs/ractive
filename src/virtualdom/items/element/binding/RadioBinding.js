import runloop from 'global/runloop';
import { removeFromArray } from 'utils/array';
import Binding from './Binding';
import getBindingGroup from './getBindingGroup';
import handleDomEvent from './handleDomEvent';

let siblings = {};

function getSiblings ( hash ) {
	return siblings[ hash ] || ( siblings[ hash ] = [] );
}

export default class RadioBinding extends Binding {
	constructor ( element ) {
		super( element, 'checked' );

		this.siblings = getSiblings( this.ractive._guid + this.element.getAttribute( 'name' ) );
		this.siblings.push( this );
	}

	getValue () {
		return this.node.checked;
	}

	handleChange () {
		runloop.start( this.root );

		this.siblings.forEach( binding => {
			binding.model.set( binding.getValue() );
		});

		runloop.end();
	}

	render () {
		super.render();

		this.node.addEventListener( 'change', handleDomEvent, false );

		if ( this.node.attachEvent ) {
			this.node.addEventListener( 'click', handleDomEvent, false );
		}
	}

	unbind () {
		removeFromArray( this.siblings, this );
	}

	unrender () {
		this.node.removeEventListener( 'change', handleDomEvent, false );
		this.node.removeEventListener( 'click', handleDomEvent, false );
	}
}
