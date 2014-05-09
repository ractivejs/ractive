import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var CheckboxNameBinding = function ( attribute, node ) {
	var valueFromModel, checked;

	this.checkboxName = true; // so that updateModel knows what to do with this

	inheritProperties( this, attribute, node );

	node.name = '{{' + this.keypath + '}}';

	node.addEventListener( 'change', updateModel, false );

	// in case of IE emergency, bind to click event as well
	if ( node.attachEvent ) {
		node.addEventListener( 'click', updateModel, false );
	}

	valueFromModel = get( this.root, this.keypath );

	// if the model already specifies this value, check/uncheck accordingly
	if ( valueFromModel !== undefined ) {
		checked = valueFromModel.indexOf( node._ractive.value ) !== -1;
		node.checked = checked;
	}

	// otherwise make a note that we will need to update the model later
	else {
		runloop.addCheckbox( this );
	}
};

CheckboxNameBinding.prototype = {
	changed: function () {
		return this.node.checked !== !!this.checked;
	},

	update: function () {
		this.checked = this.node.checked;

		runloop.addBinding( this.attr );
		set( this.root, this.keypath, getValueFromCheckboxes( this.root, this.keypath ) );
		runloop.trigger();
	},

	teardown: function () {
		this.node.removeEventListener( 'change', updateModel, false );
		this.node.removeEventListener( 'click', updateModel, false );
	}
};

export default CheckboxNameBinding;
