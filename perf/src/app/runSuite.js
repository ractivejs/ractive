/*global console */
var now;

if ( window.performance && window.performance.now ) {
	now = function () { return window.performance.now(); };
} else if ( Date.now ) {
	now = function () { return Date.now(); };
} else {
	now = function () { return new Date().getTime(); };
}

function runSuite ( tests, version, ractiveUrl, callback ) {
	var testResults = { tests: [] },
		container = document.querySelector( '.iframe-container' );

	console.group( 'running performance tests (' + version + ')' );

	tests = tests.slice();

	function runNextTest () {
		var test, frame;

		test = tests.shift();
		if ( !test ) {
			console.groupEnd();
			return callback( null, testResults );
		}

		frame = document.createElement( 'iframe' );
		container.appendChild( frame );

		runTest( frame.contentWindow, test, version, ractiveUrl, function ( err, result ) {
			if ( err ) {
				console.groupEnd();
				return callback( err );
			}

			testResults.tests.push( result );
			container.innerHTML = '';

			setTimeout( runNextTest );
		});
	}

	runNextTest();
}

function runTest ( context, test, version, ractiveUrl, callback ) {
	console.group( test.name );

	injectScript( context, ractiveUrl, function ( err ) {
		var alreadySetup, setupResult;

		if ( err ) {
			return callback( err );
		}

		// copy setTimeout from parent to child... prevents errors
		context.setTimeout = window.setTimeout;

		// setup test
		context.setupComplete = function ( err, setupResult ) {
			var start, duration, label = version + ': ' + test.name;

			if ( err ) {
				return callback( err );
			}

			if ( alreadySetup ) throw new Error( 'setupComplete callback was called more than once' );
			alreadySetup = true;

			console.profile( label );
			console.time( label );

			start = now();

			context.setupResult = setupResult;

			try {
				context.eval( '(' + test.test.toString() + ')(setupResult)' );
			} catch ( e ) {
				return callback( e );
			}

			duration = now() - start;

			console.timeEnd( label );
			console.profileEnd( label );

			console.groupEnd();

			callback( null, {
				test: test,
				version: version,
				ractiveUrl: ractiveUrl,
				name: test.name,
				duration: duration
			});
		};


		if ( test.setup ) {
			setupResult = context.eval( '(' +  test.setup.toString() + ')(setupComplete)' );
		}

		if ( !test.setup || !test.setup.length ) {
			context.setupComplete( null, setupResult );
		}
	});
}

function injectScript ( context, url, callback ) {
	var doc, script, id, handleMessage;

	doc = context.document;

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
