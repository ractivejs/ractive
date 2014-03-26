define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture;

		module( 'Decorators' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

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

	};

});
