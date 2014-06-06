define([
	'ractive',
	'config/options/groups/registries'
], function (
	Ractive,
	registries
) {

	'use strict';

	return function () {

		module( 'Registries Config' );

		test( 'has globally registered', function ( t ) {
			var ractive, foo = {};

			registries.forEach( r => {
				Ractive[ r.name ].foo = foo;
			});

			ractive = new Ractive({});

			registries.forEach( r => {
				t.equal( ractive[ r.name ].foo, foo, r.name);
			});

			registries.forEach( r => {
				delete Ractive[ r.name ] .foo;
			});
		});

	};



});
