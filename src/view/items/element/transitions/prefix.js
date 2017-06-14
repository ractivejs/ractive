import { isClient, vendors } from '../../../../config/environment';
import { createElement } from '../../../../utils/dom';
import hyphenateCamel from '../../../../utils/hyphenateCamel';

let prefix;

if ( !isClient ) {
	prefix = null;
} else {
	const prefixCache = {};
	const testStyle = createElement( 'div' ).style;

	// technically this also normalizes on hyphenated styles as well
	prefix = function ( prop ) {
		if ( !prefixCache[ prop ] ) {
			const name = hyphenateCamel( prop );

			if ( testStyle[ prop ] !== undefined ) {
				prefixCache[ prop ] = name;
			}

			else {
				// test vendors...
				let i = vendors.length;
				while ( i-- ) {
					const vendor = `-${vendors[i]}-${name}`;
					if ( testStyle[ vendor ] !== undefined ) {
						prefixCache[ prop ] = vendor;
						break;
					}
				}
			}
		}

		return prefixCache[ prop ];
	};
}

export default prefix;
