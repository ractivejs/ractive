import Binding from 'parallel-dom/items/Element/Binding/Binding';
import handleDomEvent from 'parallel-dom/items/Element/Binding/shared/handleDomEvent';

var ContentEditableBinding = Binding.extend({
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
	}
});

export default ContentEditableBinding;
