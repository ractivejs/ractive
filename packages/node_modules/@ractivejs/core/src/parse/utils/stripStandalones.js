import { COMMENT, DELIMCHANGE, SECTION, INVERTED } from '../../config/types';
import { lastItem } from '../../utils/array';

const leadingLinebreak = /^[ \t\f\r\n]*\r?\n/;
const trailingLinebreak = /\r?\n[ \t\f\r\n]*$/;

export default function ( items ) {
	let i, current, backOne, backTwo, lastSectionItem;

	for ( i=1; i<items.length; i+=1 ) {
		current = items[i];
		backOne = items[i-1];
		backTwo = items[i-2];

		// if we're at the end of a [text][comment][text] sequence...
		if ( isString( current ) && isComment( backOne ) && isString( backTwo ) ) {

			// ... and the comment is a standalone (i.e. line breaks either side)...
			if ( trailingLinebreak.test( backTwo ) && leadingLinebreak.test( current ) ) {

				// ... then we want to remove the whitespace after the first line break
				items[i-2] = backTwo.replace( trailingLinebreak, '\n' );

				// and the leading line break of the second text token
				items[i] = current.replace( leadingLinebreak, '' );
			}
		}

		// if the current item is a section, and it is preceded by a linebreak, and
		// its first item is a linebreak...
		if ( isSection( current ) && isString( backOne ) ) {
			if ( trailingLinebreak.test( backOne ) && isString( current.f[0] ) && leadingLinebreak.test( current.f[0] ) ) {
				items[i-1] = backOne.replace( trailingLinebreak, '\n' );
				current.f[0] = current.f[0].replace( leadingLinebreak, '' );
			}
		}

		// if the last item was a section, and it is followed by a linebreak, and
		// its last item is a linebreak...
		if ( isString( current ) && isSection( backOne ) ) {
			lastSectionItem = lastItem( backOne.f );

			if ( isString( lastSectionItem ) && trailingLinebreak.test( lastSectionItem ) && leadingLinebreak.test( current ) ) {
				backOne.f[ backOne.f.length - 1 ] = lastSectionItem.replace( trailingLinebreak, '\n' );
				items[i] = current.replace( leadingLinebreak, '' );
			}
		}
	}

	return items;
}

function isString ( item ) {
	return typeof item === 'string';
}

function isComment ( item ) {
	return item.t === COMMENT || item.t === DELIMCHANGE;
}

function isSection ( item ) {
	return ( item.t === SECTION || item.t === INVERTED ) && item.f;
}
