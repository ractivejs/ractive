(function ( substrings ) {
	
	'use strict';

	substrings.Fragment = function ( model, anglebars, parent, contextStack ) {
		var numItems, substring, i;

		this.substrings = [];
		
		numItems = model.items.length;
		for ( i=0; i<numItems; i+=1 ) {
			substring = substrings.create( model.items[i], anglebars, this, contextStack );
			this.substrings[i] = substring;
		}

		this.stringified = this.substrings.join('');
	};

	substrings.Fragment.prototype = {
		bubble: function () {
			this.stringified = this.substrings.join('');
			this.parent.bubble();
		},

		teardown: function () {
			var numSubstrings, i;

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				this.substrings[i].teardown();
			}
		},

		toString: function () {
			return this.stringified;
		}
	};

}( Anglebars.substrings ));