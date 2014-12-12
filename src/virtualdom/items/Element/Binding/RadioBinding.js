import runloop from 'global/runloop';
import { removeFromArray } from 'utils/array';
import Binding from './Binding';
import getSiblings from './shared/getSiblings';
import handleDomEvent from './shared/handleDomEvent';

var RadioBinding = Binding.extend({
	name: 'checked',

	init: function () {
		this.siblings = getSiblings( this.root._guid, 'radio', this.element.getAttribute( 'name' ) );
		this.siblings.push( this );
	},

	render: function () {
		var node = this.element.node;

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

	handleChange: function () {
		runloop.start( this.root );

		this.siblings.forEach( binding => {
			binding.root.viewmodel.set( binding.keypath, binding.getValue() );
		});

		runloop.end();
	},

	getValue: function () {
		return this.element.node.checked;
	},

	unbind: function () {
		removeFromArray( this.siblings, this );
	}
});

export default RadioBinding;
