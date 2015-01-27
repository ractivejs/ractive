/*global phantom, WebPage, console */

var page = new WebPage();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function ( msg ) {
	if ( msg.substr( 0, 3 ) === '>>>' ) {
		console.log( msg.substring( 3 ) );
	}
};

page.open( 'tmp/test/index.html', function(status){
	if ( status !== 'success' ) {
		console.log( 'Failed to start PhantomJS' );
		phantom.exit(1);
	}

	waitFor( pageReady, waitForTestResults );

	function pageReady () {
		return page.evaluate( function () {
			return !!document.getElementById( 'qunit-testresult' );
		});
	}

	function waitForTestResults () {
		console.log( 'phantomjs is ready. running tests...' );
		waitFor( testsComplete, evaluateResults, 30000 );
	}

	function testsComplete () {
		return page.evaluate( function () {
			var testResult = document.getElementById( 'qunit-testresult' );
			return /Tests completed/.test( testResult.innerText );
		});
	}

	function evaluateResults () {
		var failures = page.evaluate( function () {
			var result,
				testResults,
				numTests,
				i,
				testResult;

			// Summary
			console.log( '>>>' + document.querySelector( '#qunit-testresult' ).innerText.replace( /\n/g, ' ' ) );

			result = +document.querySelector( '.failed' ).innerText;

			if ( result === 0 ) {
				return 0;
			}

			testResults = document.getElementById( 'qunit-tests' ).childNodes;
			numTests = testResults.length;

			for ( i = 0; i < numTests; i += 1 ) {
				testResult = testResults[i];

				if ( /fail/.test( testResult.getAttribute( 'class' ) ) ) {
					console.log( '>>>' + testResult.childNodes[0].innerText );
				}
			}

			return result;
		});

		phantom.exit( failures ? 1 : 0 );
	}
});


function waitFor ( condition, callback, timeout ) {
	var start, interval;

	timeout = timeout || 3000;
	start = Date.now();

	interval = setInterval( function() {
		if ( Date.now() - start > timeout ) {
			console.log( 'PhantomJS timed out after ' + timeout + 'ms' );
			phantom.exit( 1 );
		}

		if ( condition() ) {
			clearInterval( interval );
			callback();
		}
	}, 100 );
}