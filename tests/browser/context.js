import { initModule, onWarn } from '../helpers/test-config';
import { test } from 'qunit';
import { fire } from 'simulant';

export default function() {
	initModule('context.js');

	test( 'node info relative data get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		t.equal( info.get( '../bat' ), 'yep' );
	});

	test( 'node info relative data get with expression', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo()}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: {
				wat: { bar: { baz: true }, bat: 'yep' },
				foo () { return this.get( 'wat' ); }
			}
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		t.equal( info.get( '../bat' ), 'yep' );
	});

	test( 'node info alias data get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo as wat}}{{#wat.bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		t.equal( info.get( 'wat.bat' ), 'yep' );
	});

	test( 'node info index ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items:i}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		t.equal( info.get( 'i' ), 0 );
	});

	test( 'node info key ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each obj:k}}<span />{{/each}}`,
			data: { obj: { foo: 'yep' } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		t.equal( info.get( 'k' ), 'foo' );
	});

	test( 'node info index ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		t.equal( info.get( '@index' ), 0 );
	});

	test( 'node info relative set' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.set( '.foo', 'ha' );
		t.equal( r.get( 'items.0.foo' ), 'ha' );
	});

	test( 'node info relative set with map' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep', bar: 'nope' } ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.set({ '.foo': 'ha', '.bar': 'yep' });
		t.equal( r.get( 'items.0.foo' ), 'ha' );
		t.equal( r.get( 'items.0.bar' ), 'yep' );
	});

	test( 'node info alias set' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items as item}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.set( 'item.foo', 'ha' );
		t.equal( r.get( 'items.0.foo' ), 'ha' );
	});

	test( 'node info add' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.add( '../bat' );
		t.equal( r.get( 'foo.bat' ), 42 );
		info.add( '../bat', 42 );
		t.equal( r.get( 'foo.bat' ), 84 );
	});

	test( 'node info add with map', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41, bop: 1 } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.add({ '../bat': 1, '../bop': 1 });
		t.equal( r.get( 'foo.bat' ), 42 );
		t.equal( r.get( 'foo.bop' ), 2 );
	});

	test( 'node info subtract' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.subtract( '../bat' );
		t.equal( r.get( 'foo.bat' ), 40 );
		info.subtract( '../bat', 42 );
		t.equal( r.get( 'foo.bat' ), -2 );
	});

	test( 'node info subtract with map', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41, bop: 1 } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.subtract({ '../bat': 1, '../bop': 2 });
		t.equal( r.get( 'foo.bat' ), 40 );
		t.equal( r.get( 'foo.bop' ), -1 );
	});

	test( 'node info animate', t => {
		const done = t.async();
		t.expect( 1 );

		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.animate( '../bat', 22 ).then(() => {
			t.equal( r.get( 'foo.bat' ), 22 );
			done();
		}, done);
	});

	test( 'node info toggle' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.toggle( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), false );
	});

	test( 'node info update', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getContext( r.find( 'input' ) );
		r.get( 'foo.bar' ).baz = 'yep';
		info.update( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	test( 'node info updateModel', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const input = r.find( 'input' );
		input.value = 'yep';
		const info = Ractive.getContext( input );
		info.updateModel( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	test( 'node info link', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.link( '.baz', '~/str' );
		t.equal( r.get( 'str' ), 'hello' );
	});

	test( 'node info unlink', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.link( '.baz', '~/str' );
		t.equal( r.get( 'str' ), 'hello' );
		info.unlink( 'str' );
		info.set( '.baz', 'yep' );
		t.ok( r.get( 'str' ) !== 'yep' );
	});

	test( `node info readLink`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#with bip}}<span />{{/with}}`,
			data: { bip: {} }
		});
		r.set( 'foo.bar.baz.bat', true );
		r.link( 'foo.bar.baz.bat', 'bip.bop' );

		t.equal( r.getContext( 'span' ).readLink( '.bop' ).keypath, 'foo.bar.baz.bat' );
	});

	test( 'node info shuffle set', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 2, 1, 0 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );
		const spans = r.findAll( 'span' );

		info.set( '../', [ 1, 2 ], { shuffle: true } );

		const postSpans = r.findAll( 'span' );

		t.equal( postSpans.length, 2 );
		t.ok( postSpans[0] === spans[1] && postSpans[1] === spans[0] );
	});

	test( 'node info push', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.push( '../', 1 );

		t.equal( r.findAll( 'span' ).length, 2 );
	});

	test( 'node info pop', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.pop( '../' );

		t.equal( r.findAll( 'span' ).length, 0 );
	});

	test( 'node info sort', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span>{{.}}</span>{{/each}}`,
			data: { items: [ 1, 0, 2 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.sort( '../' );

		t.htmlEqual( fixture.innerHTML, '<span>0</span><span>1</span><span>2</span>' );
	});

	test( 'node info sreverse', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span>{{.}}</span>{{/each}}`,
			data: { items: [ 1, 0, 2 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.reverse( '../' );

		t.htmlEqual( fixture.innerHTML, '<span>2</span><span>0</span><span>1</span>' );
	});

	test( 'node info shift', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.shift( '../' );

		t.equal( r.findAll( 'span' ).length, 0 );
	});

	test( 'node info unshift', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.unshift( '../', 1 );

		t.equal( r.findAll( 'span' ).length, 2 );
	});

	test( 'node info splice', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0, 1 ] }
		});

		const info = Ractive.getContext( r.find( 'span' ) );

		info.splice( '../', 0, 1, 3, 2 );

		t.equal( r.findAll( 'span' ).length, 3 );
		t.equal( r.get( 'items.0' ), 3 );
	});

	test( 'node info isBound', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} /> <input value="test" />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		let info = Ractive.getContext( r.findAll( 'input' )[0] );
		t.ok( info.isBound() );
		info = Ractive.getContext( r.findAll( 'input' )[1] );
		t.ok( !info.isBound() );
	});

	test( 'node info two-way binding path', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getContext( r.find( 'input' ) );
		t.equal( info.getBindingPath(), 'foo.bar.baz' );
	});

	test( 'node info two-way binding get value', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getContext( r.find( 'input' ) );
		t.equal( info.getBinding(), 'hello' );
	});

	test( 'node info two-way binding set value', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getContext( r.find( 'input' ) );
		info.setBinding( 'yep' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	test( 'node info with query selector', t => {
		new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( Ractive.getContext( '#baz' ).resolve(), 'foo.bar' );
	});

	test( 'node info from instance', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( r.getContext( r.find( '#baz' ) ).resolve(), 'foo.bar' );
	});

	test( 'node info from instance with selector', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( r.getContext( '#baz' ).resolve(), 'foo.bar' );
	});

	test( `decorator objects are available from node info objects`, t => {
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

		r.getContext( 'div' ).decorators.foo.method();

		t.ok( flag );
	});

	test( `context observe resolves using the context fragment`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: '{{#with foo}}{{#with bar}}<div />{{/with}}{{/with}}',
			data: {
				foo: { bar: {} }
			}
		});

		r.getContext( 'div' ).observe( '.foo', () => count++, { init: false } );

		r.set( 'foo.bar.foo', 'yep' );
		t.equal( count, 1 );
	});

	test( `context observe works with a map and wildcards`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: '{{#with foo}}{{#with bar}}<div />{{/with}}{{/with}}',
			data: {
				foo: { bar: {} }
			}
		});

		r.getContext( 'div' ).observe({
			'.foo': () => count++,
			'.*': () => count++
		}, { init: false } );

		r.set( 'foo.bar.foo', 'yep' );
		t.equal( count, 2 );

		r.set( 'foo.bar.baz.bat', 'yep' );
		t.equal( count, 3 );
	});

	test( `context observers shuffle correctly`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#each foo.list}}<div as-foo />{{/each}}`,
			data: {
				foo: { list: [ { bar: 1 }, { bar: 2 } ] }
			},
			decorators: {
				foo ( node ) {
					const info = Ractive.getContext( node );
					const observer = info.observe( '.bar', n => {
						node.innerHTML = n;
					}, { defer: true });

					return {
						teardown () {
							observer.cancel();
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>1</div><div>2</div>' );
		r.splice( 'foo.list', 0, 1 );
		t.htmlEqual( fixture.innerHTML, '<div>2</div>' );
		r.set( 'foo.list.0.bar', 0 );
		t.htmlEqual( fixture.innerHTML, '<div>0</div>' );
	});

	test( `context observeOnce resolves using the context fragment`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: `{{#with foo.bar}}<div />{{/with}}`,
			data: {
				foo: { bar: {} }
			}
		});

		r.getContext( 'div' ).observeOnce({
			'.foo': () => count++,
			'.*': () => count++
		});

		r.set( 'foo.bar.foo', 'yep' );
		r.set( 'foo.bar.foo', 'yep' );
		t.equal( count, 2 );

		r.getContext( 'div' ).observeOnce('.*', () => count++);
		r.set( 'foo.bar.baz.bar', 'yep' );
		r.set( 'foo.bar.baz.bip', 'yep' );
		t.equal( count, 3 );
	});

	test( `context objects can trigger events on their element`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div on-foo="wat" />`
		});

		r.on( 'wat', ( ev, arg ) => t.equal( arg, 'bar' ) );

		r.getContext( 'div' ).raise( 'foo', {}, 'bar' );
	});

	test( `context objects can trigger events on parent elements`, t => {
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

		r.getContext( 'span' ).raise( 'foo' );
	});

	test( `getting node info for a non-ractive element returns undefined (#2819)`, t => {
		const r = new Ractive({
			el: fixture
		});

		t.ok( r.getContext( document.body ) === undefined );
		t.ok( Ractive.getContext( document.body ) === undefined );
	});

	test( `getting node info for a host element returns the context of the hosted instance if there is only one (#2865)`, t => {
		const r1 = new Ractive({
			target: fixture,
			template: 'a'
		});

		t.ok( Ractive.getContext( fixture ).ractive === r1 );

		const r2 = new Ractive({
			target: fixture,
			append: true,
			template: 'b'
		});

		t.ok( Ractive.getContext( fixture ) === undefined );

		r1.teardown();

		t.ok( Ractive.getContext( fixture ).ractive === r2 );
	});

	test( `force update works from a context object`, t => {
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
		r.getContext( 'div' ).update( '../fn', { force: true } );
		t.htmlEqual( fixture.innerHTML, '<div>two</div>' );
	});

	test( `getNodeInfo still works but warns about deprecation`, t => {
		t.expect( 4 );

		const r = new Ractive({
			target: fixture,
			template: '{{#with foo.bar}}<div />{{/with}}',
			data: { foo: { bar: { baz: 42 } } }
		});

		onWarn( m => t.ok( /renamed to getContext/i.test( m ) ) );

		let ctx = Ractive.getNodeInfo( fixture.querySelector( 'div' ) );
		t.equal( ctx.resolve(), 'foo.bar' );

		ctx = r.getNodeInfo( r.find( 'div' ) );
		t.equal( ctx.resolve(), 'foo.bar' );

		ctx = r.getNodeInfo( 'div' );
		t.equal( ctx.resolve(), 'foo.bar' );
	});

	test( `node is available on all element context objects`, t => {
		const r = new Ractive({
			target: fixture,
			template: '<div />'
		});

		const n = fixture.querySelector( 'div' );

		t.strictEqual( n, r.getContext( 'div' ).node );
	});

	test( `raise should forward the return from fire`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div on-check="false, false" />`
		});

		const ctx = r.getContext( 'div' );

		t.equal( ctx.raise( 'check' ), false );
	});

	test( `raise should provide an 'original' property if one is not supplied to avoid warning about missing event objects`, t => {
		t.expect( 0 );

		onWarn( () => t.ok( false, 'should not warn' ) );

		const r = new Ractive({
			target: fixture,
			template: `<div on-check="false, false" />`
		});

		const ctx = r.getContext( 'div' );

		ctx.raise( 'check' );
	});

	test( `listen and unlisten subscribe and unsubscribe dom events`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<button />`
		});

		const ctx = r.getContext( 'button' );

		const listener = () => t.ok( true );

		ctx.listen( 'click', listener );
		fire( ctx.node, 'click' );

		ctx.unlisten( 'click', listener );
		fire( ctx.node, 'click' );
	});

	test( `listen returns a handle with a cancel method`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<button />`
		});

		const ctx = r.getContext( 'button' );

		const handle = ctx.listen( 'click', () => t.ok( true ) );
		fire( ctx.node, 'click' );

		handle.cancel();
		fire( ctx.node, 'click' );
	});

	test( `listen works with delegated events`, t => {
		t.expect( 4 );

		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<button />{{/each}}</div>`
		});

		const ctx = r.getContext( 'button' );

		const add = Element.prototype.addEventListener;
		Element.prototype.addEventListener = function ( event, handler, capture ) {
			t.ok( capture );
			t.ok( this.tagName === 'DIV' );
			t.ok( event === 'click' );
			return add.call( this, event, handler, capture );
		};
		const handle = ctx.listen( 'click', () => t.ok( true ) );
		Element.prototype.addEventListener = add;

		fire( ctx.node, 'click' );

		handle.cancel();
		fire( ctx.node, 'click' );
	});

	test( `listen can add a sub to an already subscribed event`, t => {
		t.expect( 5 );

		let count = 0;

		const add = Element.prototype.addEventListener;
		Element.prototype.addEventListener = function ( event, handler, capture ) {
			count++;
			t.ok( !capture );
			return add.call( this, event, handler, capture );
		};

		const r = new Ractive({
			target: fixture,
			template: `<button on-click="@.check()" />`,
			check () {
				t.ok( true, 'template handler fired' );
			}
		});

		const ctx = r.getContext( 'button' );
		const handle = ctx.listen( 'click', () => t.ok( true ) );
		Element.prototype.addEventListener = add;

		t.equal( count, 1 );
		fire( ctx.node, 'click' );

		handle.cancel();
		fire( ctx.node, 'click' );
	});

	test( `listen can add a sub to an already subscribed delegated event`, t => {
		t.expect( 7 );

		let count = 0;

		const add = Element.prototype.addEventListener;
		Element.prototype.addEventListener = function ( event, handler, capture ) {
			count++;
			t.ok( capture );
			t.ok( this.tagName === 'DIV' );
			t.ok( event === 'click' );
			return add.call( this, event, handler, capture );
		};

		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<button on-click="@.check()" />{{/each}}</div>`,
			check () {
				t.ok( true, 'template handler fired' );
			}
		});

		const ctx = r.getContext( 'button' );
		const handle = ctx.listen( 'click', () => t.ok( true ) );
		Element.prototype.addEventListener = add;

		t.equal( count, 1 );
		fire( ctx.node, 'click' );

		handle.cancel();
		fire( ctx.node, 'click' );
	});

	test( `sub and unsub delegated events on an existing event type converts to and from capture listener`, t => {
		t.expect( 19 );

		let count = 0;
		let rcount = 0;
		let delegate = false;

		const rem = Element.prototype.removeEventListener;
		const add = Element.prototype.addEventListener;
		Element.prototype.addEventListener = function ( event, handler, capture ) {
			count++;
			t.equal( capture, delegate );
			t.ok( this.tagName === 'DIV' );
			t.ok( event === 'click' );
			return add.call( this, event, handler, capture );
		};
		Element.prototype.removeEventListener = function ( event, handler, capture ) {
			rcount++;
			t.equal( capture, !delegate );
			return rem.call( this, event, handler, capture );
		};

		const r = new Ractive({
			target: fixture,
			template: `<div on-click="@.check()">{{#each [1]}}<button />{{/each}}</div>`,
			check () {
				t.ok( true, 'template handler fired' );
			}
		});

		t.equal( count, 1 );

		delegate = true;
		const ctx = r.getContext( 'button' );
		const handle = ctx.listen( 'click', () => t.ok( true ) );

		t.equal( count, 2 );
		t.equal( rcount, 1 );

		fire( ctx.node, 'click' );

		delegate = false;
		handle.cancel();
		t.equal( count, 3 );
		t.equal( rcount, 2 );

		fire( ctx.node, 'click' );

		Element.prototype.addEventListener = add;
		Element.prototype.removeEventListener = rem;
	});
}
