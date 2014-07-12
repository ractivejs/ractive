define( function () {

	'use strict';

	var Model = function ( attributes ) {
		this.attributes = attributes;
		this.callbacks = {};
		this.transformers = {};
	};

	Model.prototype = {
		set: function ( attr, newValue ) {
			var transformer, oldValue = this.attributes[ attr ];

			if ( transformer = this.transformers[ attr ] ) {
				newValue = transformer.call( this, newValue, oldValue );
			}

			if ( oldValue !== newValue ) {
				this.attributes[ attr ] = newValue;
				this.fire( 'change', attr, newValue );
			}
		},

		get: function ( attr ) {
			return this.attributes[ attr ];
		},

		reset: function ( newData ) {
			var attr;

			this.attributes = {};

			for ( attr in newData ) {
				if ( newData.hasOwnProperty( attr ) ) {
					this.set( attr, newData[ attr ] );
				}
			}
		},

		transform: function ( attr, transformer ) {
			this.transformers[ attr ] = transformer;
			if ( this.attributes.hasOwnProperty( attr ) ) {
				this.set( attr, this.get( attr ) );
			}
		},

		on: function ( eventName, callback ) {
			var self = this;

			if ( !this.callbacks[ eventName ] ) {
				this.callbacks[ eventName ] = [];
			}

			this.callbacks[ eventName ].push( callback );

			return {
				cancel: function () {
					self.off( eventName, callback );
				}
			}
		},

		off: function ( eventName, callback ) {
			var callbacks, index;

			callbacks = this.callbacks[ eventName ];

			if ( !callbacks ) {
				return;
			}

			index = callbacks.indexOf( callback );
			if ( index !== -1 ) {
				callbacks.splice( index, 1 );
			}
		},

		fire: function ( eventName ) {
			var args, callbacks, i;

			callbacks = this.callbacks[ eventName ];

			if ( !callbacks ) {
				return;
			}

			args = Array.prototype.slice.call( arguments, 1 );
			i = callbacks.length;
			while ( i-- ) {
				callbacks[i].apply( null, args );
			}
		}
	};

	Model.adaptor = {
		filter: function ( object ) {
			return object instanceof Model;
		},
		wrap: function ( ractive, object, keypath, prefix ) {
			var listener, setting;

			listener = object.on( 'change', function ( attr, value ) {
				if ( setting ) {
					return;
				}

				setting = true;
				ractive.set( prefix( attr, value ) );
				setting = false;
			});

			return {
				get: function () {
					return object.attributes;
				},
				teardown: function () {
					listener.cancel();
				},
				set: function ( attr, value ) {
					if ( setting ) {
						return;
					}

					setting = true;
					object.set( attr, value );
					setting = false;
				},
				reset: function ( newData ) {
					var attr;

					if ( newData instanceof Model ) {
						return false; // teardown
					}

					if ( !newData || typeof newData !== 'object' ) {
						return false;
					}

					object.reset( newData );
					ractive.update( keypath );
				}
			};
		}
	};

	return Model;

});
