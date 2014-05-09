import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var FileListBinding = function ( attribute, node ) {
	inheritProperties( this, attribute, node );

	node.addEventListener( 'change', updateModel, false );
};

FileListBinding.prototype = {
	value: function () {
		return this.attr.node.files;
	},

	update: function () {
		set( this.attr.root, this.attr.keypath, this.value() );
		runloop.trigger();
	},

	teardown: function () {
		this.node.removeEventListener( 'change', updateModel, false );
	}
};

export default FileListBinding;
