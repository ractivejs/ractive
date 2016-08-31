import { test } from 'qunit';
import { initModule } from '../../test-config';

export default function() {
	initModule( 'plugins/adaptors/arrays.js' );

	const List = Ractive.extend({
		template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
		modifyArrays: true
	});

	test( 'array.push()', t => {
		const items = [ 'alice', 'bob', 'charles' ];

		new List({
			el: fixture,
			data: { items }
		});

		items.push( 'dave' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
	});

	test( 'array.pop()', t => {
		const items = [ 'alice', 'bob', 'charles' ];

		new List({
			el: fixture,
			data: { items }
		});

		items.pop();
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
	});

	test( 'array.shift()', t => {
		const items = [ 'alice', 'bob', 'charles' ];

		new List({
			el: fixture,
			data: { items }
		});

		items.shift();
		t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
	});

	test( 'array.unshift()', t => {
		const items = [ 'alice', 'bob', 'charles' ];

		new List({
			el: fixture,
			data: { items }
		});

		items.unshift( 'dave');
		t.htmlEqual( fixture.innerHTML, '<ul><li>dave</li><li>alice</li><li>bob</li><li>charles</li></ul>' );
	});

	test( 'array.splice()', t => {
		const items = [ 'alice', 'bob', 'charles' ];

		new List({
			el: fixture,
			data: { items }
		});

		items.splice( 1, 1, 'dave', 'eric' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>dave</li><li>eric</li><li>charles</li></ul>' );
	});

	test( 'Regression test for #425', t => {
		const items = [];

		new Ractive({
			el: fixture,
			template: '{{#items.length < limit}}<p>{{items.length}} / {{limit}}</p>{{/items.length < limit}}',
			data: {
				items,
				limit: 3
			},
			modifyArrays: true
		});

		t.htmlEqual( fixture.innerHTML, '<p>0 / 3</p>' );

		items.push( 'x', 'y' );
		t.htmlEqual( fixture.innerHTML, '<p>2 / 3</p>' );

		items.push( 'z' );
		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( 'Component bindings will survive a splice', t => {
		const Widget = Ractive.extend({
			template: '<p>{{person.name}}</p>'
		});

		let people = [
			{ name: 'alice' },
			{ name: 'bob' },
			{ name: 'charles' }
		];

		new Ractive({
			el: fixture,
			template: '{{#people}}<Widget person="{{this}}"/>{{/people}}',
			data: { people },
			components: { Widget },
			modifyArrays: true
		});

		t.htmlEqual( fixture.innerHTML, '<p>alice</p><p>bob</p><p>charles</p>');

		people.splice( 0, 0, { name: 'daisy' });
		t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>bob</p><p>charles</p>');

		people.splice( 2, 1, { name: 'erica' }, { name: 'fenton' });
		t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>erica</p><p>fenton</p><p>charles</p>');
	});

	test( 'Component \'backwash\' is prevented during a splice (#406)', t => {
		const Widget = Ractive.extend({
			template: '<p>{{person.name}}</p>'
		});

		const people = [
			{ name: 'alice' },
			{ name: 'bob' },
			{ name: 'charles' }
		];

		new Ractive({
			el: fixture,
			template: '{{#people}}<Widget person="{{this}}"/>{{/people}}{{#people}}<Widget person="{{this}}"/>{{/people}}',
			data: { people },
			components: { Widget },
			modifyArrays: true
		});

		t.htmlEqual( fixture.innerHTML, '<p>alice</p><p>bob</p><p>charles</p><p>alice</p><p>bob</p><p>charles</p>');

		people.splice( 0, 0, { name: 'daisy' });
		t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>bob</p><p>charles</p><p>daisy</p><p>alice</p><p>bob</p><p>charles</p>');

		people.splice( 2, 1, { name: 'erica' }, { name: 'fenton' });
		t.htmlEqual( fixture.innerHTML, '<p>daisy</p><p>alice</p><p>erica</p><p>fenton</p><p>charles</p><p>daisy</p><p>alice</p><p>erica</p><p>fenton</p><p>charles</p>');
	});

	test( 'Reference expression resolvers survive a splice operation', t => {
		const ractive = new Ractive({
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
			},
			modifyArrays: true
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

	test( 'Option lists linked to arrays are updated when the array mutates', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<select>{{#options}}<option>{{this}}</option>{{/options}}</select>',
			data: {
				options: [ 'a', 'b', 'c' ]
			},
			modifyArrays: true
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

	test( 'popping from an empty array (#1665)', t => {
		let array = [];

		new Ractive({
			template: '{{array}}',
			data: { array },
			modifyArrays: true
		});

		t.expect( 0 );
		array.pop();
	});
}
