Anglebars.substring = function ( proto ) {
	var AnglebarsSubstring;

	AnglebarsSubstring = function ( model, anglebars, parent, contextStack ) {
		
		var formatters = model.formatters;

		this.model = model;
		this.anglebars = anglebars;
		this.viewmodel = anglebars.viewmodel;
		this.parent = parent;
		this.contextStack = contextStack || [];

		this.initialize();

		this.viewmodel.getKeypath( this, model.partialKeypath, contextStack, function ( keypath ) {
			var value, self = this;

			value = this.viewmodel.get( keypath );
			this.update( anglebars._format( value, formatters ) );

			this.observerRefs = this.viewmodel.observe( keypath, model.priority, function ( value ) {
				self.update( anglebars._format( value, formatters ) );
			});
		});
	};

	AnglebarsSubstring.prototype = proto;

	return AnglebarsSubstring;
};