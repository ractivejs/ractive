define([
	'utils/isEqual',
	'Ractive/prototype/observe/getPattern'
], function (
	isEqual,
	getPattern
) {
	
	'use strict';

	var PatternObserver, wildcard = /\*/;

	PatternObserver = function ( ractive, keypath, callback, options ) {
		var values;

		this.root = ractive;
		
		this.callback = callback;
		this.defer = options.defer;
		this.debug = options.debug;

		this.keypath = keypath;
		this.regex = new RegExp( '^' + keypath.replace( /\./g, '\\.' ).replace( /\*/g, '[^\\.]+' ) + '$' );
		this.values = {};

		if ( this.defer ) {
			this.proxies = [];
		}

		// Observers are notified before any DOM changes take place (though
		// they can defer execution until afterwards)
		this.priority = 'pattern';

		// default to root as context, but allow it to be overridden
		this.context = ( options && options.context ? options.context : ractive );

		// Initialise
		values = getPattern( ractive, keypath );

		if ( options.init !== false ) {
			for ( keypath in values ) {
				if ( values.hasOwnProperty( keypath ) ) {
					this.update( keypath );
				}
			}
		} else {
			this.values = values;
		}
	};

	PatternObserver.prototype = {
		update: function ( keypath ) {
			var values;

			if ( wildcard.test( keypath ) ) {
				values = getPattern( this.root, keypath );

				for ( keypath in values ) {
					if ( values.hasOwnProperty( keypath ) ) {
						this.update( keypath );
					}
				}

				return;
			}

			if ( this.defer && this.ready ) {
				this.root._defObservers.push( this.getProxy( keypath ) );
				return;
			}

			this.reallyUpdate( keypath );
		},

		reallyUpdate: function ( keypath ) {
			var value;

			// Prevent infinite loops
			if ( this.updating ) {
				return;
			}

			this.updating = true;

			// TODO create, and use, an internal get method instead - we can skip checks
			value = this.root.get( keypath || this.keypath, true );

			if ( !isEqual( value, this.values[ keypath ] ) || !this.ready ) {
				// wrap the callback in a try-catch block, and only throw error in
				// debug mode
				try {
					this.callback.call( this.context, value, this.values[ keypath ], keypath || this.keypath );
				} catch ( err ) {
					if ( this.debug || this.root.debug ) {
						throw err;
					}
				}
				this.values[ keypath ] = value;
			}

			this.updating = false;
		},

		getProxy: function ( keypath ) {
			var self = this;

			if ( !this.proxies[ keypath ] ) {
				this.proxies[ keypath ] = {
					update: function () {
						self.reallyUpdate( keypath );
					}
				};
			}

			return this.proxies[ keypath ];
		}
	};

	return PatternObserver;

});