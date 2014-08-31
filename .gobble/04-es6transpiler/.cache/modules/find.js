define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Widget, Decoy;

		module( 'ractive.find()/findAll()/findComponent()/findAllComponents()' );

		// setup
		fixture = document.getElementById( 'qunit-fixture' );

		Widget = Ractive.extend({
			template: '<p>{{content}}</p>'
		});

		Decoy = Ractive.extend({
			template: '<p>I am a decoy</p>'
		});

		Ractive = Ractive.extend({
			components: {
				widget: Widget,
				decoy: Decoy
			}
		});

		test( 'find() works with a string-only template', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<p>foo</p><p>bar</p>'
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'foo' );
		});

		test( 'find() works with a template containing mustaches', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p><p>{{bar}}</p>',
				data: { foo: 'one', bar: 'two' }
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'one' );
		});

		test( 'find() works with nested elements', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<div class="outer"><div class="inner"><p>{{foo}}</p><p>{{bar}}</p></div></div>',
				data: { foo: 'one', bar: 'two' }
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'one' );
		});

		test( 'findAll() gets an array of all nodes matching a selector', function ( t ) {
			var ractive, divs;

			ractive = new Ractive({
				el: fixture,
				template: '<div><div><div>{{foo}}</div></div></div>'
			});

			divs = ractive.findAll( 'div' );
			t.equal( divs.length, 3 );
		});

		test( 'findAll() works with a string-only template', function ( t ) {
			var ractive, paragraphs;

			ractive = new Ractive({
				el: fixture,
				template: '<div><p>foo</p><p>bar</p></div>'
			});

			paragraphs = ractive.findAll( 'p' );

			t.ok( paragraphs.length === 2 );
			t.ok( paragraphs[0].innerHTML === 'foo' );
			t.ok( paragraphs[1].innerHTML === 'bar' );
		});

		test( 'findAll() with { live: true } gets an updating array of all nodes matching a selector', function ( t ) {
			var ractive, lis;

			ractive = new Ractive({
				el: fixture,
				template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
				data: {
					items: [ 'a', 'b', 'c' ]
				}
			});

			lis = ractive.findAll( 'li', { live: true });
			t.equal( lis.length, 3 );

			ractive.get( 'items' ).push( 'd' );
			t.equal( lis.length, 4 );
		});

		test( 'A live query maintains the correct sort order after a merge operation', function ( t ) {
			var ractive, lis, getHtml;

			ractive = new Ractive({
				el: fixture,
				template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
				data: {
					items: [ 'a', 'b', 'c', 'd' ]
				}
			});

			getHtml = function ( node ) {
				return node.innerHTML;
			};

			lis = ractive.findAll( 'li', { live: true });
			t.deepEqual( lis.map( getHtml ), [ 'a', 'b', 'c', 'd' ] );

			ractive.merge( 'items', [ 'c', 'b', 'a', 'd' ] );
			t.deepEqual( lis.map( getHtml ), [ 'c', 'b', 'a', 'd' ] );
		});

		test( 'ractive.findComponent() finds the first component, of any type', function ( t ) {
			var ractive, widget;

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>'
			});

			widget = ractive.findComponent();

			t.ok( widget instanceof Widget );
		});

		test( 'ractive.findComponent(selector) finds the first component of type `selector`', function ( t ) {
			var ractive, widget;

			ractive = new Ractive({
				el: fixture,
				template: '<decoy/><widget/>'
			});

			widget = ractive.findComponent( 'widget' );

			t.ok( widget instanceof Widget );
		});

		test( 'ractive.findAllComponents() finds all components, of any type', function ( t ) {
			var ractive, widgets;

			ractive = new Ractive({
				el: fixture,
				template: '<widget/><widget/><widget/>'
			});

			widgets = ractive.findAllComponents();

			t.equal( widgets.length, 3 );
			t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget && widgets[2] instanceof Widget );
		});

		test( 'ractive.findAllComponents(selector) finds all components of type `selector`', function ( t ) {
			var ractive, widgets;

			ractive = new Ractive({
				el: fixture,
				template: '<widget/><decoy/><widget/>'
			});

			widgets = ractive.findAllComponents( 'widget' );

			t.equal( widgets.length, 2 );
			t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget );
		});

		test( 'ractive.findAllComponents(selector, {live: true}) returns a live query that maintains sort order', function ( t ) {
			var ractive, widgets, widgetA, widgetB, widgetC, widgetD;

			ractive = new Ractive({
				el: fixture,
				template: '{{#widgets}}<div><widget content="{{this}}"/></div>{{/widgets}}',
				data: {
					widgets: [ 'a', 'b', 'c' ]
				}
			});

			widgets = ractive.findAllComponents( 'widget', { live: true });

			t.equal( widgets.length, 3 );
			t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget && widgets[2] instanceof Widget );
			t.equal( widgets[0].get( 'content' ), 'a' );
			t.equal( widgets[1].get( 'content' ), 'b' );
			t.equal( widgets[2].get( 'content' ), 'c' );

			ractive.get( 'widgets' ).push( 'd' );
			t.equal( widgets.length, 4 );
			t.ok( widgets[3] instanceof Widget );
			t.equal( widgets[3].get( 'content' ), 'd' );

			widgetA = widgets[0];
			widgetB = widgets[1];
			widgetC = widgets[2];
			widgetD = widgets[3];

			ractive.merge( 'widgets', [ 'c', 'a', 'd', 'b' ]);

			t.ok( widgets[0] === widgetC );
			t.ok( widgets[1] === widgetA );
			t.ok( widgets[2] === widgetD );
			t.ok( widgets[3] === widgetB );
		});

		test( 'Components containing other components work as expected with ractive.findAllComponents()', function ( t ) {
			var Compound, ractive, widgets;

			Compound = Ractive.extend({
				template: '<widget content="foo"/><div><widget content="bar"/></div>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#shown}}<compound/><widget content="baz"/>{{/shown}}',
				components: {
					compound: Compound
				}
			});

			widgets = ractive.findAllComponents( 'widget', { live: true });

			t.equal( widgets.length, 0 );

			ractive.set( 'shown', true );
			t.equal( widgets.length, 3 );

			ractive.set( 'shown', false );
			t.equal( widgets.length, 0 );
		});

		test( 'Nodes belonging to components are removed from live queries when those components are torn down', function ( t ) {
			var Widget, ractive, divs;

			Widget = Ractive.extend({
				template: '<div>this should be removed</div>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#widgets}}<widget/>{{/widgets}}',
				components: {
					widget: Widget
				}
			});

			divs = ractive.findAll( 'div', { live: true });
			t.equal( divs.length, 0 );

			[ 3, 2, 5, 10, 0 ].forEach( function ( length ) {
				ractive.set( 'widgets', new Array( length ) );
				t.equal( divs.length, length );
			});
		})


		// TODO add tests (and add the functionality)...
		// * cancelling a live query (also, followed by teardown)
		// * components
		// * a load of other stuff

	};

});
