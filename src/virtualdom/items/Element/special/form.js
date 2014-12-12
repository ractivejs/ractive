import runloop from 'global/runloop';

export function render ( element ) {
	element.node.addEventListener( 'reset', handleReset, false);
}

export function unrender ( element ) {
	element.node.removeEventListener( 'reset', handleReset, false);
}

function handleReset () {
	var element = this._ractive.proxy;

	runloop.start();
	element.formBindings.forEach( updateModel );
	runloop.end();
}

function updateModel ( binding ) {
	binding.root.viewmodel.set( binding.keypath, binding.resetValue );
}