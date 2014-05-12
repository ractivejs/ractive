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
	setValue: function ( value ) {
		if ( !isEqual( value, this.value ) ) {
			this.value = value;
			this.computation.bubble();
		}
	},

	teardown: function () {
		unregisterDependant( this );
	}
};

export default Watcher;
