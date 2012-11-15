Anglebars.views.create = function ( options ) {
	var views = Anglebars.views;

	switch ( options.model.type ) {
		case 'text':
			return new views.Text( options );

		case 'interpolator':
			return new views.Interpolator( options );

		case 'triple':
			return new views.Triple( options );

		case 'element':
			return new views.Element( options );

		case 'section':
			return new views.Section( options );
	}
};


// model, anglebars, parentNode, contextStack, anchor, parentFragment, index