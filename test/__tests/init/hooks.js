var fired, firedSetup, hooks

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
	var View, ractive;

	View = Ractive.extend({
		onconstruct: function ( options ){
			options.template = '{{foo}}';
			options.data = { foo: 'bar' };
		}
	});

	ractive = new View({
		el: fixture
	});

	t.equal( fixture.innerHTML, 'bar' );

});

hooks = [
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

	function addHook ( hook ) {
		options[ hook ] = function () {
			fired.push( hook );
		};
	}

	hooks.forEach( hook => addHook( hook ) );

	ractive = new Ractive( options );
	ractive.teardown();
	t.deepEqual( fired, hooks );

	fired = [];
	addHook( 'onconstruct');

	Component = Ractive.extend( options );
	ractive = new Component();
	ractive.teardown();
	t.deepEqual( fired, [ 'onconstruct' ].concat( hooks ) );

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
		// construct and config temporarily commented out, see #1381
		method = {
			/*construct: [], config: [], */init: [],
			render: [], complete: [],
			unrender: [], teardown: []
		},
		event = {
			/*config: [],*/ init: [],
			render: [], complete: [],
			unrender: [], teardown: []
		},
		simpsons = ["Homer", "Marge", "Lisa", "Bart", "Maggie"];

	Simpson = Ractive.extend({
		template: "{{simpson}}",
		onconstruct: function ( o ) {
			// method.construct.push( o.data.simpson );

			/*this.on('config', () => {
				event.config.push( this.data.simpson );
			})*/
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
		// onconfig: function () {
		// 	method.config.push( this.data.simpson );
		// },
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

test( 'render hooks are not fired until after DOM updates (#1367)', function ( t ) {
	var ractive = new Ractive({
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
				onrender: function () {
					this.parent.find( 'whatever' );
				}
			})
		}
	});

	expect( 0 );

	// If the `<one>` component is not rendered, the `<two>` component's
	// render handler will cause an error
	ractive.set( 'bool', true );
});

test( 'correct behaviour of deprecated beforeInit hook (#1395)', function ( t ) {
	var Subclass, count, reset;

	reset = () => count = { construct: 0, beforeInit: 0 };
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
	reset();
	new Ractive({
		beforeInit: () => count.beforeInit += 1
	});
	t.deepEqual( count, { construct: 0, beforeInit: 0 });

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

asyncTest( 'error in oncomplete sent to console', function ( t ) {
	let warn = console.warn;
	let log = console.log;

	expect( 2 )
	console.warn = msg => {
		if ( /DEBUG_PROMISES/.test( msg ) ) {
			return;
		}

		t.ok( /error happened during rendering/.test( msg ) );
		console.warn = warn;
	};

	console.log = stack => {
		if ( /debug mode/.test( stack ) ) {
			return;
		}

		t.ok( /evil handler/.test( stack ) );
		console.log = log;
		QUnit.start();
	};

	new Ractive({
		el: fixture,
		template: 'foo',
		oncomplete () {
			throw new Error( 'evil handler' );
		}
	});
});
