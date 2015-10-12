import { test } from 'qunit';

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
