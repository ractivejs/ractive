import 'legacy';

var defaults, isFunction, properties, initOptions, flags, keys, wrapKeys, config;

defaults = {

	// render placement:
	el:                 null,
	append:				false,

	// template:
	template:           void 0, //custom

	// parse:
	preserveWhitespace: false,
	sanitize:           false,
	stripComments:      true,
	delimiters:         [ '{{', '}}' ],
	tripleDelimiters:   [ '{{{', '}}}' ],
	handlebars:			false,

	// data & binding:
	//data:               null, //custom
	computed:           {},  //custom
	magic:              false,
	modifyArrays:       true,
	adapt:              [],
	isolated:           false,
	twoway:             true,
	lazy:               false,

	// transitions:
	noIntro:            false,
	transitionsEnabled: true,
	complete:           null,

	// css:
	noCssTransform:     false,

	// debug:
	debug:              false //flag
};

// default is a function and should be wrapped:
isFunction = {
	complete: true
}

// flags are placed as properties on the ractive instance
// other options are 'consumed' and don't need to exist on instance
flags = [ 'adapt', 'complete', 'modifyArrays', 'magic', 'twoway', 'lazy', 'debug', 'isolated' ];

keys = Object.keys( defaults );

initOptions = {
	keys: keys,
	defaults: defaults,
	isFunction: isFunction,
	flags: flags
};

export default initOptions;
