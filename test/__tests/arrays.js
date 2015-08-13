import cleanup from 'helpers/cleanup';

var List, baseItems;

module( 'Arrays', { afterEach: cleanup });

List = Ractive.extend({
	template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>'
});

baseItems = [ 'alice', 'bob', 'charles' ];

test( 'array.push()', function ( t ) {
	var items, ractive;

	items = baseItems.slice();

	ractive = new List({
		el: fixture,
		data: { items: items }
	});

	items.push( 'dave' );
	t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
});

test( 'array.pop()', function ( t ) {
	var items, ractive;

	items = baseItems.slice();

	ractive = new List({
		el: fixture,
		data: { items: items }
	});

	items.pop();
	t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
});

test( 'array.shift()', function ( t ) {
	var items, ractive;

	items = baseItems.slice();

	ractive = new List({
		el: fixture,
		data: { items: items }
	});

	items.shift();
	t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
});

test( 'array.unshift()', function ( t ) {
	var items, ractive;

	items = baseItems.slice();

	ractive = new List({
		el: fixture,
		data: { items: items }
	});

	items.unshift( 'dave');
	t.htmlEqual( fixture.innerHTML, '<ul><li>dave</li><li>alice</li><li>bob</li><li>charles</li></ul>' );
});

test( 'array.splice()', function ( t ) {
	var items, ractive;

	items = baseItems.slice();

	ractive = new List({
		el: fixture,
		data: { items: items }
	});

	items.splice( 1, 1, 'dave', 'eric' );
	t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>dave</li><li>eric</li><li>charles</li></ul>' );
});

test( 'Regression test for #425', function ( t ) {
	var items, ractive;

	items = [];

	ractive = new Ractive({
		el: fixture,
		template: '{{#items.length < limit}}<p>{{items.length}} / {{limit}}</p>{{/items.length < limit}}',
		data: {
			items: items,
			limit: 3
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>0 / 3</p>' );

	items.push( 'x', 'y' );
	t.htmlEqual( fixture.innerHTML, '<p>2 / 3</p>' );

	items.push( 'z' );
	t.htmlEqual( fixture.innerHTML, '' );
});

test( 'Component bindings will survive a splice', function ( t ) {
	var Widget, people, ractive;

	Widget = Ractive.extend({
		template: '<p>{{person.name}}</p>'
	});

	people = [
		{ name: 'alice' },
		{ name: 'bob' },
		{ name: 'charles' }
	];

	ractive = new Ractive({
		el: fixture,
		template: '{{#people}}<widget person="{{this}}"/>{{/people}}',
		data: { people: people },
		components: { widget: Widget }
	});

	t.htmlEqual( fixture.innerHTML, '<p>alice</p><p>bob</p><p>charles</p>');

	people.splice( 0, 0, { name: 'daisy' });
	t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>bob</p><p>charles</p>');

	people.splice( 2, 1, { name: 'erica' }, { name: 'fenton' });
	t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>erica</p><p>fenton</p><p>charles</p>');
});

test( 'Component \'backwash\' is prevented during a splice (#406)', function ( t ) {
	var Widget, people, ractive;

	Widget = Ractive.extend({
		template: '<p>{{person.name}}</p>'
	});

	people = [
		{ name: 'alice' },
		{ name: 'bob' },
		{ name: 'charles' }
	];

	ractive = new Ractive({
		el: fixture,
		template: '{{#people}}<widget person="{{this}}"/>{{/people}}{{#people}}<widget person="{{this}}"/>{{/people}}',
		data: { people: people },
		components: { widget: Widget }
	});

	t.htmlEqual( fixture.innerHTML, '<p>alice</p><p>bob</p><p>charles</p><p>alice</p><p>bob</p><p>charles</p>');

	people.splice( 0, 0, { name: 'daisy' });
	t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>bob</p><p>charles</p><p>daisy</p><p>alice</p><p>bob</p><p>charles</p>');

	people.splice( 2, 1, { name: 'erica' }, { name: 'fenton' });
	t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>erica</p><p>fenton</p><p>charles</p><p>daisy</p><p>alice</p><p>erica</p><p>fenton</p><p>charles</p>');
});

test( 'Reference expression resolvers survive a splice operation', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: `
			{{#rows:r}}
				{{#columns:c}}
					<p>{{columns[c]}}{{r}}{{rows[r][this]}}</p>
				{{/columns}}
				<strong>{{rows[r][selectedColumn]}}</strong>
			{{/rows}}`,
		data: {
			rows: [
				{ foo: 'a', bar: 'b', baz: 'c' },
				{ foo: 'd', bar: 'e', baz: 'f' },
				{ foo: 'g', bar: 'h', baz: 'i' }
			],
			columns: [ 'foo', 'bar', 'baz' ],
			selectedColumn: 'foo'
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>foo0a</p><p>bar0b</p><p>baz0c</p><strong>a</strong><p>foo1d</p><p>bar1e</p><p>baz1f</p><strong>d</strong><p>foo2g</p><p>bar2h</p><p>baz2i</p><strong>g</strong>' );

	ractive.get( 'rows' ).splice( 1, 1 );
	t.htmlEqual( fixture.innerHTML, '<p>foo0a</p><p>bar0b</p><p>baz0c</p><strong>a</strong><p>foo1g</p><p>bar1h</p><p>baz1i</p><strong>g</strong>');

	ractive.set( 'rows[1].foo', 'G' );
	t.htmlEqual( fixture.innerHTML, '<p>foo0a</p><p>bar0b</p><p>baz0c</p><strong>a</strong><p>foo1G</p><p>bar1h</p><p>baz1i</p><strong>G</strong>');

	ractive.get( 'columns' ).splice( 0, 1 );
	ractive.set( 'selectedColumn', 'baz' );
	t.htmlEqual( fixture.innerHTML, '<p>bar0b</p><p>baz0c</p><strong>c</strong><p>bar1h</p><p>baz1i</p><strong>i</strong>');
});

test( 'Option lists linked to arrays are updated when the array mutates', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<select>{{#options}}<option>{{this}}</option>{{/options}}</select>',
		data: {
			options: [ 'a', 'b', 'c' ]
		}
	});

	ractive.get( 'options' ).push( 'd' );
	t.htmlEqual( fixture.innerHTML, '<select><option value="a">a</option><option value="b">b</option><option value="c">c</option><option value="d">d</option></select>' );
});

// TODO reinstate this without using internal implementation details
// test( 'Event handlers in inside iterative sections should be rebound correctly', t => {
// 	let ractive = new Ractive({
// 		el: fixture,
// 		template: '{{#list}}<a on-click="foo(.)" />{{/}}}',
// 		data: { list: [ 1, 2, 3, 4 ] }
// 	});
//
// 	t.equal( ractive.fragment.items[0].fragments[3].items[0].eventHandlers[0].keypaths.length, 1 );
//
// 	ractive.splice( 'list', 2, 1 );
//
// 	t.equal( ractive.fragment.items[0].fragments[2].items[0].eventHandlers[0].keypaths.length, 1 );
// });

test( "Nested sections don't grow a context on rebind during smart updates #1737", t => {
	let ractive = new Ractive({
		el: fixture,
		template: `
			{{#each outer}}
				{{#each inner}}
					{{@keypath}}
					{{#if .foo || some.prop > 3}}
						<span>{{@keypath}}</span>
					{{/if}}
					<br/>
				{{/each}}
			{{/each}}`,
		data: {
			outer: [
				{
					inner: [ { foo: true }, 1 ]
				}
			],
			some: { prop: 10 }
		}
	});

	t.htmlEqual( fixture.innerHTML, 'outer.0.inner.0 <span>outer.0.inner.0</span><br/>outer.0.inner.1 <span>outer.0.inner.1</span><br/>' );

	ractive.unshift( 'outer', { inner: [ 0 ] } );

	t.htmlEqual( fixture.innerHTML, 'outer.0.inner.0 <span>outer.0.inner.0</span><br/>outer.1.inner.0 <span>outer.1.inner.0</span><br/>outer.1.inner.1 <span>outer.1.inner.1</span><br/>' );
});

test( 'Array updates cause sections to shuffle with correct results', t => {
	let ractive = new Ractive({
		el: fixture,
		template: '{{#each items}}{{.title}}{{#each .tags}}{{.}}{{/each}}{{/each}}',
		data: {
			items: [
				{ title: 'one', tags: [ 'A' ] },
				{ title: 'two', tags: [ 'B', 'C' ] }
			]
		}
	});

	t.htmlEqual( fixture.innerHTML, 'oneAtwoBC' );
	ractive.unshift( 'items', { title: 'three' } );
	t.htmlEqual( fixture.innerHTML, 'threeoneAtwoBC' );
});

// TODO reinstate this in some form. Commented out for purposes of #1740
// test( `Array shuffling only adjusts context and doesn't tear stuff down to rebuild it`, t => {
// 	let ractive = new Ractive({
// 		el: fixture,
// 		template: '{{#each items}}{{.name}}{{.name + "_expr"}}{{.[~/name]}}<span {{#.name}}ok{{/}} class="{{.name}}">{{.name}}</span>{{/each}}',
// 		data: { items: [ { name: 'foo' } ], name: 'name' }
// 	});

// 	t.htmlEqual( fixture.innerHTML, 'foofoo_exprfoo<span ok class="foo">foo</span>' );

// 	let iter = ractive.fragment.items[0].fragments[0],
// 		ref = iter.items[0],
// 		exp = iter.items[1],
// 		mem = iter.items[2],
// 		el = iter.items[3];

// 	// make sure these little suckers don't get re-rendered
// 	ref.node.data += 'a';
// 	exp.node.data += 'b';
// 	mem.node.data += 'c';

// 	ractive.unshift( 'items', { name: 'bar' } );

// 	t.htmlEqual( fixture.innerHTML, 'barbar_exprbar<span ok class="bar">bar</span>fooafoo_exprbfooc<span ok class="foo">foo</span>' );

// 	let shifted = ractive.fragment.items[0].fragments[1];
// 	t.strictEqual( iter, shifted );
// 	t.strictEqual( ref, shifted.items[0]);
// 	t.strictEqual( exp, shifted.items[1]);
// 	t.strictEqual( mem, shifted.items[2]);
// 	t.strictEqual( el, shifted.items[3]);
// });

function removedElementsTest ( action, fn ) {
	test( 'Array elements removed via ' + action + ' do not trigger updates in removed sections', function ( t ) {
		let observed = false, errored = false;

		expect( 5 );

		let ractive = new Ractive({
			debug: true,
			el: fixture,
			template: '{{#options}}{{.get(this)}}{{/options}}',
			data: {
				options: [ 'a', 'b', 'c' ],
				get: function ( item ){
					if (!item ) errored = true;
					return item;
				}
			}
		});

		ractive.observe( 'options.2', function ( n, o ) {
			t.ok( !n );
			t.equal( o, 'c' );
			observed = true;
		}, { init: false } );

		t.ok( !observed );

		fn( ractive );

		t.ok( observed );
		t.ok( !errored );
	});
}

removedElementsTest( 'splice', ractive => ractive.splice( 'options', 1, 1 ) );
removedElementsTest( 'merge', ractive => ractive.merge( 'options', [ 'a', 'c' ] ) );

test( 'popping from an empty array (#1665)', t => {
	let array = [];

	new Ractive({
		template: '{{array}}',
		data: { array },
		modifyArrays: true
	});

	expect( 0 );
	array.pop();
});
