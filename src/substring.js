Anglebars.substring = function ( proto ) {
	var AnglebarsSubstring;

	AnglebarsSubstring = function ( model, anglebars, parent, contextStack ) {
		this.model = model;
		this.formatters = model.formatters;
		this.anglebars = anglebars;
		this.viewmodel = anglebars.viewmodel;
		this.parent = parent;
		this.contextStack = contextStack || [];

		this.initialize();

		this.viewmodel.getKeypath( this, model.partialKeypath, contextStack, function ( keypath ) {
			var value, formatted, self = this;

			value = this.viewmodel.get( this.keypath );
			this.update( this.anglebars._format( value, this.formatters ) );

			this.observerRefs = this.viewmodel.observe( this.keypath, this.model.priority, function ( value ) {
				self.update( self.anglebars._format( value, self.model.formatters ) );
			});
		});
	};

	AnglebarsSubstring.prototype = proto;

	return AnglebarsSubstring;
};