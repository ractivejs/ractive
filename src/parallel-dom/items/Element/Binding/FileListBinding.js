import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var FileListBinding = function ( element ) {
	initBinding( this, element );
};

FileListBinding.prototype = {
	render: function () {
		this.element.node.addEventListener( 'change', handleChange, false );
	},

	unrender: function () {
		this.element.node.removeEventListener( 'change', handleChange, false );
	},

	getValue: function () {
		return this.element.node.files;
	},

	update: function () {
		runloop.lockAttribute( this.attribute );
		set( this.root, this.keypath, this.getValue() );
		runloop.trigger();
	}
};

export default FileListBinding;
