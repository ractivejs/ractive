define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, fired, firedSetup, hooks

		fixture = document.getElementById( 'qunit-fixture' );

		firedSetup = {
			setup: function () {
				fired = [];
			},
			teardown: function () {
				fired = void 0;
			}
		};

		module( 'onconstruct', firedSetup );

		test( 'has access to options', t => {
			var ractive

			ractive = new Ractive({
				el: fixture,
				onconstruct: function ( options ){
					options.template = '{{foo}}';
					options.data = { foo: 'bar' };
				}
			});

			t.equal( fixture.innerHTML, 'bar' );

		});

		hooks = [
			'onconstruct',
			'onconfig',
			'oninit',
			'onrender',
			'onunrender',
			'onteardown'
		];

		module( 'hooks', firedSetup );

		test( 'basic order', t => {
			var ractive, options, Component;

			options = {
				el: fixture,
				template: 'foo'
			};

			hooks.forEach( hook => {
				options[ hook ] = function () {
					fired.push( hook );
				};
			});

			ractive = new Ractive( options );
			ractive.teardown();
			t.deepEqual( fired, hooks );

			fired = [];

			Component = Ractive.extend( options );
			ractive = new Component();
			ractive.teardown();
			t.deepEqual( fired, hooks );

		});

		test( 'hooks call _super', t => {
			var ractive, Component, superOptions = {}, options = {};

			hooks.forEach( hook => {
				superOptions[ hook ] = function () {
					fired.push( 'super' + hook );
				};
			});

			Component = Ractive.extend( superOptions );

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


		module( 'hierarchy order', firedSetup);

		function testHierarchy ( hook, expected ) {

			asyncTest( hook, t => {

				var ractive, options, Child, GrandChild, grandchild;

				function getOptions ( level ) {
					var options = {};
					options[ hook ] = function () {
						fired.push( level );
					};
					return options;
				}

				options = getOptions( 'grandchild' );
				options.template = '{{foo}}';
				GrandChild = Ractive.extend( options );


				options = getOptions( 'child' );
				options.template = '<grand-child/>';
				options.components = {
					'grand-child': GrandChild
				};
				Child = Ractive.extend( options );

				options = getOptions( 'parent' );
				options.el = fixture;
				options.template = '<child/>';
				options.data = { foo: 'bar' };
				options.components = {
					child: Child
				};
				ractive = new Ractive(options);

				grandchild = ractive.findComponent( 'grand-child' );
				grandchild.set( 'foo', 'fizz' );

				ractive.teardown().then( () => {
					t.deepEqual( fired, expected );
					start()
				});
			})
		}

		var topDown = [ 'parent', 'child', 'grandchild' ];
		var bottomUp = [ 'grandchild', 'child', 'parent' ];

		testHierarchy( 'onconstruct', topDown );
		testHierarchy( 'onconfig', topDown );
		testHierarchy( 'oninit', topDown );
		testHierarchy( 'onrender', topDown );
		testHierarchy( 'onchange', bottomUp );
		testHierarchy( 'oncomplete', bottomUp );
		testHierarchy( 'onunrender', bottomUp );
		testHierarchy( 'onteardown', bottomUp );

		module( 'detach and insert', firedSetup);

		test( 'fired', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: 'foo',
				oninsert: function () {
					fired.push( 'oninsert' );
				},
				ondetach: function () {
					fired.push( 'ondetach' );
				}
			});

			ractive.detach();
			ractive.insert( fixture );

			t.deepEqual( fired, [ 'ondetach', 'oninsert' ] );

		})

		test( 'late-comer components on render still fire init', t => {
			var ractive, Widget, Widget2;

			Widget = Ractive.extend({
				template: '{{~/init}}',
				oninit: function(){
					this.set('init', 'yes')
				}
			})

			Widget2 = Ractive.extend({
				template: '',
				oninit: function(){
					this.set('show', true)
				}
			})

			ractive = new Ractive( {
				el: fixture,
				template: '{{#show}}<widget/>{{/}}<widget-two show="{{show}}"/>',
				components: {
					widget: Widget,
					'widget-two': Widget2
				}
			});

			t.equal( fixture.innerHTML, 'yes' );

		});

		// Hold off on these until demand for them.
		// also an issue is that reserve event checking
		// currently happens at parse time, so that
		// would need to change or something setup for it
		// so maybe just YAGNI and we hold off on these.
		/*
		module( 'hooks option', firedSetup);

		asyncTest( '"methodOnly" prevents events', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: 'foo',
				hooks: 'methodOnly',
				oninit: function () {
					this.on( 'teardown', function () {
						throw new Error( 'event hook should not fire' );
					});
				}
			});

			ractive.teardown().then(function(){
				t.ok( true );
				start();
			});

		})

		test( '"eventOnly" prevents methods', t => {
			var ractive;

			expect( 1 );

			ractive = new Ractive({
				el: fixture,
				template: 'foo',
				hooks: 'eventOnly',
				oninit: function () {
					throw new Error( 'method hook should not fire' );
				}
			});

			ractive.on( 'teardown', function(){
				t.ok( true );
			})

			ractive.teardown()

		})
		*/
	}

});
