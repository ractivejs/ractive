import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var GenericBinding = function ( attribute, node ) {
	inheritProperties( this, attribute, node );

	node.addEventListener( 'change', updateModel, false );

	if ( !this.root.lazy ) {
		node.addEventListener( 'input', updateModel, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'keyup', updateModel, false );
		}
	}

	this.node.addEventListener( 'blur', updateModelAndView, false );
};

GenericBinding.prototype = {
	value: function () {
		var value = this.attr.node.value;

		// if the value is numeric, treat it as a number. otherwise don't
		if ( ( +value + '' === value ) && value.indexOf( 'e' ) === -1 ) {
			value = +value;
		}

		return value;
	},

	update: function () {
		var attribute = this.attr, value = this.value();

		runloop.addBinding( attribute );
		set( attribute.root, attribute.keypath, value );
		runloop.trigger();
	},

	teardown: function () {
		this.node.removeEventListener( 'change', updateModel, false );
		this.node.removeEventListener( 'input', updateModel, false );
		this.node.removeEventListener( 'keyup', updateModel, false );
		this.node.removeEventListener( 'blur', updateModelAndView, false );
	}
};

export default GenericBinding;
