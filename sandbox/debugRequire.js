(function ( win ) {

	'use strict';

	// this is just a quick hack to enable easier debugging through
	// shorter stack traces - all the Module.emit and Module.check
	// garbage fired by require.js gets lopped off by the setTimeout

	var actualRequire, fakeRequire;

	actualRequire = win._require = win.require;

	fakeRequire = function ( deps, callback ) {
		return actualRequire( deps, delay( callback ) );
	};

	Object.keys( actualRequire ).forEach( function ( key ) {
		fakeRequire[ key ] = actualRequire[ key ];
	});

	window.require = fakeRequire;

	function delay ( fn ) {
		return function () {
			var self = this, args = arguments;

			setTimeout( function () {
				fn.apply( self, args );
			}, 0 );
		};
	}

}( window ));
