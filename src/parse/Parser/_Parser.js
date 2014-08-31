import circular from 'circular';
import create from 'utils/create';
import hasOwnProperty from 'utils/hasOwnProperty';
import getConditional from 'parse/Parser/expressions/conditional';
import flattenExpression from 'parse/Parser/utils/flattenExpression';

var Parser, ParseError, leadingWhitespace = /^\s+/;

ParseError = function ( message ) {
	this.name = 'ParseError';
	this.message = message;
	try {
		throw new Error(message);
	} catch (e) {
		this.stack = e.stack;
	}
};

ParseError.prototype = Error.prototype;

Parser = function ( str, options ) {
	var items, item;

	this.str = str;
	this.options = options || {};
	this.pos = 0;

	// Custom init logic
	if ( this.init ) this.init( str, options );

	items = [];

	while ( ( this.pos < this.str.length ) && ( item = this.read() ) ) {
		items.push( item );
	}

	this.leftover = this.remaining();
	this.result = this.postProcess ? this.postProcess( items, options ) : items;
};

Parser.prototype = {
	read: function ( converters ) {
		var pos, i, len, item;

		if ( !converters ) converters = this.converters;

		pos = this.pos;

		len = converters.length;
		for ( i = 0; i < len; i += 1 ) {
			this.pos = pos; // reset for each attempt

			if ( item = converters[i]( this ) ) {
				return item;
			}
		}

		return null;
	},

	readExpression: function () {
		// The conditional operator is the lowest precedence operator (except yield,
		// assignment operators, and commas, none of which are supported), so we
		// start there. If it doesn't match, it 'falls through' to progressively
		// higher precedence operators, until it eventually matches (or fails to
		// match) a 'primary' - a literal or a reference. This way, the abstract syntax
		// tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
		return getConditional( this );
	},

	flattenExpression: flattenExpression,

	getLinePos: function () {
		var lines, currentLine, currentLineEnd, nextLineEnd, lineNum, charNum, annotation;

		lines = this.str.split( '\n' );

		lineNum = 0;
		nextLineEnd = 0;

		do {
			currentLineEnd = nextLineEnd;
			lineNum ++;
			currentLine = lines[ lineNum - 1 ];
			nextLineEnd += currentLine.length + 1; // +1 for the newline
		} while ( nextLineEnd <= this.pos );

		charNum = ( this.pos - currentLineEnd ) + 1;
		annotation = currentLine + '\n' + new Array( charNum ).join( ' ' ) + '^----';

		return {
			line: lineNum,
			ch: charNum,
			text: currentLine,
			annotation: annotation,
			toJSON: () => [ lineNum, charNum ],
			toString: () => `line ${lineNum} character ${charNum}`
		};
	},

	error: function ( message ) {
		var pos, error;

		pos = this.getLinePos();
		error = new ParseError( message + ' at ' + pos + ':\n' + pos.annotation );

		error.line = pos.line;
		error.character = pos.ch;
		error.shortMessage = message;

		throw error;
	},

	matchString: function ( string ) {
		if ( this.str.substr( this.pos, string.length ) === string ) {
			this.pos += string.length;
			return string;
		}
	},

	matchPattern: function ( pattern ) {
		var match;

		if ( match = pattern.exec( this.remaining() ) ) {
			this.pos += match[0].length;
			return match[1] || match[0];
		}
	},

	allowWhitespace: function () {
		this.matchPattern( leadingWhitespace );
	},

	remaining: function () {
		return this.str.substring( this.pos );
	},

	nextChar: function () {
		return this.str.charAt( this.pos );
	}
};

Parser.extend = function ( proto ) {
	var Parent = this, Child, key;

	Child = function ( str, options ) {
		Parser.call( this, str, options );
	};

	Child.prototype = create( Parent.prototype );

	for ( key in proto ) {
		if ( hasOwnProperty.call( proto, key ) ) {
			Child.prototype[ key ] = proto[ key ];
		}
	}

	Child.extend = Parser.extend;
	return Child;
};

circular.Parser = Parser;
export default Parser;
