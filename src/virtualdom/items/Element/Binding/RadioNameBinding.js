import { removeFromArray } from 'utils/array';
import Binding from './Binding';
import handleDomEvent from './shared/handleDomEvent';
import getSiblings from './shared/getSiblings';

var RadioNameBinding = Binding.extend({
	name: 'name',

	init: function () {
		this.siblings = getSiblings( this.root._guid, 'radioname', this.keypath.str );
		this.siblings.push( this );

		this.radioName = true; // so that ractive.updateModel() knows what to do with this
	},

	getInitialValue: function () {
		if ( this.element.getAttribute( 'checked' ) ) {
			return this.element.getAttribute( 'value' );
		}
	},

	render: function () {
		var node = this.element.node;

		node.name = '{{' + this.keypath.str + '}}';
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

	rebound: function ( oldKeypath, newKeypath ) {
		var node;

		Binding.prototype.rebound.call( this, oldKeypath, newKeypath );

		if ( node = this.element.node ) {
			node.name = '{{' + this.keypath.str + '}}';
		}
	},

	unbind: function () {
		removeFromArray( this.siblings, this );
	}
});

export default RadioNameBinding;
