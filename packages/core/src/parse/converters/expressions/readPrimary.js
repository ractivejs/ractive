import readLiteral from './primary/readLiteral';
import readReference from './primary/readReference';
import readBracketedExpression from './primary/readBracketedExpression';

export default function ( parser ) {
	return readLiteral( parser )
		|| readReference( parser )
		|| readBracketedExpression( parser );
}
