import { lastItem } from 'utils/array';

var empty = /^\s*$/, leadingWhitespace = /^\s*/;

export default function ( str ) {
	var lines, firstLine, lastLine, minIndent;

	lines = str.split( '\n' );

	// remove first and last line, if they only contain whitespace
	firstLine = lines[0];
	if ( firstLine !== undefined && empty.test( firstLine ) ) {
		lines.shift();
	}

	lastLine = lastItem( lines );
	if ( lastLine !== undefined && empty.test( lastLine ) ) {
		lines.pop();
	}

	minIndent = lines.reduce( reducer, null );

	if ( minIndent ) {
		str = lines.map( function ( line ) {
			return line.replace( minIndent, '' );
		}).join( '\n' );
	}

	return str;
}

function reducer ( previous, line ) {
	var lineIndent = leadingWhitespace.exec( line )[0];

	if ( previous === null || ( lineIndent.length < previous.length ) ) {
		return lineIndent;
	}

	return previous;
}
