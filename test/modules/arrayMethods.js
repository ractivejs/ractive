define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, baseItems;

		module( 'Array methods' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		baseItems = [ 'alice', 'bob', 'charles' ];

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

			test( 'ractive.pop() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
				var items, ractive;

				items = baseItems.slice();

				ractive = new List({
					el: fixture,
					data: { items: items }
				});

				ractive.pop( 'items' );
				t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
			});

			test( 'ractive.shift() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
				var items, ractive;

				items = baseItems.slice();

				ractive = new List({
					el: fixture,
					data: { items: items }
				});

				ractive.shift( 'items' );
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

			test( 'ractive.splice() (modifyArrays: ' + modifyArrays + ')', function ( t ) {
				var items, ractive;

				items = baseItems.slice();

				ractive = new List({
					el: fixture,
					data: { items: items }
				});

				ractive.splice( 'items', 1, 1, 'dave', 'eric' );
				t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>dave</li><li>eric</li><li>charles</li></ul>' );
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

	};

});
