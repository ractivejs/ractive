(function () {

	'use strict';

	var isBuild, config, i, prefixedModules = [];

	if ( /build=true/.test( window.location.search ) || /phantomjs/i.test( window.navigator.userAgent ) ) {
		isBuild = true;
		QUnit.config.autostart = false;

		config = {
			baseUrl: '../../src/',
			paths: {
				ractive: '../tmp/ractive-legacy',
				modules: '../test/modules',
				samples: '../test/samples',
				vendor: '../test/vendor'
			}
		};
	} else {
		config = {
			baseUrl: '../../src/',
			paths: {
				modules: '../test/modules',
				samples: '../test/samples',
				vendor: '../test/vendor'
			}
		};
	}

	require.config( config );

	// can't use .map() because of IE...
	i = _modules.length;
	while ( i-- ) {
		prefixedModules[i] = 'modules/' + _modules[i];
	}

	console.log( 'about to load test modules ' + prefixedModules.join( ',' ) );

	require( [ 'ractive' ].concat( prefixedModules ), function ( Ractive ) {
		window.Ractive = Ractive;

		console.log( 'loaded test modules. continuing...' );

		Ractive.defaults.magic = /magic=true/.test( window.location.search );

		Array.prototype.slice.call( arguments, 1 ).forEach( function ( testSet ) {
			testSet();
		});

		console.log( 'isBuild? ' + isBuild );

		if ( isBuild ) {
			QUnit.start();
		}
	});

}());
