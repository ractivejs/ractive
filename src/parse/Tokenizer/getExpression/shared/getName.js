define([ 'parse/Tokenizer/utils/makeRegexMatcher' ], function ( makeRegexMatcher ) {
	
	'use strict';

	return makeRegexMatcher( /^[a-zA-Z_$][a-zA-Z_$0-9]*/ );

});