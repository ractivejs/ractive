define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, fired, firedSetup

		fixture = document.getElementById( 'qunit-fixture' );

		firedSetup = {
			setup: function () {
				fired = []
			},
			teardown: function () {
				fired = void 0;
			}
		};

		module( 'onConstruct', firedSetup );

		test( 'extend', t => {
			var View, ractive;

			View = Ractive.extend({
				onConstruct: function ( options ) {
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
						onConstruct: function ( options ) {
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

		module( 'onConfig', firedSetup );

		test( 'new', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				onConfig: function () {
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
				onConfig: function () {
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
						onConfig: function () {
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
				onConfig: function () {
					fired.push( this );
					this.data.foo++;
				}
			});

			ractive = new View({
				el: fixture,
				template: '{{foo}}',
				data: { foo: 1 },
				onConfig: function () {
					fired.push( this );
					this.data = { foo: 12 };
					this._super();
				}
			});

			t.deepEqual( fired, [ ractive, ractive ] );
			t.equal( fixture.innerHTML, '13' );
		});

		module( 'init', firedSetup );

		test( 'hooks', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: { foo: 1 },
				// onConstruct: function ( options ) {
				// 	fired.push('onConstruct')
				// },
				onConfig: function () {
					fired.push('onConfig')
				},
				onInit: function () {
					fired.push('onInit')
				},
				onInited: function () {
					fired.push('onInited')
				},
				onRender: function () {
					fired.push('onRender')
				},
				onRendered: function () {
					fired.push('onRendered')
				},
				onUnrender: function () {
					fired.push('onUnrender')
				},
				onUnrendered: function () {
					fired.push('onUnrendered')
				},
				onTeardown: function () {
					fired.push('onTeardown')
				}
			});

			ractive.teardown();

			t.deepEqual( fired, [
				// 'onConstruct',
				'onConfig',
				'onInit',
				'onInited',
				'onRender',
				'onRendered',
				'onUnrender',
				'onUnrendered',
				'onTeardown'
			] );
		});

	}

});
