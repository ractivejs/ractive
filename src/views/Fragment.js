Anglebars.views.Fragment = function ( options ) {

	var numModels, i, itemOptions;

	this.parentSection = options.parentSection;
	this.index = options.index;

	itemOptions = {
		anglebars:      options.anglebars,
		parentNode:     options.parentNode,
		contextStack:   options.contextStack,
		anchor:         options.anchor,
		parentFragment: this
	};

	this.items = [];

	numModels = options.model.length;
	for ( i=0; i<numModels; i+=1 ) {
		itemOptions.model = options.model[i];
		itemOptions.index = i;

		this.items[i] = Anglebars.views.create( itemOptions );
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
	},

	firstNode: function () {
		if ( this.items[0] ) {
			return this.items[0].firstNode();
		} else {
			if ( this.parentSection ) {
				return this.parentSection.findNextNode( this );
			}
		}

		return null;
	},

	findNextNode: function ( item ) {
		var index;

		index = item.index;

		if ( this.items[ index + 1 ] ) {
			return this.items[ index + 1 ].firstNode();
		} else {
			if ( this.parentSection ) {
				return this.parentSection.findNextNode( this );
			}
		}

		return null;
	}
};