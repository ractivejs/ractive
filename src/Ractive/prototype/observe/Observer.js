define([
	'utils/isEqual'
], function (
	isEqual
) {
	
	'use strict';

	var Observer = function ( ractive, keypath, callback, options ) {
		var self = this;

		this.root = ractive;
		this.keypath = keypath;
		this.callback = callback;
		this.defer = options.defer;
		this.debug = options.debug;

		this.proxy = {
			update: function () {
				self.reallyUpdate();
			}
		};
		
		// Observers are notified before any DOM changes take place (though
		// they can defer execution until afterwards)
		this.priority = 0;

		// default to root as context, but allow it to be overridden
		this.context = ( options && options.context ? options.context : ractive );

		// Initialise
		if ( options.init !== false ) {
			this.update();
		} else {
			this.value = ractive.get( this.keypath );
		}
	};

	Observer.prototype = {
		update: function () {
			if ( this.defer && this.ready ) {
				this.root._defObservers.push( this.proxy );
				return;
			}

			this.reallyUpdate();
		},

		reallyUpdate: function () {
			var value;

			// Prevent infinite loops
			if ( this.updating ) {
				return;
			}

			this.updating = true;

			// TODO create, and use, an internal get method instead - we can skip checks
			value = this.root.get( this.keypath, true );

			if ( !isEqual( value, this.value ) || !this.ready ) {
				// wrap the callback in a try-catch block, and only throw error in
				// debug mode
				try {
					this.callback.call( this.context, value, this.value, this.keypath );
				} catch ( err ) {
					if ( this.debug || this.root.debug ) {
						throw err;
					}
				}
				this.value = value;
			}

			this.updating = false;
		}
	};

	return Observer;

});