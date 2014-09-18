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
			'onpreinit',
			'oninit',
			'onprerender',
			'onrender',
			'onpreunrender',
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

	}

});
