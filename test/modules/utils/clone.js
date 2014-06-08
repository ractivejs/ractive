define([ 'utils/clone' ], function ( clone ) {

	'use strict';

	return function () {

		module( 'clone');

		test( 'clone returns on new Primitive() objects', function ( t ) {
			var val;
			t.equal( val = new Date(), clone( val ) );
			t.equal( val = new Boolean(true), clone( val ) );
			t.equal( val = new Number(4), clone( val ) );
			t.equal( val = new String('wat?'), clone( val ) );
		});

	};

});
