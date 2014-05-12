import runloop from 'global/runloop';
import circular from 'circular';

var Fragment, getValueOptions, ComponentParameter;

circular.push( function () {
	Fragment = circular.Fragment;
});

getValueOptions = { parse: true };

ComponentParameter = function ( component, key, value ) {

	this.parentFragment = component.parentFragment;
	this.component = component;
	this.key = key;

	this.fragment = new Fragment({
		template:   value,
		root:         component.root,
		owner:        this
	});

	this.value = this.fragment.getValue( getValueOptions );
};

ComponentParameter.prototype = {
	bubble: function () {
		if ( !this.dirty ) {
			this.dirty = true;

			runloop.afterModelUpdate( () => {
				this.update();
				this.dirty = false;
			});
		}
	},

	update: function () {
		var value = this.fragment.getValue( getValueOptions );

		this.component.instance.set( this.key, value );
		this.value = value;
	},

	teardown: function () {
		this.fragment.teardown();
	}
};

export default ComponentParameter;
