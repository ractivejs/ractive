define([
	'config/types'
], function (
	types
) {

	'use strict';

	return function ( token ) {
		if ( token.type === types.COMMENT ) {
			this.pos += 1;

			return {
				t: types.COMMENT,
				f: token.content
			};
		}

		return null;
	};

});
