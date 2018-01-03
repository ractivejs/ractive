import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

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

	test( 'ractive.find() throws error if instance is unrendered (#2008)', t => {
		const ractive = new Ractive({
			template: '<p>unrendered</p>'
		});

		t.throws( () => {
			ractive.find( 'p' );
		}, /Cannot call ractive\.find\('p'\) unless instance is rendered to the DOM/ );
	});


	test( `find() finds elements in targeted attached children`, t => {
		const r1 = new Ractive({
			template: '<div id="r1"></div>'
		});
		const r2 = new Ractive({
			el: fixture,
			template: '{{#if show}}<div id="r2"></div>{{/if}}<#foo />',
			data: {
				show: true
			}
		});

		r2.attachChild( r1, { target: 'foo' } );

		t.ok( r2.find( 'div' ).id === 'r2' );
		r2.set( 'show', false );
		t.ok( r2.find( 'div' ).id === 'r1' );
	});

	test( `find() doesn't find elements in non-targeted attached children by default`, t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '<div id="r1"></div>'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: '{{#if show}}<div id="r2"></div>{{/if}}<#foo />',
			data: {
				show: true
			}
		});

		r2.attachChild( r1 );

		t.ok( r2.find( 'div' ).id === 'r2' );
		r2.set( 'show', false );
		t.ok( r2.find( 'div' ) === undefined );
	});

	test( `find() finds elements in non-targeted attached children when asked to`, t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '<div id="r1"></div>'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: '{{#if show}}<div id="r2"></div>{{/if}}<#foo />',
			data: {
				show: true
			}
		});

		r2.attachChild( r1 );

		t.ok( r2.find( 'div', { remote: true } ).id === 'r2' );
		r2.set( 'show', false );
		t.ok( r2.find( 'div', { remote: true } ).id === 'r1' );
	});

	test( `find() finds elements in triples`, t => {
		const r = new Ractive({
			target: fixture,
			template: '{{{bar}}}{{{foo}}}',
			data: {
				foo: '<div><a /></div>',
				bar: '<section />'
			}
		});

		t.ok( r.find( 'a' ) );
	});
}
