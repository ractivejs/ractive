Anglebars.view = function ( proto ) {
	var AnglebarsView;

	AnglebarsView = function ( model, anglebars, parentNode, contextStack, anchor ) {
		this.model = model;
		this.formatters = model.formatters;
		this.anglebars = anglebars;
		this.data = anglebars.data;
		this.parentNode = parentNode;
		this.contextStack = contextStack || [];
		this.anchor = anchor;

		this.initialize();

		this.data.getKeypath( this, model.partialKeypath, contextStack, function ( keypath ) {
			var value, formatted, self = this;

			value = this.data.get( this.keypath );
			formatted = this.anglebars._format( value, this.formatters ); // TODO is it worth storing refs to partialKeypath and formatters on the substring?

			this.update( formatted );

			this.observerRefs = this.data.observe( this.keypath, this.model.level, function ( value ) {
				var formatted = self.anglebars._format( value, self.model.formatters );
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