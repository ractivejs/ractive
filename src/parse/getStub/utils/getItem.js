define([
	'config/types',
	'parse/getStub/TextStub',
	'parse/getStub/SectionStub',
	'parse/getStub/MustacheStub',
	'parse/getStub/ElementStub',
	'parse/getStub/CommentStub'
], function (
	types,
	TextStub,
	SectionStub,
	MustacheStub,
	ElementStub,
	CommentStub
) {

	'use strict';

	var getItem,

		// helpers
		getText,
		getMustache,
		getElement,
		getComment;

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
		if ( next.type === types.TEXT ) {
			parser.pos += 1;
			return new TextStub( next, preserveWhitespace );
		}

		return null;
	};

	getMustache = function ( parser, next, preserveWhitespace ) {
		if ( next.type === types.MUSTACHE || next.type === types.TRIPLE ) {
			if ( next.mustacheType === types.SECTION || next.mustacheType === types.INVERTED ) {
				return new SectionStub( next, parser, preserveWhitespace );				
			}

			return new MustacheStub( next, parser );
		}

		return null;
	};

	getElement = function ( parser, next, preserveWhitespace ) {
		var stub;

		if ( next.type === types.TAG ) {
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
		if ( next.type === types.COMMENT ) {
			parser.pos += 1;
			return new CommentStub( next );
		}

		return null;
	};

	return getItem;

});