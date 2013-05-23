(function ( expr ) {

	var refinement, dotRefinement, arrayRefinement, arrayMember;

	expr.mustacheRef = function ( tokenizer ) {
		var start, ref, member;

		start = tokenizer.pos;

		if ( expr.generic( tokenizer, '.' ) ) {
			return '.';
		}

		ref = expr.name( tokenizer );
		if ( !ref ) {
			return null;
		}

		member = refinement( tokenizer );
		while ( member !== null ) {
			ref += member;
			member = refinement( tokenizer );
		}

		return ref;
	};

	refinement = function ( tokenizer ) {
		return dotRefinement( tokenizer ) || arrayRefinement( tokenizer );
	};

	dotRefinement = expr.regex( /^\.[a-zA-Z_$][a-zA-Z_$0-9]*/ );

	arrayRefinement = function ( tokenizer ) {
		var num = arrayMember( tokenizer );

		if ( num ) {
			return '.' + num;
		}

		return null;
	};

	arrayMember = expr.regex( /^\[(0|[1-9][0-9]*)\]/ );

}( expr ));