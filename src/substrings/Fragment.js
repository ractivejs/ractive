Anglebars.substrings.Fragment = function ( models, anglebars, parent, contextStack ) {
	var numItems, i;

	this.parent = parent;
	this.items = [];
	
	numItems = models.length;
	for ( i=0; i<numItems; i+=1 ) {
		this.items[ this.items.length ] = Anglebars.substrings.create( models[i], anglebars, this, contextStack );
	}

	this.value = this.items.join('');
};

Anglebars.substrings.Fragment.prototype = {
	bubble: function () {
		this.value = this.items.join( '' );
		this.parent.bubble();
	},

	teardown: function () {
		var numItems, i;

		numItems = this.items.length;
		for ( i=0; i<numItems; i+=1 ) {
			this.items[i].teardown();
		}
	},

	toString: function () {
		return this.value;
	}
};

