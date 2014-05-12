import runloop from 'global/runloop';
import get from 'shared/get';
import Binding from 'parallel-dom/items/Element/Binding/Binding';
import handleDomEvent from 'parallel-dom/items/Element/Binding/shared/handleDomEvent';

var RadioNameBinding = Binding.extend({
	name: 'name',

	init: function () {
		this.radioName = true; // so that ractive.updateModel() knows what to do with this
	},

	render: function () {
		var node = this.element.node, valueFromModel;

		node.name = '{{' + this.keypath + '}}';

		node.addEventListener( 'change', handleDomEvent, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
		}

		valueFromModel = get( this.root, this.keypath );
		if ( valueFromModel !== undefined ) {
			node.checked = ( valueFromModel == node._ractive.value );
		} else {
			runloop.afterModelUpdate( () => this.handleChange() );
		}
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'click', handleDomEvent, false );
	},

	getValue: function () {
		var node = this.element.node;
		return node._ractive ? node._ractive.value : node.value;
	},

	handleChange: function () {
		var node = this.element.node;

		// If this <input> is the one that's checked, then the value of its
		// `name` keypath gets set to its value
		if ( node.checked ) {
			Binding.prototype.handleChange.call( this );
		}
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		Binding.prototype.rebind.call( this, indexRef, newIndex, oldKeypath, newKeypath );
		this.element.node.name = '{{' + this.keypath + '}}';
	}
});

export default RadioNameBinding;
