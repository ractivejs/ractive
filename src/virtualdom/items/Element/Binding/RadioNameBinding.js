import removeFromArray from 'utils/removeFromArray';
import Binding from 'virtualdom/items/Element/Binding/Binding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';
import getSiblings from 'virtualdom/items/Element/Binding/shared/getSiblings';

var RadioNameBinding = Binding.extend({
	name: 'name',

	init: function () {
		this.siblings = getSiblings( this.root._guid, 'radioname', this.keypath );
		this.siblings.push( this );

		this.radioName = true; // so that ractive.updateModel() knows what to do with this
		this.attribute.twoway = true; // we set this property so that the attribute gets the correct update method
	},

	getInitialValue: function () {
		if ( this.element.getAttribute( 'checked' ) ) {
			return this.element.getAttribute( 'value' );
		}
	},

	render: function () {
		var node = this.element.node;

		node.name = '{{' + this.keypath + '}}';
		node.checked = this.root.viewmodel.get( this.keypath ) == this.element.getAttribute( 'value' );

		node.addEventListener( 'change', handleDomEvent, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
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
		// If this <input> is the one that's checked, then the value of its
		// `name` keypath gets set to its value
		if ( this.element.node.checked ) {
			Binding.prototype.handleChange.call( this );
		}
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		Binding.prototype.rebind.call( this, indexRef, newIndex, oldKeypath, newKeypath );
		this.element.node.name = '{{' + this.keypath + '}}';
	},

	unbind: function () {
		removeFromArray( this.siblings, this );
	}
});

export default RadioNameBinding;
