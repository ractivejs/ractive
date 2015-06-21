import { vendors } from 'config/environment';

var unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );

export default function ( prop ) {
	return prop.replace( unprefixPattern, '' );
}
