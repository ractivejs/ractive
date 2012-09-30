/*jslint white: true */
/*global Anglebars, jQuery */


(function ( Anglebars, $ ) {

	'use strict';

	var examples = {}, example, select, i, numExamples;

	$( function () {
		select = $( 'select' );

		console.log( window.location.hash );

		// load data
		$.ajax( 'flattened.json', {
			success: function ( data ) {
				examples = data;

				select.empty();

				console.log( data );

				numExamples = examples.examples.length;
				for ( i=0; i<numExamples; i+=1 ) {
					example = examples.examples[i];
					console.log( example );
					select.append( '<option value="' + example.slug + '">' + example.title + '</option>' );
				}
			},
			error: function ( msg ) {
				throw new Error( msg );
			}
		});

		$( window ).on( 'hashchange', function () {
			console.log( window.location.hash );
		});
	});


}( Anglebars, jQuery ));