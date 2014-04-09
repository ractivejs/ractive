define([
	'config/isClient',
	'config/vendors',
	'utils/createElement'
], function (
	isClient,
	vendors,
	createElement
) {

	'use strict';

	var prefixCache, testStyle;

	if ( !isClient ) {
		return;
	}

	prefixCache = {};
	testStyle = createElement( 'div' ).style;

	return function ( prop ) {
		var i, vendor, capped;

		if ( !prefixCache[ prop ] ) {
			if ( testStyle[ prop ] !== undefined ) {
				prefixCache[ prop ] = prop;
			}

			else {
				// test vendors...
				capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );

				i = vendors.length;
				while ( i-- ) {
					vendor = vendors[i];
					if ( testStyle[ vendor + capped ] !== undefined ) {
						prefixCache[ prop ] = vendor + capped;
						break;
					}
				}
			}
		}

		return prefixCache[ prop ];
	};

});
