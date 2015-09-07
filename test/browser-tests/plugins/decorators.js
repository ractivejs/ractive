import { test } from 'qunit';

test( 'Basic decorator', t => {
	new Ractive({
		el: fixture,
		template: '<div decorator="foo">this text will be overwritten</div>',
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

test( 'Decorator with a static argument', t => {
	new Ractive({
		el: fixture,
		template: '<div decorator="foo:bar">this text will be overwritten</div>',
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
		template: '<div decorator="foo:{{foo}}">this text will be overwritten</div>',
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
		template: '<div decorator="foo:{{foo}}">this text will be overwritten</div>',
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
});

test( 'Decorator with a dynamic argument that changes, with update() method', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '<div decorator="foo:{{foo}}">this text will be overwritten</div>',
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
});

if ( Ractive.magic ) {
	test( 'Referencing parent data context in magic mode does not break decorators', t => {
		const data = {
			item: { name: 'one' },
			foo: {
				bar: 'biz'
			}
		};

		new Ractive({
			el: fixture,
			template: '{{#item}}{{foo.bar}}{{name}}<span decorator="decorateme:{{foo}}"></span>{{/item}}',
			magic: true,
			data,
			decorators: {
				decorateme ( node, foo ) {
					node.innerHTML = foo ? foo.bar || 'fail' : 'fail';
					return { teardown () {} };
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'bizone<span>biz</span>' );
	});
}

test( 'Decorator without arguments can be torn down (#453)', t => {
	t.expect( 1 );

	const ractive = new Ractive({
		el: fixture,
		template: '{{#foo}}<p decorator="bar">foo</p>{{/foo}}',
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
		template: '<pre decorator="show: blue is the moon   "/><pre decorator="show:\' blue is the moon   \'"/>',
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
	const ractive = new Ractive({
		el: fixture,
		template: '{{#each letters :i}}<p decorator="check:{{i}}"></p>{{/each}}',
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
	const ractive = new Ractive({
		el: fixture,
		template: '{{#each letters :i}}<p decorator="whatever"></p>{{/each}}',
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
		template: '{{# count > 0}}<span decorator="whatever">foo</span>{{/0}}',
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


test( 'Dynamic and empty dynamic decorator and empty', t => {
	const ractive = new Ractive({
		el: fixture,
		debug: true,
		template: '{{#if x}}<div decorator="{{foo}}">not this</div>{{/if}}',
		data: {
			foo: '',
			x: true
		},
		decorators: {
			test ( node ) {
				node.innerHTML = 'pass';
				return { teardown () {} };
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div>not this</div>' );
	ractive.set( 'x', false );
	ractive.set( 'foo', 'test' );
	ractive.set( 'x', true );
	t.htmlEqual( fixture.innerHTML, '<div>pass</div>' );
});

test( 'Decorator teardown should happen after outros have completed (#1481)', t => {
	const done = t.async();

	let decoratorTorndown;

	const ractive = new Ractive({
		el: fixture,
		template: `
			{{#if foo}}
				<div outro='wait' decorator='red'>red</div>
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
