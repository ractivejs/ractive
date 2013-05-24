(function ( proto ) {

	var observe, updateObserver;

	proto.observe = function ( keypath, callback, options ) {

		var observers = [], k;

		if ( typeof keypath === 'object' ) {
			options = callback;

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					callback = keypath[k];
					observers[ observers.length ] = observe( this, k, callback, options );
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

		return observe( this, keypath, callback, options );

	};


	observe = function ( root, keypath, callback, options ) {
		var observer, lastValue, context;

		options = options || {};
		context = options.context || root;

		observer = {
			update: function () {
				var value;

				// TODO create, and use, an internal get method instead - we can skip checks
				value = root.get( keypath, true );

				if ( !isEqual( value, lastValue ) ) {
					callback.call( context, value, lastValue );
					lastValue = value;
				}
			},

			cancel: function () {
				unregisterDependant( root, keypath, observer, 0 );
			}
		};

		if ( options.init !== false ) {
			observer.update();
		}

		registerDependant( root, keypath, observer, 0 );

		return observer;
	};

}( proto ));

