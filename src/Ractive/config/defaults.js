export default {
	// render placement:
	el:                     void 0,
	append:				    false,

	// template:
	template:               null,

	// parse:
	delimiters:             [ '{{', '}}' ],
	tripleDelimiters:       [ '{{{', '}}}' ],
	staticDelimiters:       [ '[[', ']]' ],
	staticTripleDelimiters: [ '[[[', ']]]' ],
	csp: 					true,
	interpolate:            false,
	preserveWhitespace:     false,
	sanitize:               false,
	stripComments:          true,

	// data & binding:
	data:                   {},
	computed:               {},
	magic:                  false,
	modifyArrays:           true,
	adapt:                  [],
	isolated:               false,
	twoway:                 true,
	lazy:                   false,
	derivedBindings:		false,

	// transitions:
	noIntro:                false,
	transitionsEnabled:     true,
	complete:               void 0,

	// css:
	css:                    null,
	noCssTransform:         false
};
