import { vendors } from 'config/environment';

var vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );

export default function ( str ) {
	var hyphenated;

	if ( !str ) {
		return ''; // edge case
	}

	if ( vendorPattern.test( str ) ) {
		str = '-' + str;
	}

	hyphenated = str.replace( /[A-Z]/g, function ( match ) {
		return '-' + match.toLowerCase();
	});

	return hyphenated;
}
