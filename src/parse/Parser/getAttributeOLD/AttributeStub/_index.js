define([
	'parse/Parser/utils/StringParser/_index',
	'parse/Parser/utils/stringifyStubs',
	'parse/Parser/utils/jsonifyStubs'
], function (
	StringParser,
	stringifyStubs,
	jsonifyStubs
) {
	
	'use strict';

	var AttributeStub;

	AttributeStub = function ( tokens ) {
		var parser = new StringParser( tokens );
		this.stubs = parser.result;
	};

	AttributeStub.prototype = {
		toJSON: function ( noStringify ) {
			var json;

			if ( this[ 'json_' + noStringify ] ) {
				return this[ 'json_' + noStringify ];
			}

			json = this[ 'json_' + noStringify ] = jsonifyStubs( this.stubs, noStringify );
			return json;
		},

		toString: function () {
			if ( this.str !== undefined ) {
				return this.str;
			}

			this.str = stringifyStubs( this.stubs );
			return this.str;
		}
	};

	return AttributeStub;

});