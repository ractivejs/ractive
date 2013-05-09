(function ( Ractive ) {

	'use strict';

	Ractive.adaptors = {};

	Ractive.adaptors.Backbone = function ( model, twoway ) {
		var settingModel, settingView, setModel, setView;

		twoway = ( twoway === false ? false : true ); // default to twoway binding

		return {
			init: function ( view ) {
				setView = function ( model ) {
					if ( !settingModel ) {
						settingView = true;
						view.set( model.changed );
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

				model.on( 'change', setView );
				
				if ( twoway ) {
					view.on( 'set', setModel );
				}

				// initialise
				view.set( model.attributes );
			},

			teardown: function ( view ) {
				model.off( 'change', setView );
				view.off( 'set', setModel );
			}
		};
	};

	Ractive.adaptors.Statesman = function ( model, twoway ) {
		var settingModel, settingView, setModel, setView;

		twoway = ( twoway === false ? false : true ); // default to twoway binding

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
				
				if ( twoway ) {
					view.on( 'set', setModel );
				}

				// initialise
				view.set( model.get() );
			},

			teardown: function ( view ) {
				model.off( 'change', setView );
				view.off( 'set', setModel );
			}
		};
	};

}( Ractive ));