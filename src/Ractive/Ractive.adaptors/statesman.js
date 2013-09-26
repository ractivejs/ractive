adaptors.statesman = function ( model, path ) {
	var settingModel, settingView, setModel, setView, pathMatcher, pathLength, prefix;

	if ( path ) {
		path += '.';
		pathMatcher = new RegExp( '^' + path.replace( /\./g, '\\.' ) );
		pathLength = path.length;

		prefix = function ( attrs ) {
			var attr, result;

			if ( !attrs ) {
				return;
			}

			result = {};

			for ( attr in attrs ) {
				if ( hasOwn.call( attrs, attr ) ) {
					result[ path + attr ] = attrs[ attr ];
				}
			}

			return result;
		};
	}


	return {
		init: function ( view ) {
			
			var data, lastViewChange;

			// if no path specified...
			if ( !path ) {
				setView = function ( change ) {
					var keypath;

					settingView = true;

					if ( typeof lastViewChange === 'string' ) {
						delete change[ lastViewChange ];
					}

					if ( typeof lastViewChange === 'object' ) {
						for ( keypath in lastViewChange ) {
							if ( lastViewChange.hasOwnProperty( keypath ) ) {
								delete change[ lastViewChange ];
							}
						}
					}
					
					view.set( change );
					
					settingView = false;
				};

				if ( view.twoway ) {
					setModel = function ( keypath, value ) {
						if ( !settingView ) {
							lastViewChange = keypath;
							model.set( keypath, value );
						}
					};
				}
			}

			else {
				setView = function ( change ) {
					if ( !settingModel ) { // TODO use lastViewChange mechanism
						settingView = true;
						
						change = prefix( change );
						view.set( change );
						
						settingView = false;
					}
				};

				if ( view.twoway ) {
					setModel = function ( keypath, value ) {
						if ( !settingView ) {
							if ( pathMatcher.test( keypath ) ) {
								settingModel = true;
								model.set( keypath.substring( pathLength ), value );
								settingModel = false;
							}
						}
					};
				}
			}

			model.on( 'change', setView );
	
			if ( view.twoway ) {
				view.on( 'set', setModel );
			}
			
			// initialise
			data = ( path ? prefix( model.get() ) : model.get() );

			if ( data ) {
				view.set( path ? prefix( model.get() ) : model.get() );
			}
		},

		teardown: function ( view ) {
			model.off( 'change', setView );
			view.off( 'set', setModel );
		}
	};
};