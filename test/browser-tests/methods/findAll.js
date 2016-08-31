import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/findAll.js' );

	test( 'findAll() gets an array of all nodes matching a selector', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div><div><div>{{foo}}</div></div></div>'
		});

		const divs = ractive.findAll( 'div' );
		t.equal( divs.length, 3 );
	});

	test( 'findAll() works with a string-only template', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div><p>foo</p><p>bar</p></div>'
		});

		const paragraphs = ractive.findAll( 'p' );

		t.ok( paragraphs.length === 2 );
		t.ok( paragraphs[0].innerHTML === 'foo' );
		t.ok( paragraphs[1].innerHTML === 'bar' );
	});

	test( 'findAll() with { live: true } gets an updating array of all nodes matching a selector', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
			data: {
				items: [ 'a', 'b', 'c' ]
			}
		});

		const lis = ractive.findAll( 'li', { live: true });
		t.equal( lis.length, 3 );

		ractive.push( 'items', 'd' );
		t.equal( lis.length, 4 );
	});

	test( 'Nodes belonging to components are removed from live queries when those components are torn down', t => {
		const Widget = Ractive.extend({
			template: '<div>this should be removed</div>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{#widgets}}<Widget/>{{/widgets}}',
			components: { Widget }
		});

		let divs = ractive.findAll( 'div', { live: true });
		t.equal( divs.length, 0 );

		[ 3, 2, 5, 10, 0 ].forEach( function ( length ) {
			ractive.set( 'widgets', new Array( length ) );
			t.equal( divs.length, length );
		});
	});

	test( 'ractive.findAll() throws error if instance is unrendered (#2008)', t => {
		const ractive = new Ractive({
			template: '<p>unrendered</p>'
		});

		t.throws( () => {
			ractive.findAll( 'p' );
		}, /Cannot call ractive\.findAll\('p', \.\.\.\) unless instance is rendered to the DOM/ );
	});
}
