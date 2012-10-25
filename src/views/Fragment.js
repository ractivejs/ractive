Anglebars.views.Fragment = function ( models, anglebars, parentNode, contextStack, anchor ) {

	var numModels, i;

	this.items = [];

	numModels = models.length;
	for ( i=0; i<numModels; i+=1 ) {
		this.items[ this.items.length ] = Anglebars.views.create( models[i], anglebars, parentNode, contextStack, anchor );
	}
};

Anglebars.views.Fragment.prototype = {
	teardown: function () {
		
		var i, numItems;

		numItems = this.items.length;
		for ( i=0; i<numItems; i+=1 ) {
			this.items[i].teardown();
		}

		delete this.items;
	}
};