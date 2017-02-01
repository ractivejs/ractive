import { initModule } from '../helpers/test-config';

export default function() {
	initModule('node-info.js');

	QUnit.test( 'node info relative data get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( '../bat' ), 'yep' );
	});

	QUnit.test( 'node info relative data get with expression', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo()}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: {
				wat: { bar: { baz: true }, bat: 'yep' },
				foo () { return this.get( 'wat' ); }
			}
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( '../bat' ), 'yep' );
	});

	QUnit.test( 'node info alias data get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo as wat}}{{#wat.bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( 'wat.bat' ), 'yep' );
	});

	QUnit.test( 'node info index ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items:i}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( 'i' ), 0 );
	});

	QUnit.test( 'node info key ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each obj:k}}<span />{{/each}}`,
			data: { obj: { foo: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( 'k' ), 'foo' );
	});

	QUnit.test( 'node info index ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( '@index' ), 0 );
	});

	QUnit.test( 'node info relative set' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.set( '.foo', 'ha' );
		t.equal( r.get( 'items.0.foo' ), 'ha' );
	});

	QUnit.test( 'node info relative set with map' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep', bar: 'nope' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.set({ '.foo': 'ha', '.bar': 'yep' });
		t.equal( r.get( 'items.0.foo' ), 'ha' );
		t.equal( r.get( 'items.0.bar' ), 'yep' );
	});

	QUnit.test( 'node info alias set' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items as item}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.set( 'item.foo', 'ha' );
		t.equal( r.get( 'items.0.foo' ), 'ha' );
	});

	QUnit.test( 'node info add' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.add( '../bat' );
		t.equal( r.get( 'foo.bat' ), 42 );
		info.add( '../bat', 42 );
		t.equal( r.get( 'foo.bat' ), 84 );
	});

	QUnit.test( 'node info add with map', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41, bop: 1 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.add({ '../bat': 1, '../bop': 1 });
		t.equal( r.get( 'foo.bat' ), 42 );
		t.equal( r.get( 'foo.bop' ), 2 );
	});

	QUnit.test( 'node info subtract' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.subtract( '../bat' );
		t.equal( r.get( 'foo.bat' ), 40 );
		info.subtract( '../bat', 42 );
		t.equal( r.get( 'foo.bat' ), -2 );
	});

	QUnit.test( 'node info subtract with map', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41, bop: 1 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.subtract({ '../bat': 1, '../bop': 2 });
		t.equal( r.get( 'foo.bat' ), 40 );
		t.equal( r.get( 'foo.bop' ), -1 );
	});

	QUnit.test( 'node info animate', t => {
		const done = t.async();
		t.expect( 1 );

		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.animate( '../bat', 22 ).then(() => {
			t.equal( r.get( 'foo.bat' ), 22 );
			done();
		}, done);
	});

	QUnit.test( 'node info toggle' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.toggle( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), false );
	});

	QUnit.test( 'node info update', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		r.get( 'foo.bar' ).baz = 'yep';
		info.update( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	QUnit.test( 'node info updateModel', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const input = r.find( 'input' );
		input.value = 'yep';
		const info = Ractive.getNodeInfo( input );
		info.updateModel( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	QUnit.test( 'node info link', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.link( '.baz', '~/str' );
		t.equal( r.get( 'str' ), 'hello' );
	});

	QUnit.test( 'node info unlink', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.link( '.baz', '~/str' );
		t.equal( r.get( 'str' ), 'hello' );
		info.unlink( 'str' );
		info.set( '.baz', 'yep' );
		t.ok( r.get( 'str' ) !== 'yep' );
	});

	QUnit.test( `node info readLink`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#with bip}}<span />{{/with}}`,
			data: { bip: {} }
		});
		r.set( 'foo.bar.baz.bat', true );
		r.link( 'foo.bar.baz.bat', 'bip.bop' );

		t.equal( r.getNodeInfo( 'span' ).readLink( '.bop' ).keypath, 'foo.bar.baz.bat' );
	});

	QUnit.test( 'node info shuffle set', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 2, 1, 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );
		const spans = r.findAll( 'span' );

		info.set( '../', [ 1, 2 ], { shuffle: true } );

		const postSpans = r.findAll( 'span' );

		t.equal( postSpans.length, 2 );
		t.ok( postSpans[0] === spans[1] && postSpans[1] === spans[0] );
	});

	QUnit.test( 'node info push', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.push( '../', 1 );

		t.equal( r.findAll( 'span' ).length, 2 );
	});

	QUnit.test( 'node info pop', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.pop( '../' );

		t.equal( r.findAll( 'span' ).length, 0 );
	});

	QUnit.test( 'node info sort', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span>{{.}}</span>{{/each}}`,
			data: { items: [ 1, 0, 2 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.sort( '../' );

		t.htmlEqual( fixture.innerHTML, '<span>0</span><span>1</span><span>2</span>' );
	});

	QUnit.test( 'node info sreverse', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span>{{.}}</span>{{/each}}`,
			data: { items: [ 1, 0, 2 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.reverse( '../' );

		t.htmlEqual( fixture.innerHTML, '<span>2</span><span>0</span><span>1</span>' );
	});

	QUnit.test( 'node info shift', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.shift( '../' );

		t.equal( r.findAll( 'span' ).length, 0 );
	});

	QUnit.test( 'node info unshift', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.unshift( '../', 1 );

		t.equal( r.findAll( 'span' ).length, 2 );
	});

	QUnit.test( 'node info splice', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0, 1 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.splice( '../', 0, 1, 3, 2 );

		t.equal( r.findAll( 'span' ).length, 3 );
		t.equal( r.get( 'items.0' ), 3 );
	});

	QUnit.test( 'node info isBound', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} /> <input value="test" />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		let info = Ractive.getNodeInfo( r.findAll( 'input' )[0] );
		t.ok( info.isBound() );
		info = Ractive.getNodeInfo( r.findAll( 'input' )[1] );
		t.ok( !info.isBound() );
	});

	QUnit.test( 'node info two-way binding path', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		t.equal( info.getBindingPath(), 'foo.bar.baz' );
	});

	QUnit.test( 'node info two-way binding get value', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		t.equal( info.getBinding(), 'hello' );
	});

	QUnit.test( 'node info two-way binding set value', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		info.setBinding( 'yep' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	QUnit.test( 'node info with query selector', t => {
		new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( Ractive.getNodeInfo( '#baz' ).resolve(), 'foo.bar' );
	});

	QUnit.test( 'node info from instance', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( r.getNodeInfo( r.find( '#baz' ) ).resolve(), 'foo.bar' );
	});

	QUnit.test( 'node info from instance with selector', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( r.getNodeInfo( '#baz' ).resolve(), 'foo.bar' );
	});

	QUnit.test( `decorator objects are available from node info objects`, t => {
		let flag = false;
		const r = new Ractive({
			target: fixture,
			template: '<div as-foo />',
			decorators: {
				foo () {
					return {
						teardown () {},
						method () {
							flag = true;
						}
					};
				}
			}
		});

		r.getNodeInfo( 'div' ).decorators.foo.method();

		t.ok( flag );
	});

	QUnit.test( `context observe resolves using the context fragment`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: '{{#with foo}}{{#with bar}}<div />{{/with}}{{/with}}',
			data: {
				foo: { bar: {} }
			}
		});

		r.getNodeInfo( 'div' ).observe( '.foo', () => count++, { init: false } );

		r.set( 'foo.bar.foo', 'yep' );
		t.equal( count, 1 );
	});

	QUnit.test( `context observe works with a map and wildcards`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: '{{#with foo}}{{#with bar}}<div />{{/with}}{{/with}}',
			data: {
				foo: { bar: {} }
			}
		});

		r.getNodeInfo( 'div' ).observe({
			'.foo': () => count++,
			'.*': () => count++
		}, { init: false } );

		r.set( 'foo.bar.foo', 'yep' );
		t.equal( count, 2 );

		r.set( 'foo.bar.baz.bat', 'yep' );
		t.equal( count, 3 );
	});

	QUnit.test( `context observeOnce resolves using the context fragment`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: `{{#with foo.bar}}<div />{{/with}}`,
			data: {
				foo: { bar: {} }
			}
		});

		r.getNodeInfo( 'div' ).observeOnce({
			'.foo': () => count++,
			'.*': () => count++
		});

		r.set( 'foo.bar.foo', 'yep' );
		r.set( 'foo.bar.foo', 'yep' );
		t.equal( count, 2 );

		r.getNodeInfo( 'div' ).observeOnce('.*', () => count++);
		r.set( 'foo.bar.baz.bar', 'yep' );
		r.set( 'foo.bar.baz.bip', 'yep' );
		t.equal( count, 3 );
	});

	QUnit.test( `context objects can trigger events on their element`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div on-foo="wat" />`
		});

		r.on( 'wat', ( ev, arg ) => t.equal( arg, 'bar' ) );

		r.getNodeInfo( 'div' ).raise( 'foo', {}, 'bar' );
	});

	QUnit.test( `context objects can trigger events on parent elements`, t => {
		t.expect( 1 );

		const cmp = Ractive.extend({
			template: '{{yield}}'
		});
		const r = new Ractive({
			target: fixture,
			template: `<div on-foo="@.foo()"><div><cmp><span /></cmp></div></div>`,
			components: { cmp },
			foo () { t.ok( true ); }
		});

		r.getNodeInfo( 'span' ).raise( 'foo' );
	});

	QUnit.test( `getting node info for a non-ractive element returns undefined (#2819)`, t => {
		const r = new Ractive({
			el: fixture
		});

		t.ok( r.getNodeInfo( document.body ) === undefined );
		t.ok( Ractive.getNodeInfo( document.body ) === undefined );
	});

	QUnit.test( `getting node info for a host element returns the context of the hosted instance if there is only one (#2865)`, t => {
		const r1 = new Ractive({
			target: fixture,
			template: 'a'
		});

		t.ok( Ractive.getNodeInfo( fixture ).ractive === r1 );

		const r2 = new Ractive({
			target: fixture,
			append: true,
			template: 'b'
		});

		t.ok( Ractive.getNodeInfo( fixture ) === undefined );

		r1.teardown();

		t.ok( Ractive.getNodeInfo( fixture ).ractive === r2 );
	});

	QUnit.test( `force update works from a context object`, t => {
		let msg = 'one';
		const r = new Ractive({
			target: fixture,
			template: `{{#with foo.bar}}{{#with baz}}<div>{{fn()}}</div>{{/with}}{{/with}}`,
			data: {
				foo: { bar: {
					fn () { return msg; },
					baz: {}
				} }
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>one</div>' );

		msg = 'two';
		r.getNodeInfo( 'div' ).update( '../fn', { force: true } );
		t.htmlEqual( fixture.innerHTML, '<div>two</div>' );
	});
}
