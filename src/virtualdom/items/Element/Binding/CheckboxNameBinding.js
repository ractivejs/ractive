import runloop from 'global/runloop';
import removeFromArray from 'utils/removeFromArray';
import Binding from 'virtualdom/items/Element/Binding/Binding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';

var CheckboxNameBinding = Binding.extend({
	name: 'name',

	init: function () {
		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this
		this.isChecked = this.element.getAttribute( 'checked' );

		this.siblings = this.root._checkboxNameBindings[ this.keypath ] || ( this.root._checkboxNameBindings[ this.keypath ] = [] );
		this.siblings.push( this );
	},

	teardown: function () {
		removeFromArray( this.siblings, this );
	},

	render: function () {
		var node = this.element.node, valueFromModel, checked;

		this.element.node.name = '{{' + this.keypath + '}}';

		node.addEventListener( 'change', handleDomEvent, false );

		// in case of IE emergency, bind to click event as well
		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
		}

		valueFromModel = this.root.viewmodel.get( this.keypath );

		// if the model already specifies this value, check/uncheck accordingly
		if ( valueFromModel !== undefined ) {
			checked = valueFromModel.indexOf( node._ractive.value ) !== -1;
			node.checked = checked;
		}

		// otherwise make a note that we will need to update the model later
		else {
			runloop.addCheckboxBinding( this );
		}
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'click', handleDomEvent, false );
	},

	changed: function () {
		return this.element.node.checked !== !!this.checked;
	},

	handleChange: function () {
		var value = [];

		this.isChecked = this.element.node.checked;

		this.siblings.forEach( s => {
			if ( s.isChecked ) {
				value.push( s.element.getAttribute( 'value' ) );
			}
		});

		runloop.start( this.root );
		this.root.viewmodel.set( this.keypath, value );
		runloop.end();
	},

	getValue: function () {
		throw new Error( 'This code should not execute!' );
	}
});

export default CheckboxNameBinding;
