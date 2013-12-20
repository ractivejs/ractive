define([
	'parse/Parser/getText/_getText',
	'parse/Parser/getMustache/_getMustache'
], function (
	getText,
	getMustache
) {

	'use strict';

	var StringParser;

	StringParser = function ( tokens, options ) { // TODO what are the options?
		var stub;

		this.tokens = tokens || [];
		this.pos = 0;
		this.options = options;

		this.result = [];

		while ( stub = this.getStub() ) {
			this.result.push( stub );
		}
	};

	StringParser.prototype = {
		getStub: function () {
			var token = this.next();

			if ( !token ) {
				return null;
			}

			return this.getText( token ) || this.getMustache( token );
		},

		getText: getText,
		getMustache: getMustache,

		next: function () {
			return this.tokens[ this.pos ];
		}
	};

	return StringParser;

});