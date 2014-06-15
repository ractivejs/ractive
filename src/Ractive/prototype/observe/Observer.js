import runloop from 'global/runloop';
import isEqual from 'utils/isEqual';

var Observer = function ( ractive, keypath, callback, options ) {
	this.root = ractive;
	this.keypath = keypath;
	this.callback = callback;
	this.defer = options.defer;
	this.debug = options.debug;

	// Observers are notified before any DOM changes take place (though
	// they can defer execution until afterwards)
	this.priority = 0;

	// default to root as context, but allow it to be overridden
	this.context = ( options && options.context ? options.context : ractive );
};

Observer.prototype = {
	init: function ( immediate ) {
		this.value = this.root.viewmodel.get( this.keypath );

		if ( immediate !== false ) {
			this.update();
		}
	},

	setValue: function ( value ) {
		if ( !isEqual( value, this.oldValue ) ) {
			this.value = value;

			if ( this.defer && this.ready ) {
				runloop.afterViewUpdate( () => this.update() );
			} else {
				runloop.afterModelUpdate( () => this.update() );
			}
		}
	},

	update: function () {
		// Prevent infinite loops
		if ( this.updating ) {
			return;
		}

		this.updating = true;

		// wrap the callback in a try-catch block, and only throw error in
		// debug mode
		try {
			this.callback.call( this.context, this.value, this.oldValue, this.keypath );
		} catch ( err ) {
			if ( this.debug || this.root.isDebug() ) {
				throw err;
			}
		}

		this.oldValue = this.value;
		this.updating = false;
	}
};

export default Observer;
