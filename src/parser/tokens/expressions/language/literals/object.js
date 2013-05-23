expr.objectLiteral = function ( tokenizer ) {
	var start, object, keyValuePairs, i, pair;

	start = tokenizer.pos;

	// allow whitespace
	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, '{' ) ) {
		tokenizer.pos = start;
		return null;
	}

	object = {};

	keyValuePairs = expr.keyValuePairs( tokenizer );
	if ( keyValuePairs ) {
		i = keyValuePairs.length;
		while ( i-- ) {
			pair = keyValuePairs[i];

			if ( object.hasOwnProperty( pair.key ) ) {
				throw new Error( 'An object cannot have multiple keys with the same name' );
			}

			object[ pair.key ] = pair.value;
		}
	}

	// allow whitespace between final value and '}'
	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, '}' ) ) {
		tokenizer.pos = start;
		return null;
	}

	return {
		type: OBJECT_LITERAL,
		value: object
	};
};

expr.keyValuePairs = function ( tokenizer ) {
	var start, pairs, pair, keyValuePairs;

	start = tokenizer.pos;

	pair = expr.keyValuePair( tokenizer );
	if ( pair === null ) {
		return null;
	}

	pairs = [ pair ];

	if ( expr.generic( tokenizer, ',' ) ) {
		keyValuePairs = expr.keyValuePairs( tokenizer );

		if ( !keyValuePairs ) {
			tokenizer.pos = start;
			return null;
		}

		return pairs.concat( keyValuePairs );
	}

	return pairs;
};

expr.keyValuePair = function ( tokenizer ) {
	var start, pair, key, value;

	start = tokenizer.pos;

	// allow whitespace between '{' and key
	expr.whitespace( tokenizer );

	key = expr.key( tokenizer );
	if ( key === null ) {
		tokenizer.pos = start;
		return null;
	}

	// allow whitespace between key and ':'
	expr.whitespace( tokenizer );

	// next character must be ':'
	if ( !expr.generic( tokenizer, ':' ) ) {
		tokenizer.pos = start;
		return null;
	}

	// allow whitespace between ':' and value
	expr.whitespace( tokenizer );

	// next expression must be a, well... expression
	value = expr.expression( tokenizer );

	if ( value === null ) {
		tokenizer.pos = start;
		return null;
	}

	// workaround for null problem
	if ( value === expr.nullSentinel ) {
		value = null;
	}

	return { key: key, value: value };
};

// http://mathiasbynens.be/notes/javascript-properties
// can be any name, string literal, or number literal
expr.key = function ( tokenizer ) {
	return expr.name( tokenizer ) || expr.stringLiteral( tokenizer ) || expr.numberLiteral( tokenizer );
};