import readNumberLiteral from './literal/readNumberLiteral';
import readBooleanLiteral from './literal/readBooleanLiteral';
import readStringLiteral from './literal/readStringLiteral';
import readObjectLiteral from './literal/readObjectLiteral';
import readArrayLiteral from './literal/readArrayLiteral';
import readRegexpLiteral from './literal/readRegexpLiteral';

export default function readLiteral ( parser ) {
	return readNumberLiteral( parser )  ||
	       readBooleanLiteral( parser ) ||
	       readStringLiteral( parser )  ||
	       readObjectLiteral( parser )  ||
	       readArrayLiteral( parser )   ||
	       readRegexpLiteral( parser );
}
