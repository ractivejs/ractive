define( function () {

	'use strict';

	return function ( string ) {
		var substr;

		substr = this.str.substr( this.pos, string.length );

		if ( substr === string ) {
			this.pos += string.length;
			return string;
		}

		return null;
	};

});