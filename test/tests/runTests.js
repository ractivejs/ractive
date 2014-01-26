(function () {

	'use strict';

	var isBuild, config;

	if ( /build=true/.test( window.location.search ) || /phantomjs/i.test( window.navigator.userAgent ) ) {
		isBuild = true;
		QUnit.config.autostart = false;

		config = {
			paths: {
				Ractive: '../../tmp/Ractive-legacy',
				modules: '../modules',
				samples: '../samples',
				vendor: '../vendor'
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

	require( _modules.map( function ( test ) {
		return 'modules/' + test;
	}), function () {
		Array.prototype.slice.call( arguments ).forEach( function ( testSet ) {
			Ractive.defaults.magic = true;
			testSet();
		});

		if ( isBuild ) {
			QUnit.start();
		}
	});

}());