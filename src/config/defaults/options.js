var defaultOptions = {

	// render placement:
	el:                 void 0,
	append:				false,

	// template:
	template:           {v:1,t:[]},

	// parse:
	preserveWhitespace: false,
	sanitize:           false,
	stripComments:      true,

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

export default defaultOptions;
