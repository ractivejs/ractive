define([
	'ractive',
	'viewmodel/Viewmodel',
	'virtualdom/Fragment',
	'virtualdom/items/Element/_Element',
	'virtualdom/items/Triple/_Triple',
	'config/types'
], function (
	Ractive,
	Viewmodel,
	Fragment,
	Element,
	Triple,
	types
) {

	'use strict';

	return function () {

		var fixture;

		module( 'rebind' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		function contextUpdate(opt){
			test( 'update context path: ' + opt.test, function ( t ) {
				var resolved, fragment, el, triple;

				fragment = {
					context: opt.target,
					items: [],
					root: {
						'_liveQueries': [],
						'_deps': [] ,
						'_depsMap': [],
						'_cache': [],
						'_computations': [],
						'_wrapped': [],
						'_evaluators': [],
						el: { namespaceURI: 'http://www.w3.org/1999/xhtml' },
						adapt: []
					},
					indexRefs: { i: opt.oldKeypath.replace('items.','')}
				};

				fragment.root.viewmodel = new Viewmodel( fragment.root );

				el = new Element({
					parentFragment: fragment,
					template: { e: 'div' }
				});

				triple = new Triple({
					parentFragment: fragment,
					template: {
						t: types.TRIPLE,
						r: '.'
					}
				});

				triple.resolve = function(keypath){
				 	resolved = keypath
				};

				fragment.items.push(el, triple);

				fragment.render = Fragment.prototype.render;
				fragment.rebind = Fragment.prototype.rebind;
				fragment.bubble = Fragment.prototype.bubble;
				fragment.getNode = function () { return fixture; };
				fragment.findNextNode = function () { return null; };

				fragment.render();
				fragment.rebind( 'i', opt.newKeypath.replace('items.',''), opt.oldKeypath, opt.newKeypath);

				t.equal( fragment.context, opt.expected );
				t.equal( fragment.items[0].node._ractive.keypath, opt.expected );
				if(opt.target!==opt.newKeypath){
					t.equal( resolved, opt.expected );
				}

				t.htmlEqual( fixture.innerHTML, '' );
			});
		}

		contextUpdate({
			test: 'exact match replace',
			target: 'items.11',
			oldKeypath: 'items.11',
			newKeypath: 'items.21',
			expected: 'items.21'
		});

		contextUpdate({
			test: 'partial replace',
			target: 'items.1.foo',
			oldKeypath: 'items.1',
			newKeypath: 'items.11',
			expected: 'items.11.foo'
		});

		contextUpdate({
			test: 'overlapping replace',
			target: 'items.11',
			oldKeypath: 'items.1',
			newKeypath: 'items.11',
			expected: 'items.11'
		});

		test('Section with item that has expression only called once when created', function(t){
			var called = 0,
				ractive = new Ractive({
					el: fixture,
					template: '{{#items}}{{format(.)}}{{/items}}',
					data: {
						items: [],
						format: function(){
							called++;
						}
					}
				});

			ractive.get('items').push('item');
			t.equal( called, 1 );
		})

		test('Section with item indexRef expression changes correctly', function(t){
			var ractive = new Ractive({
					el: fixture,
					template: '{{#items:i}}{{format(.,i)}},{{/items}}',
					data: {
						items: [1,2,3,4,5],
						format: function(x,i){
							return x+i;
						}
					}
				});

			t.htmlEqual( fixture.innerHTML, '1,3,5,7,9,');

			var items = ractive.get('items');
			items.splice(1,2,10);
			t.deepEqual(items, [1,10,4,5]);
			t.htmlEqual( fixture.innerHTML, '1,11,6,8,');
		})

		test('Section updates child keypath expression', function(t){
			var ractive = new Ractive({
					el: fixture,
					template: '{{#items:i}}{{foo[bar]}},{{/}}',
					data: {
						bar: 'name',
						items: [
							{ foo: { name: 'bob' } },
							{ foo: { name: 'bill' } },
							{ foo: { name: 'betty' } }
						]
					}
				});

			t.htmlEqual( fixture.innerHTML, 'bob,bill,betty,');

			var items = ractive.get('items');
			items.splice(1,2, { foo: { name: 'jill' } } );
			t.htmlEqual( fixture.innerHTML, 'bob,jill,');
		})

		test('Section with nested sections and inner context does splice()', function(t){
			var template = '{{#model:i}}{{#thing}}' +
								'{{# .inner.length > 1}}' +
        							'<p>{{{format(inner)}}}</p>' +
        						'{{/ inner}}' +
    						'{{/thing}}{{/model}}'
    		var called = 0

			var ractive = new Ractive({
					el: fixture,
					template: template,
					data: {
						model: [ { thing: { inner: [3,4] } } ],
						format: function(a){
							called++;
							return a;
						}
					}
				});

			t.htmlEqual( fixture.innerHTML, '<p>3,4</p>');
			ractive.get('model').splice(0, 0, {thing: {inner: [1,2]}});
			t.htmlEqual( fixture.innerHTML, '<p>1,2</p><p>3,4</p>');
		})

		test( 'Components in a list can be rebound', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<widget letter="{{.}}"/>{{/items}}',
				data: { items: [ 'a', 'b', 'c' ] },
				components: {
					widget: Ractive.extend({
						template: '<p>{{letter}}</p>'
					})
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>a</p><p>b</p><p>c</p>' );

			ractive.get( 'items' ).splice( 1, 1 );
			t.htmlEqual( fixture.innerHTML, '<p>a</p><p>c</p>' );

			ractive.set( 'items[0]', 'd' );
			ractive.set( 'items[1]', 'e' );
			t.htmlEqual( fixture.innerHTML, '<p>d</p><p>e</p>' );
		});

		test( 'Index references can be used as key attributes on components, and rebinding works', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<widget index="{{i}}" letter="{{.}}"/>{{/items}}',
				data: { items: [ 'a', 'b', 'c' ] },
				components: {
					widget: Ractive.extend({
						template: '<p>{{index}}: {{letter}}</p>'
					})
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: b</p><p>2: c</p>' );

			ractive.get( 'items' ).splice( 1, 1 );
			t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: c</p>' );
		});

		test('Section with partials that use indexRef update correctly', function(t){
			var ractive = new Ractive({
					el: fixture,
					template: '{{#items:i}}{{>partial}},{{/items}}',
					partials: {
						partial: '{{i}}'
					},
					data: { items: [1,2,3,4,5] }
				});

			t.htmlEqual( fixture.innerHTML, '0,1,2,3,4,');

			var items = ractive.get('items');
			items.splice(1,2,10);
			t.deepEqual(items, [1,10,4,5]);
			t.htmlEqual( fixture.innerHTML, '0,1,2,3,');
		})

		test( 'Expressions with unresolved references can be rebound (#630)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#list}}{{#check > length}}true{{/test}}{{/list}}',
				data: {list:[1,2], check:3}
			});

			ractive.get('list').unshift(3);
			t.ok(true);
		});

		test( 'Regression test for #697', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#model}}{{#thing}}{{# foo && bar }}<p>works</p>{{/inner}}{{/thing}}{{/model}}',
				data: {
					model: [{
						thing: { bar: true },
						foo: true
					}]
				}
			});

			ractive.get('model').unshift({
				thing: { bar: true },
				foo: false
			});

			t.ok( true );
		});

		test( 'Regression test for #715', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{#test}}{{# .entries > 1 }}{{{ foo }}}{{/ .entries }}{{/test}}{{/items}}',
				data: {
					items: [
						{test: [{"entries": 2}]},
						{test: [{}]}
					],
					foo: 'bar'
				}
			});

			ractive.get( 'items' ).unshift({});

			t.ok( true );
		});

		test( 'Items are not unrendered and rerendered unnecessarily in cases like #715', function ( t ) {
			var ractive, renderCount = 0, unrenderCount = 0;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{#test}}{{# .entries > 1 }}<p intro="rendered" outro="unrendered">foo</p>{{/ .entries }}{{/test}}{{/items}}',
				data: {
					items: [
						{test: [{"entries": 2}]},
						{test: [{}]}
					],
					foo: 'bar'
				},
				transitions: {
					rendered: function () {
						renderCount += 1;
					},
					unrendered: function () {
						unrenderCount += 1;
					}
				}
			});

			t.equal( renderCount, 1 );
			t.equal( unrenderCount, 0 );

			ractive.get( 'items' ).unshift({});
			t.equal( renderCount, 1 );
			t.equal( unrenderCount, 0 );
		});

		test( 'Regression test for #729 (part one) - rebinding silently-created elements', function ( t ) {
			var items, ractive;

			items = [{test: { bool: false }}];

			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{#test}}{{#bool}}<p>true</p>{{/bool}}{{^bool}}<p>false</p>{{/bool}}{{/test}}{{/items}}',
				data: { items: items }
			});

			items[0].test = { bool: true };
			items.unshift({});

			t.ok( true );
		});

		test( 'Regression test for #729 (part two) - inserting before silently-created elements', function ( t ) {
			var items, ractive;

			items = [];

			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{#bool}}{{{foo}}}{{/bool}}{{/items}}',
				data: { items: items }
			});

			ractive.set('items.0', {bool: false});
			items[0].bool = true;
			items.unshift({});

			t.ok( true );
		});

		test( 'Regression test for #756 - fragment contexts are not rebound to undefined', function ( t ) {
			var ractive, new_items;

			ractive = new Ractive({
				el: fixture,
				template: `
					{{#items}}
						<div class="{{foo?'foo':''}}">
							{{#test}}{{# .list.length === 1 }}[ {{list.0.thing}} ]{{/ .list.length }}{{/test}}
						</div>
					{{/items}}`,
				data: { items:[{},{}] }
			});

			new_items = [{"test":{"list":[{"thing":"Z"},{"thing":"Z"}]},"foo":false},
			             {"test":{"list":[{"thing":"Z"},{"thing":"Z"}]},"foo":false}]

			ractive.set('items', new_items)

			new_items[1].test = {"list":[{"thing":"Z"}]}
			ractive.update();

			t.htmlEqual( fixture.innerHTML, '<div class></div><div class>[ Z ]</div>' );
		});

	};

});
