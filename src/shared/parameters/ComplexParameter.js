import runloop from 'global/runloop';
import Fragment from 'virtualdom/Fragment';

function ComplexParameter ( parameters, key, value ) {
	this.parameters = parameters;
	this.parentFragment = parameters.component.parentFragment;
	this.key = key;

	this.fragment = new Fragment({
		template: value,
		root:     parameters.component.root,
		owner:    this
	});

	this.parameters.addData( this.key.str, this.fragment.getValue() );
}

export default ComplexParameter;

ComplexParameter.prototype = {
	bubble: function () {
		if ( !this.dirty ) {
			this.dirty = true;
			runloop.addView( this );
		}
	},

	update: function () {
		var viewmodel = this.parameters.component.instance.viewmodel;

		this.parameters.addData( this.key.str, this.fragment.getValue() );
		viewmodel.mark( this.key );

		this.dirty = false;
	},

	rebind: function ( oldKeypath, newKeypath ) {
		this.fragment.rebind( oldKeypath, newKeypath );
	},

	unbind: function () {
		this.fragment.unbind();
	}
};

