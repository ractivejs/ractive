import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'await' );

	test( `await with non-promise`, t => {
		new Ractive({
			target: fixture,
			template: '{{#await foo}}wait{{then val}}done: {{val}}{{/await}}',
			data: { foo: 42 }
		});

		t.htmlEqual( fixture.innerHTML, 'done: 42' );
	});

	test( `await with a swapped out promise`, t => {
		const done = t.async();
		t.expect( 4 );

		const r = new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then}}done{{catch}}error{{/await}}',
			data: {
				promise: 42
			}
		});

		t.htmlEqual( fixture.innerHTML, 'done' );

		let ok;
		let pr = new Promise( y => {
			ok = y;
		});

		r.set( 'promise', pr );

		t.htmlEqual( fixture.innerHTML, 'wait' );
		ok( 99 );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, 'done' );

			pr = Promise.reject( 'nope' );
			r.set( 'promise', pr );

			pr.then( null, () => {
				t.htmlEqual( fixture.innerHTML, 'error' );
				done();
			});
		});
	});

	test( `await with a resolution`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.resolve( 42 );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then val}}{{val}}{{catch e}}{{e}}{{/await}}',
			data: { promise: pr }
		});

		t.htmlEqual( fixture.innerHTML, 'wait' );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, '42' );
			done();
		});
	});

	test( `await with a rejection`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.reject( 42 );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then val}}{{val}}{{catch e}}{{e}}{{/await}}',
			data: { promise: pr }
		});

		t.htmlEqual( fixture.innerHTML, 'wait' );

		pr.then( null, () => {
			t.htmlEqual( fixture.innerHTML, '42' );
			done();
		});
	});

	test( `await resolution with no then`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.resolve( 42 );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{catch e}}{{e}}{{/await}}',
			data: { promise: pr }
		});

		t.htmlEqual( fixture.innerHTML, 'wait' );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, '' );
			done();
		});
	});

	test( `await rejection with no catch`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.reject( 42 );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then val}}{{val}}{{/await}}',
			data: { promise: pr }
		});

		t.htmlEqual( fixture.innerHTML, 'wait' );

		pr.then( null, () => {
			t.htmlEqual( fixture.innerHTML, '' );
			done();
		});
	});

	test( `await with no pending template`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.resolve( 42 );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}{{then val}}{{val}}{{/await}}',
			data: { promise: pr }
		});

		t.htmlEqual( fixture.innerHTML, '' );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, '42' );
			done();
		});
	});

	test( `await with no then or catch template`, t => {
		const done = t.async();
		t.expect( 3 );

		let ok;
		const pr = new Promise( y => ok = y );
		const r = new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{else}}undefined{{/await}}'
		});

		t.htmlEqual( fixture.innerHTML, 'undefined' );
		r.set( 'promise', pr );
		t.htmlEqual( fixture.innerHTML, 'wait' );
		ok( 42 );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, '' );
			done();
		});
	});

	test( `await resolution with no alias`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.resolve( 42 );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then}}done{{/await}}',
			data: { promise: pr }
		});

		t.htmlEqual( fixture.innerHTML, 'wait' );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, 'done' );
			done();
		});
	});

	test( `await rejection with no alias`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.reject( 42 );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{catch}}error{{/await}}',
			data: { promise: pr }
		});

		t.htmlEqual( fixture.innerHTML, 'wait' );

		pr.then( null, () => {
			t.htmlEqual( fixture.innerHTML, 'error' );
			done();
		});
	});

	test( `await with then after catch errors`, t => {
		t.throws( () => {
			new Ractive({
				target: fixture,
				template: '{{#await promise}}wait{{catch e}}error{{then}}nope{{/await}}'
			});
		}, /block must appear before/ );
	});

	test( `await with then after then errors`, t => {
		t.throws( () => {
			new Ractive({
				target: fixture,
				template: '{{#await promise}}wait{{then one}}ok{{then}}nope{{/await}}'
			});
		}, /there can only be one/ );
	});

	test( `await with catch after catch errors`, t => {
		t.throws( () => {
			new Ractive({
				target: fixture,
				template: '{{#await promise}}wait{{then ok}}ok{{catch one}}ok err{{catch}}nope{{/await}}'
			});
		}, /there can only be one/ );
	});

	test( `await with then after else errors`, t => {
		t.throws( () => {
			new Ractive({
				target: fixture,
				template: '{{#await promise}}wait{{else}}ok{{then}}nope{{/await}}'
			});
		}, /block must appear before/ );
	});

	test( `await with catch after else errors`, t => {
		t.throws( () => {
			new Ractive({
				target: fixture,
				template: '{{#await promise}}wait{{else}}ok{{catch}}nope{{/await}}'
			});
		}, /block must appear before/ );
	});

	test( `await with else after else errors`, t => {
		t.throws( () => {
			new Ractive({
				target: fixture,
				template: '{{#await promise}}wait{{else}}ok{{else}}nope{{/await}}'
			});
		}, /there can only be one/ );
	});

	test( `await with alias overlapping context`, t => {
		const done = t.async();
		t.expect( 2 );

		const pr = Promise.resolve( 'yep' );
		new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then bar}}{{bar}}{{/await}}',
			data: { promise: pr, bar: 'nope' }
		});

		t.htmlEqual( fixture.innerHTML, 'wait' );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, 'yep' );
			done();
		});
	});

	test( `await with a more complex template`, t => {
		const done = t.async();
		t.expect( 5 );

		const r = new Ractive({
			target: fixture,
			template:
				`<h1>Promises</h1>
				{{#await promise}}
					{{#if something}}<b>I'm</b>{{else}}<i>I'm probably</i>{{/if}}
					waiting...
				{{then list}}
					<h2>See my list</h2>
					{{#each list}}
						<div>{{.}}</div>
					{{/each}}
				{{catch e}}
					<h2>Uh oh</h2>
					This went wrong: {{e.message}}
				{{/await}}
				etc`,
			data: {
				promise: [ 1, 2, 3 ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '<h1>Promises</h1><h2>See my list</h2><div>1</div><div>2</div><div>3</div> etc' );

		let ok;
		let pr = new Promise( y => {
			ok = y;
		});

		r.set( 'promise', pr );

		t.htmlEqual( fixture.innerHTML, `<h1>Promises</h1><i>I'm probably</i> waiting... etc` );
		r.toggle( 'something' );
		t.htmlEqual( fixture.innerHTML, `<h1>Promises</h1><b>I'm</b> waiting... etc` );
		ok( [ 'a', 'b', 'c' ]);

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, '<h1>Promises</h1><h2>See my list</h2><div>a</div><div>b</div><div>c</div> etc' );

			pr = Promise.reject( new Error( 'nope' ) );
			r.set( 'promise', pr );

			pr.then( null, () => {
				t.htmlEqual( fixture.innerHTML, '<h1>Promises</h1><h2>Uh oh</h2> This went wrong: nope etc' );
				done();
			});
		});
	});

	test( `awaiting an undefined skips the block`, t => {
		const done = t.async();
		t.expect( 4 );

		const r = new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then}}done{{catch}}error{{/await}}',
		});

		t.htmlEqual( fixture.innerHTML, '' );

		let ok;
		let pr = new Promise( y => {
			ok = y;
		});

		r.set( 'promise', pr );

		t.htmlEqual( fixture.innerHTML, 'wait' );
		ok( 99 );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, 'done' );

			pr = Promise.reject( 'nope' );
			r.set( 'promise', pr );

			pr.then( null, () => {
				t.htmlEqual( fixture.innerHTML, 'error' );
				done();
			});
		});
	});

	test( `awaiting an undefined triggers an else block if provided`, t => {
		const done = t.async();
		t.expect( 4 );

		const r = new Ractive({
			target: fixture,
			template: '{{#await promise}}wait{{then}}done{{catch}}error{{else}}undefined{{/await}}',
		});

		t.htmlEqual( fixture.innerHTML, 'undefined' );

		let ok;
		let pr = new Promise( y => {
			ok = y;
		});

		r.set( 'promise', pr );

		t.htmlEqual( fixture.innerHTML, 'wait' );
		ok( 99 );

		pr.then( () => {
			t.htmlEqual( fixture.innerHTML, 'done' );

			pr = Promise.reject( 'nope' );
			r.set( 'promise', pr );

			pr.then( null, () => {
				t.htmlEqual( fixture.innerHTML, 'error' );
				done();
			});
		});
	});
}
