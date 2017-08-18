import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

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

		r.toggle( 'show', { keep: true } );
		t.ok( initFrag === r.fragment.items[0].detached );
		t.ok( each === r.fragment.items[0].detached.items[0] );
		t.htmlEqual( fixture.innerHTML, '' );

		r.toggle( 'show' );
		t.ok( initFrag === r.fragment.items[0].fragment );
		t.ok( each === r.fragment.items[0].fragment.items[0] );
		t.htmlEqual( fixture.innerHTML, '<span>1</span><span>2</span>' );
		t.ok( cmp === r.findComponent( '*' ) );
	});

	test( `kept fragments aren't considered during find, findAll, and friends`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#if show}}<div /><cmp />{{/if}}`,
			data: { show: true },
			components: { cmp: Ractive.extend() }
		});

		const cmp = r.findComponent( 'cmp' );

		r.toggle( 'show', { keep: true } );
		t.ok( cmp );
		t.ok( r.find( 'div' ) === undefined );
		t.ok( r.findAll( 'div' ).length === 0 );
		t.ok( r.findComponent( 'cmp' ) === undefined );
		t.ok( r.findAllComponents( 'cmp' ).length === 0 );

		r.toggle( 'show' );
		t.ok( r.findAll( 'div' ).length, 'div element reappeared' );
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

		r.toggle( 'show', { keep: true } );
		t.htmlEqual( fixture.innerHTML, '' );

		r.toggle( 'show' );
		t.htmlEqual( fixture.innerHTML, '<div></div>text' );
	});

	test( `kept fragments properly re-render conditional attributes`, t => {
		const r = new Ractive({
			target: fixture,
			template: '{{#if show}}<div {{#if true}}class-foo{{/if}} />{{/if}}',
			data: {
				show: true
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div class="foo"></div>' );

		r.set( 'show', false, { keep: true } );
		r.toggle( 'show' );

		t.htmlEqual( fixture.innerHTML, '<div class="foo"></div>' );
	});

	test( `trying to shuffle set a keypath that doesn't exist yet should be equivalent to a plain set`, t => {
		const r = new Ractive({
			template: `{{#each list}}{{.}}{{/each}}`,
			target: fixture
		});

		r.set( 'list', [ 1, 2, 3 ], { shuffle: true } );

		t.htmlEqual( fixture.innerHTML, '123' );

		r.set( 'list', [ 4, 3, 6, 1 ], { shuffle: true } );

		t.htmlEqual( fixture.innerHTML, '4361' );
	});
}
