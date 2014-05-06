import runloop from 'global/runloop';

var Unresolved = function ( ractive, ref, parentFragment, callback ) {
    this.root = ractive;
    this.ref = ref;
    this.parentFragment = parentFragment;

    this.resolve = callback;

    runloop.addUnresolved( this );
};

Unresolved.prototype = {
    teardown: function () {
        runloop.removeUnresolved( this );
    }
};

export default Unresolved;
