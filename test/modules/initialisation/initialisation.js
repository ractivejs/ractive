define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Foo,
			defaultTemplate = Ractive.defaults.template,
			defaultData = Ractive.defaults.data;

		module( 'Initialisation', {
			// make sure it gets put back, or will break other test modules!
			teardown: () => {
				Ractive.defaults.template = defaultTemplate;
				Ractive.defaults.data = defaultData;
			}
		} );

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

		});

		test( 'Instance data function called on initialize', function ( t ) {
			var ractive, data = { foo: 'bar' } ;

			ractive = new Ractive({
				data: function() { return data }
			});
			t.equal( ractive.data, data );

		});

		/* Not currently true. There are number of issues that need to resolved
		   before we could make this happen */
		/*
		test( 'Ractive instance data is used as data object', function ( t ) {
			var ractive, data = { foo: 'bar' } ;

			Ractive.defaults.data = { bar: 'bizz' };
			ractive = new Ractive({ data: data });

			t.equal( ractive.data, data );

			delete Ractive.defaults.data;
		});
		*/

		test( 'Default data function with no return uses existing data instance', function ( t ) {
			var ractive;

			Ractive.defaults.data = function(d) { d.bizz = 'bop' };

			ractive = new Ractive({ data: { foo: 'bar' } });

			t.ok( ractive.data.foo );
			t.ok( ractive.data.bizz );
		});

		test( 'Instance data function takes precendence over default data function', function ( t ) {
			var ractive;

			Ractive.defaults.data = function() { return { foo: 'fizz' } };

			ractive = new Ractive({ data: function() { return { bar: 'bizz' } } });

			t.ok( ractive.data.bar );
			t.equal( ractive.data.bar, 'bizz' );
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

		});

		test( 'Instantiated .extend() component with data function called on initialize', function ( t ) {
			var Component, ractive, data = { foo: 'bar' } ;

			Component = Ractive.extend({
				data: function(){ return data }
			});

			ractive = new Component();
			t.equal( ractive.data, data );
		});

		test( 'Extend data option includes Ractive defaults.data', function ( t ) {
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
			t.ok( ractive.data.defaultOnly, 'has Ractive.default data' );
			t.equal( fixture.innerHTML, 'component' )

		});

		test( 'Return from data function replaces data instance', function ( t ) {

			var Component, ractive;

			function Model ( data ) {
				if ( !( this instanceof Model ) ) { return new Model( data ) }
				this.foo = ( data ? data.foo : 'bar' ) || 'bar';
			};

			// This would be an odd thing to do, unless you
			// were returning a model instance...
			Component = Ractive.extend({
				data: Model
			});

			ractive = new Component( {
				el: fixture,
				template: '{{foo}}'
			});

			t.ok( ractive.data instanceof Model );
			t.equal( fixture.innerHTML, 'bar' )

			ractive = new Component( {
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'fizz' }
			});

			t.ok( ractive.data instanceof Model );
			t.equal( fixture.innerHTML, 'fizz' );

			ractive = new Component( {
				el: fixture,
				template: '{{foo}}{{bar}}',
				data: function( data ) {
					data = this._super( data );
					data.bar = 'bizz'
					return data;
				}
			});

			t.ok( ractive.data instanceof Model );
			t.equal( fixture.innerHTML, 'barbizz' );
		});

		test( 'Instantiated .extend() with data uses existing data instance', function ( t ) {
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

		});

		test( 'Template function has helper object', function ( t ) {
			var ractive, assert = t;

			fixture.innerHTML = '{{foo}}';

			Ractive.defaults.template = function ( d, t ) {
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


		});

		/* Not supported, do we need it?
		test( 'Instantiated component with template function plus instantiation template', function ( t ) {
			var Component, ractive;

			Component = Ractive.extend({
				template: function( d,p ){ return o.template + '{{fizz}}'; }
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
		*/

	};



});
