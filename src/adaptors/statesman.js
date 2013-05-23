Ractive.adaptors.statesman = function ( model, path ) {
	var settingModel, settingView, setModel, setView;

	path = ( path ? path + '.' : '' );

	return {
		init: function ( view ) {
			setView = function ( keypath, value ) {
				if ( !settingModel ) {
					settingView = true;
					view.set( keypath, value );
					settingView = false;
				}
			};

			setModel = function ( keypath, value ) {
				if ( !settingView ) {
					settingModel = true;
					model.set( keypath, value );
					settingModel = false;
				}
			};

			model.on( 'set', setView );
			view.on( 'set', setModel );

			// initialise
			view.set( model.get() );
		},

		teardown: function ( view ) {
			model.off( 'change', setView );
			view.off( 'set', setModel );
		}
	};
};