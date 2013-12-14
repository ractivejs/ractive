define([ 'config/types' ], function ( types ) {

	'use strict';

	return function ( tokens ) {
		var i, current, backOne, backTwo, leadingLinebreak, trailingLinebreak;

		leadingLinebreak = /^\s*\r?\n/;
		trailingLinebreak = /\r?\n\s*$/;

		for ( i=2; i<tokens.length; i+=1 ) {
			current = tokens[i];
			backOne = tokens[i-1];
			backTwo = tokens[i-2];

			// if we're at the end of a [text][mustache][text] sequence...
			if ( current.type === types.TEXT && ( backOne.type === types.MUSTACHE ) && backTwo.type === types.TEXT ) {

				// ... and the mustache is a standalone (i.e. line breaks either side)...
				if ( trailingLinebreak.test( backTwo.value ) && leadingLinebreak.test( current.value ) ) {

					// ... then we want to remove the whitespace after the first line break
					// if the mustache wasn't a triple or interpolator or partial
					if ( backOne.mustacheType !== types.INTERPOLATOR && backOne.mustacheType !== types.TRIPLE ) {
						backTwo.value = backTwo.value.replace( trailingLinebreak, '\n' );
					}

					// and the leading line break of the second text token
					current.value = current.value.replace( leadingLinebreak, '' );

					// if that means the current token is now empty, we should remove it
					if ( current.value === '' ) {
						tokens.splice( i--, 1 ); // splice and decrement
					}
				}
			}
		}

		return tokens;
	};

});

