import circular from 'circular';
import removeFromArray from 'utils/removeFromArray';
import runloop from 'global/runloop';
import notifyDependants from 'shared/notifyDependants';

var get, empty = {};

circular.push( function () {
    get = circular.get;
});

var UnresolvedImplicitDependency = function ( ractive, keypath ) {
    this.root = ractive;
    this.ref = keypath;
    this.parentFragment = empty;

    ractive._unresolvedImplicitDependencies[ keypath ] = true;
    ractive._unresolvedImplicitDependencies.push( this );

    runloop.addUnresolved( this );
};

UnresolvedImplicitDependency.prototype = {
    resolve: function () {
        var ractive = this.root;

        notifyDependants( ractive, this.ref );

        ractive._unresolvedImplicitDependencies[ this.ref ] = false;
        removeFromArray( ractive._unresolvedImplicitDependencies, this );
    },

    teardown: function () {
        runloop.removeUnresolved( this );
    }
};

export default UnresolvedImplicitDependency;
