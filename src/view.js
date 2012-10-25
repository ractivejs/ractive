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
			formatted = this.anglebars._format( value, formatters );

			this.update( formatted );

			this.observerRefs = this.viewmodel.observe( keypath, this.model.priority, function ( value ) {
				var formatted = self.anglebars._format( value, formatters );
				self.update( formatted );
				
				if ( self.bubble ) {
					self.bubble();
				}
			});
		});
	};

	AnglebarsView.prototype = proto;

	return AnglebarsView;
};