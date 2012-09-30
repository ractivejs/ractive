/*jslint white: true */
/*global Anglebars, jQuery */

var flatten;

(function ( Anglebars, $ ) {

	'use strict';

	var examples, example, i, numExamples, loadExample, notes = {}, templates = {}, code = {}, codeExamples = {}, deferreds;


	examples = [
		{
			title: 'Hello, world!',
			slug: 'helloworld'
		},
		{
			title: 'Formatters',
			slug: 'formatters'
		}
	];


	loadExample = function ( example ) {
		var deferred = new $.Deferred(), loadingNotes, loadingTemplate, loadingCode, loadingExampleCode;

		loadingNotes = $.ajax( example.slug + '/notes.html' )
			.done( function ( data ) { notes[ example.slug ] = data; });

		loadingTemplate = $.ajax( example.slug + '/template.html' )
			.done( function ( data ) { templates[ example.slug ] = data; });

		loadingCode = $.ajax( example.slug + '/code.txt' )
			.done( function ( data ) { code[ example.slug ] = data; });

		loadingExampleCode = $.ajax( example.slug + '/exampleCode.txt' )
			.done( function ( data ) { codeExamples[ example.slug ] = data; });


		$.when( loadingNotes, loadingTemplate, loadingCode, loadingExampleCode )
			.done( function () { deferred.resolve(); });

		return deferred;
	};

	numExamples = examples.length;
	deferreds = [];
	for ( i=0; i<numExamples; i+=1 ) {
		example = examples[i];

		deferreds[i] = loadExample( example );
	}

	$.when( deferreds )
		.done( function () {
			console.log( notes, templates, code, codeExamples );

			console.log( notes.helloworld );
		})
		.fail( function () {
			throw new Error( 'Something went wrong' );
		});


	flatten = function () {
		$( '#output' ).text( JSON.stringify({ examples: examples, notes: notes, templates: templates, code: code, codeExamples: codeExamples }) );
	};

}( Anglebars, jQuery ));