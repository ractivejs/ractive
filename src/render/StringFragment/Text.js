define([ 'config/types' ], function ( types ) {
	
	'use strict';

	var StringText = function ( text ) {
		this.type = types.TEXT;
		this.text = text;
	};

	StringText.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};

	return StringText;

});