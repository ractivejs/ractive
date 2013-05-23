expr.expressionList = function ( tokenizer ) {
	var start, expressions, expression, next;

	start = tokenizer.pos;

	// allow whitespace before first expression
	//expr.whitespace( tokenizer );

	expression = expr.expression( tokenizer );

	if ( expression === null ) {
		return null;
	}

	expressions = [ expression ];

	// allow whitespace between expression and ','
	expr.whitespace( tokenizer );

	if ( expr.generic( tokenizer, ',' ) ) {
		next = expr.expressionList( tokenizer );
		if ( next === null ) {
			tokenizer.pos = start;
			return null;
		}

		expressions = expressions.concat( next );
	}

	return expressions;
};

expr.expression = function ( tokenizer ) {

	var start, expression, fns, fn, i, len;

	start = tokenizer.pos;

	// allow whitespace
	expr.whitespace( tokenizer );
	
	expression = typeof_( tokenizer )
	          || unaryNegation( tokenizer )
	          || unaryPlus( tokenizer )
	          || bitwiseNot( tokenizer )
	          || logicalNot( tokenizer )
	          || conditional( tokenizer );

	return expression;
};


var leftToRight = function ( symbol, fallthrough ) {
	return function ( tokenizer ) {
		var start, left, right;

		left = fallthrough( tokenizer );
		if ( !left ) {
			return null;
		}

		start = tokenizer.pos;

		expr.whitespace( tokenizer );

		if ( !expr.generic( tokenizer, symbol ) ) {
			tokenizer.pos = start;
			return left;
		}

		expr.whitespace( tokenizer );

		right = expr.expression( tokenizer );
		if ( !right ) {
			tokenizer.pos = start;
			return left;
		}

		return {
			symbol: symbol,
			expressions: [ left, right ]
		};
	};
};



var bracketed = function ( tokenizer ) {
	var start, expression;

	start = tokenizer.pos;

	if ( !expr.generic( tokenizer, '(' ) ) {
		return null;
	}

	expr.whitespace( tokenizer );

	expression = expr.expression( tokenizer );
	if ( !expression ) {
		tokenizer.pos = start;
		return null;
	}

	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, ')' ) ) {
		tokenizer.pos = start;
		return null;
	}

	return {
		type: BRACKETED,
		expression: expression
	};
};


var primary = function ( tokenizer ) {
	var production = expr.literal( tokenizer )
	              || expr.reference( tokenizer )
	              || bracketed( tokenizer );

	return production;
};

var member = function ( tokenizer ) {
	var start, expression, name, refinement, member;

	expression = primary( tokenizer );
	if ( !expression ) {
		return null;
	}

	refinement = expr.refinement( tokenizer );
	if ( !refinement ) {
		return expression;
	}

	while ( refinement !== null ) {
		member = {
			type: MEMBER,
			expression: expression,
			refinement: refinement
		};

		expression = member;
		refinement = expr.refinement( tokenizer );
	}

	return member;
};


var invocation = function ( tokenizer ) {
	var start, expression, expressionList, result;

	expression = member( tokenizer );
	if ( !expression ) {
		return null;
	}

	start = tokenizer.pos;

	if ( !expr.generic( tokenizer, '(' ) ) {
		return expression;
	}

	expr.whitespace( tokenizer );
	expressionList = expr.expressionList( tokenizer );

	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, ')' ) ) {
		tokenizer.pos = start;
		return expression;
	}

	result = {
		type: INVOCATION,
		expression: expression
	};

	if ( expressionList ) {
		result.parameters = expressionList;
	}

	return result;
};



var i, len, fn;
var ltrOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );

var ltrOperatorFns = [];

var prev = invocation;
for ( i=0, len=ltrOperators.length; i<len; i+=1 ) {
	fn = leftToRight( ltrOperators[i], prev );
	prev = fn;
}



var logicalOr = prev;
var conditional = function ( tokenizer ) {
	var start, expression, ifTrue, ifFalse;

	expression = logicalOr( tokenizer );
	if ( !expression ) {
		return null;
	}

	start = tokenizer.pos;

	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, '?' ) ) {
		tokenizer.pos = start;
		return expression;
	}

	expr.whitespace( tokenizer );

	ifTrue = expr.expression( tokenizer );
	if ( !ifTrue ) {
		tokenizer.pos = start;
		return expression;
	}

	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, ':' ) ) {
		tokenizer.pos = start;
		return expression;
	}

	expr.whitespace( tokenizer );

	ifFalse = expr.expression( tokenizer );
	if ( !ifFalse ) {
		tokenizer.pos = start;
		return expression;
	}

	return {
		type: CONDITIONAL,
		expressions: [ expression, ifTrue, ifFalse ]
	};
};




// right-to-left
var rightToLeft = function ( symbol ) {
	return function ( tokenizer ) {
		var start, expression;

		start = tokenizer.pos;

		if ( !expr.generic( tokenizer, symbol ) ) {
			return null;
		}

		expr.whitespace( tokenizer );

		expression = expr.expression( tokenizer );
		if ( !expression ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			symbol: symbol,
			expression: expression,
			type: PREFIX
		};
	};
};


var logicalNot = rightToLeft( '!' );
var bitwiseNot = rightToLeft( '~' );
var unaryPlus = rightToLeft( '+' );
var unaryNegation = rightToLeft( '-' );
var typeof_ = rightToLeft( 'typeof' );