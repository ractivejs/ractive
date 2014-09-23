define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, fired, firedSetup, hooks

		fixture = document.getElementById( 'qunit-fixture' );

		firedSetup = {
			setup: function () {
				fired = []
			},
			teardown: function () {
				fired = void 0;
			}
		};

		module( 'onconstruct', firedSetup );

		test( 'new', t => {
			var View, ractive;

			ractive = new Ractive({
				el: fixture,
				onconstruct: function ( options ) {
					fired.push( this );
					options.template = '{{foo}}';
					options.data = { foo: 'bar' };
				}
			});

			t.deepEqual( fired, [ ractive ] );
			equal( fixture.innerHTML, 'bar' );
		});

		test( 'extend', t => {
			var View, ractive;

			View = Ractive.extend({
				onconstruct: function ( options ) {
					fired.push( this );
					options.template = '{{foo}}';
					options.data = { foo: 'bar' };
				}
			});

			ractive = new View({
				el: fixture
			});

			t.deepEqual( fired, [ ractive ] );
			equal( fixture.innerHTML, 'bar' );
		});

		test( 'with component', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				components: {
					widget: Ractive.extend({
						onconstruct: function ( options ) {
							fired.push( this );
							options.template = '{{foo}}';
							options.data = { foo: 'bar' };
						}
					})
				}
			});

			t.deepEqual( fired, [ ractive.findComponent('widget') ] );
			equal( fixture.innerHTML, 'bar' );
		});

		test( '_super', t => {
			var View, ractive;

			View = Ractive.extend({
				onconstruct: function ( options ) {
					fired.push( this );
					options.template = '{{foo}}';
					options.data = { foo: 'bar' };
				}
			});

			ractive = new View({
				el: fixture,
				onconstruct: function ( options ) {
					fired.push( this );
					this._super( options );
					options.data = { foo: 12 };
				}
			});

			t.deepEqual( fired, [ ractive, ractive ] );
			t.equal( fixture.innerHTML, '12' );
		});

		module( 'onconfig', firedSetup );

		test( 'new', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				onconfig: function () {
					fired.push( this );
					this.data.foo++;
				},
				template: '{{foo}}',
				data: function () { return { foo: 1 } }
			});

			t.deepEqual( fired, [ ractive ] );
			equal( fixture.innerHTML, '2' );
		});

		test( 'extend', t => {
			var View, ractive;

			View = Ractive.extend({
				onconfig: function () {
					fired.push( this );
					this.data.foo++;
				},
			});

			ractive = new View({
				el: fixture,
				template: '{{foo}}',
				data: function () { return { foo: 1 } }
			});

			t.deepEqual( fired, [ ractive ] );
			equal( fixture.innerHTML, '2' );
		});

		test( 'with component', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{foo}}"/>',
				data: function () { return { foo: 1 } },
				components: {
					widget: Ractive.extend({
						template: '{{foo}}',
						onconfig: function () {
							fired.push( this );
							this.data.foo++;
						},
					})
				}
			});

			t.deepEqual( fired, [ ractive.findComponent('widget') ] );
			equal( fixture.innerHTML, '2' );
		});

		test( '_super', t => {
			var View, ractive;

			View = Ractive.extend({
				onconfig: function () {
					fired.push( this );
					this.data.foo++;
				}
			});

			ractive = new View({
				el: fixture,
				template: '{{foo}}',
				data: { foo: 1 },
				onconfig: function () {
					fired.push( this );
					this.data = { foo: 12 };
					this._super();
				}
			});

			t.deepEqual( fired, [ ractive, ractive ] );
			t.equal( fixture.innerHTML, '13' );
		});

		module( 'hooks', firedSetup );

		hooks = [
			'onconstruct',
			'onconfig',
			'oninit',
			'onrender',
			'onunrender',
			'onteardown'
		];

		test( 'basic order', t => {
			var ractive, options, Component;

			options = {
				el: fixture,
				template: 'foo'
			};

			hooks.forEach( hook => {
				options[ hook ] = function () {
					fired.push( hook );
				}
			});

			ractive = new Ractive( options );
			ractive.teardown();
			t.deepEqual( fired, hooks );

			fired = [];

			Component = Ractive.extend( options );
			ractive = new Component()
			ractive.teardown();
			t.deepEqual( fired, hooks );

		});

		test( 'hooks call _super', t => {
			var ractive, Component, superOptions = {}, options = {};

			hooks.forEach( hook => {
				superOptions[ hook ] = function () {
					fired.push( 'super' + hook );
				}
			});

			Component = Ractive.extend(superOptions)

			options = {
				el: fixture,
				template: 'foo'
			};

			hooks.forEach( hook => {
				options[ hook ] = function( arg ){
					this._super( arg );
					fired.push( 'instance' + hook );
				}
			});

			ractive = new Component( options );
			ractive.teardown();

			hooks.forEach( hook => {
				t.equal( fired.shift(), 'super' + hook );
				t.equal( fired.shift(), 'instance' + hook );
			});


		});

		asyncTest( 'Component hooks called in consistent order (gh #589)', t => {
			var Simpson, ractive,
				method = {
					construct: [], config: [], init: [],
					render: [], complete: [],
					unrender: [], teardown: []
				},
				event = {
					config: [], init: [],
					render: [], complete: [],
					unrender: [], teardown: []
				},
				simpsons = ["Homer", "Marge", "Lisa", "Bart", "Maggie"];

			Simpson = Ractive.extend({
				template: "{{simpson}}",
				onconstruct: function ( o ) {
					method.construct.push( o.data.simpson );

					this.on('config', () => {
						event.config.push( this.data.simpson );
					})
					this.on('init', () => {
						event.init.push( this.get( "simpson" ) );
					})
					this.on('render', () => {
						event.render.push( this.get( "simpson" ) );
					})
					this.on('complete', () => {
						event.complete.push( this.get( "simpson" ) );
					})
					this.on('unrender', () => {
						event.unrender.push( this.get( "simpson" ) );
					})
					this.on('teardown', () => {
						event.teardown.push( this.get( "simpson" ) );
					})
				},
				onconfig: function () {
					method.config.push( this.data.simpson );
				},
				oninit: function () {
					method.init.push( this.get( "simpson" ) );
				},
				onrender: function () {
					method.render.push( this.get( "simpson" ) );
				},
				oncomplete: function () {
					method.complete.push( this.get( "simpson" ) );
				},
				onunrender: function () {
					method.unrender.push( this.get( "simpson" ) );
				},
				onteardown: function () {
					method.teardown.push( this.get( "simpson" ) );
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#simpsons}}<simpson simpson="{{this}}"/>{{/}}',
				data: {
					simpsons: simpsons
				},
				components: {
					simpson: Simpson
				}
			});

			t.equal( fixture.innerHTML, simpsons.join('') );

			ractive.teardown().then( () => {
				function testHooks( name, order ) {
					Object.keys( order ).forEach( function ( hook ) {
						if( hook === 'complete' ){
							t.equal( order.complete.length, simpsons.length );
						} else {
							t.deepEqual( order[ hook ], simpsons, hook + ' ' + name + ' order' );
						}
					});
				}
				testHooks( 'method', method );
				testHooks( 'event', event );
				start();
			})
		});
	}

});
