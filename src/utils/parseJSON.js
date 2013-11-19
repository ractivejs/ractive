define([
	'parse/Tokenizer/utils/getStringMatch',
	'parse/Tokenizer/utils/allowWhitespace',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/_getStringLiteral',
	'parse/Tokenizer/getExpression/shared/getKey'
], function (
	getStringMatch,
	allowWhitespace,
	getStringLiteral,
	getKey
) {
	
	'use strict';

	// simple JSON parser, without the restrictions of JSON parse
	// (i.e. having to double-quote keys).
	//
	// This re-uses logic from the main template parser, albeit
	// messily. Could probably use a cleanup at some point

	var Tokenizer, specials, specialsPattern, numberPattern;

	specials = {
		'true': true,
		'false': false,
		'undefined': undefined,
		'null': null
	};

	specialsPattern = new RegExp( '^(?:' + Object.keys( specials ).join( '|' ) + ')' );
	numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;

	Tokenizer = function ( str ) {
		this.str = str;
		this.pos = 0;

		this.result = this.getToken();
	};

	Tokenizer.prototype = {
		remaining: function () {
			return this.str.substring( this.pos );
		},

		getStringMatch: getStringMatch,

		getToken: function () {
			this.allowWhitespace();

			return this.getSpecial() ||
			       this.getNumber()  ||
			       this.getString()  ||
			       this.getObject()  ||
			       this.getArray();
		},

		getSpecial: function () {
			var match;

			if ( match = specialsPattern.exec( this.remaining() ) ) {
				this.pos += match[0].length;

				return { v: specials[ match[0] ] };
			}
		},

		getNumber: function () {
			var match;

			if ( match = numberPattern.exec( this.remaining() ) ) {
				this.pos += match[0].length;

				return { v: +match[0] };
			}
		},

		getString: function () {
			return getStringLiteral( this );
		},

		getObject: function () {
			var result, pair;

			if ( !this.getStringMatch( '{' ) ) {
				return null;
			}

			result = {};

			while ( pair = getKeyValuePair( this ) ) {
				result[ pair.key ] = pair.value;

				this.allowWhitespace();

				if ( this.getStringMatch( '}' ) ) {
					return { v: result };
				}

				if ( !this.getStringMatch( ',' ) ) {
					return null;
					// throw new Error( 'Unexpected token "' + this.remaining().charAt( 0 ) + '" (expected ",")' );
				}
			}

			return null;
		},

		getArray: function () {
			var result, valueToken;

			if ( !this.getStringMatch( '[' ) ) {
				return null;
			}

			result = [];

			while ( valueToken = this.getToken() ) {
				result.push( valueToken.v );
				
				if ( this.getStringMatch( ']' ) ) {
					return { v: result };
				}

				if ( !this.getStringMatch( ',' ) ) {
					return null;
					// throw new Error( 'Unexpected token "' + this.remaining().charAt( 0 ) + '" (expected ",")' );
				}
			}

			return null;
		},

		allowWhitespace: allowWhitespace
	};


	function getKeyValuePair ( tokenizer ) {
		var key, valueToken, pair;

		tokenizer.allowWhitespace();

		key = getKey( tokenizer );

		if ( !key ) {
			return null;
		}

		pair = { key: key };

		tokenizer.allowWhitespace();
		if ( !tokenizer.getStringMatch( ':' ) ) {
			return null;
			// throw new Error( 'Expected ":"' );
		}
		tokenizer.allowWhitespace();

		valueToken = tokenizer.getToken();
		if ( !valueToken ) {
			return null;
			// throw new Error( 'something went wrong' );
		}

		pair.value = valueToken.v;

		return pair;
	}


	return function ( str ) {
		var tokenizer = new Tokenizer( str );
		return tokenizer.result;
	};

});