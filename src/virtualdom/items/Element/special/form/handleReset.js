import runloop from 'global/runloop';

export default function handleReset () {
	var element = this._ractive.proxy;

	runloop.start();
	element.formBindings.forEach( updateModel );
	runloop.end();
}

function updateModel ( binding ) {
	binding.root.viewmodel.set( binding.keypath, binding.resetValue );
}