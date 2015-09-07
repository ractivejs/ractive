import { test } from 'qunit';
import { onWarn, onLog } from 'test-config';
import hasUsableConsole from 'hasUsableConsole';
import cleanup from 'helpers/cleanup';

let fired;

const firedSetup = {
	beforeEach () {
		fired = [];
	},
	afterEach () {
		fired = void 0;
		cleanup();
	}
};

const hooks = [
	'onconfig',
	'oninit',
	'onrender',
	'onunrender',
	'onteardown'
];

module( 'hooks', firedSetup );

test( 'basic order', t => {
	let options = {
		el: fixture,
		template: 'foo'
	};

	function addHook ( hook ) {
		options[ hook ] = function () {
			fired.push( hook );
		};
	}

	hooks.forEach( hook => addHook( hook ) );

	let ractive = new Ractive( options );
	ractive.teardown();
	t.deepEqual( fired, hooks );

	fired = [];
	addHook( 'onconstruct');

	const Component = Ractive.extend( options );
	ractive = new Component();
	ractive.teardown();
	t.deepEqual( fired, [ 'onconstruct' ].concat( hooks ) );
});

test( 'hooks call _super', t => {
	let superOptions = {};
	let options = {};

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


module( 'hierarchy order', firedSetup );

function testHierarchy ( hook, expected ) {
	test( hook, t => {
		const done = t.async();

		function getOptions ( level ) {
			let options = {};
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

		ractive.teardown().then( () => {
			t.deepEqual( fired, expected );
			done();
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

module( 'detach and insert', firedSetup);

test( 'fired', t => {
	const ractive = new Ractive({
		el: fixture,
		template: 'foo',
		oninsert () {
			fired.push( 'oninsert' );
		},
		ondetach () {
			fired.push( 'ondetach' );
		}
	});

	ractive.detach();
	ractive.insert( fixture );

	t.deepEqual( fired, [ 'ondetach', 'oninsert' ] );
});

test( 'late-comer components on render still fire init', t => {
	const Widget = Ractive.extend({
		template: '{{~/init}}',
		oninit () {
			this.set( 'init', 'yes' );
		}
	});

	const Widget2 = Ractive.extend({
		template: '',
		oninit () {
			this.set( 'show', true );
		}
	});

	new Ractive( {
		el: fixture,
		template: '{{#show}}<Widget/>{{/}}<Widget2 show="{{show}}"/>',
		components: { Widget, Widget2 }
	});

	t.equal( fixture.innerHTML, 'yes' );
});

test( 'render hooks are not fired until after DOM updates (#1367)', t => {
	t.expect( 0 );

	const ractive = new Ractive({
		el: fixture,
		template: '<one/>',
		components: {
			one: Ractive.extend({
				template: `
					{{#if bool}}
						<p></p>
					{{/if}}

					{{#if bool}}
						<two/>
					{{/if}}`
			}),
			two: Ractive.extend({
				onrender () {
					this.parent.find( 'whatever' );
				}
			})
		}
	});

	// If the `<one>` component is not rendered, the `<two>` component's
	// render handler will cause an error
	ractive.set( 'bool', true );
});

test( 'correct behaviour of deprecated beforeInit hook (#1395)', t => {
	t.expect( 6 );

	let count;
	const reset = () => count = { construct: 0, beforeInit: 0 };
	reset();

	// specifying both options is an error
	t.throws( function () {
		new Ractive({
			onconstruct: () => count.construct += 1,
			beforeInit: () => count.beforeInit += 1
		});
	}, /cannot specify both options/ );

	// hooks-without-extend were introduced at the same time as beforeInit was
	// deprecated, so this should not fire
	onWarn( msg => t.ok( /deprecated/.test( msg ) ) );

	reset();
	new Ractive({
		beforeInit: () => count.beforeInit += 1
	});
	t.deepEqual( count, { construct: 0, beforeInit: 0 });

	let Subclass;

	t.throws( function () {
		Subclass = Ractive.extend({
			onconstruct: () => count.construct += 1,
			beforeInit: () => count.beforeInit += 1
		});
		new Subclass();
	}, /cannot specify both options/ );

	reset();
	Subclass = Ractive.extend({
		beforeInit: () => count.beforeInit += 1
	});
	new Subclass();
	t.deepEqual( count, { construct: 0, beforeInit: 1 });
});

if ( hasUsableConsole ) {
	test( 'error in oncomplete sent to console', t => {
		t.expect( 2 );

		const done = t.async();

		onWarn( msg => {
			if ( /DEBUG_PROMISES/.test( msg ) ) {
				return;
			}

			t.ok( /error happened during rendering/.test( msg ) );
		});

		onLog( stack => {
			if ( /debug mode/.test( stack ) ) {
				return;
			}

			t.ok( /evil handler/.test( stack ) || /oncomplete@/.test( stack ) ); // Firefox & Safari don't include the error message in the stack for some reason
			done();
		});

		new Ractive({
			el: fixture,
			template: 'foo',
			oncomplete () {
				throw new Error( 'evil handler' );
			}
		});
	});
}
