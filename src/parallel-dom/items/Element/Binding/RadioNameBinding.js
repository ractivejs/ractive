import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var RadioNameBinding = function ( attribute, node ) {
	var valueFromModel;

	this.radioName = true; // so that ractive.updateModel() knows what to do with this

	initBinding( this, attribute, node );

	node.name = '{{' + attribute.keypath + '}}';

	node.addEventListener( 'change', handleChange, false );

	if ( node.attachEvent ) {
		node.addEventListener( 'click', handleChange, false );
	}

	valueFromModel = get( this.root, this.keypath );
	if ( valueFromModel !== undefined ) {
		node.checked = ( valueFromModel == node._ractive.value );
	} else {
		runloop.addRadio( this );
	}
};

RadioNameBinding.prototype = {
	value: function () {
		return this.node._ractive ? this.node._ractive.value : this.node.value;
	},

	update: function () {
		var node = this.node;

		if ( node.checked ) {
			runloop.lockAttribute( this.attr );
			set( this.root, this.keypath, this.value() );
			runloop.trigger();

		}
	},

	teardown: function () {
		this.node.removeEventListener( 'change', handleChange, false );
		this.node.removeEventListener( 'click', handleChange, false );
	}
};

export default RadioNameBinding;
