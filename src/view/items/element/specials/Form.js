import runloop from '../../../../global/runloop';
import Element from '../../Element';

export default class Form extends Element {
	constructor ( options ) {
		super( options );
		this.formBindings = [];
	}

	render ( target, occupants ) {
		super.render( target, occupants );
		this.node.addEventListener( 'reset', handleReset, false );
	}

	unrender ( shouldDestroy ) {
		this.node.removeEventListener( 'reset', handleReset, false );
		super.unrender( shouldDestroy );
	}
}

function handleReset () {
	const element = this._ractive.proxy;

	runloop.start();
	element.formBindings.forEach( updateModel );
	runloop.end();
}

function updateModel ( binding ) {
	binding.model.set( binding.resetValue );
}
