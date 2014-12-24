var defaultOptions = {

	// render placement:
	el:                 void 0,
	append:				false,

	// template:
	template:           {v:2,t:[]},

	// parse:     // TODO static delimiters?
	preserveWhitespace: false,
	sanitize:           false,
	stripComments:      true,
	delimiters:         [ '{{', '}}' ],
	tripleDelimiters:   [ '{{{', '}}}' ],
	interpolate:        false,

	// data & binding:
	data:               {},
	computed:           {},
	magic:              false,
	modifyArrays:       true,
	adapt:              [],
	isolated:           false,
	parameters: 		true,
	twoway:             true,
	lazy:               false,

	// transitions:
	noIntro:            false,
	transitionsEnabled: true,
	complete:           void 0,

	// css:
	css:                null,
	noCssTransform:     false,

	// debug:
	debug:              false
};

export default defaultOptions;
