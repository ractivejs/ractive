import Binding from './Binding';
import handleDomEvent from './shared/handleDomEvent';

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
