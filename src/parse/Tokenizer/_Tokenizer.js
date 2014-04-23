define([
	'parse/Tokenizer/getMustache/_getMustache',
	'parse/Tokenizer/getComment/getComment',
	'parse/Tokenizer/getTag/_getTag',
	'parse/Tokenizer/getText/_getText',

	'parse/Tokenizer/getExpression/_getExpression',

	'parse/Tokenizer/utils/allowWhitespace',
	'parse/Tokenizer/utils/getStringMatch'
], function (
	getMustache,
	getComment,
	getTag,
	getText,

	getExpression,

	allowWhitespace,
	getStringMatch
) {

	'use strict';

	var Tokenizer;

	Tokenizer = function ( str, options ) {
		var token;

		this.str = str;
		this.pos = 0;
        this.lines = [0];
		var index = 0;
		while ((index = str.indexOf('\n', index)) >= 0) {
			index++;
			this.lines.push(index);
		}
		this.lines.push(str.length + 1);

		this.delimiters = options.delimiters;
		this.tripleDelimiters = options.tripleDelimiters;
		this.interpolate = options.interpolate;

		this.tokens = [];

		while ( this.pos < this.str.length ) {
			token = this.getToken();

			if ( token === null && this.remaining() ) {
				this.fail();
			}

			this.tokens.push( token );
		}
	};

	// from http://stackoverflow.com/a/4431347/100374
	function getClosestLowIndex(a, x) {
		var lo = -1;
		var hi = a.length;
		while (hi - lo > 1) {
			var mid = 0|((lo + hi)/2);
			if (a[mid] <= x) {
				lo = mid;
			} else {
				hi = mid;
			}
		}
		return lo;
	}

	Tokenizer.prototype = {
		getToken: function () {
			var tokenizer = this;
			var pos = this.pos;
			var token = this.getMustache() ||
			            this.getComment() ||
			            this.getTag() ||
			            this.getText();

			if(token) {
				token.getLinePos = function () {
					return tokenizer.getLinePos(pos);
				};
			}

			return token;
		},
		getLinePos: function (pos) {
			if ( arguments.length === 0 ) {
				pos = this.pos;
			}


			var lines = this.lines;
			var str = this.str;
			var line = getClosestLowIndex(lines, pos);
			var lineStart = lines[line];

			return {
				line: line + 1,
				ch: pos - lineStart + 1,
				getLine: function() {
					return str.substring(lineStart, lines[line+1] - 1);
				},
				toJSON: function() {
					return [this.line, this.ch];
				},
				toString: function () {
					var line = this.getLine();
					return this.line + ":" + this.ch + ":\n" +
						line + "\n" +
						line.substr(0,this.ch-1).replace(/[\S]/g,' ') + "^----";
				}
			};
		},

		getMustache: getMustache,
		getComment: getComment,
		getTag: getTag,
		getText: getText,

		getExpression: getExpression,

		// utils
		allowWhitespace: allowWhitespace,
		getStringMatch: getStringMatch,

		remaining: function () {
			return this.str.substring( this.pos );
		},

		fail: function () {
			var last20, next20;

			last20 = this.str.substr( 0, this.pos ).substr( -20 );
			if ( last20.length === 20 ) {
				last20 = '...' + last20;
			}

			next20 = this.remaining().substr( 0, 20 );
			if ( next20.length === 20 ) {
				next20 = next20 + '...';
			}

			throw new Error( 'Could not parse template: ' + ( last20 ? last20 + '<- ' : '' ) + ' on line '+this.getLinePos() + ' ->' + next20 );
		},

		expected: function ( thing ) {
			var remaining = this.remaining().substr( 0, 40 );
			if ( remaining.length === 40 ) {
				remaining += '...';
			}
			throw new Error( 'Tokenizer failed: unexpected string "' + remaining + '" (expected ' + thing + ') on line '+this.getLinePos() );
		}
	};

	return Tokenizer;

});
