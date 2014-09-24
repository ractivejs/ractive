define([ 'ractive', 'utils/log' ], function ( Ractive, log ) {

	'use strict';

	return function () {

		var Ractive_original, fixture = document.getElementById( 'qunit-fixture' );

		module( 'Transitions', {
			setup: function () {
				// augment base Ractive object slightly
				Ractive_original = Ractive;
				Ractive = Ractive.extend({
					beforeInit: function ( options ) {
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

				Ractive.transitions.fade = function ( t ) {
					var targetOpacity;

					if ( t.isIntro ) {
						targetOpacity = t.getStyle( 'opacity' );
						t.setStyle( 'opacity', 0 );
					} else {
						targetOpacity = 0;
					}

					t.animateStyle( 'opacity', targetOpacity, { duration: 50 } ).then( t.complete );
				};
			},
			teardown: function () {
				Ractive = Ractive_original;
			}
		});

		asyncTest( 'Elements containing components with outroing elements do not detach until transitions are complete', function ( t ) {
			var Widget, ractive, p, shouldHaveCompleted;

			Widget = Ractive.extend({
				template: '<p outro="test">foo</div>',
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
				complete: function(){
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
				complete: function(){
					t.ok( !transitioned, 'transition happened');
					start()
				}
			});

			ractive.render( fixture );
		});

		asyncTest( 'ractive.transitionsEnabled false prevents all transitions', function ( t ) {

			var ractive, Component, transitioned;

			expect( 1 );

			Component = Ractive.extend({
				template: '{{#foo}}<div intro-outro="test"></div>{{/foo}}',
				beforeInit: function ( options ) {
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
				complete: function () {
					this.set( 'foo', false ).then( function(){
						t.ok( !transitioned, 'outro transition happened');
						start()
					});
				}
			});
		});

		if ( console && console.warn ) {
			asyncTest( 'Missing transition functions do not cause errors, but do console.warn', function ( t ) {
				var ractive, warn = console.warn;

				expect( 1 );

				console.warn = function( msg ) {
					t.ok( msg );
				}

				ractive = new Ractive({
					el: fixture,
					template: '<div intro="foo"></div>',
					complete: function () {
						console.warn = warn;
						start();
					}
				});
			});
		}

		asyncTest( 'Transitions work the first time (#916)', function ( t ) {
			var ractive, div;

			ractive = new Ractive({
				el: fixture,
				template: '<div intro="fade"></div>',
				complete: function () {
					t.equal( div.style.opacity, '' );
					QUnit.start();
				}
			});

			div = ractive.find( 'div' );

			t.equal( div.style.opacity, 0 );
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
	};
});
