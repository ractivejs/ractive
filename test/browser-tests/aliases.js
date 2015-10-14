import { test } from 'qunit';

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

test( 'aliased complex computations are cached', t => {
	let normal = 0, aliased = 0;

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

// TODO: no idea why these fail in phantom an pass in browser, but they should probably pass both
if ( !/phantom/i.test( navigator.userAgent ) ) {
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
}
