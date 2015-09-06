import { test } from 'qunit';

test( 'Pattern observers on arrays fire correctly after mutations (mirror of test in observe.js)', t => {
	const ractive = new Ractive({
		data: {
			items: [ 'a', 'b', 'c' ]
		}
	});

	let lastKeypath;
	let lastValue;
	let observedLengthChange = false;

	ractive.observe( 'items.*', function ( n, o, k ) {
		lastKeypath = k;
		lastValue = n;

		if ( k === 'items.length' ) {
			observedLengthChange = true;
		}
	}, { init: false });

	ractive.push( 'items', 'd' );
	t.equal( lastKeypath, 'items.3' );
	t.equal( lastValue, 'd' );

	ractive.pop( 'items' );
	// TODO this appears to directly contradict related tests in observe.js???
	// t.equal( lastKeypath, 'items.3' );
	// t.equal( lastValue, undefined );

	t.ok( !observedLengthChange );

	ractive.set( 'items.length', 4 );
	t.ok( observedLengthChange );
});

test( '#if sections only render once when arrays are mutated', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#if list}}yes{{else}}no{{/if}}',
		data: {
			list: [ 'a', 'b', 'c' ]
		}
	});

	t.htmlEqual( fixture.innerHTML, 'yes' );

	ractive.push( 'list', 'd' );
	t.htmlEqual( fixture.innerHTML, 'yes' );

	ractive.splice( 'list', 0, 0, 'e', 'f' );
	t.htmlEqual( fixture.innerHTML, 'yes' );
});

test( 'Unbound sections disregard splice instructions (#967)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: `
			<ul>
				{{#list:i}}
					<li>{{.}}: {{#list}}{{.}}{{/}}</li>
				{{/list}}
			</ul>`,
		data: {
			list: [ 'a', 'b', 'c' ]
		}
	});

	ractive.splice( 'list', 1, 1 );
	t.htmlEqual( fixture.innerHTML, '<ul><li>a: ac</li><li>c: ac</li></ul>' );
});

test( 'Interpolators that directly reference arrays are updated on array mutation (#1074)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{letters}}',
		data: {
			letters: [ 'a', 'b', 'c' ]
		}
	});

	ractive.push( 'letters', 'd', 'e', 'f' );
	t.htmlEqual( fixture.innerHTML, 'a,b,c,d,e,f' );
});

test( 'unshift should make all indices update (#1729)', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{foo.0}}',
		data: { foo: [ 'first' ] }
	});

	t.htmlEqual( fixture.innerHTML, 'first' );
	ractive.unshift( 'foo', 'second' );
	t.htmlEqual( fixture.innerHTML, 'second' );
});

test( 'splice with net additions should make all indices greater than start update', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{foo.2}}',
		data: { foo: [ 0, 2 ] }
	});

	ractive.splice( 'foo', 1, 0, 1 );
	t.htmlEqual( fixture.innerHTML, '2' );
	ractive.splice( 'foo', 0, 1, 0, 'hello' );
	t.htmlEqual( fixture.innerHTML, '1' );
});

test( 'array modification with non-shuffle-able deps should update correctly', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#foo}}{{.}}{{/}}{{foo.0}}',
		data: { foo: [ 1, 2 ] }
	});

	t.htmlEqual( fixture.innerHTML, '121' );
	ractive.unshift( 'foo', 0 );
	t.htmlEqual( fixture.innerHTML, '0120' );
});

test( 'shifting an empty array', t => {
	t.expect( 0 );

	let ractive = new Ractive({
		template: '{{#items}}x{{/}}',
		el: 'main',
		data: {
			items: []
		}
	});

	ractive.shift( 'items' );
});


test( 'splice with one argument (#1943)', t => {
	let ractive = new Ractive({
		el: fixture,
		template: '{{#items}}{{this}}{{/}}',
		data: {
			items: [ 1, 2, 3 ]
		}
	});

	ractive.splice( 'items', 1 );

	t.htmlEqual( fixture.innerHTML, '1' );
});

test( 'Check for this.model existence when rebinding (#2114)', t => {
	let list = [ {} ];

	const ractive = new Ractive({
		el: fixture,
		template: `
			{{#each list}}
				{{#if bar}}yep{{else}}nope{{/if bar}}
			{{/each list}}`,
		data: { list }
	});

	ractive.unshift( 'list', { bar: true });
	t.equal( fixture.innerHTML, 'yepnope' );
});
