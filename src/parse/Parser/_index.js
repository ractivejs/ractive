define([
	'parse/Parser/getText/_index',
	'parse/Parser/getComment/_index',
	'parse/Parser/getMustache/_index',
	'parse/Parser/getElement/_index',

	'parse/Parser/utils/jsonifyStubs'
], function (
	getText,
	getComment,
	getMustache,
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

		this.result = jsonifyStubs( stubs );
	};

	Parser.prototype = {
		getStub: function () {
			var token = this.next();

			if ( !token ) {
				return null;
			}

			return this.getText( token )     ||
			       this.getComment( token )  ||
			       this.getMustache( token ) ||
			       this.getElement( token );
		},

		getText: getText,
		getComment: getComment,
		getMustache: getMustache,
		getElement: getElement,

		next: function () {
			return this.tokens[ this.pos ];
		}
	};

	return Parser;

});