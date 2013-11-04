define([
	'utils/isEqual',
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	isEqual,
	registerDependant,
	unregisterDependant
) {

	'use strict';

	var observe,

		// helpers
		getObserverFacade,
		Observer;

	observe = function ( keypath, callback, options ) {

		var observers = [], k;

		if ( typeof keypath === 'object' ) {
			options = callback;

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					callback = keypath[k];
					observers[ observers.length ] = getObserverFacade( this, k, callback, options );
				}
			}

			return {
				cancel: function () {
					while ( observers.length ) {
						observers.pop().cancel();
					}
				}
			};
		}

		return getObserverFacade( this, keypath, callback, options );
	};

	getObserverFacade = function ( root, keypath, callback, options ) {
		var observer;

		options = options || {};
		observer = new Observer( root, keypath, callback, options );

		if ( options.init !== false ) {
			observer.update();
		}

		observer.ready = true;
		registerDependant( observer );

		return {
			cancel: function () {
				unregisterDependant( observer );
			}
		};
	};

	Observer = function ( root, keypath, callback, options ) {
		this.root = root;
		this.keypath = keypath;
		this.callback = callback;
		this.defer = options.defer;
		
		// Observers are notified before any DOM changes take place (though
		// they can defer execution until afterwards)
		this.priority = 0;

		// default to root as context, but allow it to be overridden
		this.context = ( options && options.context ? options.context : root );
	};

	Observer.prototype = {
		update: function ( deferred ) {
			var value;

			if ( this.defer && !deferred && this.ready ) {
				this.root._defObservers.push( this );
				return;
			}

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
					this.callback.call( this.context, value, this.value );
				} catch ( err ) {
					if ( this.root.debug ) {
						throw err;
					}
				}
				this.value = value;
			}

			this.updating = false;
		}
	};

	return observe;

});

