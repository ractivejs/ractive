(function ( substrings ) {

	'use strict';

	substrings.Text = function ( model ) {
		this.text = model.text;
	};

	substrings.Text.prototype = {
		toString: function () {
			return this.text;
		}
	};

}( Anglebars.substrings ));

