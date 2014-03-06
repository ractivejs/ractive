(function () {

	'use strict';

	var isBuild, config, i, prefixedModules = [];

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

	// can't use .map() because of IE...
	i = _modules.length;
	while ( i-- ) {
		prefixedModules[i] = 'modules/' + _modules[i];
	}

	require( [ 'Ractive' ].concat( prefixedModules ), function ( Ractive ) {
		window.Ractive = Ractive;

		Ractive.defaults.magic = /magic=true/.test( window.location.search );

		Array.prototype.slice.call( arguments, 1 ).forEach( function ( testSet ) {
			testSet();
		});

		if ( isBuild ) {
			QUnit.start();
		}
	});

}());
