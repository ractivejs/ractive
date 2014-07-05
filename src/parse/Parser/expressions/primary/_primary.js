import getLiteral from 'parse/Parser/expressions/primary/literal/_literal';
import getReference from 'parse/Parser/expressions/primary/reference';
import getBracketedExpression from 'parse/Parser/expressions/primary/bracketedExpression';

export default function ( parser ) {
	return getLiteral( parser )
		|| getReference( parser )
		|| getBracketedExpression( parser );
}
