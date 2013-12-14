define( function () {

	'use strict';

	var leadingWhitespace = /^\s+/;

	return function () {
		var match = leadingWhitespace.exec( this.remaining() );

		if ( !match ) {
			return null;
		}

		this.pos += match[0].length;
		return match[0];
	};

});