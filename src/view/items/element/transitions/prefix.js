import { isClient, vendors } from '../../../../config/environment';
import { createElement } from '../../../../utils/dom';
import camelizeHyphenated from '../../../../utils/camelizeHyphenated.js';

let prefix;

if ( !isClient ) {
	prefix = null;
} else {
	const prefixCache = {};
	const testStyle = createElement( 'div' ).style;

	prefix = function ( prop ) {
		prop = camelizeHyphenated( prop );

		if ( !prefixCache[ prop ] ) {
			if ( testStyle[ prop ] !== undefined ) {
				prefixCache[ prop ] = prop;
			}

			else {
				// test vendors...
				const capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );

				let i = vendors.length;
				while ( i-- ) {
					const vendor = vendors[i];
					if ( testStyle[ vendor + capped ] !== undefined ) {
						prefixCache[ prop ] = vendor + capped;
						break;
					}
				}
			}
		}

		return prefixCache[ prop ];
	};
}

export default prefix;
