define(['global/runloop','utils/isEqual'],function (runloop, isEqual) {

	'use strict';
	
	var Observer = function ( ractive, keypath, callback, options ) {
		this.root = ractive;
		this.keypath = keypath;
		this.callback = callback;
		this.defer = options.defer;
	
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
			} else {
				this.oldValue = this.value;
			}
		},
	
		setValue: function ( value ) {var this$0 = this;
			if ( !isEqual( value, this.value ) ) {
				this.value = value;
	
				if ( this.defer && this.ready ) {
					runloop.scheduleTask( function()  {return this$0.update()} );
				} else {
					this.update();
				}
			}
		},
	
		update: function () {
			// Prevent infinite loops
			if ( this.updating ) {
				return;
			}
	
			this.updating = true;
	
			this.callback.call( this.context, this.value, this.oldValue, this.keypath );
			this.oldValue = this.value;
	
			this.updating = false;
		}
	};
	
	return Observer;

});