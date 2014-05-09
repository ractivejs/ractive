import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var ContentEditableBinding = function ( element ) {
	initBinding( this, element );
};

ContentEditableBinding.prototype = {
	render: function () {
		var node = this.element.node;

		node.addEventListener( 'change', handleChange, false );

		if ( !this.root.lazy ) {
			node.addEventListener( 'input', handleChange, false );

			if ( node.attachEvent ) {
				node.addEventListener( 'keyup', handleChange, false );
			}
		}
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleChange, false );
		node.removeEventListener( 'input', handleChange, false );
		node.removeEventListener( 'keyup', handleChange, false );
	},

	handleChange: function () {
		runloop.lockAttribute( this.attr );
		set( this.root, this.keypath, this.node.innerHTML );
		runloop.trigger();
	}
};

export default ContentEditableBinding;
