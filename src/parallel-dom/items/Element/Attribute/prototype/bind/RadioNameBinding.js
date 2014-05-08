import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var RadioNameBinding = function ( attribute, node ) {
	var valueFromModel;

	this.radioName = true; // so that updateModel knows what to do with this

	inheritProperties( this, attribute, node );

	node.name = '{{' + attribute.keypath + '}}';

	node.addEventListener( 'change', updateModel, false );

	if ( node.attachEvent ) {
		node.addEventListener( 'click', updateModel, false );
	}

	valueFromModel = get( this.root, this.keypath );
	if ( valueFromModel !== undefined ) {
		node.checked = ( valueFromModel == node._ractive.value );
	} else {
		runloop.addRadio( this );
	}
};

RadioNameBinding.prototype = {
	value: function () {
		return this.node._ractive ? this.node._ractive.value : this.node.value;
	},

	update: function () {
		var node = this.node;

		if ( node.checked ) {
			runloop.addBinding( this.attr );
			set( this.root, this.keypath, this.value() );
			runloop.trigger();

		}
	},

	teardown: function () {
		this.node.removeEventListener( 'change', updateModel, false );
		this.node.removeEventListener( 'click', updateModel, false );
	}
};

export default RadioNameBinding;
