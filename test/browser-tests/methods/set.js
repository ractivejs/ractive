import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/set.js' );

	test( `deep set merges data into the existing model tree`, t => {
		const r = new Ractive({
			data: { foo: { bar: 42, bip: 'yep' } }
		});

		r.set( 'foo', { bar: { bat: 42 }, baz: [ true ] }, { deep: true } );
		t.deepEqual( r.get( 'foo' ), { bar: { bat: 42 }, bip: 'yep', baz: [ true ] } );
	});

	test( `deep setting with numeric keys will update array indices`, t => {
		const r = new Ractive({
			data: { foo: [ 1, 2, 3 ] }
		});

		r.set( '', { foo: { 1: 42 } }, { deep: true } );
		t.deepEqual( r.get( 'foo' ), [ 1, 42, 3 ] );

		r.set( '', { foo: [ 99 ] }, { deep: true } );
		t.deepEqual( r.get( 'foo' ), [ 99, 42, 3 ] );
	});

	test( `keep set does not discard vdom or dom, where non-keep does`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#if show}}{{#each [1,2]}}<span>{{.}}</span>{{/each}}<cmp />{{/if}}`,
			data: { show: true },
			components: { cmp: Ractive.extend() }
		});

		const initFrag = r.fragment.items[0].fragment; // conditional fragment
		const each = initFrag.items[0];
		const cmp = r.findComponent( '*' );
		const span1 = r.find( 'span' );

		r.toggle( 'show', { keep: true } );
		t.ok( initFrag === r.fragment.items[0].detached );
		t.ok( each === r.fragment.items[0].detached.items[0] );
		t.htmlEqual( fixture.innerHTML, '' );

		r.toggle( 'show' );
		t.ok( initFrag === r.fragment.items[0].fragment );
		t.ok( each === r.fragment.items[0].fragment.items[0] );
		t.htmlEqual( fixture.innerHTML, '<span>1</span><span>2</span>' );
		t.ok( span1 === r.find( 'span' ) );
		t.ok( cmp === r.findComponent( '*' ) );
	});

	test( `kept fragments aren't considered during find, findAll, and friends`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#if show}}<div /><cmp />{{/if}}`,
			data: { show: true },
			components: { cmp: Ractive.extend() }
		});

		const div = r.find( 'div' );
		const cmp = r.findComponent( 'cmp' );

		r.toggle( 'show', { keep: true } );
		t.ok( cmp );
		t.ok( r.find( 'div' ) === undefined );
		t.ok( r.findAll( 'div' ).length === 0 );
		t.ok( r.findComponent( 'cmp' ) === undefined );
		t.ok( r.findAllComponents( 'div' ).length === 0 );

		r.toggle( 'show' );
		t.ok( div === r.find( 'div' ), 'div element is same' );
		t.ok( cmp === r.findComponent( 'cmp' ), 'cmp instance is same' );
	});

	test( `kept fragments still intro and outro`, t => {
		let count = 0;

		const r = new Ractive({
			target: fixture,
			template: `{{#if show}}<div go-in-out />{{/if}}`,
			data: { show: true },
			transitions: {
				go ( trans ) {
					count++;
					trans.complete();
				}
			}
		});

		t.equal( count, 1 );

		r.toggle( 'show', { keep: true } );
		t.equal( count, 2 );

		r.toggle( 'show' );
		t.equal( count, 3 );
	});

	test( `kept fragments with triples work correctly`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#if show}}{{{html}}}{{/if}}`,
			data: {
				show: true,
				html: '<div></div>text'
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div></div>text' );

		const div = r.find( 'div' );
		const txt = fixture.childNodes[1];

		r.toggle( 'show', { keep: true } );
		t.htmlEqual( fixture.innerHTML, '' );

		r.toggle( 'show' );
		t.htmlEqual( fixture.innerHTML, '<div></div>text' );

		t.ok( div === r.find( 'div' ) );
		t.ok( fixture.childNodes[1] === txt );
	});
}
