define([ 'utils/parseJSON' ], function ( parseJSON ) {

	'use strict';

	return function () {

		module( 'parseJSON' );

		test( 'Unquoted string', function ( t ) {
			var parsed = parseJSON( 'foo' );
			t.ok( !parsed );
		});

		test( 'Single-quoted string', function ( t ) {
			var parsed = parseJSON( "'foo'" );
			t.equal( parsed.value, 'foo' );
		});

		test( 'Double-quoted string', function ( t ) {
			var parsed = parseJSON( '"foo"' );
			t.equal( parsed.value, 'foo' );
		});

		test( 'Number', function ( t ) {
			var parsed = parseJSON( '42' );
			t.equal( parsed.value, 42 );
		});

		test( 'Array', function ( t ) {
			var parsed = parseJSON( '["a","b"]' );
			t.deepEqual( parsed.value, ['a','b'] );
		});

		test( 'Interpolated value', function ( t ) {
			var parsed = parseJSON( '${answer}', { answer: 42 } );
			t.equal( parsed.value, 42);
		});

		test( 'Array of interpolated values', function ( t ) {
			var parsed = parseJSON( '[${a},${b},${c}]', { a: 1, b: 2, c: 3 } );
			t.deepEqual( parsed.value, [1,2,3]);
		});

		test( 'Array of interpolated values with funky whitespace', function ( t ) {
			var parsed = parseJSON( '[  ${a} , ${b} , ${c}  ]', { a: 1, b: 2, c: 3 } );
			t.deepEqual( parsed.value, [1,2,3]);
		});

	};

});
