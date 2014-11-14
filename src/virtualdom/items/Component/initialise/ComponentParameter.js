import runloop from 'global/runloop';
import Fragment from 'virtualdom/Fragment';

var ComponentParameter = function ( component, key, value ) {
	this.parentFragment = component.parentFragment;
	this.component = component;
	this.key = key;

	this.fragment = new Fragment({
		template: value,
		root:     component.root,
		owner:    this
	});

	this.value = this.fragment.getValue();
};

ComponentParameter.prototype = {
	bubble: function () {
		if ( !this.dirty ) {
			this.dirty = true;
			runloop.addView( this );
		}
	},

	update: function () {
		var value = this.fragment.getValue();

		this.component.instance.viewmodel.set( this.key, value );
		this.value = value;

		this.dirty = false;
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	},

	unbind: function () {
		this.fragment.unbind();
	}
};

export default ComponentParameter;
