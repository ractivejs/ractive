(function ( substrings ) {
	
	'use strict';

	substrings.create = function ( model, anglebars, parent, contextStack ) {

		switch ( model.type ) {
			case 'text':
				return new substrings.Text( model, parent );

			case 'interpolator':
			case 'triple':
				return new substrings.Interpolator( model, anglebars, parent, contextStack );

			case 'section':
				return new substrings.Section( model, anglebars, parent, contextStack );
		}
	};

}( Anglebars.substrings ));