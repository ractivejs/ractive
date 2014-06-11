import isEqual from 'utils/isEqual';

var Watcher = function ( computation, keypath ) {
	this.root = computation.ractive;
	this.keypath = keypath;
	this.priority = 0;

	this.computation = computation;

	this.root.viewmodel.register( this );
};

Watcher.prototype = {
	setValue: function ( value ) {
		if ( !isEqual( value, this.value ) ) {
			this.value = value;
			this.computation.bubble();
		}
	},

	teardown: function () {
		this.root.viewmodel.unregister( this );
	}
};

export default Watcher;
