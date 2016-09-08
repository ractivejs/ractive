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

	test( 'ractive.findAll() throws error if instance is unrendered (#2008)', t => {
		const ractive = new Ractive({
			template: '<p>unrendered</p>'
		});

		t.throws( () => {
			ractive.findAll( 'p' );
		}, /Cannot call ractive\.findAll\('p', \.\.\.\) unless instance is rendered to the DOM/ );
	});

	test( `cancelling a query is only advisory if there are multiple references`, t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}<div />{{/each}}',
			data: { items: [] }
		});

		const all = r.findAll( 'div', { live: true } );
		// these simulate other refs
		r.findAll( 'div', { live: true } );
		r.findAll( 'div', { live: true } );

		all.cancel();
		r.push( 'items', 0 );
		t.equal( all.length, 1 );

		all.cancel();
		r.push( 'items', 0 );
		t.equal( all.length, 2 );

		all.cancel();
		r.push( 'items', 0 );
		t.equal( all.length, 2 );
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

	test( 'findAll skips non-target instances by default', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '<div id="r1" />'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: '<div id="r2" />'
		});

		r1.attachChild( r2 );

		const all = r1.findAll( 'div' );

		t.equal( all.length, 1 );
		t.strictEqual( all[0], r1.find( '#r1' ) );
	});

	test( 'findAll searches non-targeted attached children, when asked, last', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '<div id="r1" />'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: '<div id="r2" />'
		});

		r1.attachChild( r2 );

		const all = r1.findAll( 'div', { remote: true } );

		t.equal( all.length, 2 );
		t.strictEqual( all[0], r1.find( '#r1' ) );
		t.strictEqual( all[1], r2.find( '#r2' ) );
	});

	test( 'findAll searches targeted attached children in order', t => {
		const r1 = new Ractive({
			el: fixture,
			template: '{{>>anchor}}<div id="r1" />'
		});
		const r2 = new Ractive({
			template: '<div id="r2" />'
		});

		r1.attachChild( r2, { target: 'anchor' } );

		const all = r1.findAll( 'div' );

		t.equal( all.length, 2 );
		t.strictEqual( all[1], r1.find( '#r1' ) );
		t.strictEqual( all[0], r2.find( '#r2' ) );
	});

	test( 'live findAll searches with attached children stay up to date', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '{{>>anchor}}<div id="r1" />'
		});
		const r2 = new Ractive({
			template: '<div id="r2" />'
		});
		const r3 = new Ractive({
			el: fixture.children[1],
			template: '<div id="r3" />'
		});

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		const all = r1.findAll( 'div', { live: true } );

		t.equal( all.length, 2 );
		t.strictEqual( all[1], r1.find( '#r1' ) );
		t.strictEqual( all[0], r2.find( '#r2' ) );

		r1.detachChild( r3 );
		t.equal( all.length, 2 );

		r1.detachChild( r2 );
		t.equal( all.length, 1 );
		t.strictEqual( all[0], r1.find( '#r1' ) );

		r1.attachChild( r3 );
		t.equal( all.length, 1 );

		r1.attachChild( r2, { target: 'anchor' } );
		t.equal( all.length, 2 );
		t.strictEqual( all[1], r1.find( '#r1' ) );
		t.strictEqual( all[0], r2.find( '#r2' ) );
	});

	test( 'live findAll searches with attached children and remotes stay up to date', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '{{>>anchor}}<div id="r1" />'
		});
		const r2 = new Ractive({
			template: '<div id="r2" />'
		});
		const r3 = new Ractive({
			el: fixture.children[1],
			template: '<div id="r3" />'
		});

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		const all = r1.findAll( 'div', { live: true, remote: true } );

		t.equal( all.length, 3 );
		t.strictEqual( all[1], r1.find( '#r1' ) );
		t.strictEqual( all[0], r2.find( '#r2' ) );
		t.strictEqual( all[2], r3.find( '#r3' ) );

		r1.detachChild( r3 );
		t.equal( all.length, 2 );
		t.strictEqual( all[1], r1.find( '#r1' ) );
		t.strictEqual( all[0], r2.find( '#r2' ) );

		r1.detachChild( r2 );
		t.equal( all.length, 1 );
		t.strictEqual( all[0], r1.find( '#r1' ) );

		r1.attachChild( r3 );
		t.equal( all.length, 2 );
		t.strictEqual( all[0], r1.find( '#r1' ) );
		t.strictEqual( all[1], r3.find( '#r3' ) );

		r1.attachChild( r2, { target: 'anchor' } );
		t.equal( all.length, 3 );
		t.strictEqual( all[1], r1.find( '#r1' ) );
		t.strictEqual( all[0], r2.find( '#r2' ) );
		t.strictEqual( all[2], r3.find( '#r3' ) );
	});

	test( 'live queries update with deeply nested elements correctly', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const cmp = Ractive.extend({
			template: '<div class="cmp" />'
		});
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '{{>>anchor}}<div id="r1" />'
		});
		const r2 = new Ractive({
			template: '<div id="r2" /><cmp />',
			components: { cmp }
		});
		const r3 = new Ractive({
			el: fixture.children[1],
			template: '<div id="r3" /><cmp />',
			components: { cmp }
		});

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		let q1 = r1.findAll( 'div', { live: true } );
		let q2 = r1.findAll( 'div', { live: true, remote: true } );

		t.equal( q1.length, 3 );
		t.equal( q2.length, 5 );

		r1.detachChild( r2 );
		r1.detachChild( r3 );

		t.equal( q1.length, 1 );
		t.equal( q2.length, 1 );

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		t.equal( q1.length, 3 );
		t.equal( q2.length, 5 );
	});
}
