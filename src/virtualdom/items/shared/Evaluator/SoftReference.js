import isEqual from 'utils/isEqual';

var SoftReference = function ( ractive, keypath, evaluator ) {
	this.root = ractive;
	this.keypath = keypath;
	this.priority = evaluator.priority;

	this.evaluator = evaluator;

	ractive.viewmodel.register( this );
};

SoftReference.prototype = {
	setValue: function ( value ) {
		if ( !isEqual( value, this.value ) ) {
			this.evaluator.bubble();
			this.value = value;
		}
	},

	teardown: function () {
		this.root.viewmodel.unregister( this );
	}
};

export default SoftReference;
