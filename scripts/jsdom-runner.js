/*global console, process */

var jsdom = require( 'jsdom' );

jsdom.env({
	file: 'tmp/test/index.html',
	features: {
		FetchExternalResources : [ 'img', 'script' ],
		ProcessExternalResources:  [ 'script' ]
	},
	done: function ( err, window ) {
		var document;

		if ( err ) throw err;

		document = window.document;

		waitFor( pageReady, waitForTestResults );

		function pageReady () {
			return !!document.getElementById( 'qunit-testresult' );
		}

		function waitForTestResults () {
			console.log( 'jsdom is ready. running tests...' );
			waitFor( testsComplete, evaluateResults, 20000 );
		}

		function testsComplete () {
			var testResult = document.getElementById( 'qunit-testresult' );
			console.log( 'testResult.textContent', testResult.textContent );
			return /Tests completed/.test( testResult.textContent );
		}

		function evaluateResults () {
			var failures,
				testResults,
				numTests,
				i,
				testResult;

			// Summary
			console.log( '>>>' + document.querySelector( '#qunit-testresult' ).textContent.replace( /\n/g, ' ' ) );

			failures = +document.querySelector( '.failed' ).textContent;

			if ( failures !== 0 ) {
				testResults = document.getElementById( 'qunit-tests' ).childNodes;
				numTests = testResults.length;

				for ( i = 0; i < numTests; i += 1 ) {
					testResult = testResults[i];

					if ( /fail/.test( testResult.getAttribute( 'class' ) ) ) {
						console.log( '>>>' + testResult.childNodes[0].textContent );
					}
				}
			}

			process.exit( failures ? 1 : 0 );
		}
	}
});

function waitFor ( condition, callback, timeout ) {
	var start, interval;

	timeout = timeout || 3000;
	start = Date.now();

	interval = setInterval( function() {
		if ( Date.now() - start > timeout ) {
			console.log( 'JSDOM runner timed out after ' + timeout + 'ms' );
			process.exit( 1 );
		}

		if ( condition() ) {
			clearInterval( interval );
			callback();
		}
	}, 100 );
}