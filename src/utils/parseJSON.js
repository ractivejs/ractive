define([
	'parse/Parser/_Parser',
	'parse/Parser/expressions/primary/literal/stringLiteral/_stringLiteral',
	'parse/Parser/expressions/shared/key'
], function (
	Parser,
	getStringLiteral,
	getKey
) {

	'use strict';

	// simple JSON parser, without the restrictions of JSON parse
	// (i.e. having to double-quote keys).
	//
	// This re-uses logic from the main template parser, albeit
	// messily. Could probably use a cleanup at some point.
	//
	// If passed a hash of values as the second argument, ${placeholders}
	// will be replaced with those values

	var JsonParser, specials, specialsPattern, numberPattern, placeholderPattern, placeholderAtStartPattern, onlyWhitespace;

	specials = {
		'true': true,
		'false': false,
		'undefined': undefined,
		'null': null
	};

	specialsPattern = new RegExp( '^(?:' + Object.keys( specials ).join( '|' ) + ')' );
	numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
	placeholderPattern = /\$\{([^\}]+)\}/g;
	placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
	onlyWhitespace = /^\s*$/;

	JsonParser = Parser.extend({
		init: function ( str, options ) {
			this.values = options.values;
		},

		postProcess: function ( result, options ) {
			if ( result.length !== 1 || !onlyWhitespace.test( this.leftover ) ) {
				return null;
			}

			return { value: result[0].v };
		},

		converters: [
			function getPlaceholder ( parser ) {
				var placeholder;

				if ( !parser.values ) {
					return null;
				}

				placeholder = parser.matchPattern( placeholderAtStartPattern );

				if ( placeholder && ( parser.values.hasOwnProperty( placeholder ) ) ) {
					return { v: parser.values[ placeholder ] };
				}
			},

			function getSpecial ( parser ) {
				var special;

				if ( special = parser.matchPattern( specialsPattern ) ) {
					return { v: specials[ special ] };
				}
			},

			function getNumber ( parser ) {
				var number;

				if ( number = parser.matchPattern( numberPattern ) ) {
					return { v: +number };
				}
			},

			// TODO is this duplicating functionality?
			function getString ( parser ) {
				var stringLiteral = getStringLiteral( parser ), values;

				if ( stringLiteral && ( values = parser.values ) ) {
					return {
						v: stringLiteral.v.replace( placeholderPattern, function ( match, $1 ) {
							return ( $1 in values ? values[ $1 ] : $1 );
						})
					};
				}

				return stringLiteral;
			},

			function getObject ( parser ) {
				var result, pair;

				if ( !parser.matchString( '{' ) ) {
					return null;
				}

				result = {};

				while ( pair = getKeyValuePair( parser ) ) {
					result[ pair.key ] = pair.value;

					parser.allowWhitespace();

					if ( parser.matchString( '}' ) ) {
						return { v: result };
					}

					if ( !parser.matchString( ',' ) ) {
						return null;
					}
				}

				return null;
			},

			function getArray ( parser ) {
				var result, valueToken;

				if ( !parser.matchString( '[' ) ) {
					return null;
				}

				result = [];

				parser.allowWhitespace();

				while ( valueToken = parser.read() ) {
					result.push( valueToken.v );

					parser.allowWhitespace();

					if ( parser.matchString( ']' ) ) {
						return { v: result };
					}

					if ( !parser.matchString( ',' ) ) {
						return null;
					}

					parser.allowWhitespace();
				}

				return null;
			}
		]
	});


	function getKeyValuePair ( parser ) {
		var key, valueToken, pair;

		parser.allowWhitespace();

		key = getKey( parser );

		if ( !key ) {
			return null;
		}

		pair = { key: key };

		parser.allowWhitespace();
		if ( !parser.matchString( ':' ) ) {
			return null;
			// throw new Error( 'Expected ":"' );
		}
		parser.allowWhitespace();

		valueToken = parser.read();
		if ( !valueToken ) {
			return null;
			// throw new Error( 'something went wrong' );
		}

		pair.value = valueToken.v;

		return pair;
	}

	return function ( str, values ) {
		var parser = new JsonParser( str, {
			values: values
		});

		return parser.result;
	};

});
