import runloop from 'global/runloop';
import { isEqual } from 'utils/is';

var Observer = function ( ractive, keypath, callback, options ) {
	this.root = ractive;
	this.keypath = keypath;
	this.callback = callback;
	this.defer = options.defer;

	// default to root as context, but allow it to be overridden
	this.context = ( options && options.context ? options.context : ractive );
};

Observer.prototype = {
	init: function ( immediate ) {
		this.value = this.root.get( this.keypath.str );

		if ( immediate !== false ) {
			this.update();
		} else {
			this.oldValue = this.value;
		}
	},

	setValue: function ( value ) {
		if ( !isEqual( value, this.value ) ) {
			this.value = value;

			if ( this.defer && this.ready ) {
				runloop.scheduleTask( () => this.update() );
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

		this.callback.call( this.context, this.value, this.oldValue, this.keypath.str );
		this.oldValue = this.value;

		this.updating = false;
	}
};

export default Observer;
