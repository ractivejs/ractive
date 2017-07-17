/*global console, ractive */
var now;

if ( window.performance && window.performance.now ) {
	now = function () { return window.performance.now(); };
} else if ( Date.now ) {
	now = function () { return Date.now(); };
} else {
	now = function () { return new Date().getTime(); };
}

const durationMax = 1000;
const totalDurationMax = 3000;

let shouldProfile = false;

function runSuite ( tests, version, ractiveUrl, callback ) {
	var testResults = { tests: [] },
		container = document.querySelector( '.iframe-container' ),
		solo;

	console.group( 'running performance tests (' + version + ')' );

	shouldProfile = ractive.get( 'shouldProfile' );

	tests = tests.filter( function ( t ) { return !t.skip; });

	solo = tests.filter( function ( t ) { return t.solo; });
	if ( solo.length ) {
		tests = solo;
	}

	function runNextTest () {
		var test, frame;

		test = tests.shift();
		if ( !test ) {
			console.groupEnd();
			return callback( null, testResults );
		}

		frame = document.createElement( 'iframe' );
		if ( ractive.get( 'showResult' ) ) frame.classList.add( 'visible' );
		container.appendChild( frame );

		runTest( frame.contentWindow, test, version, ractiveUrl, function ( err, result ) {
			if ( err ) {
				console.groupEnd();
				err.testName = test.name;
				if ( result ) testResults.tests.push( result );
				return callback( err, testResults );
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
			var start, runStart, duration, totalDuration, count = 0, label = version + ': ' + test.name, steps = [], died = false, min, max, durs = [];

			if ( err ) {
				return callback( err );
			}

			if ( alreadySetup ) throw new Error( 'setupComplete callback was called more than once' );
			alreadySetup = true;

			if ( shouldProfile || test.profile ) console.profile( label );

			start = now();
			duration = totalDuration = min = max = 0;

			context.setupResult = setupResult;

			while ( !died && duration < durationMax && totalDuration < totalDurationMax ) {
				if ( test.beforeEach ) {
					context.eval( '(' + test.beforeEach.toString() + ')()' );
				}

				count += 1;
				runStart = now();

				try {
					if ( Array.isArray( test.test ) ) {
						for ( let i = 0; i < test.test.length; i++ ) {
							const t = test.test[i];
							if ( !t.skip ) {
								if ( t.profile ) console.profile( label + ' - ' + t.name );
								runStep( context, t, ( err, res ) => {
									steps.push( res );
									if ( err ) {
										res.error = err;
										died = true;
									}
								});
								if ( t.profile ) console.profileEnd( label + ' - ' + t.name );
							}
						}
					} else {
						context.eval( '(' + test.test.toString() + ')(setupResult)' );
					}
				} catch ( e ) {
					return callback( e );
				}

				var dur = now() - runStart;
				duration += dur;
				durs.push( dur );
				if ( !min || dur < min ) min = dur;
				if ( dur > max ) max = dur;
				totalDuration += dur;
			}

			if ( shouldProfile || test.profile ) console.profileEnd( label );

			console.groupEnd();

			callback( null, {
				test: test,
				version: version,
				ractiveUrl: ractiveUrl,
				name: test.name,
				count: count,
				steps,
				duration: duration,
				average: duration / count,
				min: min,
				max: max,
				durations: durs
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

function runStep ( context, test, callback ) {
	let start = now(), count = 0, runStart, setupStart;
	let duration = 0, totalDuration = 0, min = 0, max = 0;
	let durs = [], setups = [], setup;

	console.group( test.name );

	if ( typeof test.setup === 'function' ) {
		setupStart = now();
		context.eval( '(' + test.setup.toString() + ')()' );
		setup = now() - setupStart;
	}

	while ( duration < ( test.max || durationMax ) && totalDuration < ( test.totalMax || totalDurationMax ) ) {
		if ( typeof test.beforeEach === 'function' ) {
			setupStart = now();
			context.eval( '(' + test.beforeEach.toString() + ')()' );
			setups.push( now() - setupStart );
		}
		runStart = now();
		count++;

		try {
			context.eval( '(' + test.test.toString() + ')(setupResult)' );
		} catch ( e ) {
			return callback( e, { name: test.name } );
		}

		var dur = now() - runStart;
		duration += dur;
		durs.push( dur );
		if ( !min || dur < min ) min = dur;
		if ( dur > max ) max = dur;
		totalDuration = now() - start;

		if ( test.maxCount && count >= test.maxCount ) break;
	}

	callback(null, {
		name: test.name,
		duration,
		count,
		average: duration / count,
		min,
		max,
		durations: durs,
		setups,
		setup
	});

	console.groupEnd( test.name );
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
