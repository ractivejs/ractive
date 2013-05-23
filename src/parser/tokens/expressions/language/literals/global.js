(function ( expr ) {

	var globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)/;

	// Not strictly literals, but we can treat them as such because they
	// never need to be dereferenced.

	// Allowed globals:
	// ----------------
	//
	// Array, Date, RegExp, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, isFinite, isNaN, parseFloat, parseInt, JSON, Math, NaN, undefined, null
	expr.global = function ( tokenizer ) {
		var start, name, match, global;

		start = tokenizer.pos;
		name = expr.name( tokenizer );

		if ( !name ) {
			return null;
		}

		match = globals.exec( name );
		if ( match ) {
			tokenizer.pos = start + match[0].length;
			return {
				type: GLOBAL,
				value: match[0]
			};
		}

		tokenizer.pos = start;
		return null;
	};

}( expr ));

