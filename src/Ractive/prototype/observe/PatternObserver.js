import runloop from 'global/runloop';
import { isEqual } from 'utils/is';
import getPattern from './getPattern';

var PatternObserver, slice = Array.prototype.slice;

PatternObserver = function ( ractive, model, callback, options ) {
	this.root = ractive;

	this.callback = callback;
	this.defer = options.defer;

	this.model = model;
	this.regex = new RegExp( '^' + model.getKeypath().replace( /\./g, '\\.' ).replace( /\*/g, '([^\\.]+)' ) + '$' );
	this.values = {};

	if ( this.defer ) {
		this.proxies = [];
	}

	// default to root as context, but allow it to be overridden
	this.context = ( options && options.context ? options.context : ractive );
};

PatternObserver.prototype = {
	init: function ( immediate ) {
		var values, model;

		values = getPattern( this.root, this.model );

		if ( immediate !== false ) {
			for ( model in values ) {
				if ( values.hasOwnProperty( model ) ) {
					this.update( model.get() );
				}
			}
		} else {
			this.values = values;
		}
	},

	update: function ( model ) {
		var values;

		if ( keypath.isPattern ) {
			values = getPattern( this.root, keypath );

			for ( model in values ) {
				if ( values.hasOwnProperty( model ) ) {
					this.update( model.get() );
				}
			}

			return;
		}

		// special case - array mutation should not trigger `array.*`
		// pattern observer with `array.length`
		if ( this.root.viewmodel.implicitChanges[ model.getKeypath() ] ) {
			return;
		}

		if ( this.defer && this.ready ) {
			runloop.scheduleTask( () => this.getProxy( model ).update() );
			return;
		}

		this.reallyUpdate( model );
	},

	reallyUpdate: function ( model ) {
		var keypath, value, keys, args;

		keypath = model.getKeypath();
		value = this.root.viewmodel.get( model );

		// Prevent infinite loops
		if ( this.updating ) {
			this.values[ keypath ] = value;
			return;
		}

		this.updating = true;

		if ( !isEqual( value, this.values[ keypath ] ) || !this.ready ) {
			keys = slice.call( this.regex.exec( keypath ), 1 );
			args = [ value, this.values[ keypath ], keypath ].concat( keys );

			this.values[ keypath ] = value;
			this.callback.apply( this.context, args );
		}

		this.updating = false;
	},

	getProxy: function ( model ) {
		if ( !this.proxies[ model.getKeypath() ] ) {
			this.proxies[ model.getKeypath() ] = {
				update: () => this.reallyUpdate( model )
			};
		}

		return this.proxies[ model.getKeypath() ];
	}
};

export default PatternObserver;
