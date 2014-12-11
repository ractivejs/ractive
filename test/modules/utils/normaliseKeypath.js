define([ 'utils/normaliseKeypath' ], function ( normaliseKeypath ) {

	'use strict';

	normaliseKeypath = normaliseKeypath.default || normaliseKeypath;

	return function () {

		module( 'normaliseKeypath.js');

		test( 'Regular keypath', function ( t ) {
			t.equal( normaliseKeypath( 'foo.bar' ), 'foo.bar' );
		});

		test( 'Keypath with array notation', function ( t ) {
			t.equal( normaliseKeypath( 'foo[1]' ), 'foo.1' );
		});

		test( 'Keypath with leading dot', function ( t ) {
			t.equal( normaliseKeypath( '.foo' ), 'foo' );
		});
	};

});
