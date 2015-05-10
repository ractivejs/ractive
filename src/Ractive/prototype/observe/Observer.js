import runloop from 'global/runloop';
import { isEqual } from 'utils/is';

var Observer = function ( bindingContext, callback, options ) {
	this.context = bindingContext;
	this.callback = callback;
	this.callbackContext = options.context;
	this.defer = options.defer;

	this.value = null;
	this.oldValue = null;
};

Observer.prototype = {
	init: function ( immediate ) {
		this.value = this.context.get();

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

		this.callback.call( this.callbackContext, this.value, this.oldValue, this.context.getKeypath() );
		this.oldValue = this.value;

		this.updating = false;
	}
};

export default Observer;
