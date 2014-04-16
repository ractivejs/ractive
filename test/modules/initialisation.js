define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Foo;

		module( 'Initialisation' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'Ractive initialize with no options ok', function ( t ) {
			var ractive, data = { foo: 'bar' } ;
			
			ractive = new Ractive();
			t.ok( ractive );
		});

		test( 'Ractive default data function called on initialize', function ( t ) {
			var ractive, data = { foo: 'bar' } ;
			
			Ractive.defaults.data = function() { return data };
			ractive = new Ractive();
			t.equal( ractive.data, data );

			delete Ractive.defaults.data;

		});

		test( 'Ractive default data copied to instance called on initialize', function ( t ) {
			var ractive, data = { foo: 'bar' } ;
			
			Ractive.defaults.data = { format: function() { return; } };
			ractive = new Ractive( { data: data } );

			t.ok( ractive.data.foo, 'has instance data' );
			t.ok( ractive.data.format, 'has default data' );

			delete Ractive.defaults.data;

		});

		test( 'Instantiated .extend() with data function called on initialize', function ( t ) {
			var Component, ractive, data = { foo: 'bar' } ;
			
			Component = Ractive.extend({
				data: function(){ return data }
			});
			
			ractive = new Component();
			t.equal( ractive.data, data );
		});

		test( 'Extend data option replace Ractive defaults.data', function ( t ) {
			var Component, ractive;

			Ractive.defaults.data = { 
				format: function() { return 'default' ; },
				defaultOnly: {}
			};

			Component = Ractive.extend({
				data: {
					format: function(){ return 'component'; },
					componentOnly: {}
				}
			});

			ractive = new Component( { 
				el: fixture,
				template: '{{format()}}',
				data: { foo: 'bar' } 
			});

			t.ok( ractive.data.foo, 'has instance data' );
			t.ok( ractive.data.componentOnly, 'has Component data' );
			t.ok( !ractive.data.defaultOnly, 'does not have .default data' );
			t.equal( fixture.innerHTML, 'component' )

			delete Ractive.defaults.data;

		});

		test( 'Instantiated .extend() with data function with no return uses existing data instance', function ( t ) {
			var Component, ractive, data = { foo: 'bar' } ;
			
			Component = Ractive.extend({
				data: function(d){ d.bizz = 'bop' }
			});
			
			ractive = new Component({ data: data });
			t.equal( ractive.data, data );
			t.ok( ractive.data.bizz );
		});

		test( 'Top-level Component data function with no return uses existing data instance', function ( t ) {
			var Component, ractive, data = { foo: 'bar' } ;
			
			Component = Ractive.extend({
				data: function(d) { d.bizz = 'bop' }
			});
			
			ractive = new Component({ data: data });
			t.equal( ractive.data, data );
			t.ok( ractive.data.bizz );
		});

		test( 'Ractive default template used on initialize', function ( t ) {
			var ractive;
			
			Ractive.defaults.template = '{{foo}}';
			
			ractive = new Ractive({
				el: fixture,
				data: { foo: 'bar' }
			});

			t.equal( fixture.innerHTML, 'bar' );

			delete Ractive.defaults.template;

		});

		test( 'Ractive default template function called on initialize', function ( t ) {
			var ractive;
			
			Ractive.defaults.template = function() { 
				return '{{foo}}'; 
			};

			ractive = new Ractive( { 
				el: fixture,
				data: { foo: 'bar' } 
			});

			t.equal( fixture.innerHTML, 'bar' );

			delete Ractive.defaults.template;

		});

		test( 'Instantiated .extend() with template function called on initialize', function ( t ) {
			var Component, ractive;
			
			Component = Ractive.extend({
				template: function(){ return '{{foo}}'; }
			});
			
			ractive = new Component({ 
				el: fixture,
				data: { foo: 'bar' } 
			});

			t.equal( fixture.innerHTML, 'bar' );
		});

		test( 'Extend template replaces Ractive defaults.template', function ( t ) {
			var Component, ractive;

			Ractive.defaults.template = function() { return '{{fizz}}'; };

			Component = Ractive.extend({
				template: function(){ return '{{foo}}'; }
			});

			ractive = new Component( { 
				el: fixture,
				data: { foo: 'bar', fizz: 'bizz' } 
			});

			t.equal( fixture.innerHTML, 'bar' )

			delete Ractive.defaults.template;

		});

		test( 'Instantiated component with template function plus instantiation template', function ( t ) {
			var Component, ractive;
			
			Component = Ractive.extend({
				template: function(t){ return t + '{{fizz}}'; }
			});
			
			ractive = new Component({ 
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'bar', fizz: 'bizz' }  
			});

			t.equal( fixture.innerHTML, 'barbizz' );
		});

		test( 'Instantiated component with no-return template function with instantiation options', function ( t ) {
			var Component, ractive;
			
			Component = Ractive.extend({
				template: function(t, options){ options.template += '{{fizz}}'; }
			});
			
			ractive = new Component({ 
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'bar', fizz: 'bizz' }  
			});

			t.equal( fixture.innerHTML, 'barbizz' );
		});


		test( 'Instantiated component with data-based template selection function', function ( t ) {
			var Component, ractive;
			
			Component = Ractive.extend({
				template: function(t, options){ 
					if(options.data.fizz) { return '{{fizz}}'; }
				}
			});
			
			ractive = new Component({ 
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'bar', fizz: 'bizz' }  
			});

			t.equal( fixture.innerHTML, 'bizz' );

			ractive = new Component({ 
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'bar' }  
			});

			t.equal( fixture.innerHTML, 'bar' );

		});

	};



});
