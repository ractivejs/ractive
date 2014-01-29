define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	window.Ractive = Ractive;

	return function () {

		var fixture, Foo;

		module( 'Components' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		// test( 'Static data is propagated from parent to child', function ( t ) {
		// 	var Widget, ractive, widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo}}</p>'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget foo="blah"/>',
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	widget = ractive.findComponent( 'widget' );

		// 	t.equal( widget.get( 'foo' ), 'blah' );
		// 	t.htmlEqual( fixture.innerHTML, '<p>blah</p>' );
		// });

		// test( 'Static object data is propagated from parent to child', function ( t ) {
		// 	var Widget, ractive, widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo.bar}}</p>'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget foo="{{ { bar: \'biz\' } }}"/>',
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	widget = ractive.findComponent( 'widget' );
		// 	t.deepEqual( widget.get( 'foo' ), { bar: 'biz' } );
		// 	t.htmlEqual( fixture.innerHTML, '<p>biz</p>' );

		// 	widget.set('foo.bar', 'bah')
		// 	t.deepEqual( widget.get( 'foo' ), { bar: 'bah' } );
		// 	t.htmlEqual( fixture.innerHTML, '<p>bah</p>' );
		// });

		// test( 'Dynamic data is propagated from parent to child, and (two-way) bindings are created', function ( t ) {
		// 	var Widget, ractive, widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo}}</p>'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget foo="{{bar}}"/>',
		// 		components: {
		// 			widget: Widget
		// 		},
		// 		data: {
		// 			bar: 'blah'
		// 		}
		// 	});

		// 	widget = ractive.findComponent( 'widget' );

		// 	t.equal( widget.get( 'foo' ), 'blah' );
		// 	t.htmlEqual( fixture.innerHTML, '<p>blah</p>' );

		// 	ractive.set( 'bar', 'flup' );
		// 	t.equal( widget.get( 'foo' ), 'flup' );
		// 	t.htmlEqual( fixture.innerHTML, '<p>flup</p>' );

		// 	widget.set( 'foo', 'shmup' );
		// 	t.equal( ractive.get( 'bar' ), 'shmup' );
		// 	t.htmlEqual( fixture.innerHTML, '<p>shmup</p>' );
		// });

		// // Commenting out this test for the moment - is this a desirable feature?
		// // It prevents JavaScript closure-like behaviour with data contexts
		// /*test( 'Missing data on the parent is not propagated', function ( t ) {
		// 	var Widget, ractive, widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo}}</p>'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget foo="{{missing}}"/>',
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	widget = ractive.findComponent( 'widget' );

		// 	t.ok( !( widget.data.hasOwnProperty( 'foo' ) ) );
		// 	t.htmlEqual( fixture.innerHTML, '<p></p>' );
		// });*/

		// test( 'Missing data on the parent is added when set', function ( t ) {
		// 	var Widget, ractive, widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo}}</p>'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget foo="{{missing}}"/>',
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	widget = ractive.findComponent( 'widget' );

		// 	t.htmlEqual( fixture.innerHTML, '<p></p>' );

		// 	ractive.set('missing', 'found')
		// 	t.ok( widget.data.hasOwnProperty( 'foo' ) );
		// 	t.htmlEqual( fixture.innerHTML, '<p>found</p>' );

		// });

		// test( 'Data on the child is propagated to the parent, if it is not missing', function ( t ) {
		// 	var Widget, ractive, widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo}}{{bar}}</p>',
		// 		data: {
		// 			foo: 'yes'
		// 		}
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget foo="{{one}}" bar="{{two}}"/>',
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	widget = ractive.findComponent( 'widget' );

		// 	t.equal( ractive.get( 'one' ), 'yes' );
		// 	t.ok( !( ractive.data.hasOwnProperty( 'two' ) ) );
		// 	t.htmlEqual( fixture.innerHTML, '<p>yes</p>' );
		// });

		// test( 'Parent data overrides child data during child model creation', function ( t ) {
		// 	var Widget, ractive, widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo}}{{bar}}</p>',
		// 		data: {
		// 			foo: 'yes',
		// 			bar: 'no'
		// 		}
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget foo="{{one}}" bar="{{two}}"/>',
		// 		components: {
		// 			widget: Widget
		// 		},
		// 		data: {
		// 			one: 'uno',
		// 			two: 'dos'
		// 		}
		// 	});

		// 	widget = ractive.findComponent( 'widget' );

		// 	t.equal( ractive.get( 'one' ), 'uno' );
		// 	t.equal( ractive.get( 'two' ), 'dos' );
		// 	t.equal( widget.get( 'foo' ), 'uno' );
		// 	t.equal( widget.get( 'bar' ), 'dos' );

		// 	t.htmlEqual( fixture.innerHTML, '<p>unodos</p>' );
		// });

		// test( 'Components are rendered in the correct place', function ( t ) {
		// 	var Component, ractive;

		// 	Component = Ractive.extend({
		// 		template: '<p>this is a component!</p>'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<h2>Here is a component:</h2><component/><p>(that was a component)</p>',
		// 		components: {
		// 			component: Component
		// 		}
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, '<h2>Here is a component:</h2><p>this is a component!</p><p>(that was a component)</p>' );
		// });

		// test( 'Top-level sections in components are updated correctly', function ( t ) {
		// 	var ractive, Component, component;

		// 	Component = Ractive.extend({
		// 		template: '{{#foo}}foo is truthy{{/foo}}{{^foo}}foo is falsy{{/foo}}'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<component foo="{{foo}}"/>',
		// 		components: {
		// 			component: Component
		// 		}
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, 'foo is falsy' );

		// 	ractive.set( 'foo', true );
		// 	t.htmlEqual( fixture.innerHTML, 'foo is truthy' );
		// });

		// test( 'Element order is maintained correctly with components with multiple top-level elements', function ( t ) {
		// 	var ractive, TestComponent;

		// 	TestComponent = Ractive.extend({
		// 		template: '{{#bool}}TRUE{{/bool}}{{^bool}}FALSE{{/bool}}'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<p>before</p> <test bool="{{bool}}"/> <p>after</p>',
		// 		components: { test: TestComponent }
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );

		// 	ractive.set( 'bool', true );
		// 	t.htmlEqual( fixture.innerHTML, '<p>before</p> TRUE <p>after</p>' );

		// 	ractive.set( 'bool', false );
		// 	t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );
		// });

		// test( 'Regression test for #317', function ( t ) {
		// 	var Widget, widget, ractive, items;

		// 	Widget = Ractive.extend({
		// 		template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
		// 		init: function () {
		// 			widget = this;
		// 		}
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget items="{{items}}"/><p>{{ items.join( " " ) }}</p>',
		// 		data: { items: [ 'a', 'b', 'c', 'd' ] },
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	items = ractive.get( 'items' );

		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li></ul><p>a b c d</p>' );

		// 	items.push( 'e' );
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li><li>4: e</li></ul><p>a b c d e</p>' );

		// 	items.splice( 2, 1 );
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li><li>3: e</li></ul><p>a b d e</p>' );

		// 	items.pop();
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li></ul><p>a b d</p>' );

		// 	ractive.set( 'items[0]', 'f' );
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li></ul><p>f b d</p>' );


		// 	// reset items from within widget
		// 	widget.set( 'items', widget.get( 'items' ).slice() );
		// 	items = ractive.get( 'items' );

		// 	items.push( 'g' );
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li><li>3: g</li></ul><p>f b d g</p>' );

		// 	items.splice( 1, 1 );
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li><li>2: g</li></ul><p>f d g</p>' );

		// 	items.pop();
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li></ul><p>f d</p>' );

		// 	widget.set( 'items[0]', 'h' );
		// 	t.htmlEqual( fixture.innerHTML, '<ul><li>0: h</li><li>1: d</li></ul><p>h d</p>' );
		// });

		// test( 'Component complete() methods are called', function ( t ) {
		// 	var ractive, ractiveCompleted, Widget, widgetCompleted;

		// 	Widget = Ractive.extend({
		// 		complete: function () {
		// 			widgetCompleted = true;
		// 		}
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget/>',
		// 		complete: function () {
		// 			ractiveCompleted = true;
		// 		},
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	t.equal( ractiveCompleted, true );
		// 	t.equal( widgetCompleted, true );
		// });

		// test( 'Components can access outer data context, in the same way JavaScript functions can access outer lexical scope', function ( t ) {
		// 	var ractive, Widget;

		// 	Widget = Ractive.extend({
		// 		template: '<p>{{foo || "missing"}}</p>'
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget/><widget foo="{{bar}}"/><widget foo="{{baz}}"/>',
		// 		data: {
		// 			foo: 'one',
		// 			bar: 'two'
		// 		},
		// 		components: {
		// 			widget: Widget
		// 		}
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, '<p>one</p><p>two</p><p>missing</p>' );

		// 	ractive.set({
		// 		foo: 'three',
		// 		bar: 'four',
		// 		baz: 'five'
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, '<p>three</p><p>four</p><p>five</p>' );
		// });


		// test( 'Nested components can access outer-most data context', function ( t ) {
		// 	var ractive, Widget;

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget/>',
		// 		components: {
		// 			widget: Ractive.extend({
		// 				template: '<grandwidget/>',
		// 				components: {
		// 					grandwidget: Ractive.extend({
		// 						template: 'hello {{world}}'
		// 					})
		// 				},
		// 			})
		// 		},
		// 		data: { world: 'mars' }
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, 'hello mars' );
		// 	ractive.set('world', 'venus');
		// 	t.htmlEqual( fixture.innerHTML, 'hello venus' );
		// });

		// test( 'Nested components registered at parent Ractive can access outer-most data context', function ( t ) {
		// 	var ractive, Widget;

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget/>',
		// 		components: {
		// 			widget: Ractive.extend({
		// 				template: '<grandwidget/>'
		// 			}),
		// 			grandwidget: Ractive.extend({
		// 				template: 'hello {{world}}'
		// 			})
		// 		},
		// 		data: { world: 'mars' }
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, 'hello mars' );
		// 	ractive.set('world', 'venus');
		// 	t.htmlEqual( fixture.innerHTML, 'hello venus' );
		// });

		// test( 'Nested components registered at global Ractive can access outer-most data context', function ( t ) {
		// 	var ractive, Widget;

		// 	Ractive.components.widget = Ractive.extend({ template: '<grandwidget/>' });
		// 	Ractive.components.grandwidget = Ractive.extend({ template: 'hello {{world}}' });

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget/>',
		// 		data: { world: 'mars' }
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, 'hello mars' );
		// 	ractive.set('world', 'venus');
		// 	t.htmlEqual( fixture.innerHTML, 'hello venus' );

		// 	/* This works, but is it risky to polute global for other tests? */
		// 	delete Ractive.components.widget
		// 	delete Ractive.components.grandwidget
		// });

		// test( 'Data passed into component updates inside component in magic mode', function ( t ) {
		// 	var ractive, Widget;

		// 	Widget = Ractive.extend({
		// 		template: '{{world}}',
		// 		magic: true,
		// 		complete: function(){
		// 			this.data.world = 'venus'
		// 		}
		// 	});

		// 	var data = { world: 'mars' }

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '{{world}}<widget world="{{world}}"/>',
		// 		magic: true,
		// 		components: { widget: Widget },
		// 		data: data
		// 	});

		// 	t.htmlEqual( fixture.innerHTML, 'venusvenus' );
		// });

		// test( 'Data passed into component updates from outside component in magic mode', function ( t ) {
		// 	var ractive, Widget;

		// 	Widget = Ractive.extend({
		// 		template: '{{world}}',
		// 		magic: true
		// 	});

		// 	var data = { world: 'mars' }
		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '{{world}}<widget world="{{world}}"/>',
		// 		magic: true,
		// 		components: { widget: Widget },
		// 		data: data
		// 	});

		// 	data.world = 'venus'

		// 	t.htmlEqual( fixture.innerHTML, 'venusvenus' );
		// });

		test( 'Component data passed but non-existant on parent data', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{exists}}{{missing}}',
				magic: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget exists="{{exists}}" missing={{missing}}/>',
				magic: true,
				components: { widget: Widget },
				data: { exists: 'exists' }
			});
			
			t.htmlEqual( fixture.innerHTML, 'exists' );
		});

		test( 'Some component data not included in invocation parameters', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{exists}}{{missing}}',
				magic: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget exists="{{exists}}"/>',
				magic: true,
				components: { widget: Widget },
				data: { exists: 'exists' }
			});
			
			t.htmlEqual( fixture.innerHTML, 'exists' );
		});

		test( 'Some component data not included, with implicit sibling', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{exists}}{{also}}{{missing}}',
				magic: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#stuff:exists}}<widget exists="{{exists}}" also="{{.}}"/>{{/stuff}}',
				magic: true,
				components: { widget: Widget },
				data: { 
					stuff: {
						exists: 'also'
					}
				 }
			});
			
			t.htmlEqual( fixture.innerHTML, 'existsalso' );
		});

	};

});