export default {
	// render placement:
	el:                 void 0,
	append:				false,

	// template:
	template:           null,

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
	twoway:             true,
	lazy:               false,

	// transitions:
	noIntro:            false,
	transitionsEnabled: true,
	complete:           void 0,

	// css:
	css:                null,
	noCssTransform:     false
};
