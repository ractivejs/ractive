import runloop from 'global/runloop';
import set from 'shared/set';
import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var CheckedBinding = function ( attribute, node ) {
	inheritProperties( this, attribute, node );

	node.addEventListener( 'change', updateModel, false );

	if ( node.attachEvent ) {
		node.addEventListener( 'click', updateModel, false );
	}
};

CheckedBinding.prototype = {
	value: function () {
		return this.node.checked;
	},

	update: function () {
		runloop.addBinding( this.attr );
		set( this.root, this.keypath, this.value() );
		runloop.trigger();
	},

	teardown: function () {
		this.node.removeEventListener( 'change', updateModel, false );
		this.node.removeEventListener( 'click', updateModel, false );
	}
};

export default CheckedBinding;
