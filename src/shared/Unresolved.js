import runloop from 'global/runloop';

// TODO this should be deprecated in favour of ReferenceResolver

var Unresolved = function ( ractive, ref, parentFragment, callback ) {
	this.root = ractive;
	this.ref = ref;
	this.parentFragment = parentFragment;

	this.resolve = callback;

	runloop.addUnresolved( this );
};

Unresolved.prototype = {
	unbind: function () {
		runloop.removeUnresolved( this );
	}
};

export default Unresolved;
