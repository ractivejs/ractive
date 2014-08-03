import runloop from 'global/runloop';
import circular from 'circular';

var Fragment, ComponentParameter;

circular.push( function () {
	Fragment = circular.Fragment;
});

ComponentParameter = function ( component, key, value ) {
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
		runloop.addViewmodel( this.component.instance.viewmodel );
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
