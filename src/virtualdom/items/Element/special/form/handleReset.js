import runloop from 'global/runloop';

export default function handleReset ( event ) {
	var element = this._ractive.proxy;

	event.preventDefault();

	runloop.start();
	element.formBindings.forEach( binding => {
		let value = binding.resetValue;

		element.node[ binding.attribute.name ] = value;
		element.root.viewmodel.set( binding.keypath, value );
	});
	runloop.end();
}