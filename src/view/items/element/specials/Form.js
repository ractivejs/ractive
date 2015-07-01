import runloop from 'global/runloop';
import Element from '../../Element';

export default class Form extends Element {
	constructor ( options ) {
		super( options );
		this.formBindings = [];
	}

	render () {
		const node = super.render();
		node.addEventListener( 'reset', handleReset, false );

		return node;
	}

	unrender () {
		this.node.removeEventListener( 'reset', handleReset, false );
	}
}

function handleReset ( event ) {
	var element = this._ractive.proxy;

	runloop.start();
	element.formBindings.forEach( updateModel );
	runloop.end();

	event.preventDefault();
}

function updateModel ( binding ) {
	binding.model.set( binding.resetValue );
}
