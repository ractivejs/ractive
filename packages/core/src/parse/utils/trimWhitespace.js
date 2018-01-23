import { lastItem } from '../../utils/array';

export default function ( items, leadingPattern, trailingPattern ) {
	let item;

	if ( leadingPattern ) {
		item = items[0];
		if ( typeof item === 'string' ) {
			item = item.replace( leadingPattern, '' );

			if ( !item ) {
				items.shift();
			} else {
				items[0] = item;
			}
		}
	}

	if ( trailingPattern ) {
		item = lastItem( items );
		if ( typeof item === 'string' ) {
			item = item.replace( trailingPattern, '' );

			if ( !item ) {
				items.pop();
			} else {
				items[ items.length - 1 ] = item;
			}
		}
	}
}
