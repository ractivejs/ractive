import hasUsableConsole from 'hasUsableConsole';

var Ractive_original;

module( 'Transitions', {
	setup: function () {
		// augment base Ractive object slightly
		Ractive_original = Ractive;
		Ractive = Ractive.extend({
			onconstruct: function ( options ) {
				// if a beforeComplete method is given as an initialisation option,
				// add it to the instance (unless it already exists on a component prototype)
				!this.beforeComplete && ( this.beforeComplete = options.beforeComplete );
			}
		});

		Ractive.transitions.test = function ( t, params ) {
			var delay = ( params && params.delay ) || 50;

			setTimeout( function () {
				if ( t.root.beforeComplete ) {
					t.root.beforeComplete( t, params );
				}

				t.complete();
			}, delay );
		};
	},
	teardown: function () {
		Ractive = Ractive_original;
	}
});

asyncTest( 'Elements containing components with outroing elements do not detach until transitions are complete', function ( t ) {
	var Widget, ractive, p, shouldHaveCompleted;

	Widget = Ractive.extend({
		template: '<p outro="test">foo</p>',
		beforeComplete: function ( transition, params ) {
			shouldHaveCompleted = true;
			t.ok( fixture.contains( p ), '<p> element has already been removed from the DOM' );
		}
	});

	ractive = new Ractive({
		el: fixture,
		template: '{{#foo}}<div><widget/></div>{{/foo}}',
		components: {
			widget: Widget
		},
		data: { foo: true }
	});

	p = ractive.find( 'p' );

	ractive.set( 'foo', false ).then( function () {
		t.ok( shouldHaveCompleted, 'promise was fulfilled before transition had completed' );
		t.ok( !fixture.contains( p ), '<p> element should have been removed from the DOM' );
		start();
	});
});

asyncTest( 'noIntro option prevents intro transition', function ( t ) {
	var ractive, transitioned;

	expect( 1 );

	ractive = new Ractive({
		el: fixture,
		template: '<div intro="test"></div>',
		noIntro: true,
		beforeComplete: function(){
			transitioned = true;
		},
		oncomplete: function(){
			t.ok( !transitioned, 'transition happened');
			start()
		}
	});
});

asyncTest( 'noIntro option prevents intro transition when el is initially undefined', function ( t ) {
	var ractive, transitioned;

	expect( 1 );

	ractive = new Ractive({
		template: '<div intro="test"></div>',
		noIntro: true,
		beforeComplete: function(){
			transitioned = true;
		},
		oncomplete: function(){
			t.ok( !transitioned, 'transition happened');
			start()
		}
	});

	ractive.render( fixture );
});

asyncTest( 'Empty transitions on refs okay', function ( t ) {

	expect( 1 );

	var ractive = new Ractive({
		el: fixture,
		debug: true,
		template: '{{#if x}}<div intro="{{foo}}"></div>{{/if}}',
		transitions: {
			test: function ( transition ) {
				t.ok( true );
				transition.complete();
				QUnit.start();
			}
		},
		data: {
			x: true,
			foo: ''
		}
	});

	ractive.set( 'x', false );
	ractive.set( 'foo', 'test' );
	ractive.set( 'x', true );

});

asyncTest( 'ractive.transitionsEnabled false prevents all transitions', function ( t ) {

	var ractive, Component, transitioned;

	expect( 1 );

	Component = Ractive.extend({
		template: '{{#foo}}<div intro-outro="test"></div>{{/foo}}',
		onconstruct: function ( options ) {
			this._super( options );
			this.transitionsEnabled = false;
		},
		beforeComplete: function(){
			transitioned = true;
		}
	});

	ractive = new Component({
		el: fixture,
		data: { foo: true },
		oncomplete: function () {
			this.set( 'foo', false ).then( function(){
				t.ok( !transitioned, 'outro transition happened');
				start()
			});
		}
	});
});

if ( hasUsableConsole ) {
	asyncTest( 'Missing transition functions do not cause errors, but do console.warn', function ( t ) {
		var ractive, warn = console.warn;

		expect( 1 );

		console.warn = function( msg ) {
			t.ok( msg );
		};

		ractive = new Ractive({
			el: fixture,
			template: '<div intro="foo"></div>',
			oncomplete: function () {
				console.warn = warn;
				start();
			}
		});
	});
}

asyncTest( 'Transitions work the first time (#916)', function ( t ) {
	var ractive, div;

	// we're using line height for testing because it's a numerical CSS property that IE8 supports

	ractive = new Ractive({
		el: fixture,
		template: '<div intro="changeLineHeight"></div>',
		oncomplete: function () {
			t.equal( div.style.lineHeight, '' );
			QUnit.start();
		},
		changeLineHeight ( t ) {
			let targetLineHeight;

			if ( t.isIntro ) {
				targetLineHeight = t.getStyle( 'lineHeight' );
				t.setStyle( 'lineHeight', 0 );
			} else {
				targetLineHeight = 0;
			}

			t.animateStyle( 'lineHeight', targetLineHeight, { duration: 50 } ).then( t.complete );
		}
	});

	div = ractive.find( 'div' );

	t.equal( div.style.lineHeight, 0 );
});

test( 'Nodes are detached synchronously if there are no outro transitions (#856)', function ( t ) {
	var ractive, target;

	ractive = new Ractive({
		el: fixture,
		template: '{{#if foo}}<div intro="test">intro</div>{{else}}<div class="target">no outro</div>{{/if}}'
	});

	target = ractive.find( '.target' );
	t.ok( fixture.contains( target ) );

	ractive.set( 'foo', true );
	t.ok( !fixture.contains( target ) );
});

asyncTest( 'Regression test for #1157', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<div intro="test: { duration: {{ foo ? 1000 : 0 }} }"></div>',
		transitions: {
			test: function ( transition, params ) {
				t.deepEqual( params, { duration: 0 });
				QUnit.start();
			}
		}
	});
});

test( 'Parameter objects are not polluted (#1239)', function ( t ) {
	var ractive, uid = 0, objects = [];

	ractive = new Ractive({
		el: fixture,
		template: '{{#each list}}<p intro="foo:{}"></p>{{/each}}',
		transitions: {
			foo: function ( t, params ) {
				params = t.processParams( params, {
					uid: uid++
				});

				objects.push( params );
			}
		},
		data: { list: [ 0, 0 ] }
	});

	t.equal( objects.length, 2 );
	t.notEqual( objects[0], objects[1] );
});

asyncTest( 'An intro will be aborted if a corresponding outro begins before it completes', function ( t ) {
	var ractive, tooLate;

	expect( 0 );

	ractive = new Ractive({
		el: fixture,
		template: '{{#showBox}}<div intro="wait:2000" outro="wait:1"></div>{{/showBox}}',
		transitions: {
			wait: function ( t, ms ) {
				setTimeout( t.complete, ms );
			}
		}
	});

	ractive.set( 'showBox', true ).then( function ( t ) {
		if ( !tooLate ) {
			QUnit.start();
		}
	});

	setTimeout( function () {
		ractive.set( 'showBox', false );
	}, 0 );

	setTimeout( function () {
		tooLate = true;
	}, 200 );
});

test( 'Conditional sections that become truthy are not rendered if a parent simultaneously becomes falsy (#1483)', function ( t ) {
	var ractive, transitionRan = false;

	ractive = new Ractive({
		el: fixture,
		template: `
			{{#if foo.length || bar.length}}
				{{#if foo === bar}}
					<span intro-outro='x'></span>
				{{/if}}
			{{/if}}`,
		transitions: {
			x: function ( t ) {
				transitionRan = true;
				setTimeout( t.complete, 0 );
			}
		},
		data: {
			foo: '',
			bar: ''
		}
	});

	ractive.set( 'foo', 'x' );
	ractive.set( 'foo', '' );

	t.ok( !transitionRan );
});
