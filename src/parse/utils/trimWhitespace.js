import { lastItem } from 'utils/array';

var leadingWhitespace = /^[ \t\f\r\n]+/,
	trailingWhitespace = /[ \t\f\r\n]+$/;

export default function ( items, leading, trailing ) {
	var item;

	if ( leading ) {
		item = items[0];
		if ( typeof item === 'string' ) {
			item = item.replace( leadingWhitespace, '' );

			if ( !item ) {
				items.shift();
			} else {
				items[0] = item;
			}
		}
	}

	if ( trailing ) {
		item = lastItem( items );
		if ( typeof item === 'string' ) {
			item = item.replace( trailingWhitespace, '' );

			if ( !item ) {
				items.pop();
			} else {
				items[ items.length - 1 ] = item;
			}
		}
	}
}
