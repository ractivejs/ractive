import 'legacy';

var defaults, initOptions, flags;

defaults = {

	// placement:
	el:                 null,
	append:				false,

	// template:
	template:           [],

	// parse:
	preserveWhitespace: false,
	sanitize:           false,
	stripComments:      true,
	delimiters:         [ '{{', '}}' ],
	tripleDelimiters:   [ '{{{', '}}}' ],
	handlebars:			false,

	// data & binding:
	magic:              false,
	modifyArrays:       true,
	adapt:              [],
	isolated:           false,
	twoway:             true,
	lazy:               false,
	// move out of here?
	computed:           null,

	// transitions:
	noIntro:            false,
	transitionsEnabled: true,
	complete:           null,

	// css:
	noCssTransform:     false,

	// debug:
	debug:              false
};

// flags are place as properties on the ractive instance
// other options are 'consumed' and don't need to exist on instance
flags = [ 'adapt', 'modifyArrays', 'magic', 'twoway', 'lazy', 'debug', 'isolated' ];

initOptions = {
	keys: Object.keys( defaults ),
	defaults: defaults,
	flags: flags
};

export default initOptions;
