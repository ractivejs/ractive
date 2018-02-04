import { vendors } from '../../../../config/environment';

const vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );

export default function ( str ) {
	if ( !str ) return ''; // edge case

	if ( vendorPattern.test( str ) ) str = '-' + str;

	return str.replace( /[A-Z]/g, match => '-' + match.toLowerCase() );
}
