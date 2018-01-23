import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'aliases' );

	/* global navigator */

	test( 'simple template aliases', t => {
		new Ractive({
			el: fixture,
			template: '{{#with foo.bar.baz as bar, bippy.boppy as boop}}{{bar}} {{boop}}{{/with}}',
			data: {
				foo: { bar: { baz: 'yep' } },
				bippy: { boppy: 'works' }
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep works' );
	});

	test( 'aliased computations', t => {
		new Ractive({
			el: fixture,
			template: `{{#with 3 * 2 + 10 as num}}{{num}}{{/with}}`
		});

		t.htmlEqual( fixture.innerHTML, '16' );
	});

	test( '@index refs can be aliased', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}{{#with @index as idx}}{{idx}}{{/with}}{{/each}}',
			data: { items: [1, 2, 3] }
		});

		t.htmlEqual( fixture.innerHTML, '012' );
		r.splice( 'items', 1, 0, 99 );
		t.htmlEqual( fixture.innerHTML, '0123' );
	});

	test( '@key refs can be aliased', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}{{#with @key as idx}}{{idx}}{{/with}}{{/each}}',
			data: { items: { foo: 1, bar: 2, baz: 3 } }
		});

		t.htmlEqual( fixture.innerHTML, 'foobarbaz' );
		r.set( 'items.bat', 99 );
		t.htmlEqual( fixture.innerHTML, 'foobarbazbat' );
	});

	test( '@keypath refs can be aliased', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}{{#with @keypath as idx}}{{idx}}{{/with}}{{/each}}',
			data: { items: [1, 2, 3] }
		});

		t.htmlEqual( fixture.innerHTML, 'items.0items.1items.2' );
		r.splice( 'items', 1, 0, 99 );
		t.htmlEqual( fixture.innerHTML, 'items.0items.1items.2items.3' );
	});

	test( 'aliased complex computations are cached', t => {
		let normal = 0;
		let aliased = 0;

		new Ractive({
			el: fixture,
			template: `
				{{#if normal()}}{{JSON.stringify(normal())}}{{/if}}
				{{#with aliased() as thing}}{{JSON.stringify(thing)}}{{/with}}
			`,
			data: {
				normal() { normal++; return true; },
				aliased() { aliased++; return true; }
			}
		});

		t.htmlEqual( fixture.innerHTML, 'true true' );
		t.equal( normal, 2 );
		t.equal( aliased, 1 );
	});

	test( `expression aliases that have deps pop in and out of existence don't teardown until their alias block does`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#with foo + 'a' as str}}{{#if bar}}{{str}}{{/if}}{{/with}}`,
			data: {
				foo: 1,
				bar: true
			}
		});

		t.htmlEqual( fixture.innerHTML, '1a' );
		r.toggle( 'bar' );
		r.set( 'foo', 42 );
		r.toggle( 'bar' );
		t.htmlEqual( fixture.innerHTML, '42a' );
	});

	test( 'unresolved aliases should resolve if a suitable model appears', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#with foo.bar as baz}}{{baz}}{{/with}}'
		});

		t.htmlEqual( fixture.innerHTML, '' );
		r.set( 'foo', { bar: 'yep' } );
		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( 'multiple nested aliases', t => {
		new Ractive({
			el: fixture,
			template:`
				{{#each items as item}}{{#if item.foo}}
					{{#with @keypath as key, item.foo as v1}}
						{{#each v1.bar as v2}}{{#with @keypath as key2}}
							{{#each v2.baz}}{{key}} {{key2}} {{.}}{{/each}}
						{{/with}}{{/each}}
					{{/with}}
				{{/if}}{{/each}}
			`,
			data: {
				items: [
					{ foo: { bar: [ { baz: [ 1 ] } ] } },
					{ foo: { bar: [ { baz: [ 2 ] } ] } },
					{ foo: { bar: [ { baz: [ 3 ] } ] } }
				]
			}
		});

		t.htmlEqual( fixture.innerHTML, 'items.0 items.0.foo.bar.0 1items.1 items.1.foo.bar.0 2items.2 items.2.foo.bar.0 3' );
	});

	test( 'basic aliased array iteration', t => {
		new Ractive({
			el: fixture,
			template: `{{#each items as item:i}}|{{i+1}}-{{item}}{{/each}}`,
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.htmlEqual( fixture.innerHTML, '|1-a|2-b|3-c' );
	});

	test( 'basic aliased object iteration', t => {
		new Ractive({
			el: fixture,
			template: `{{#each items as item:k,i}}|{{k}}-{{i+1}}-{{item}}{{/each}}`,
			data: { items: { k1: 'a', k2: 'b', k3: 'c' } }
		});

		t.htmlEqual( fixture.innerHTML, '|k1-1-a|k2-2-b|k3-3-c' );
	});

	test( 'aliased array iteration shuffle', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items as item:i}}|{{i+1}}-{{item}}{{/each}}`,
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.htmlEqual( fixture.innerHTML, '|1-a|2-b|3-c' );

		r.splice( 'items', 1, 0, 'd' );

		t.htmlEqual( fixture.innerHTML, '|1-a|2-d|3-b|4-c' );
	});

	test( `aliases survive shuffling`, t => {
		const r = new Ractive({
			target: fixture,
			template: '{{#each items as item}}{{#with item.foo as foo}}{{foo}}{{/with}}{{/each}}',
			data: {
				items: [
					{ foo: 1 }
				]
			}
		});

		t.htmlEqual( fixture.innerHTML, '1' );

		r.unshift( 'items', { foo: 2 } );
		t.htmlEqual( fixture.innerHTML, '21' );
	});

	test( `explicit aliases survive rebinding`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#with foo.0.bar as baz}}{{#if flip}}{{baz}}{{else}}{{baz}}{{/if}}{{/with}}`,
			data: {
				foo: [ { bar: '?' } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '?' );

		r.unshift( 'foo', { bar: 'yep' } );
		t.htmlEqual( fixture.innerHTML, 'yep' );

		r.toggle( 'flip' );
		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( `partial aliases survive rebinding`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{>p foo.0.bar as baz}}`,
			data: {
				foo: [ { bar: '?' } ]
			},
			partials: {
				p: '{{#if flip}}{{baz}}{{else}}{{baz}}{{/if}}'
			}
		});

		t.htmlEqual( fixture.innerHTML, '?' );

		r.unshift( 'foo', { bar: 'yep' } );
		t.htmlEqual( fixture.innerHTML, 'yep' );

		r.toggle( 'flip' );
		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( `nested iteration aliases survive rebinding`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#each list as outer}}{{#each outer.sub as inner}}{{#if flip}}{{outer.a}}{{inner.a}}{{else}}{{outer.a}}{{inner.a}}{{/if}}{{/each}}{{/each}}`,
			data: {
				list: [ { a: 'out1', sub: [ { a: 'in1' } ] } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, 'out1in1' );

		r.unshift( 'list', { a: 'out2', sub: [ { a: 'in2' } ] } );
		t.htmlEqual( fixture.innerHTML, 'out2in2out1in1' );
		r.unshift( 'list.1.sub', { a: 'in3' } );
		t.htmlEqual( fixture.innerHTML, 'out2in2out1in3out1in1' );
		r.toggle( 'flip' );
		t.htmlEqual( fixture.innerHTML, 'out2in2out1in3out1in1' );
	});
}
