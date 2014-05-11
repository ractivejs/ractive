import Binding from 'parallel-dom/items/Element/Binding/Binding';
import handleDomEvent from 'parallel-dom/items/Element/Binding/shared/handleDomEvent';

var FileListBinding = Binding.extend({
	render: function () {
		this.element.node.addEventListener( 'change', handleDomEvent, false );
	},

	unrender: function () {
		this.element.node.removeEventListener( 'change', handleDomEvent, false );
	},

	getValue: function () {
		return this.element.node.files;
	}
});

export default FileListBinding;
