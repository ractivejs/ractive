define( function () {

	'use strict';

	var leadingWhitespace = /^[ \n]+/,
		trailingWhitespace = /[ \n]+$/;

	return function ( items ) {
		var item;

		item = items[0];
		if ( typeof item === 'string' ) {
			item = item.replace( leadingWhitespace, '' );

			if ( !item ) {
				items.shift();
			} else {
				items[0] = item;
			}
		}

		item = items[ items.length - 1 ];
		if ( typeof item === 'string' ) {
			item = item.replace( trailingWhitespace, '' );

			if ( !item ) {
				items.pop();
			} else {
				items[ items.length - 1 ] = item;
			}
		}
	};

});
