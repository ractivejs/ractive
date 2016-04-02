import { test } from 'qunit';
import { fire } from 'simulant';

[ true, false ].forEach( modifyArrays => {
	test( `ractive.splice() (modifyArrays: ${modifyArrays})`, t => {
		t.expect( 5 );

		const done = t.async();

		let items = [ 'alice', 'bob', 'charles' ];

		const ractive = new Ractive({
			el: fixture,
			template: `
				<ul>
					{{#items}}
						<li>{{.}}</li>
					{{/items}}
				</ul>`,
			data: { items }
		});

		ractive.splice( 'items', 1, 1, 'dave', 'eric' ).then( v => {
			t.deepEqual( v, [ 'bob' ] );
			done();
		});
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
});

test( 'Unbound sections disregard splice instructions (#967)', t => {
	const ractive = new Ractive({
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

test( 'splice with net additions should make all indices greater than start update', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '{{foo.2}}',
		data: { foo: [ 0, 2 ] }
	});

	ractive.splice( 'foo', 1, 0, 1 );
	t.htmlEqual( fixture.innerHTML, '2' );
	ractive.splice( 'foo', 0, 1, 0, 'hello' );
	t.htmlEqual( fixture.innerHTML, '1' );
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

test( 'a nested object iteration should rebind with an outer array iteration when it is spliced (#2321)', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#each arr}}{{#each .obj:k}}{{k}}-{{.}}{{/each}}{{/each}}`,
		data: {
			arr: [ { obj: { name: 'Rich ' } }, { obj: { name: 'Marty ' } } ]
		}
	});

	t.htmlEqual( fixture.innerHTML, 'name-Rich name-Marty' );
	r.splice( 'arr', 0, 1 );
	t.htmlEqual( fixture.innerHTML, 'name-Marty' );
});

test( 'splicing should not make node index info get out of sync (#2400)', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#each arr:i}}<span>{{.}}</span>{{/each}}`,
		data: { arr: [ 1, 2, 3 ] }
	});

	t.equal( Ractive.getNodeInfo( r.findAll( 'span' )[1] ).index.i, 1 );
	r.unshift( 'arr' );
	t.equal( Ractive.getNodeInfo( r.findAll( 'span' )[1] ).index.i, 1 );
});

test( 'splicing should not make event index info get out of sync (#2399)', t => {
	t.expect( 2 );

	const r = new Ractive({
		el: fixture,
		template: `{{#each arr:i}}<span on-click="go">{{.}}</span>{{/each}}`,
		data: { arr: [ 1, 2, 3 ] }
	});


	r.on( 'go', ev => {
		t.equal( ev.index.i, 1 );
	});

	fire( r.findAll( 'span' )[1], 'click' );
	r.unshift( 'arr' );
	fire( r.findAll( 'span' )[1], 'click' );
});
