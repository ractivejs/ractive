import { initModule } from '../../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'init/hooks/order.js' );

	const hooks = [
		'onconfig',
		'oninit',
		'onrender',
		'onunrender',
		'onteardown'
	];

	test( 'basic order', t => {
		const options = {
			el: fixture,
			template: 'foo'
		};

		function addHook ( hook ) {
			options[ hook ] = function () {
				fired.push( hook );
			};
		}

		hooks.forEach( hook => addHook( hook ) );

		let fired = [];

		let ractive = new Ractive( options );
		ractive.teardown();
		t.deepEqual( fired, hooks );

		addHook( 'onconstruct');
		fired = [];

		const Component = Ractive.extend( options );
		ractive = new Component();
		ractive.teardown();
		t.deepEqual( fired, [ 'onconstruct' ].concat( hooks ) );
	});

	test( 'hooks call _super', t => {
		const superOptions = {};
		let options = {};

		const fired = [];

		hooks.forEach( hook => {
			superOptions[ hook ] = function () {
				fired.push( 'super' + hook );
			};
		});

		const Component = Ractive.extend( superOptions );

		options = {
			el: fixture,
			template: 'foo'
		};

		hooks.forEach( hook => {
			options[ hook ] = function ( arg ) {
				this._super( arg );
				fired.push( 'instance' + hook );
			};
		});

		const ractive = new Component( options );
		ractive.teardown();

		hooks.forEach( hook => {
			t.equal( fired.shift(), 'super' + hook );
			t.equal( fired.shift(), 'instance' + hook );
		});
	});

	test( 'Component hooks called in consistent order (gh #589)', t => {
		const done = t.async();

		// construct and config temporarily commented out, see #1381
		const method = {
			init: [],
			render: [],
			complete: [],
			unrender: [],
			teardown: []
		};

		const event = {
			init: [],
			render: [],
			complete: [],
			unrender: [],
			teardown: []
		};

		const simpsons = [ 'Homer', 'Marge', 'Lisa', 'Bart', 'Maggie' ];

		const Simpson = Ractive.extend({
			template: '{{simpson}}',
			onconstruct () {
				this.on('init', () => {
					event.init.push( this.get( 'simpson' ) );
				});
				this.on('render', () => {
					event.render.push( this.get( 'simpson' ) );
				});
				this.on('complete', () => {
					event.complete.push( this.get( 'simpson' ) );
				});
				this.on('unrender', () => {
					event.unrender.push( this.get( 'simpson' ) );
				});
				this.on('teardown', () => {
					event.teardown.push( this.get( 'simpson' ) );
				});
			},
			oninit () {
				method.init.push( this.get( 'simpson' ) );
			},
			onrender () {
				method.render.push( this.get( 'simpson' ) );
			},
			oncomplete () {
				method.complete.push( this.get( 'simpson' ) );
			},
			onunrender () {
				method.unrender.push( this.get( 'simpson' ) );
			},
			onteardown () {
				method.teardown.push( this.get( 'simpson' ) );
			}
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{#simpsons}}<Simpson simpson="{{this}}"/>{{/}}',
			data: { simpsons },
			components: { Simpson }
		});

		t.equal( fixture.innerHTML, simpsons.join( '' ) );

		setTimeout( () => {

			ractive.teardown().then( () => {
				function testHooks( name, order ) {
					Object.keys( order ).forEach( hook => {
						if ( hook === 'complete' ) {
							t.equal( order.complete.length, simpsons.length );
						} else {
							t.deepEqual( order[ hook ], simpsons, `${hook} ${name} order` );
						}
					});
				}

				testHooks( 'method', method );
				testHooks( 'event', event );
				done();
			});
		});
	});

	function testHierarchy ( hook, expected ) {
		test( hook, t => {
			const done = t.async();

			const fired = [];

			function getOptions ( level ) {
				const options = {};
				options[ hook ] = function () {
					fired.push( level );
				};
				return options;
			}

			let options = getOptions( 'grandchild' );
			options.template = '{{foo}}';
			const GrandChild = Ractive.extend( options );

			options = getOptions( 'child' );
			options.template = '<GrandChild/>';
			options.components = { GrandChild };
			const Child = Ractive.extend( options );

			options = getOptions( 'parent' );
			options.el = fixture;
			options.template = '<Child/>';
			options.data = { foo: 'bar' };
			options.components = { Child };
			const ractive = new Ractive(options);

			const grandchild = ractive.findComponent( 'GrandChild' );
			grandchild.set( 'foo', 'fizz' );

			setTimeout( () => {
				ractive.teardown().then( () => {
					t.deepEqual( fired, expected );
					done();
				});
			});
		});
	}

	const topDown = [ 'parent', 'child', 'grandchild' ];
	const bottomUp = [ 'grandchild', 'child', 'parent' ];

	testHierarchy( 'onconstruct', [ 'child', 'grandchild' ] );
	testHierarchy( 'onconfig', topDown );
	testHierarchy( 'oninit', topDown );
	testHierarchy( 'onrender', topDown );
	//testHierarchy( 'onchange', bottomUp ); commented out temporarily, see #1381
	testHierarchy( 'oncomplete', bottomUp );
	testHierarchy( 'onunrender', bottomUp );
	testHierarchy( 'onteardown', bottomUp );

	test( 'destruct hook fires after everything is completely torn down, including element removal after transitions', t => {
		const done = t.async();

		let finish;
		let finished = false;
		const foo = function ( t ) {
			finish = t.complete;
		};
		const cmp = Ractive.extend({
			template: '<div foo-out />',
			onteardown () {
				t.ok( !finished );
				t.ok( this.find( '*' ) );
			},
			ondestruct () {
				t.ok( finished );
				t.ok( !fixture.querySelector( '*' ) );
			},
			isolated: false
		});

		const r = new Ractive({
			target: fixture,
			transitions: { foo },
			components: { cmp },
			template: '{{#if show}}<cmp />{{/if}}',
			data: { show: true }
		});

		r.on( 'cmp.teardown', function () {
			t.ok( !finished );
			t.ok( this.find( '*' ) );
		});

		r.on( 'cmp.destruct', () => {
			t.ok( finished );
			t.ok( !fixture.querySelector( '*' ) );
			done();
		});

		r.toggle( 'show' );
		finished = true;
		finish();
	});
}
