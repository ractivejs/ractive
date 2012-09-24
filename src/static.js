(function ( A ) {
	
	'use strict';

	var utils = A.utils, views = A.views;

	A.compileTemplate = function ( template, preserveWhitespace, replaceSrcAttributes ) {

		var nodes, stubs, compiled = [];

		// first, remove any comment mustaches
		template = utils.stripComments( template );

		// then, parse the template
		nodes = utils.getNodeArrayFromHtml( template, replaceSrcAttributes );
		
		// then, get an array of 'stubs' from the resulting DOM nodes
		stubs = utils.getStubsFromNodes( nodes );

		// finally, compile the stubs
		compiled = utils.compileStubs( stubs, 0 );

		return compiled;
	};


	A.render = function ( anglebars, el ) {

		var rendered;

		if ( !anglebars.compiled ) {
			throw new Error( 'No compiled template' );
		}

		rendered = new views.Fragment( anglebars.compiled, anglebars, el );

		return rendered;

	};



}( Anglebars ));