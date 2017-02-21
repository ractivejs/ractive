import { initModule } from '../../helpers/test-config';
import { fire } from 'simulant';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/unshift.js' );

	[ true, false ].forEach( modifyArrays => {
		test( `ractive.unshift() (modifyArrays: ${modifyArrays})`, t => {
			const items = [ 'alice', 'bob', 'charles' ];

			const ractive = new Ractive({
				el: fixture,
				template: `
				<ul>
				{{#items}}
				<li>{{.}}</li>
				{{/items}}
				</ul>`,
				data: { items }
			});

			ractive.unshift( 'items', 'dave');
			t.htmlEqual( fixture.innerHTML, '<ul><li>dave</li><li>alice</li><li>bob</li><li>charles</li></ul>' );
		});
	});

	test( 'unshift should make all indices update (#1729)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{foo.0}}',
			data: { foo: [ 'first' ] }
		});

		t.htmlEqual( fixture.innerHTML, 'first' );
		ractive.unshift( 'foo', 'second' );
		t.htmlEqual( fixture.innerHTML, 'second' );
	});

	test( 'array modification with non-shuffle-able deps should update correctly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}{{.}}{{/}}{{foo.0}}',
			data: { foo: [ 1, 2 ] }
		});

		t.htmlEqual( fixture.innerHTML, '121' );
		ractive.unshift( 'foo', 0 );
		t.htmlEqual( fixture.innerHTML, '0120' );
	});

	test( 'Check for this.model existence when rebinding (#2114)', t => {
		const list = [ {} ];

		const ractive = new Ractive({
			el: fixture,
			template: `
			{{#each list}}
			{{#if bar}}yep{{else}}nope{{/if bar}}
			{{/each list}}`,
			data: { list }
		});

		ractive.unshift( 'list', { bar: true });
		t.equal( fixture.innerHTML, 'yepnope' );
	});

	test( 'Nested sections don\'t grow a context on rebind during smart updates #1737', t => {
		const ractive = new Ractive({
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
		const ractive = new Ractive({
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

	test( 'nested contexts in iterative sections update correctly (#2660)', t => {
		t.expect( 1 );

		const r = new Ractive({
			el: fixture,
			template: '{{#each outer}}{{#each .inner}}<button on-click="@this.check(event)">check</button>{{/each}}{{/each}}',
			data: {
				outer: [
					{ inner: [ {} ] }
				]
			},
			check ( ev ) {
				t.equal( ev.resolve(), 'outer.1.inner.0' );
			}
		});

		r.unshift( 'outer', { inner: [ {} ] } );
		const btn = r.findAll( 'button' )[1];

		fire( btn, 'click' );
	});
}
