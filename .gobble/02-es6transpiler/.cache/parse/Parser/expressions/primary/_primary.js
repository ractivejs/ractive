define(['parse/Parser/expressions/primary/literal/_literal','parse/Parser/expressions/primary/reference','parse/Parser/expressions/primary/bracketedExpression'],function (getLiteral, getReference, getBracketedExpression) {

	'use strict';
	
	return function ( parser ) {
		return getLiteral( parser )
			|| getReference( parser )
			|| getBracketedExpression( parser );
	};

});