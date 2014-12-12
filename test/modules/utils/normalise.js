define([ 'shared/keypaths' ], function ( keypaths ) {

	'use strict';

	var normalise = keypaths.normalise;

	return function () {

		module( 'normalise.js');

		test( 'Regular keypath', function ( t ) {
			t.equal( normalise( 'foo.bar' ), 'foo.bar' );
		});

		test( 'Keypath with array notation', function ( t ) {
			t.equal( normalise( 'foo[1]' ), 'foo.1' );
		});
	};

});
