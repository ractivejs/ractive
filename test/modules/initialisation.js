define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Foo;

		module( 'Initialisation' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'Ractive initialize with no options ok', function ( t ) {
			var ractive = new Ractive();
			t.ok( ractive );
		});

		test( 'Ractive default data function called on initialize', function ( t ) {
			var ractive, data = { foo: 'bar' } ;
			
			Ractive.defaults.data = function() { return data };
			ractive = new Ractive();
			t.equal( ractive.data, data );

			delete Ractive.defaults.data;

		});

		test( 'Instance data function called on initialize', function ( t ) {
			var ractive, data = { foo: 'bar' } ;
			
			ractive = new Ractive({
				data: function() { return data }
			});
			t.equal( ractive.data, data );

		});

		test( 'Ractive instance data is used as data object', function ( t ) {
			var ractive, data = { foo: 'bar' } ;
			
			Ractive.defaults.data = { bar: 'bizz' };
			ractive = new Ractive({ data: data });

			//This is how it currently works.
			t.notEqual( ractive.data, data );

			delete Ractive.defaults.data;
		});
		
		test( 'Default data function with no return uses existing data instance', function ( t ) {
			var ractive;

			Ractive.defaults.data = function(d) { d.bizz = 'bop' };
			
			ractive = new Ractive({ data: { foo: 'bar' } });
			
			t.ok( ractive.data.foo );
			t.ok( ractive.data.bizz );
			
			delete Ractive.defaults.data;
		});

		test( 'Instance data function takes precendence over default data function', function ( t ) {
			var ractive;

			Ractive.defaults.data = function() { return { foo: 'fizz' } };
			
			ractive = new Ractive({ data: function() { return { bar: 'bizz' } } });
			
			t.ok( ractive.data.bar );
			t.equal( ractive.data.bar, 'bizz' );
			
			delete Ractive.defaults.data;
		});

		test( 'Instance data takes precedence over default data but includes unique properties', function ( t ) {
			var ractive, data = { foo: 'bar' } ;
			
			Ractive.defaults.data = { 
				unique: function() { return; },
				format: function() { return 'not me'; } 
			};
			ractive = new Ractive( { data: { 
				foo: 'bar',
				format: function() {return 'foo' }
			}});

			t.ok( ractive.data.foo, 'has instance data' );
			t.ok( ractive.data.format, 'has default data' );
			t.ok( ractive.data.unique, 'has default data' );
			t.equal( ractive.data.format(), 'foo' );

			delete Ractive.defaults.data;

		});

		test( 'Instantiated .extend() component with data function called on initialize', function ( t ) {
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

		test( 'Inheritance hierarchy has precedence', function ( t ) {
			var Component, ractive;

			Ractive.defaults.data = function(){ return { foo: 'fizz' } };

			Component = Ractive.extend({
				data: { bar: 'bizz' }
			});

			ractive = new Component( { 
				el: fixture,
				template: '{{foo}}{{bar}}'
			});
			t.equal( fixture.innerHTML, 'bizz' )

			ractive = new Component( { 
				el: fixture,
				template: '{{foo}}{{bar}}',
				data: { foo: 'flip' }
			});
			t.equal( fixture.innerHTML, 'flipbizz' )

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

		test( 'Template with hash is retrieved from element Id', function ( t ) {
			var ractive;

			fixture.innerHTML = '{{foo}}';

			ractive = new Ractive({ 
				el: fixture,
				template: '#qunit-fixture',
				data: { foo: 'bar' }  
			});

			t.equal( fixture.innerHTML, 'bar' );
		});

		test( 'Template with non-existant element Id throws', function ( t ) {
			var ractive;

			throws(function(){
				new Ractive({ 
					el: fixture,
					template: '#nonexistant'
				});
			})
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

		test( 'Template function has helper object', function ( t ) {
			var ractive, assert = t;

			fixture.innerHTML = '{{foo}}';
			
			Ractive.defaults.template = function ( d, o, t ) {
				var template = t.fromId( 'qunit-fixture' );
				template += '{{bar}}';
				assert.ok( !t.isParsed(template) );
				template = t.parse( template );
				assert.ok( t.isParsed( template ) );
				return template;
			}

			ractive = new Ractive( { 
				el: fixture,
				data: { foo: 'fizz', bar: 'bizz' }
			});

			t.equal( fixture.innerHTML, 'fizzbizz' );

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
				template: function(d,o){ return o.template + '{{fizz}}'; }
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
				template: function(d,o){ o.template += '{{fizz}}'; }
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

		test( 'Append true option inserts in correct location', function ( t ) {
			var ractive, 
				target = document.createElement('div'), 
				child = document.createElement('div');

			child.innerHTML = 'foo';
			target.id = 'target';
			target.appendChild( child );
			fixture.appendChild( target );

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );

			ractive = new Ractive({
				el: target,
				template: '<div>bar</div>',
				append: true
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div><div>bar</div></div>' );
		});

		test( 'Append false option inserts in correct location', function ( t ) {
			var ractive, 
				target = document.createElement('div'), 
				child = document.createElement('div');

			child.innerHTML = 'bar';
			target.id = 'target';
			target.appendChild( child );
			fixture.appendChild( target );

			t.equal( fixture.innerHTML, '<div id="target"><div>bar</div></div>' );

			ractive = new Ractive({
				el: target,
				template: '<div>bar</div>',
				append: false
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>bar</div></div>' );
		});


		test( 'Insert element at { target, anchor } option inserts in correct location', function ( t ) {
			var ractive, 
				target = document.createElement('div'), 
				anchor = document.createElement('div');

			anchor.innerHTML = 'bar';
			target.appendChild( anchor );
			fixture.appendChild( target );

			t.equal( fixture.innerHTML, '<div><div>bar</div></div>' );

			ractive = new Ractive({
				el: { target: target, anchor: anchor },
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div><div>foo</div><div>bar</div></div>' );

			
		});


	};



});
