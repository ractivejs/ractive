import runloop from '../../../../global/runloop';
import { removeFromArray } from '../../../../utils/array';
import Binding from './Binding';
import handleDomEvent from './handleDomEvent';

const siblings = {};

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

		this.element.on( 'change', handleDomEvent );

		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	}

	setFromNode ( node ) {
		this.model.set( node.checked );
	}

	unbind () {
		removeFromArray( this.siblings, this );
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
		this.element.off( 'click', handleDomEvent );
	}
}
