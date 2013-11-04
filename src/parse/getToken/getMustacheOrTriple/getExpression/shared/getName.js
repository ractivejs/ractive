define([ 'parse/getToken/utils/getRegexMatcher' ], function ( getRegexMatcher ) {
	
	'use strict';

	return getRegexMatcher( /^[a-zA-Z_$][a-zA-Z_$0-9]*/ );

});