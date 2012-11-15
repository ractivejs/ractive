// Static method to compile a template string
Anglebars.compile = function ( template, options ) {
	var nodes, stubs, compiled = [], delimiters, tripleDelimiters, utils = Anglebars.utils;

	options = options || {};

	Anglebars.delimiters = options.delimiters || [ '{{', '}}' ];
	Anglebars.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

	Anglebars.utils.compileMustachePattern();

	// Collapse any standalone mustaches and remove templates
	template = utils.preProcess( template, options.partials );
	
	// Parse the template
	nodes = utils.getNodeArrayFromHtml( template, ( options.replaceSrcAttributes === undefined ? true : options.replaceSrcAttributes ) );

	// Get an array of 'stubs' from the resulting DOM nodes
	stubs = utils.getStubsFromNodes( nodes );

	// Compile the stubs
	compiled = utils.compileStubs( stubs, 0, options.namespace, options.preserveWhitespace );

	return compiled;
};

// Cached regexes
Anglebars.patterns = {
	formatter: /([a-zA-Z_$][a-zA-Z_$0-9]*)(\[[^\]]*\])?/,
	
	// for template preprocessor
	preprocessorTypes: /section|comment|delimiterChange/,
	standalonePre: /(?:\r)?\n[ \t]*$/,
	standalonePost: /^[ \t]*(\r)?\n/,
	standalonePreStrip: /[ \t]+$/
};