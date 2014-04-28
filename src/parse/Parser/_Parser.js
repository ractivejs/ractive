define([
	'circular',
	'config/types',
	'utils/create',
	'utils/hasOwnProperty',
	'parse/Parser/expressions/conditional',
	'parse/Parser/utils/flattenExpression',
	'parse/Parser/utils/trimWhitespace'
], function (
	circular,
	types,
	create,
	hasOwnProperty,
	getConditional,
	flattenExpression,
	trimWhitespace
) {

	'use strict';

	var Parser, ParseError, leadingWhitespace = /^\s+/;

	ParseError = function ( message ) {
		this.name = 'ParseError';
		this.message = message;
	};

	ParseError.prototype = Error.prototype;

	Parser = function ( str, options ) {
		var items, item;

		this.str = str;
		this.options = options || {};
		this.pos = 0;

		this.init( str, options );

		items = [];

		while ( ( this.pos < this.str.length ) && ( item = this.read() ) ) {
			if ( !item.ignore ) {
				items.push( item );
			}
		}

		this.leftover = this.remaining();

		// tidy up
		if ( !options.preserveWhitespace ) {
			trimWhitespace( items );
		}

		this.result = items;
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

		error: function ( err ) {
			var lines, currentLine, currentLineEnd, nextLineEnd, lineNum, columnNum, message;

			lines = this.str.split( '\n' );

			lineNum = -1;
			nextLineEnd = 0;

			do {
				currentLineEnd = nextLineEnd;

				currentLine = lines[ lineNum++ + 1 ];
				nextLineEnd = currentLine.length + 1; // +1 for the newline
			} while ( nextLineEnd < this.pos );

			columnNum = this.pos - currentLineEnd;

			message = err + ' at line ' + ( lineNum + 1 ) + ' character ' + ( columnNum + 1 ) + ':\n' +
				currentLine + '\n' + new Array( columnNum + 1 ).join( ' ' ) + '^----';

			throw new ParseError( message );
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

	return Parser;

});
