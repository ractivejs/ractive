import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var ContentEditableBinding = function ( attribute, node ) {
	inheritProperties( this, attribute, node );

	node.addEventListener( 'change', updateModel, false );
	if ( !this.root.lazy ) {
		node.addEventListener( 'input', updateModel, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'keyup', updateModel, false );
		}
	}
};

ContentEditableBinding.prototype = {
	update: function () {
		runloop.addBinding( this.attr );
		set( this.root, this.keypath, this.node.innerHTML );
		runloop.trigger();
	},

	teardown: function () {
		this.node.removeEventListener( 'change', updateModel, false );
		this.node.removeEventListener( 'input', updateModel, false );
		this.node.removeEventListener( 'keyup', updateModel, false );
	}
};

export default ContentEditableBinding;
