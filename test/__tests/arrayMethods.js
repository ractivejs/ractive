module( 'Array methods' );

var baseItems = [ 'alice', 'bob', 'charles' ];

[ true, false ].forEach( modifyArrays => {
	var List = Ractive.extend({
		template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
		modifyArrays: modifyArrays
	});

	test( 'ractive.push() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
		var items, ractive;

		items = baseItems.slice();

		ractive = new List({
			el: fixture,
			data: { items: items }
		});

		ractive.push( 'items', 'dave' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
	});

	asyncTest( 'ractive.pop() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
		var items, ractive;

		items = baseItems.slice();
		expect(2);

		ractive = new List({
			el: fixture,
			data: { items: items }
		});

		ractive.pop( 'items' ).then( function(v) {
			t.strictEqual( v, 'charles' );
			QUnit.start();
		} );
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
	});

	asyncTest( 'ractive.shift() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
		var items, ractive;

		items = baseItems.slice();
		expect(2);

		ractive = new List({
			el: fixture,
			data: { items: items }
		});

		ractive.shift( 'items' ).then( function(v) {
			t.strictEqual( v, 'alice' );
			QUnit.start();
		} );
		t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
	});

	test( 'ractive.unshift() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
		var items, ractive;

		items = baseItems.slice();

		ractive = new List({
			el: fixture,
			data: { items: items }
		});

		ractive.unshift( 'items', 'dave');
		t.htmlEqual( fixture.innerHTML, '<ul><li>dave</li><li>alice</li><li>bob</li><li>charles</li></ul>' );
	});

	asyncTest( 'ractive.splice() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
		var items, ractive;

		items = baseItems.slice();
		expect(5);

		ractive = new List({
			el: fixture,
			data: { items: items }
		});

		ractive.splice( 'items', 1, 1, 'dave', 'eric' ).then( function(v) {
			t.deepEqual( v, [ 'bob' ] );
			QUnit.start();
		} );
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>dave</li><li>eric</li><li>charles</li></ul>' );

		// removing before the beginning removes from the beginning
		ractive.splice( 'items', -10, 1, 'john' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>john</li><li>dave</li><li>eric</li><li>charles</li></ul>' );

		// removing beyond the end is a noop
		ractive.splice( 'items', 10, 1, 'larry' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>john</li><li>dave</li><li>eric</li><li>charles</li><li>larry</li></ul>' );

		// negative indexing within bounds starts from the end
		ractive.splice( 'items', -1, 1 );
		t.htmlEqual( fixture.innerHTML, '<ul><li>john</li><li>dave</li><li>eric</li><li>charles</li></ul>' );
	});

	test( 'ractive.reverse() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
		var items, ractive;

		items = baseItems.slice();

		ractive = new List({
			el: fixture,
			data: { items: items }
		});

		ractive.reverse( 'items' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>charles</li><li>bob</li><li>alice</li></ul>' );
	});

	test( 'ractive.sort() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
		var items, ractive;

		items = baseItems.slice();

		ractive = new List({
			el: fixture,
			data: { items: items }
		});

		ractive.sort( 'items', function ( a, b ) {
			return a.length - b.length;
		});
		t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>alice</li><li>charles</li></ul>' );
	});
});

asyncTest( 'Array method proxies return a promise that resolves on transition complete', function ( t ) {
	var items, ractive;

	items = baseItems.slice();

	ractive = new Ractive({
		el: fixture,
		template: '<ul>{{#items}}<li intro="test">{{.}}</li>{{/items}}</ul>',
		data: { items: items },
		transitions: {
			test: function ( t ) {
				setTimeout( t.complete, 50 );
			}
		}
	});

	expect( 1 );

	ractive.push( 'items', 'dave' ).then( function () {
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
		QUnit.start();
	});
});

test( 'Pattern observers on arrays fire correctly after mutations (mirror of test in observe.js)', function ( t ) {
	var ractive, lastKeypath, lastValue, observedLengthChange;

	ractive = new Ractive({
		data: {
			items: [ 'a', 'b', 'c' ]
		}
	});

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
	t.equal( lastKeypath, 'items.3' );
	t.equal( lastValue, undefined );

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
