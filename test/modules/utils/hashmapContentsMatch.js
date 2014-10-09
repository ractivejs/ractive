define([ 'utils/hashmapContentsMatch' ], function ( match ) {

	'use strict';

	return function () {

		module( 'Hashmap Contents Match');

		test( 'Ref equality and undefined matches', function ( t ) {
			var item = {}, undefinedObject;

			t.ok( match( item, item ) );
			t.ok( !match( item, undefinedObject ) );
			t.ok( !match( undefinedObject, item ) );
			t.ok( !match( undefinedObject, undefinedObject ) );
		});

		test( 'Keylength matches', function ( t ) {
			var item1 = { one: 'one' },
				item2 = { one: 'one', two: 'two' },
				item3 = item1;

			t.ok( !match( item1, item2 ) );
			t.ok( match( item1, item3 ) );
		});

		test( 'Primitive matches', function ( t ) {
			var item1 = { one: 'one' },
				item2 = { one: 'uno' },
				item3 = { one: 'one' };

			t.ok( !match( item1, item2 ), 'value different' );
			t.ok( match( item1, item3 ), 'value same' );
		});

		test( 'Object ref matches', function ( t ) {
			var obj1 = {}, obj2 = {},
				item1 = { one: obj1 },
				item2 = { one: obj2 },
				item3 = { one: obj1 };

			t.ok( !match( item1, item2 ), 'value different' );
			t.ok( match( item1, item3 ), 'value same' );
		});

		test( 'Key matches', function ( t ) {
			var obj1 = {}, obj2 = {}, obj3 = {},
				item1 = { one: obj1, two: obj2 },
				item2 = { one: obj1, three: obj2 },
				item3 = { one: obj1, two: obj3 },
				item4 = { one: obj1, two: obj2 };

			t.ok( !match( item1, item2 ), 'objects different' );
			t.ok( !match( item1, item3 ), 'objects different' );
			t.ok( !match( item2, item3 ), 'objects different' );
			t.ok( match( item1, item4 ), 'objects same' );
		});
	};

});
