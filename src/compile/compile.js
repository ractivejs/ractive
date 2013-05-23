// Ractive.compile
// ===============
//
// Takes in a string, and returns an object representing the compiled template.
// A compiled template is an array of 1 or more 'descriptors', which in some
// cases have children.
//
// The format is optimised for size, not readability, however for reference the
// keys for each descriptor are as follows:
//
// * r - Reference, e.g. 'mustache' in {{mustache}}
// * t - Type, as according to types.js (e.g. 1 is text, 2 is interpolator...)
// * f - Fragment. Contains a descriptor's children
// * e - Element name
// * a - map of element Attributes
// * n - indicates an iNverted section
// * p - Priority. Higher priority items are updated before lower ones on model changes
// * i - Index reference, e.g. 'num' in {{#section:num}}content{{/section}}
// * v - eVent proxies (i.e. when user e.g. clicks on a node, fire proxy event)
// * c - Conditionals (e.g. ['yes', 'no'] in {{condition ? yes : no}})
// * x - eXpressions

var Ractive = Ractive || {}, utils = utils || {}; // in case we're not using the runtime

(function ( R, utils ) {

	'use strict';

	R.compile = function ( template, options ) {
		var tokens, fragmentStub, json;

		options = options || {};

		if ( options.sanitize === true ) {
			options.sanitize = {
				// blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
				elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
				eventAttributes: true
			};
		}

		tokens = utils.tokenize( template, options );
		
		fragmentStub = utils.getFragmentStubFromTokens( tokens, 0, options, options.preserveWhitespace );
		
		json = fragmentStub.toJson();

		if ( typeof json === 'string' ) {
			// If we return it as a string, Ractive will attempt to recompile it!
			// Instead we wrap it in an array. Ractive knows what to do then
			return [ json ];
		}
	
		return json;
	};


	// TODO account for options (preserveWhitespace, sanitize) and priority


	

	utils.getFragmentStubFromTokens = function ( tokens, priority, options, preserveWhitespace ) {
		var parser, stub;

		parser = {
			pos: 0,
			tokens: tokens || [],
			next: function () {
				return parser.tokens[ parser.pos ]
			},
			options: options
		};

		stub = stubs.fragment( parser, priority, preserveWhitespace );

		return stub;
	};


}( Ractive, utils ));