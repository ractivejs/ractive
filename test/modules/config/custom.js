define([
	'ractive',
	'config/options/groups/registries'
], function (
	Ractive,
	registries
) {

	'use strict';

	return function () {

		module( 'Debug', {
			teardown: () => { Ractive.debug = false; }
		});

		test( 'can be set on Ractive', function ( t ) {
			var ractive, old = Ractive.debug;

			Ractive.debug = true;

			ractive = new Ractive();

			t.ok( ractive.debug );

			Ractive.debug = old;

		});

		test( 'can be set on Component', function ( t ) {
			var Component, ractive;

			Component = Ractive.extend();
			Component.debug = true;
			ractive = new Component();

			t.ok( ractive.debug );

		});

		test( 'can be set on Ractive after extend', function ( t ) {
			var Component, ractive, old = Ractive.defaults.debug;

			Component = Ractive.extend();
			Ractive.debug = true;
			ractive = new Component();

			t.ok( ractive.debug );

			Ractive.debug = old;

		});

		test( 'can be set on Ractive,defaults after extend', function ( t ) {
			var Component, ractive, old = Ractive.defaults.debug;

			Component = Ractive.extend();
			Ractive.defaults.debug = true;
			ractive = new Component();

			t.ok( ractive.debug );

			Ractive.defaults.debug = old;

		});

	};



});
