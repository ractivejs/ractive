import runloop from 'global/runloop';

// This is the handler for DOM events that would lead to a change in the model
// (i.e. change, sometimes, input, and occasionally click and keyup)
export default function updateModel () {
	runloop.start( this._ractive.root );
	this._ractive.binding.update();
	runloop.end();
};
