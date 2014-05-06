import isEqual from 'utils/isEqual';
import registerDependant from 'shared/registerDependant';
import unregisterDependant from 'shared/unregisterDependant';

var Watcher = function ( computation, keypath ) {
    this.root = computation.ractive;
    this.keypath = keypath;
    this.priority = 0;

    this.computation = computation;

    registerDependant( this );
};

Watcher.prototype = {
    update: function () {
        var value;

        value = this.root.get( this.keypath );

        if ( !isEqual( value, this.value ) ) {
            this.computation.bubble();
        }
    },

    teardown: function () {
        unregisterDependant( this );
    }
};

export default Watcher;
