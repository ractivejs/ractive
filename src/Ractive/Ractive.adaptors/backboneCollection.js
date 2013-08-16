adaptors.backboneCollection = function ( collection, path ) {
	var settingCollection, settingView, setCollection, setView, pathMatcher, pathLength, prefix;

	if ( path ) {
		path += '.';
		pathMatcher = new RegExp( '^' + path.replace( /\./g, '\\.' ) );
		pathLength = path.length;
	}


	return {
		init: function ( view ) {

			// if no path specified...
			if ( !path ) {
				setView = function ( collection ) {
					if ( !settingCollection ) {
						settingView = true;
						view.set( collection.collection.toJSON() );
						settingView = false;
					}
				};

				setCollection = function ( keypath, value ) {
					if ( !settingView ) {
						settingCollection = true;
						collection.reset(value);
						settingCollection = false;
					}
				};
			}

			else {
				prefix = function ( models ) {
					var result, i;

					result = {};

					for ( i=0; i<models.length; i++ ) {
						result[ path + i ] = models[ i ];
					}

					return result;
				};

				setView = function ( collection ) {
					if ( typeof arguments[0] === 'string' ) {
						collection = arguments[1];
					}

					if ( !settingCollection ) {
						settingView = true;
						view.set( prefix( collection.collection.toJSON() ) );
						settingView = false;
					}
				};

				setCollection = function ( keypath, value ) {
					if ( !settingView ) {
						if ( pathMatcher.test( keypath ) ) {
							settingCollection = true;
							collection.reset(value);
							settingCollection = false;
						}
					}
				};
			}

			collection.on( 'all', setView );
			view.on( 'set', setCollection );

			// initialise
			view.set( path ? prefix( collection.toJSON() ) : collection.toJSON() );
		},

		teardown: function ( view ) {
			collection.off( 'change', setView );
			view.off( 'set', setCollection );
		}
	};
};