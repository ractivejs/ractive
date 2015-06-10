import Binding from './Binding';
import handleDomEvent from './shared/handleDomEvent';

var ContentEditableBinding = Binding.extend({
	getInitialValue: function () {
		return this.element.fragment ? this.element.fragment.toString() : '';
	},

	render: function () {
		var node = this.element.node;

		node.addEventListener( 'change', handleDomEvent, false );

		if ( !this.root.lazy ) {
			node.addEventListener( 'input', handleDomEvent, false );

			if ( node.attachEvent ) {
				node.addEventListener( 'keyup', handleDomEvent, false );
			}
		}
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'input', handleDomEvent, false );
		node.removeEventListener( 'keyup', handleDomEvent, false );
	},

	getValue: function () {
		return this.element.node.innerHTML;
	}
});

export default ContentEditableBinding;
