import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/find.js' );

	test( 'find() works with a string-only template', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<p>foo</p><p>bar</p>'
		});

		t.ok( ractive.find( 'p' ).innerHTML === 'foo' );
	});

	test( 'find() works with a template containing mustaches', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<p>{{foo}}</p><p>{{bar}}</p>',
			data: { foo: 'one', bar: 'two' }
		});

		t.ok( ractive.find( 'p' ).innerHTML === 'one' );
	});

	test( 'find() works with nested elements', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div class="outer"><div class="inner"><p>{{foo}}</p><p>{{bar}}</p></div></div>',
			data: { foo: 'one', bar: 'two' }
		});

		t.ok( ractive.find( 'p' ).innerHTML === 'one' );
	});

	test( 'A live query maintains the correct sort order after a merge operation', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
			data: {
				items: [ 'a', 'b', 'c', 'd' ]
			}
		});

		function getHtml ( node ) {
			return node.innerHTML;
		}

		const lis = ractive.findAll( 'li', { live: true });
		t.deepEqual( lis.map( getHtml ), [ 'a', 'b', 'c', 'd' ] );

		ractive.merge( 'items', [ 'c', 'b', 'a', 'd' ] );
		t.deepEqual( lis.map( getHtml ), [ 'c', 'b', 'a', 'd' ] );
	});

	test( 'ractive.find() and ractive.findAll() work inside an onchange handler (#1541)', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each items}}
					<p>{{this}}</p>
				{{/each}}`,
			data: {
				items: []
			}
		});

		ractive.on( 'change', () => {
			const node = ractive.find( 'p' );
			const nodes = ractive.findAll( 'p' );

			t.equal( node, null );
			t.equal( nodes.length, 0 );
		});

		ractive.set( 'items', [ 'foo', 'bar', 'baz' ] );
	});

	test( 'ractive.find() throws error if instance is unrendered (#2008)', t => {
		const ractive = new Ractive({
			template: '<p>unrendered</p>'
		});

		t.throws( () => {
			ractive.find( 'p' );
		}, /Cannot call ractive\.find\('p'\) unless instance is rendered to the DOM/ );
	});


	// TODO add tests (and add the functionality)...
	// * cancelling a live query (also, followed by teardown)
	// * components
	// * a load of other stuff
}
