define([
	'ractive',
	'config/options/groups/registries'
], function (
	Ractive,
	registries
) {

	'use strict';

	Ractive = Ractive.default || Ractive;
	registries = registries.default || registries;

	return function () {

		module( 'Registries Config' );

		test( 'has globally registered', function ( t ) {
			var ractive, foo = {};

			registries.forEach( r => {
				var target = r.useDefaults ? Ractive.defaults : Ractive;
				target[ r.name ].foo = foo;
			});

			ractive = new Ractive({});

			registries.forEach( r => {
				t.equal( ractive[ r.name ].foo, foo, r.name);
			});

			registries.forEach( r => {
				var target = r.useDefaults ? Ractive.defaults : Ractive;
				delete target[ r.name ] .foo;
			});
		});

	};



});
