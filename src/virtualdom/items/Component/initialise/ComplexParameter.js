import runloop from 'global/runloop';
import Fragment from 'virtualdom/Fragment';

function ComplexParameter ( component, template, callback ) {
	this.parentFragment = component.parentFragment;
	this.callback = callback;

	this.fragment = new Fragment({
		template: template,
		root:     component.root,
		owner:    this
	});

	this.update();
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
		this.callback( this.fragment.getValue() );
		this.dirty = false;
	},

	rebind: function ( oldKeypath, newKeypath, newValue = true ) {
		this.fragment.rebind( oldKeypath, newKeypath, newValue );
	},

	unbind: function () {
		this.fragment.unbind();
	}
};

