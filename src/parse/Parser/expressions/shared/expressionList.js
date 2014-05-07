export default function getExpressionList ( tokenizer ) {
	var start, expressions, expr, next;

	start = tokenizer.pos;

	tokenizer.allowWhitespace();

	expr = tokenizer.readExpression();

	if ( expr === null ) {
		return null;
	}

	expressions = [ expr ];

	// allow whitespace between expression and ','
	tokenizer.allowWhitespace();

	if ( tokenizer.matchString( ',' ) ) {
		next = getExpressionList( tokenizer );
		if ( next === null ) {
			tokenizer.pos = start;
			return null;
		}

		next.forEach( append );
	}

	function append ( expression ) {
		expressions.push( expression );
	}

	return expressions;
}
