// Static method to compile a template string
Anglebars.compile = function ( template, options ) {
	var nodes, stubs, compiled = [], utils = Anglebars.utils;

	// Remove any comment mustaches
	template = utils.stripComments( template );

	// Parse the template
	nodes = utils.getNodeArrayFromHtml( template, ( options.replaceSrcAttributes === undefined ? true : options.replaceSrcAttributes ) );
	
	// Get an array of 'stubs' from the resulting DOM nodes
	stubs = utils.getStubsFromNodes( nodes );

	// Compile the stubs
	compiled = utils.compileStubs( stubs, 0, options.namespace, options.preserveWhitespace );

	return compiled;
};

