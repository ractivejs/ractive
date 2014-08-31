define(['parse/Parser/expressions/primary/literal/numberLiteral','parse/Parser/expressions/primary/literal/booleanLiteral','parse/Parser/expressions/primary/literal/stringLiteral/_stringLiteral','parse/Parser/expressions/primary/literal/objectLiteral/_objectLiteral','parse/Parser/expressions/primary/literal/arrayLiteral'],function (getNumberLiteral, getBooleanLiteral, getStringLiteral, getObjectLiteral, getArrayLiteral) {

	'use strict';
	
	return function ( parser ) {
		var literal = getNumberLiteral( parser )   ||
					  getBooleanLiteral( parser )  ||
					  getStringLiteral( parser )   ||
					  getObjectLiteral( parser )   ||
					  getArrayLiteral( parser );
	
		return literal;
	};

});