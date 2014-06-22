define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'Transitions' );

		// augment base Ractive object slightly
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
					QUnit.start();

				}
			});
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

	};

});
