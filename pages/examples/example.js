/*jslint white: true */
/*global Anglebars, jQuery */

(function ( Anglebars, $ ) {

	'use strict';

	var masterAnglebars, templateDeferred, examplesDeferred, master, exampleBySlug, examples, selectExample;

	// load master template
	templateDeferred = $.ajax( 'master.html' ).done( function ( data ) {
		master = data;
	})
	.fail( function ( err ) {
		throw err;
	});

	// load examples
	examplesDeferred = $.ajax( 'examples.json' ).done( function ( data ) {
		examples = data;
	})
	.fail( function ( err ) {
		throw err;
	});




	// DOM ready
	$( function () {
		$.when( templateDeferred, examplesDeferred ).done( function () {
			var i, example, numExamples, hashSlug, slug, select, consoleTextarea, consoleMirror, mirror, scr;

			// get array of examples
			exampleBySlug = {};
			numExamples = examples.length;
			for ( i=0; i<numExamples; i+=1 ) {
				example = examples[i];
				exampleBySlug[ example.slug ] = example;
			}

			// sort
			// TODO ensure examples are in the correct order, somehow

			// select example based on hash
			selectExample = function () {
				var scr, selectedExample = exampleBySlug[ window.location.hash.replace( '#', '' ) ];

				if ( selectedExample ) {
					masterAnglebars.set( 'selectedExample', selectedExample );
					mirror();
					
					select.val( selectedExample.slug );

					// run setup script by appending a script element to the DOM, then removing it
					scr = document.createElement( 'script' );
					scr.innerHTML = selectedExample.setup;
					document.body.appendChild( scr );
					document.body.removeChild( scr );
				}
			};

			// set up master anglebars
			masterAnglebars = new Anglebars({
				el: document.body,
				template: master,
				data: {
					examples: examples,
					selectedExample: examples[0]
				}
			});

			
			// set up textarea mirroring
			consoleTextarea = $( '#console' );
			consoleMirror = $( '#consoleMirror' );

			// TODO make this better
			mirror = function () {
				consoleMirror.text( consoleTextarea.val() + '\nx' );
			};

			consoleTextarea.on( 'keyup keydown keypress', function () {
				if ( event.type === 'keydown' && event.which === 13 ) {
					if ( !event.shiftKey ) {
						// submit
						event.preventDefault();
						eval( consoleTextarea.val() );
					}
				}

				mirror();
			});

			select = $( 'select' );
			select.on( 'change', function () {
				window.location.hash = select.val();
			});

			// select example based on URL hash
			selectExample();
			mirror();

			$( window ).on( 'hashchange', selectExample );
		});

		

		
	});


}( Anglebars, jQuery ));