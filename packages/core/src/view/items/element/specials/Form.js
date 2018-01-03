import runloop from '../../../../global/runloop';
import Element from '../../Element';

export default class Form extends Element {
	constructor ( options ) {
		super( options );
		this.formBindings = [];
	}

	render ( target, occupants ) {
		super.render( target, occupants );
		this.on( 'reset', handleReset );
	}

	unrender ( shouldDestroy ) {
		this.off( 'reset', handleReset );
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
