import cleanup from 'helpers/cleanup';

module( 'Decorators', { afterEach: cleanup });

test( 'Basic decorator', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<div decorator="foo">this text will be overwritten</div>',
		decorators: {
			foo: function ( node ) {
				var contents = node.innerHTML;
				node.innerHTML = 'foo';

				return {
					teardown: function () {
						node.innerHTML = contents;
					}
				}
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div>foo</div>' );
});

test( 'Decorator with a static argument', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<div decorator="foo:bar">this text will be overwritten</div>',
		decorators: {
			foo: function ( node, newContents ) {
				var contents = node.innerHTML;
				node.innerHTML = newContents;

				return {
					teardown: function () {
						node.innerHTML = contents;
					}
				}
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div>bar</div>' );
});

test( 'Decorator with a dynamic argument', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<div decorator="foo:{{foo}}">this text will be overwritten</div>',
		data: {
			foo: 'baz'
		},
		decorators: {
			foo: function ( node, newContents ) {
				var contents = node.innerHTML;
				node.innerHTML = newContents;

				return {
					teardown: function () {
						node.innerHTML = contents;
					}
				}
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
});

test( 'Decorator with a dynamic argument that changes, without update() method', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<div decorator="foo:{{foo}}">this text will be overwritten</div>',
		data: {
			foo: 'baz'
		},
		decorators: {
			foo: function ( node, newContents ) {
				var contents = node.innerHTML;
				node.innerHTML = newContents;

				return {
					teardown: function () {
						node.innerHTML = contents;
					}
				}
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
	ractive.set( 'foo', 'qux' );
	t.htmlEqual( fixture.innerHTML, '<div>qux</div>' );
});

test( 'Decorator with a dynamic argument that changes, with update() method', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<div decorator="foo:{{foo}}">this text will be overwritten</div>',
		data: {
			foo: 'baz'
		},
		decorators: {
			foo: function ( node, newContents ) {
				var contents = node.innerHTML;
				node.innerHTML = newContents;

				return {
					update: function ( newContents ) {
						node.innerHTML = newContents;
					},
					teardown: function () {
						node.innerHTML = contents;
					}
				}
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div>baz</div>' );
	ractive.set( 'foo', 'qux' );
	t.htmlEqual( fixture.innerHTML, '<div>qux</div>' );
});

if ( Ractive.magic ) {
	test( 'Referencing parent data context in magic mode does not break decorators', function ( t ) {
		var ractive, data;

		data = {
			item: { name: 'one' },
			foo: {
				bar: 'biz'
			}
		};

		ractive = new Ractive({
			el: fixture,
			template: '{{#item}}{{foo.bar}}{{name}}<span decorator="decorateme:{{foo}}"></span>{{/item}}',
			magic: true,
			data: data,
			decorators: {
				decorateme: function(node, foo){
					node.innerHTML = foo ? foo.bar || 'fail' : 'fail';
					return { teardown: function () {} };
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'bizone<span>biz</span>' );
	});
}

test( 'Decorator without arguments can be torn down (#453)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#foo}}<p decorator="bar">foo</p>{{/foo}}',
		data: { foo: true },
		decorators: {
			bar: function( node ) {
				return { teardown: function () {} }
			}
		}
	});

	expect( 1 );

	ractive.set("foo", false);
	t.ok( true );
});

test( 'Unnecessary whitespace is trimmed (#810)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<pre decorator="show: blue is the moon   "/><pre decorator="show:\' blue is the moon   \'"/>',
		decorators: {
			show: function ( node, arg ) {
				node.innerHTML = typeof arg === 'string'
					? '|' + arg + '|'
					: JSON.stringify(arg)

				return { teardown: Function.prototype }
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<pre>|blue is the moon|</pre><pre>| blue is the moon   |</pre>' );
});

test( 'Rebinding causes decorators to update, if arguments are index references', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#each letters :i}}<p decorator="check:{{i}}"></p>{{/each}}',
		data: {
			letters: [ 'a', 'b' ]
		},
		decorators: {
			check: function ( node, index ) {
				return {
					update: function ( newIndex ) {
						t.equal( newIndex, index - 1 );
						index = newIndex;
					},
					teardown: function () {}
				};
			}
		}
	});

	ractive.shift( 'letters' );
});

test( 'Rebinding safe if decorators have no arguments', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#each letters :i}}<p decorator="whatever"></p>{{/each}}',
		data: {
			letters: [ 'a', 'b' ]
		},
		decorators: {
			whatever: function ( node ) {
				return {
					update: function () {},
					teardown: function () {
						t.ok( true );
					}
				};
			}
		}
	});

	ractive.shift( 'letters' );
});

test( 'Teardown before init should work', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{# count > 0}}<span decorator="whatever">foo</span>{{/0}}',
		data: {
			count: 0
		},
		decorators: {
			whatever: function ( node ) {
				return { teardown: Function.prototype }
			}
		}
	});

	ractive.observe( 'boo', function( newval, oldval ) {
	    ractive.set( 'count', 1 );
	    ractive.set( 'count', 0 );
	});
	ractive.set( 'boo', 1) ;
	t.ok( true );
});


test( 'Dynamic and empty dynamic decorator and empty', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		debug: true,
		template: '{{#if x}}<div decorator="{{foo}}">not this</div>{{/if}}',
		data: {
			foo: '',
			x: true
		},
		decorators: {
			test: function ( node ) {
				node.innerHTML = 'pass';
				return { teardown: function () {} }
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div>not this</div>' );
	ractive.set( 'x', false );
	ractive.set( 'foo', 'test' );
	ractive.set( 'x', true );
	t.htmlEqual( fixture.innerHTML, '<div>pass</div>' );
});

asyncTest( 'Decorator teardown should happen after outros have completed (#1481)', function ( t ) {
	var ractive, div, decoratorTorndown;

	ractive = new Ractive({
		el: fixture,
		template: `
			{{#if foo}}
				<div outro='wait' decorator='red'>red</div>
			{{/if}}`,
		data: {
			foo: true
		},
		decorators: {
			red: function ( node ) {
				var originalColor = node.style.color;
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
			wait: function ( tr ) {
				setTimeout( () => {
					t.ok( !decoratorTorndown );
					t.equal( div.style.color, 'red' );

					tr.complete();
				});
			}
		}
	});

	div = ractive.find( 'div' );

	ractive.set( 'foo', false ).then( function () {
		t.ok( decoratorTorndown );
		QUnit.start();
	});

	t.equal( div.style.color, 'red' );
});
