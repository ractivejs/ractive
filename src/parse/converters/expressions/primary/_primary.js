import getLiteral from './literal/_literal';
import getReference from './reference';
import getBracketedExpression from './bracketedExpression';

export default function ( parser ) {
	return getLiteral( parser )
		|| getReference( parser )
		|| getBracketedExpression( parser );
}
