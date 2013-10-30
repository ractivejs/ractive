var getItem;

(function () {

	var getText, getMustache, getElement, getComment;

	getItem = function ( parser, preserveWhitespace ) {
		var next = parser.next();

		if ( !next ) {
			return null;
		}

		return getText( parser, next, preserveWhitespace )
		    || getMustache( parser, next, preserveWhitespace )
		    || getElement( parser, next, preserveWhitespace )
		    || getComment( parser, next );
	};

	getText = function ( parser, next, preserveWhitespace ) {
		if ( next.type === TEXT ) {
			parser.pos += 1;
			return new TextStub( next, preserveWhitespace );
		}

		return null;
	};

	getMustache = function ( parser, next, preserveWhitespace ) {
		if ( next.type === MUSTACHE || next.type === TRIPLE ) {
			if ( next.mustacheType === SECTION || next.mustacheType === INVERTED ) {
				return new SectionStub( next, parser, preserveWhitespace );				
			}

			return new MustacheStub( next, parser );
		}

		return null;
	};

	getElement = function ( parser, next, preserveWhitespace ) {
		var stub;

		if ( next.type === TAG ) {
			stub = new ElementStub( next, parser, preserveWhitespace );

			// sanitize			
			if ( parser.options.sanitize && parser.options.sanitize.elements ) {
				if ( parser.options.sanitize.elements.indexOf( stub.lcTag ) !== -1 ) {
					return null;
				}
			}

			return stub;
		}

		return null;
	};

	getComment = function ( parser, next ) {
		if ( next.type === COMMENT ) {
			parser.pos += 1;
			return new CommentStub( next );
		}

		return null;
	};

}());