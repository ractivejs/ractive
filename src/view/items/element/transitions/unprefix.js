import { vendors } from '../../../../config/environment';

const unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );

export default function ( prop ) {
	return prop.replace( unprefixPattern, '' );
}
