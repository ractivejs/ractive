Anglebars.view = function ( proto ) {
	var AnglebarsView;

	AnglebarsView = function ( model, anglebars, parentNode, contextStack, anchor ) {
		
		var formatters = model.formatters;

		this.model = model;
		this.anglebars = anglebars;
		this.viewmodel = anglebars.viewmodel;
		this.parentNode = parentNode;
		this.contextStack = contextStack || [];
		this.anchor = anchor;

		this.initialize();

		this.viewmodel.getKeypath( this, model.partialKeypath, contextStack, function ( keypath ) {
			var value, formatted, self = this;

			value = this.viewmodel.get( keypath );
			this.update( this.anglebars._format( value, formatters ) );

			this.observerRefs = this.viewmodel.observe( keypath, this.model.priority, function ( value ) {
				self.update( self.anglebars._format( value, formatters ) );
				
				if ( self.bubble ) {
					self.bubble();
				}
			});
		});

		// if the last callback didn't run immediately (ie viewmodel.getKeypath didn't succeed)
		// we have a failed lookup. For inverted sections, we need to trigger this.update() so
		// the contents are rendered
		if ( !this.keypath && this.model.inverted ) { // test both section-hood and inverticity in one go
			this.update( false );
		}
	};

	AnglebarsView.prototype = proto;

	return AnglebarsView;
};