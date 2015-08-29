import runloop from '../../../../global/runloop';
import Element from '../../Element';

export default class Form extends Element {
	constructor ( options ) {
		super( options );
		this.formBindings = [];
	}

	render ( target ) {
		super.render( target );
		this.node.addEventListener( 'reset', handleReset, false );
	}

	unrender () {
		this.node.removeEventListener( 'reset', handleReset, false );
	}
}

function handleReset () {
	var element = this._ractive.proxy;

	runloop.start();
	element.formBindings.forEach( updateModel );
	runloop.end();
}

function updateModel ( binding ) {
	binding.model.set( binding.resetValue );
}
