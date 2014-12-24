import getNumberLiteral from './numberLiteral';
import getBooleanLiteral from './booleanLiteral';
import getStringLiteral from './stringLiteral/_stringLiteral';
import getObjectLiteral from './objectLiteral/_objectLiteral';
import getArrayLiteral from './arrayLiteral';

export default function ( parser ) {
	var literal = getNumberLiteral( parser )   ||
				  getBooleanLiteral( parser )  ||
				  getStringLiteral( parser )   ||
				  getObjectLiteral( parser )   ||
				  getArrayLiteral( parser );

	return literal;
}
