define([
	'parse/Parser/getText/_getText',
	'parse/Parser/getComment/_getComment',
	'parse/Parser/getMustache/_getMustache',
	'parse/Parser/getSection/_getSection',
	'parse/Parser/getElement/_getElement',

	'parse/Parser/utils/jsonifyStubs'
], function (
	getText,
	getComment,
	getMustache,
	getSection,
	getElement,

	jsonifyStubs
) {

	'use strict';

	var Parser;

	Parser = function ( tokens, options ) {
		var stub, stubs;

		this.tokens = tokens || [];
		this.pos = 0;
		this.options = options;
		this.preserveWhitespace = options.preserveWhitespace;

		stubs = [];

		while ( stub = this.getStub() ) {
			stubs.push( stub );
		}

		this.result = jsonifyStubs( stubs, options.noStringify, true );
	};

	Parser.prototype = {
		getStub: function ( preserveWhitespace ) {
			var token = this.next();

			if ( !token ) {
				return null;
			}

			return this.getText( token, this.preserveWhitespace || preserveWhitespace ) ||
			       this.getComment( token )  ||
			       this.getSection( token )  ||
			       this.getMustache( token ) ||
			       this.getElement( token );
		},

		getText: getText,
		getComment: getComment,
		getMustache: getMustache,
		getSection: getSection,
		getElement: getElement,

		next: function () {
			return this.tokens[ this.pos ];
		}
	};

	return Parser;

});
