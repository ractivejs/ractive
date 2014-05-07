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

	this.selfUpdating = this.fragment.isSimple();
	this.value = this.fragment.getValue( getValueOptions );
};

ComponentParameter.prototype = {
	bubble: function () {
		// If there's a single item, we can update the component immediately...
		if ( this.selfUpdating ) {
			this.update();
		}

		// otherwise we want to register it as a deferred parameter, to be
		// updated once all the information is in, to prevent unnecessary
		// DOM manipulation
		else if ( !this.deferred && this.ready ) {
			runloop.addAttribute( this );
			this.deferred = true;
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
