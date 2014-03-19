define([ 'Ractive' ], function ( Ractive ) {

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

	};

});
