import { COMMENT, ELEMENT } from '../../config/types';
import { isArray } from '../../utils/is';
import stripStandalones from './stripStandalones';
import trimWhitespace from './trimWhitespace';

let contiguousWhitespace = /[ \t\f\r\n]+/g;
let preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i;
let leadingWhitespace = /^[ \t\f\r\n]+/;
let trailingWhitespace = /[ \t\f\r\n]+$/;
let leadingNewLine = /^(?:\r\n|\r|\n)/;
let trailingNewLine = /(?:\r\n|\r|\n)$/;

export default function cleanup ( items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace ) {
	if ( typeof items === 'string' ) return;

	var i,
		item,
		previousItem,
		nextItem,
		preserveWhitespaceInsideFragment,
		removeLeadingWhitespaceInsideFragment,
		removeTrailingWhitespaceInsideFragment,
		key;

	// First pass - remove standalones and comments etc
	stripStandalones( items );

	i = items.length;
	while ( i-- ) {
		item = items[i];

		// Remove delimiter changes, unsafe elements etc
		if ( item.exclude ) {
			items.splice( i, 1 );
		}

		// Remove comments, unless we want to keep them
		else if ( stripComments && item.t === COMMENT ) {
			items.splice( i, 1 );
		}
	}

	// If necessary, remove leading and trailing whitespace
	trimWhitespace( items, removeLeadingWhitespace ? leadingWhitespace : null, removeTrailingWhitespace ? trailingWhitespace : null );

	i = items.length;
	while ( i-- ) {
		item = items[i];

		// Recurse
		if ( item.f ) {
			let isPreserveWhitespaceElement = item.t === ELEMENT && preserveWhitespaceElements.test( item.e );
			preserveWhitespaceInsideFragment = preserveWhitespace || isPreserveWhitespaceElement;

			if ( !preserveWhitespace && isPreserveWhitespaceElement ) {
				trimWhitespace( item.f, leadingNewLine, trailingNewLine );
			}

			if ( !preserveWhitespaceInsideFragment ) {
				previousItem = items[ i - 1 ];
				nextItem = items[ i + 1 ];

				// if the previous item was a text item with trailing whitespace,
				// remove leading whitespace inside the fragment
				if ( !previousItem || ( typeof previousItem === 'string' && trailingWhitespace.test( previousItem ) ) ) {
					removeLeadingWhitespaceInsideFragment = true;
				}

				// and vice versa
				if ( !nextItem || ( typeof nextItem === 'string' && leadingWhitespace.test( nextItem ) ) ) {
					removeTrailingWhitespaceInsideFragment = true;
				}
			}

			cleanup( item.f, stripComments, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );

			// clean up name templates (events, decorators, etc)
			if ( isArray( item.f.n ) ) {
				cleanup( item.f.n, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespace );
			}

			// clean up arg templates (events, decorators, etc)
			if ( isArray( item.f.d ) ) {
				cleanup( item.f.d, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespace );
			}
		}

		// Split if-else blocks into two (an if, and an unless)
		if ( item.l ) {
			cleanup( item.l.f, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );

			items.splice( i + 1, 0, item.l );
			delete item.l; // TODO would be nice if there was a way around this
		}

		// Clean up element attributes
		if ( item.a ) {
			for ( key in item.a ) {
				if ( item.a.hasOwnProperty( key ) && typeof item.a[ key ] !== 'string' ) {
					cleanup( item.a[ key ], stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
				}
			}
		}
		// Clean up conditional attributes
		if ( item.m ) {
			cleanup( item.m, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
			if ( item.m.length < 1 ) delete item.m;
		}
	}

	// final pass - fuse text nodes together
	i = items.length;
	while ( i-- ) {
		if ( typeof items[i] === 'string' ) {
			if ( typeof items[i+1] === 'string' ) {
				items[i] = items[i] + items[i+1];
				items.splice( i + 1, 1 );
			}

			if ( !preserveWhitespace ) {
				items[i] = items[i].replace( contiguousWhitespace, ' ' );
			}

			if ( items[i] === '' ) {
				items.splice( i, 1 );
			}
		}
	}
}
