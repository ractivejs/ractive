var defaults = {

	// render placement:
	el:                 void 0,
	append:				false,

	// template:
	template:           void 0,

	// parse:
	preserveWhitespace: false,
	sanitize:           false,
	stripComments:      true,
	delimiters:         [ '{{', '}}' ],
	tripleDelimiters:   [ '{{{', '}}}' ],
	handlebars:			false,

	// data & binding:
	data:               {},
	computed:           {},
	magic:              false,
	modifyArrays:       true,
	adapt:              [],
	isolated:           false,
	twoway:             true,
	lazy:               false,

	// transitions:
	noIntro:            false,
	transitionsEnabled: true,
	complete:           void 0,

	// css:
	noCssTransform:     false,

	// debug:
	debug:              false
};

export default defaults;
