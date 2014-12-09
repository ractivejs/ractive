var now;

if ( window.performance && window.performance.now ) {
	now = function () { return window.performance.now(); }
} else if ( Date.now ) {
	now = function () { return Date.now(); }
} else {
	now = function () { return new Date().getTime(); }
}

function runSuite ( tests, ractiveUrl, callback ) {
	var testResults = { tests: [] };

	tests = tests.slice();

	function runNextTest () {
		var test;

		test = tests.shift();
		if ( !test ) {
			return callback( null, testResults );
		}

		runTest( test, ractiveUrl, function ( err, result ) {
			if ( err ) {
				return callback( err );
			}

			testResults.tests.push( result );
			document.querySelector( '.iframe-container' ).innerHTML = '';

			setTimeout( runNextTest );
		});
	}

	runNextTest();
}

function runTest ( test, ractiveUrl, callback ) {
	console.group( test.name );

	iframe = document.createElement( 'iframe' );
	document.querySelector( '.iframe-container' ).appendChild( iframe );

	win = iframe.contentWindow;

	injectScript( iframe, ractiveUrl, function ( err ) {
		var alreadySetup, setupResult;

		if ( err ) {
			return callback( err );
		}

		// copy setTimeout from parent to child... prevents errors
		win.setTimeout = window.setTimeout;

		// setup test
		win.setupComplete = function ( err, setupResult ) {
			var start, duration;

			if ( err ) {
				return callback( err );
			}

			if ( alreadySetup ) throw new Error( 'setupComplete callback was called more than once' );
			alreadySetup = true;

			console.profile( test.name );
			console.time( test.name );

			start = now();

			win.setupResult = setupResult;

			try {
				win.eval( '(' + test.test.toString() + ')(setupResult)' );
			} catch ( err ) {
				return callback( err );
			}

			duration = now() - start;

			console.timeEnd( test.name );
			console.profileEnd( test.name );

			console.groupEnd();

			callback( null, {
				name: test.name,
				duration: duration
			});
		};


		if ( test.setup ) {
			setupResult = win.eval( '(' +  test.setup.toString() + ')(setupComplete)' );
		}

		if ( !test.setup || !test.setup.length ) {
			win.setupComplete( null, setupResult );
		}
	});
}

function injectScript ( iframe, url, callback ) {
	var doc, script, id, handleMessage;

	doc = iframe.contentDocument || iframe.contentWindow.document;

	script = doc.createElement( 'script' );
	script.src = url;

	id = Math.random();

	window.addEventListener( 'message', handleMessage = function ( event ) {
		if ( event.data === id ) {
			window.removeEventListener( 'message', handleMessage );
			callback();
		}
	});

	script.onload = function () {
		window.parent.postMessage( id, window.location.origin );
	};

	script.onerror = function () {
		var err = new Error( 'Could not load ' + url );
		callback( err );
	};

	doc.body.appendChild( script );
}
