import isEqual from 'utils/isEqual';
import registerDependant from 'shared/registerDependant';
import unregisterDependant from 'shared/unregisterDependant';

var SoftReference = function ( root, keypath, evaluator ) {
	this.root = root;
	this.keypath = keypath;
	this.priority = evaluator.priority;

	this.evaluator = evaluator;

	registerDependant( this );
};

SoftReference.prototype = {
	setValue: function ( value ) {
		if ( !isEqual( value, this.value ) ) {
			this.evaluator.bubble();
			this.value = value;
		}
	},

	teardown: function () {
		unregisterDependant( this );
	}
};

export default SoftReference;
