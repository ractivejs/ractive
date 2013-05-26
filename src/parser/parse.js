// Ractive.parse
// ===============
//
// Takes in a string, and returns an object representing the parsed template.
// A parsed template is an array of 1 or more 'descriptors', which in some
// cases have children.
//
// The format is optimised for size, not readability, however for reference the
// keys for each descriptor are as follows:
//
// * r - Reference, e.g. 'mustache' in {{mustache}}
// * t - Type code (e.g. 1 is text, 2 is interpolator...)
// * f - Fragment. Contains a descriptor's children
// * e - Element name
// * a - map of element Attributes
// * n - indicates an iNverted section
// * p - Priority. Higher priority items are updated before lower ones on model changes
// * i - Index reference, e.g. 'num' in {{#section:num}}content{{/section}}
// * v - eVent proxies (i.e. when user e.g. clicks on a node, fire proxy event)
// * c - Conditionals (e.g. ['yes', 'no'] in {{condition ? yes : no}})
// * x - eXpressions

var parse;

parse = function ( template, options ) {
	var tokens, fragmentStub, json, token, onlyWhitespace;

	options = options || {};

	onlyWhitespace = /^\s*$/;

	if ( options.sanitize === true ) {
		options.sanitize = {
			// blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
			elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
			eventAttributes: true
		};
	}

	tokens = tokenize( template, options );

	if ( !options.preserveWhitespace ) {
		// remove first token if it only contains whitespace
		token = tokens[0];
		if ( token && ( token.type === TEXT ) && onlyWhitespace.test( token.value ) ) {
			tokens.shift();
		}

		// ditto last token
		token = tokens[ tokens.length - 1 ];
		if ( token && ( token.type === TEXT ) && onlyWhitespace.test( token.value ) ) {
			tokens.pop();
		}
	}
	
	fragmentStub = getFragmentStubFromTokens( tokens, 0, options, options.preserveWhitespace );
	
	json = fragmentStub.toJson();

	if ( typeof json === 'string' ) {
		// If we return it as a string, Ractive will attempt to reparse it!
		// Instead we wrap it in an array. Ractive knows what to do then
		return [ json ];
	}

	return json;
};