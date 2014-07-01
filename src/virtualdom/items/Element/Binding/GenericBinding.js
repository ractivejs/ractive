import Binding from 'virtualdom/items/Element/Binding/Binding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';

var GenericBinding, getOptions;

getOptions = { evaluateWrapped: true };

GenericBinding = Binding.extend({
	getInitialValue: () => '',

	getValue: function () {
		return this.element.node.value;
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

		node.addEventListener( 'blur', handleBlur, false );
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'input', handleDomEvent, false );
		node.removeEventListener( 'keyup', handleDomEvent, false );
		node.removeEventListener( 'blur', handleBlur, false );
	}
});

export default GenericBinding;


function handleBlur () {
	var value;

	handleDomEvent.call( this );

	value = this._ractive.root.viewmodel.get( this._ractive.binding.keypath, getOptions );
	this.value = value == undefined ? '' : value;
}
