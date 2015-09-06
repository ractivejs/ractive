import { test } from 'qunit';

test( 'find() works with a string-only template', function ( t ) {
	var ractive;

	ractive = new Ractive({
		el: fixture,
		template: '<p>foo</p><p>bar</p>'
	});

	t.ok( ractive.find( 'p' ).innerHTML === 'foo' );
});

test( 'find() works with a template containing mustaches', function ( t ) {
	var ractive;

	ractive = new Ractive({
		el: fixture,
		template: '<p>{{foo}}</p><p>{{bar}}</p>',
		data: { foo: 'one', bar: 'two' }
	});

	t.ok( ractive.find( 'p' ).innerHTML === 'one' );
});

test( 'find() works with nested elements', function ( t ) {
	var ractive;

	ractive = new Ractive({
		el: fixture,
		template: '<div class="outer"><div class="inner"><p>{{foo}}</p><p>{{bar}}</p></div></div>',
		data: { foo: 'one', bar: 'two' }
	});

	t.ok( ractive.find( 'p' ).innerHTML === 'one' );
});

test( 'A live query maintains the correct sort order after a merge operation', function ( t ) {
	var ractive, lis, getHtml;

	ractive = new Ractive({
		el: fixture,
		template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
		data: {
			items: [ 'a', 'b', 'c', 'd' ]
		}
	});

	getHtml = function ( node ) {
		return node.innerHTML;
	};

	lis = ractive.findAll( 'li', { live: true });
	t.deepEqual( lis.map( getHtml ), [ 'a', 'b', 'c', 'd' ] );

	ractive.merge( 'items', [ 'c', 'b', 'a', 'd' ] );
	t.deepEqual( lis.map( getHtml ), [ 'c', 'b', 'a', 'd' ] );
});

test( 'ractive.find() and ractive.findAll() work inside an onchange handler (#1541)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: `
			{{#each items}}
				<p>{{this}}</p>
			{{/each}}`,
		data: {
			items: []
		}
	});

	expect( 2 );

	ractive.on( 'change', function () {
		var node, nodes;

		node = ractive.find( 'p' );
		nodes = ractive.findAll( 'p' );

		t.equal( node, null );
		t.equal( nodes.length, 0 );
	});

	ractive.set( 'items', [ 'foo', 'bar', 'baz' ] );
});


// TODO add tests (and add the functionality)...
// * cancelling a live query (also, followed by teardown)
// * components
// * a load of other stuff
