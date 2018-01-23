import { hasUsableConsole, onWarn, initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'plugins/decorators.js' );


	test( 'Basic decorator', t => {
		new Ractive({
			el: fixture,
			template: '<div as-foo>this text will be overwritten</div>',
			decorators: {
				foo ( node ) {
					const contents = node.innerHTML;
					node.innerHTML = 'foo';

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
	});

	if ( hasUsableConsole ) {
		test( 'Missing decorator', t => {
			t.expect( 1 );

			onWarn( msg => {
				t.ok( /Missing "foo" decorator plugin/.test( msg ) );
			});

			new Ractive({
				el: fixture,
				template: '<div as-foo>missing</div>',
			});
		});
	}

	test( 'Decorator with a static argument', t => {
		new Ractive({
			el: fixture,
			template: '<div as-foo=""bar"">this text will be overwritten</div>',
			decorators: {
				foo ( node, newContents ) {
					const contents = node.innerHTML;
					node.innerHTML = newContents;

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>bar</div>' );
	});

	test( 'Decorator with a dynamic argument', t => {
		new Ractive({
			el: fixture,
			template: '<div as-foo="foo">this text will be overwritten</div>',
			data: {
				foo: 'baz'
			},
			decorators: {
				foo ( node, newContents ) {
					const contents = node.innerHTML;
					node.innerHTML = newContents;

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
	});

	test( 'Decorator with a dynamic argument that changes, without update() method', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div as-foo="foo">this text will be overwritten</div>',
			data: {
				foo: 'baz'
			},
			decorators: {
				foo ( node, newContents ) {
					const contents = node.innerHTML;
					node.innerHTML = newContents;

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
		ractive.set( 'foo', 'qux' );
		t.htmlEqual( fixture.innerHTML, '<div>qux</div>' );
		ractive.set( 'foo', 'bar' );
		t.htmlEqual( fixture.innerHTML, '<div>bar</div>' );
	});

	test( 'Decorator with a dynamic argument that changes, with update() method', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div as-foo="foo">this text will be overwritten</div>',
			data: {
				foo: 'baz'
			},
			decorators: {
				foo ( node, newContents ) {
					const contents = node.innerHTML;
					node.innerHTML = newContents;

					return {
						update ( newContents ) {
							node.innerHTML = newContents;
						},
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
		ractive.set( 'foo', 'qux' );
		t.htmlEqual( fixture.innerHTML, '<div>qux</div>' );
		ractive.set( 'foo', 'bar' );
		t.htmlEqual( fixture.innerHTML, '<div>bar</div>' );
	});

	test( 'Decorator without arguments can be torn down (#453)', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}<p as-bar>foo</p>{{/foo}}',
			data: { foo: true },
			decorators: {
				bar () {
					return { teardown () {} };
				}
			}
		});

		ractive.set( 'foo', false );
		t.ok( true );
	});

	test( 'Unnecessary whitespace is trimmed (#810)', t => {
		new Ractive({
			el: fixture,
			template: '<pre as-show=""blue is the moon""/><pre as-show="" blue is the moon   ""/>',
			decorators: {
				show ( node, arg ) {
					node.innerHTML = `|${arg}|`;
					return { teardown () {} };
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<pre>|blue is the moon|</pre><pre>| blue is the moon   |</pre>' );
	});

	test( 'Rebinding causes decorators to update, if arguments are index references', t => {
		t.expect(1);

		const ractive = new Ractive({
			el: fixture,
			template: '{{#each letters :i}}<p as-check="i"></p>{{/each}}',
			data: {
				letters: [ 'a', 'b' ]
			},
			decorators: {
				check ( node, index ) {
					return {
						update ( newIndex ) {
							t.equal( newIndex, index - 1 );
							index = newIndex;
						},
						teardown () {}
					};
				}
			}
		});

		ractive.shift( 'letters' );
	});

	test( 'Rebinding safe if decorators have no arguments', t => {
		// second time is for teardown
		t.expect(2);

		const ractive = new Ractive({
			el: fixture,
			template: '{{#each letters :i}}<p as-whatever></p>{{/each}}',
			data: {
				letters: [ 'a', 'b' ]
			},
			decorators: {
				whatever () {
					return {
						update () {},
						teardown () {
							t.ok( true );
						}
					};
				}
			}
		});

		ractive.shift( 'letters' );
	});

	test( 'Teardown before init should work', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{# count > 0}}<span as-whatever>foo</span>{{/0}}',
			data: {
				count: 0
			},
			decorators: {
				whatever () {
					return { teardown: Function.prototype };
				}
			}
		});

		ractive.observe( 'boo', () => {
			ractive.set( 'count', 1 );
			ractive.set( 'count', 0 );
		});

		ractive.set( 'boo', 1 );
		t.ok( true );
	});


	test( 'Decorator teardown should happen after outros have completed (#1481)', t => {
		const done = t.async();

		let decoratorTorndown;

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#if foo}}
					<div wait-out as-red>red</div>
				{{/if}}`,
			data: {
				foo: true
			},
			decorators: {
				red ( node ) {
					const originalColor = node.style.color;
					node.style.color = 'red';

					return {
						teardown: () => {
							node.style.color = originalColor;
							decoratorTorndown = true;
						}
					};
				}
			},
			transitions: {
				wait ( tr ) {
					setTimeout( () => {
						t.ok( !decoratorTorndown );
						t.equal( div.style.color, 'red' );

						tr.complete();
					});
				}
			}
		});

		const div = ractive.find( 'div' );

		ractive.set( 'foo', false ).then( () => {
			t.ok( decoratorTorndown );
			done();
		});

		t.equal( div.style.color, 'red' );
	});

	test( 'Decorators can have their parameters change before they are rendered (#2278)', t => {
		t.expect( 0 );

		const dec = () => ({ teardown() {} });

		new Ractive({
			el: fixture,
			decorators: { dec },
			template: '<div as-dec="foo" />',
			data: {
				foo: 1
			},
			oninit() {
				this.set( 'foo', 2 );
			}
		});
	});

	test( 'basic conditional decorator', t => {
		const r = new Ractive({
			el: fixture,
			template: '<div {{#if foo}}as-foo{{/if}}>bar</div>',
			data: { foo: true },
			decorators: {
				foo ( node ) {
					const contents = node.innerHTML;
					node.innerHTML = 'foo';

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
		r.set( 'foo', false );
		t.htmlEqual( fixture.innerHTML, '<div>bar</div>' );
		r.set( 'foo', true );
		t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
	});

	test( 'conditional decorator with else', t => {
		const r = new Ractive({
			el: fixture,
			template: '<div {{#if foo}}as-foo{{else}}as-baz{{/if}}>bar</div>',
			data: { foo: true },
			decorators: {
				foo ( node ) {
					const contents = node.innerHTML;
					node.innerHTML = 'foo';

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				},
				baz ( node ) {
					const contents = node.innerHTML;
					node.innerHTML = 'baz';

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
		r.set( 'foo', false );
		t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
		r.set( 'foo', true );
		t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
		r.set( 'foo', false );
		t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
	});

	test( 'decorators can be named with as-${name}', t => {
		new Ractive({
			el: fixture,
			template: '<div as-foo>this text will be overwritten</div>',
			decorators: {
				foo ( node ) {
					const contents = node.innerHTML;
					node.innerHTML = 'foo';

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
	});

	test( 'decorators can be named with as-${name} with args', t => {
		new Ractive({
			el: fixture,
			template: `<div as-foo="bar, 'baz'">this text will be overwritten</div>`,
			decorators: {
				foo ( node, t1, t2 ) {
					const contents = node.innerHTML;
					node.innerHTML = t1 + ' ' + t2;

					return {
						teardown () {
							node.innerHTML = contents;
						}
					};
				}
			},
			data: { bar: 'foo' }
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo baz</div>' );
	});

	test( 'named decorators update with their args (#2590)', t => {
		const r = new Ractive({
			el: fixture,
			template: `<div as-foo="bar">bar here</div>`,
			decorators: {
				foo ( node, bar ) {
					const contents = node.innerHTML;
					node.innerHTML = bar;

					return {
						update ( bar ) {
							node.innerHTML = bar;
						},
						teardown ()  {
							node.innerHTML = contents;
						}
					};
				}
			},
			data: { bar: 'foo' }
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
		r.set( 'bar', 'baz' );
		t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
	});

	test( 'decorators in nested elements are torn down (#2608)', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: '{{#if foo}}<div>{{#if true}}{{#each [1]}}{{>bar}}{{/each}}{{/if}}</div>{{/if}}',
			decorators: {
				foo () {
					count++;
					return {
						teardown () {
							count--;
						}
					};
				}
			},
			data: { foo: true },
			partials: {
				bar: '<div><div as-foo /></div>'
			}
		});

		t.equal( count, 1 );
		r.toggle( 'foo' );
		t.equal( count, 0 );
		r.toggle( 'foo' );
		t.equal( count, 1 );
		r.toggle( 'foo' );
		t.equal( count, 0 );
	});

	test( 'decorators in nested components are torn down (#2608)', t => {
		let count = 0;
		const cmp = Ractive.extend({
			template: '<div as-foo />',
			isolated: false
		});
		const r = new Ractive({
			el: fixture,
			template: '{{#if foo}}<div><cmp/></div>{{/if}}',
			decorators: {
				foo () {
					count++;
					return {
						teardown () {
							count--;
						}
					};
				}
			},
			components: { cmp },
			data: { foo: true }
		});

		t.equal( count, 1 );
		r.toggle( 'foo' );
		t.equal( count, 0 );
		r.toggle( 'foo' );
		t.equal( count, 1 );
		r.toggle( 'foo' );
		t.equal( count, 0 );
	});

	test( 'decorators get applied if the element rendered during onrender (#2697)', t => {
		new Ractive({
			el: fixture,
			template: '{{#if show}}<p as-foo>nope</p>{{/if}}',
			decorators: {
				foo ( node ) {
					node.innerHTML = 'yep';
					return { teardown () {} };
				}
			},
			onrender () {
				this.toggle( 'show' );
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p>yep</p>' );
	});

	test( 'decorators within a nested alias block are torn down appropriately (#2735)', t => {
		let count = 0;

		function foo () {
			count++;
			return {
				teardown () { count--; }
			};
		}
		const r = new Ractive({
			el: fixture,
			template: `{{#if show}}<div>{{#with 1 as sure}}<span as-foo />{{/with}}</div>{{/if}}` ,
			data: { show: true },
			decorators: { foo }
		});

		t.equal( count, 1 );

		r.toggle( 'show' );
		t.equal( count, 0 );

		r.toggle( 'show' );
		t.equal( count, 1 );
	});

	test( `decorators that cause themselves to be torn down during their init are torn down properly (#2412)`, t => {
		let go = true;
		let setup = 0;
		let teardown = 0;

		const foo = function () {
			setup++;

			if ( go ) {
				go = false;
				this.shift( 'items' );
			}

			return {
				teardown () { teardown++; }
			};
		};

		new Ractive({
			el: fixture,
			template: '{{#each items}}<div as-foo>{{.}}</div>{{/each}}',
			decorators: { foo },
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.equal( setup, 3 );
		t.equal( teardown, 1 );
		t.htmlEqual( fixture.innerHTML, '<div>b</div><div>c</div>' );
	});

	test( `decorators ask to be notified when dom changes in the element's tree`, t => {
		let dom = 0;
		let updated = 0;

		const r = new Ractive({
			target: fixture,
			template: `<div as-watched>{{downstream}}</div>`,
			data: { downstream: 1 },
			decorators: {
				watched () {
					return {
						invalidate () { dom++; },
						update () { updated++; },
						teardown () {}
					};
				}
			}
		});

		t.equal( dom, 0 );
		t.equal( updated, 0 );
		r.add( 'downstream' );

		t.equal( dom, 1 );
		t.equal( updated, 0 );

		r.add( 'downstream' );

		t.equal( dom, 2 );
		t.equal( updated, 0 );

	});
}
