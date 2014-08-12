// EVENT TESTS
// ===========
//
// TODO: add moar tests

define([ 'ractive' ], function ( Ractive ) {

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'Events' );

		test( 'on-click="someEvent" fires an event when user clicks the element', function ( t ) {
			var ractive;

			expect( 2 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="someEvent">click me</span>'
			});

			ractive.on( 'someEvent', function ( event ) {
				t.ok( true );
				t.equal( event.original.type, 'click' );
			});

			simulant.fire( ractive.nodes.test, 'click' );
		});

		test( 'on-click="someEvent" does not fire event when unrendered', t => {
			var ractive, node;

			expect( 0 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="someEvent">click me</span>'
			});

			ractive.on( 'someEvent', function ( event ) {
				throw new Error('Event handler called after unrender');
			});

			node = ractive.nodes.test;

			ractive.unrender();

			simulant.fire( node, 'click' );
		});

		test( 'custom event invoked and torndown', t => {
			var ractive, custom, node;

			expect( 3 );

			custom = function ( node, fire ) {

				var torndown = false;

				node.addEventListener( 'click', fireEvent, false );

				function fireEvent ( event ) {

					if ( torndown ) {
						throw new Error('Custom event called after teardown');
					}

					fire({
						node: node,
						original: event
					});
				}

				return {
					teardown: function () {
						t.ok( torndown = true );
						node.removeEventListener( 'click', fireEvent, false );
					}
				}
			}


			ractive = new Ractive({
				el: fixture,
				events: { custom: custom },
				template: '<span id="test" on-custom="someEvent">click me</span>'
			});

			ractive.on( 'someEvent', function ( event ) {
				t.ok( true );
				t.equal( event.original.type, 'click' );
			});

			node = ractive.nodes.test;

			simulant.fire( node, 'click' );

			ractive.unrender();

			simulant.fire( node, 'click' );

		});


		test( 'Standard events have correct properties: node, original, keypath, context, index', function ( t ) {
			var ractive, fakeEvent;

			expect( 5 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="someEvent">click me</span>'
			});

			ractive.on( 'someEvent', function ( event ) {
				t.equal( event.node, ractive.nodes.test );
				t.ok( event.original );
				t.equal( event.keypath, '' );
				t.equal( event.context, ractive.data );
				t.equal( event.index, undefined );
			});

			fakeEvent = simulant( 'click' );

			simulant.fire( ractive.nodes.test, fakeEvent );
		});


		test( 'preventDefault and stopPropagation if event handler returned false', function ( t ) {
			var ractive, preventedDefault = false, stoppedPropagation = false;

			expect( 9 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="return_false" on-click="returnFalse">click me</span>' +
							'<span id="return_undefined" on-click="returnUndefined">click me</span>' +
							'<span id="return_zero" on-click="returnZero">click me</span> ' +
							'<span id="multiHandler" on-click="multiHandler">click me</span> '
			});

			function mockOriginalEvent( original ) {
				preventedDefault = stoppedPropagation = false;
				original.preventDefault = function() { preventedDefault = true; }
				original.stopPropagation = function() { stoppedPropagation = true; }
			}

			ractive.on( 'returnFalse', function ( event ) {
				t.ok( true );
				mockOriginalEvent( event.original );
				return false;
			});
			ractive.on( 'returnUndefined', function ( event ) {
				t.ok( true );
				mockOriginalEvent( event.original );
			});
			ractive.on( 'returnZero', function ( event ) {
				t.ok( true );
				mockOriginalEvent( event.original );
				return 0;
			});

			ractive.on( 'multiHandler', function ( event ) {
				t.ok( true );
				mockOriginalEvent( event.original );
				return false;
			});
			ractive.on( 'multiHandler', function ( event ) {
				t.ok( true );
				mockOriginalEvent( event.original );
				return 0;
			});

			simulant.fire( ractive.nodes.return_false, 'click' );
			t.ok( preventedDefault && stoppedPropagation );

			simulant.fire( ractive.nodes.return_undefined, 'click' );
			t.ok( !preventedDefault && !stoppedPropagation );

			simulant.fire( ractive.nodes.return_zero, 'click' );
			t.ok( !preventedDefault && !stoppedPropagation );

			simulant.fire( ractive.nodes.multiHandler, 'click' );
			t.ok( preventedDefault && stoppedPropagation );
		});


		test( 'event.keypath is set to the innermost context', function ( t ) {
			var ractive;

			expect( 2 );

			ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}<span id="test" on-click="someEvent">click me</span>{{/foo}}',
				data: {
					foo: { bar: 'test' }
				}
			});

			ractive.on( 'someEvent', function ( event ) {
				t.equal( event.keypath, 'foo' );
				t.equal( event.context.bar, 'test' );
			});

			simulant.fire( ractive.nodes.test, 'click' );
		});

		test( 'event.index stores current indices against their references', function ( t ) {
			var ractive;

			expect( 4 );

			ractive = new Ractive({
				el: fixture,
				template: '<ul>{{#array:i}}<li id="item_{{i}}" on-click="someEvent">{{i}}: {{.}}</li>{{/array}}</ul>',
				data: {
					array: [ 'a', 'b', 'c', 'd', 'e' ]
				}
			});

			ractive.on( 'someEvent', function ( event ) {
				t.equal( event.node.innerHTML, '2: c' );
				t.equal( event.keypath, 'array.2' );
				t.equal( event.context, 'c' );
				t.deepEqual( event.index, { i: 2 })
			});

			simulant.fire( ractive.nodes.item_2, 'click' );
		});

		test( 'event.index reports nested indices correctly', function ( t ) {
			var ractive;

			expect( 2 );

			ractive = new Ractive({
				el: fixture,
				template: '{{#foo:x}}{{#bar:y}}{{#baz:z}}<span id="test_{{x}}{{y}}{{z}}" on-click="someEvent">{{x}}{{y}}{{z}}</span>{{/baz}}{{/bar}}{{/foo}}',
				data: {
					foo: [
						{
							bar: [
								{
									baz: [ 1, 2, 3 ]
								}
							]
						}
					]
				}
			});

			t.equal( ractive.nodes.test_001.innerHTML, '001' );

			ractive.on( 'someEvent', function ( event ) {
				t.deepEqual( event.index, { x: 0, y: 0, z: 1 })
			});

			simulant.fire( ractive.nodes.test_001, 'click' );
		});

		test( 'proxy events can have dynamic names', function ( t ) {
			var ractive, last;

			expect( 2 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="do_{{something}}">click me</span>',
				data: { something: 'foo' }
			});

			ractive.on({
				do_foo: function ( event ) {
					last = 'foo';
				},
				do_bar: function ( event ) {
					last = 'bar';
				}
			});

			simulant.fire( ractive.nodes.test, 'click' );
			t.equal( last, 'foo' );

			ractive.set( 'something', 'bar' );

			simulant.fire( ractive.nodes.test, 'click' );
			t.equal( last, 'bar' );
		});

		test( 'proxy event parameters are correctly parsed as JSON, or treated as a string', function ( t ) {
			var ractive, last;

			expect( 3 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="foo" on-click="log:one">click me</span><span id="bar" on-click=\'log:{"bar":true}\'>click me</span><span id="baz" on-click="log:[1,2,3]">click me</span>'
			});

			ractive.on({
				log: function ( event, params ) {
					last = params;
				}
			});

			simulant.fire( ractive.nodes.foo, 'click' );
			t.equal( last, 'one' );

			simulant.fire( ractive.nodes.bar, 'click' );
			t.deepEqual( last, { bar: true } );

			simulant.fire( ractive.nodes.baz, 'click' );
			t.deepEqual( last, [ 1, 2, 3 ] );
		});

		test( 'proxy events can have dynamic arguments', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<span id="foo" on-click="foo:{{foo}}">click me</span>',
				data: { foo: 'bar' }
			});

			expect( 1 );

			ractive.on({
				foo: function ( event, foo ) {
					t.equal( foo, 'bar' );
				}
			});

			simulant.fire( ractive.nodes.foo, 'click' );
		});

		test( 'proxy events can have multiple arguments', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<span id="foo" on-click="one:1,2,3">click me</span><span id="bar" on-click="two:{a:1},{b:2}">click me</span><span id="baz" on-click="three:{c:{{c}}},{d:\'{{d}}\'}">click me</span>',
				data: { c: 3, d: 'four' }
			});

			expect( 7 );

			ractive.on({
				one: function ( event, one, two, three ) {
					t.equal( one, 1 );
					t.equal( two, 2 );
					t.equal( three, 3 );
				},
				two: function ( event, one, two ) {
					t.equal( one.a, 1 );
					t.equal( two.b, 2 );
				},
				three: function ( event, three, four ) {
					t.equal( three.c, 3 );
					t.equal( four.d, 'four' );
				}
			});

			simulant.fire( ractive.nodes.foo, 'click' );
			simulant.fire( ractive.nodes.bar, 'click' );
			simulant.fire( ractive.nodes.baz, 'click' );
		});

		test( 'Splicing arrays correctly modifies proxy events', function ( t ) {
			var ractive;

			expect( 4 );

			ractive = new Ractive({
				el: fixture,
				template: '{{#buttons:i}}<button id="button_{{i}}" on-click="remove:{{i}}">click me</button>{{/buttons}}',
				data: { buttons: new Array(5) }
			});

			ractive.on( 'remove', function ( event, num ) {
				this.get( 'buttons' ).splice( num, 1 );
			});

			t.equal( ractive.findAll( 'button' ).length, 5 );

			simulant.fire( ractive.nodes.button_2, 'click' );
			t.equal( ractive.findAll( 'button' ).length, 4 );

			simulant.fire( ractive.nodes.button_2, 'click' );
			t.equal( ractive.findAll( 'button' ).length, 3 );

			simulant.fire( ractive.nodes.button_2, 'click' );
			t.equal( ractive.findAll( 'button' ).length, 2 );
		});

		test( 'Splicing arrays correctly modifies two-way bindings', function ( t ) {
			var ractive, items;

			expect( 25 );

			items = [
				{ description: 'one' },
				{ description: 'two', done: true },
				{ description: 'three' }
			];

			ractive = new Ractive({
				el: fixture,
				template: '<ul>{{#items:i}}<li><input id="input_{{i}}" type="checkbox" checked="{{.done}}"> {{description}}</li>{{/items}}</ul>',
				data: { items: items }
			});

			// 1-3
			t.equal( ractive.nodes.input_0.checked, false );
			t.equal( ractive.nodes.input_1.checked, true );
			t.equal( ractive.nodes.input_2.checked, false );

			// 4-6
			t.equal( !!ractive.get( 'items.0.done' ), false );
			t.equal( !!ractive.get( 'items.1.done' ), true );
			t.equal( !!ractive.get( 'items.2.done' ), false );

			simulant.fire( ractive.nodes.input_0, 'click' );

			// 7-9
			t.equal( ractive.nodes.input_0.checked, true );
			t.equal( ractive.nodes.input_1.checked, true );
			t.equal( ractive.nodes.input_2.checked, false );

			// 10-12
			t.equal( !!ractive.get( 'items.0.done' ), true );
			t.equal( !!ractive.get( 'items.1.done' ), true );
			t.equal( !!ractive.get( 'items.2.done' ), false );

			items.shift();

			// 13-14
			t.equal( ractive.nodes.input_0.checked, true );
			t.equal( ractive.nodes.input_1.checked, false );

			// 15-16
			t.equal( !!ractive.get( 'items.0.done' ), true );
			t.equal( !!ractive.get( 'items.1.done' ), false );

			simulant.fire( ractive.nodes.input_0, 'click' );

			// 17-18
			t.equal( ractive.nodes.input_0.checked, false );
			t.equal( ractive.nodes.input_1.checked, false );

			// 19-20
			t.equal( !!ractive.get( 'items.0.done' ), false );
			t.equal( !!ractive.get( 'items.1.done' ), false );

			simulant.fire( ractive.nodes.input_1, 'click' );

			// 21-22
			t.equal( ractive.nodes.input_0.checked, false );
			t.equal( ractive.nodes.input_1.checked, true );

			// 23-24
			t.equal( !!ractive.get( 'items.0.done' ), false );
			t.equal( !!ractive.get( 'items.1.done' ), true );

			// 25
			t.equal( ractive.findAll( 'input' ).length, 2 );
		});

		test( 'Calling ractive.off() without a keypath removes all handlers', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: 'doesn\'t matter'
			});

			expect( 0 );

			ractive.on({
				foo: function () {
					t.ok( false );
				},
				bar: function () {
					t.ok( false );
				},
				baz: function () {
					t.ok( false );
				}
			});

			ractive.off();

			ractive.fire( 'foo' );
			ractive.fire( 'bar' );
			ractive.fire( 'baz' );
		});

		test( 'Changes triggered by two-way bindings propagate properly (#460)', function ( t ) {
			var changes, ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<label><input type="checkbox" checked="{{completed}}"> {{description}}</label>{{/items}}<p class="result">{{ items.filter( completed ).length }}</p>{{# items.filter( completed ).length }}<p class="conditional">foo</p>{{/ items.filter( completed ).length }}',
				data: {
					items: [
						{ completed: true, description: 'fix this bug' },
						{ completed: false, description: 'fix other bugs' },
						{ completed: false, description: 'housework' }
					],
					completed: function ( item ) {
						return !!item.completed;
					}
				}
			});

			ractive.on( 'change', function ( c ) {
				changes = c;
			});

			t.htmlEqual( ractive.find( '.result' ).innerHTML, '1' );

			simulant.fire( ractive.findAll( 'input' )[1], 'click' );
			t.htmlEqual( ractive.find( '.result' ).innerHTML, '2' );

			t.equal( changes[ 'items.1.completed' ], true );

			simulant.fire( ractive.findAll( 'input' )[0], 'click' );
			simulant.fire( ractive.findAll( 'input' )[1], 'click' );
			t.htmlEqual( ractive.find( '.result' ).innerHTML, '0' );
		});

		test( 'Multiple events can share the same directive', function ( t ) {
			var ractive, count = 0;

			ractive = new Ractive({
				el: fixture,
				template: '<div on-click-mouseover="foo"></div>'
			});

			ractive.on( 'foo', function () {
				count += 1;
			});

			simulant.fire( ractive.find( 'div' ), 'click' );
			t.equal( count, 1 );

			simulant.fire( ractive.find( 'div' ), 'mouseover' );
			t.equal( count, 2 );
		});

		test( 'Superfluous whitespace is ignored', function ( t ) {
			var ractive, fooCount = 0, barCount = 0;

			ractive = new Ractive({
				el: fixture,
				template: '<div class="one" on-click=" foo "></div><div class="two" on-click="{{#bar}} bar {{/}}"></div>'
			});

			ractive.on({
				foo: function () {
					fooCount += 1;
				},
				bar: function () {
					barCount += 1;
				}
			});

			simulant.fire( ractive.find( '.one' ), 'click' );
			t.equal( fooCount, 1 );

			simulant.fire( ractive.find( '.two' ), 'click' );
			t.equal( barCount, 0 );

			ractive.set( 'bar', true );
			simulant.fire( ractive.find( '.two' ), 'click' );
			t.equal( barCount, 1 );
		});

		test( 'Multiple space-separated events can be handled with a single callback (#731)', function ( t ) {
			var ractive, count = 0;

			ractive = new Ractive({});

			ractive.on( ' foo bar  baz', () => count += 1 );

			ractive.fire( 'foo' );
			t.equal( count, 1 );

			ractive.fire( 'bar' );
			t.equal( count, 2 );

			ractive.fire( 'baz' );
			t.equal( count, 3 );

			ractive.off( ' bar  foo ' );

			ractive.fire( 'foo' );
			t.equal( count, 3 );

			ractive.fire( 'bar' );
			t.equal( count, 3 );

			ractive.fire( 'baz' );
			t.equal( count, 4 );
		});

		test( 'ractive.off() is chainable (#677)', t => {
			var ractive, returnedValue;

			ractive = new Ractive();
			returnedValue = ractive.off('foo');

			t.equal( returnedValue, ractive );
		});

		test( 'Events really do not call addEventListener when no proxy name', function ( t ) {
			var ractive,
				addEventListener = Element.prototype.addEventListener,
				errorAdd = function(){
					throw new Error('addEventListener should not be called')
				};

			try {
				Element.prototype.addEventListener = errorAdd;

				expect( 1 );

				ractive = new Ractive({
					el: fixture,
					template: '<span id="test" on-click="{{foo}}">click me</span>'
				});

				ractive.on('bar', function(){
					t.ok( true );
				})

				simulant.fire( ractive.nodes.test, 'click' );

				Element.prototype.addEventListener = addEventListener;
				ractive.set( 'foo', 'bar' );
				simulant.fire( ractive.nodes.test, 'click' );

				Element.prototype.addEventListener = errorAdd;
				ractive.set( 'foo', ' ' );
				simulant.fire( ractive.nodes.test, 'click' );
			}
			finally {
				Element.prototype.addEventListener = addEventListener;
			}

		});

		test( '@index can be used in proxy event directives', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#each letters}}<button on-click="select:{{@index}}"></button>{{/each}}',
				data: { letters: [ 'a', 'b', 'c' ] }
			});

			expect( 1 );

			ractive.on( 'select', function ( event, index ) {
				t.equal( index, 1 );
			});

			simulant.fire( ractive.findAll( 'button' )[1], 'click' );
		});


	};

});
