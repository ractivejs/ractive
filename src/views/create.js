(function ( views ) {

	'use strict';

	views.create = function ( model, anglebars, parentNode, contextStack, anchor ) {

		switch ( model.type ) {
			case 'text':
				return new views.Text( model, parentNode, anchor );

			case 'interpolator':
				return new views.Interpolator( model, anglebars, parentNode, contextStack, anchor );

			case 'triple':
				return new views.Triple( model, anglebars, parentNode, contextStack, anchor );

			case 'element':
				return new views.Element( model, anglebars, parentNode, contextStack, anchor );

			case 'section':
				return new views.Section( model, anglebars, parentNode, contextStack, anchor );
		}
	};
	
}( Anglebars.views ));