import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

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

	test( 'ractive.findAll() throws error if instance is unrendered (#2008)', t => {
		const ractive = new Ractive({
			template: '<p>unrendered</p>'
		});

		t.throws( () => {
			ractive.findAll( 'p' );
		}, /Cannot call ractive\.findAll\('p', \.\.\.\) unless instance is rendered to the DOM/ );
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
			template: '<#anchor /><div id="r1" />'
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

	test( `findAll() finds elements in triples`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{{foo}}}{{{bar}}}`,
			data: {
				foo: '<div><a /><a /><span><a /></span></div>',
				bar: '<section />'
			}
		});

		t.ok( r.findAll( 'a' ).length === 3 );
	});
}
