import Viewmodel from 'viewmodel/Viewmodel';
import Fragment from 'virtualdom/Fragment';
import Element from 'virtualdom/items/Element/_Element';
import Triple from 'virtualdom/items/Triple/_Triple';
import { TRIPLE } from 'config/types';

module( 'rebind' );

const test = QUnit.test; // necessary due to a bug in esperanto

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

	ractive.push('items', 'item');
	t.equal( called, 1 );
})

test('Section with item index ref expression changes correctly', function(t){
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
	ractive.splice( 'items', 1, 2, 10 );
	t.deepEqual( items, [ 1, 10, 4, 5 ] );
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

	ractive.splice( 'items', 1,2, { foo: { name: 'jill' } } );
	t.htmlEqual( fixture.innerHTML, 'bob,jill,');
})

test('Section with nested sections and inner context does splice()', function(t){
	var template = '{{#model:i}}{{#thing}}' +
						'{{# .inner.length > 1}}' +
							'<p>{{{format(inner)}}}</p>' +
						'{{/ inner}}' +
					'{{/thing}}{{/model}}'
	var called = 0;

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
	ractive.splice( 'model', 0, 0, { thing: { inner: [ 1, 2 ] } } );
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

	ractive.splice( 'items', 1, 1 );
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

	ractive.splice( 'items', 1, 1 );
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

	ractive.splice( 'items', 1 , 2, 10 );
	t.deepEqual( ractive.get( 'items' ), [1,10,4,5]);
	t.htmlEqual( fixture.innerHTML, '0,1,2,3,');
})

test( 'Expressions with unresolved references can be rebound (#630)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#list}}{{#check > length}}true{{/test}}{{/list}}',
		data: {list:[1,2], check:3}
	});

	ractive.unshift( 'list', 3 );
	t.ok( true );
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

	ractive.unshift('model', {
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

	ractive.unshift( 'items' , {} );

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

	ractive.unshift( 'items', {} );
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
	ractive.unshift( 'items', {} );

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
	ractive.unshift( 'items', {} );

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

test( '@index rebinds correctly', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#each items}}<p>{{@index}}:{{this}}</p>{{/each}}',
		data: { items: [ 'a', 'b', 'd' ] }
	});

	ractive.splice( 'items', 2, 0, 'c' );
	t.htmlEqual( fixture.innerHTML, '<p>0:a</p><p>1:b</p><p>2:c</p><p>3:d</p>' );
});

test( 'index rebinds do not go past new index providers (#1457)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#each foo}}{{@index}}{{#each .bar}}{{@index}}{{/each}}<br/>{{/each}}',
		data: {
			foo: [
				{ bar: [ 1, 2 ] },
				{ bar: [ 1 ] },
				{ bar: [ 1, 2, 3, 4 ] }
			]
		}
	});

	t.htmlEqual( fixture.innerHTML, '001<br/>10<br/>20123<br/>' );

	ractive.splice( 'foo', 1, 1 );

	t.htmlEqual( fixture.innerHTML, '001<br/>10123<br/>' );
});

test( 'index rebinds get passed through conditional sections correctly', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#each foo}}{{@index}}{{#.bar}}{{@index}}{{/}}<br/>{{/each}}',
		data: {
			foo: [
				{ bar: true },
				{ bar: true },
				{ bar: false },
				{ bar: true }
			]
		}
	});

	t.htmlEqual( fixture.innerHTML, '00<br/>11<br/>2<br/>33<br/>' );

	ractive.splice( 'foo', 1, 1 );

	t.htmlEqual( fixture.innerHTML, '00<br/>1<br/>22<br/>' );
});
