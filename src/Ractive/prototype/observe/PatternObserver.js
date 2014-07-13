import runloop from 'global/runloop';
import isEqual from 'utils/isEqual';
import getPattern from 'Ractive/prototype/observe/getPattern';

var PatternObserver, wildcard = /\*/, slice = Array.prototype.slice;

PatternObserver = function ( ractive, keypath, callback, options ) {
	this.root = ractive;

	this.callback = callback;
	this.defer = options.defer;

	this.keypath = keypath;
	this.regex = new RegExp( '^' + keypath.replace( /\./g, '\\.' ).replace( /\*/g, '([^\\.]+)' ) + '$' );
	this.values = {};

	if ( this.defer ) {
		this.proxies = [];
	}

	// Observers are notified before any DOM changes take place (though
	// they can defer execution until afterwards)
	this.priority = 'pattern';

	// default to root as context, but allow it to be overridden
	this.context = ( options && options.context ? options.context : ractive );
};

PatternObserver.prototype = {
	init: function ( immediate ) {
		var values, keypath;

		values = getPattern( this.root, this.keypath );

		if ( immediate !== false ) {
			for ( keypath in values ) {
				if ( values.hasOwnProperty( keypath ) ) {
					this.update( keypath );
				}
			}
		} else {
			this.values = values;
		}
	},

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

		// special case - array mutation should not trigger `array.*`
		// pattern observer with `array.length`
		if ( this.root.viewmodel.implicitChanges[ keypath ] ) {
			return;
		}

		if ( this.defer && this.ready ) {
			runloop.addObserver( this.getProxy( keypath ) );
			return;
		}

		this.reallyUpdate( keypath );
	},

	reallyUpdate: function ( keypath ) {
		var value, keys, args;

		value = this.root.viewmodel.get( keypath );

		// Prevent infinite loops
		if ( this.updating ) {
			this.values[ keypath ] = value;
			return;
		}

		this.updating = true;

		if ( !isEqual( value, this.values[ keypath ] ) || !this.ready ) {
			keys = slice.call( this.regex.exec( keypath ), 1 );
			args = [ value, this.values[ keypath ], keypath ].concat( keys );

			this.callback.apply( this.context, args );

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

export default PatternObserver;
