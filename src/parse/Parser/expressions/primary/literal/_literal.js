import getNumberLiteral from 'parse/Parser/expressions/primary/literal/numberLiteral';
import getBooleanLiteral from 'parse/Parser/expressions/primary/literal/booleanLiteral';
import getStringLiteral from 'parse/Parser/expressions/primary/literal/stringLiteral/_stringLiteral';
import getObjectLiteral from 'parse/Parser/expressions/primary/literal/objectLiteral/_objectLiteral';
import getArrayLiteral from 'parse/Parser/expressions/primary/literal/arrayLiteral';

export default function ( parser ) {
	var literal = getNumberLiteral( parser )   ||
				  getBooleanLiteral( parser )  ||
				  getStringLiteral( parser )   ||
				  getObjectLiteral( parser )   ||
				  getArrayLiteral( parser );

	return literal;
}
