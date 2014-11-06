define([ 'ractive' ], function ( Ractive ) {

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'Events' );

		test( 'on-click="someEvent" fires an event when user clicks the element', t => {
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

		test( 'empty event on-click="" ok', t => {
			var ractive;

			expect( 0 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="">click me</span>'
			});

			simulant.fire( ractive.nodes.test, 'click' );
		})

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

		test( 'sharing names with array mutator functions doesn\'t break events', t => {
			var ractive,
				eventNames = ['sort', 'reverse', 'push', 'pop', 'shift', 'unshift', 'fhtagn'], // the last one just tests the test
				results = new Object(null);

			expect(eventNames.length);

			ractive = new Ractive({
				el: fixture,
				template: ''
			});

			eventNames.forEach(function(eventName) {
				ractive.on( eventName, function () { results[eventName] = true; });
				ractive.fire( eventName );
				t.ok( typeof( results[eventName] ) != 'undefined', 'Event "'+eventName+'" did not fire.' );
			});
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


		test( 'Standard events have correct properties: node, original, keypath, context, index, name', t => {
			var ractive;

			expect( 6 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="someEvent">click me</span>'
			});

			ractive.on( 'someEvent', function ( event ) {
				t.equal( event.node, ractive.nodes.test );
				t.equal( event.name, 'someEvent' );
				t.ok( event.original );
				t.equal( event.keypath, '' );
				t.equal( event.context, ractive.data );
				t.ok( typeof event.index === 'object' && Object.keys( event.index ).length === 0 );
			});

			simulant.fire( ractive.nodes.test, 'click' );
		});

		test( 'Empty event names are safe, though do not fire', t => {
			var ractive = new Ractive();

			expect( 1 );
			ractive.on( '', function ( event ) {
				throw new Error( 'Empty event name should not fire' );
			});
			ractive.fire( '' );
			t.ok( true );
		});

		test( 'preventDefault and stopPropagation if event handler returned false', t => {
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


		test( 'event.keypath is set to the innermost context', t => {
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

		test( 'event.index stores current indices against their references', t => {
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
				t.equal( event.index.i, 2 );
			});

			simulant.fire( ractive.nodes.item_2, 'click' );
		});

		test( 'event.index reports nested indices correctly', t => {
			var ractive;

			expect( 4 );

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
				t.equal( event.index.x, 0 );
				t.equal( event.index.y, 0 );
				t.equal( event.index.z, 1 );
			});

			simulant.fire( ractive.nodes.test_001, 'click' );
		});

		test( 'proxy events can have dynamic names', t => {
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

		test( 'proxy event parameters are correctly parsed as JSON, or treated as a string', t => {
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

		test( 'proxy events can have dynamic arguments', t => {
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

		test( 'proxy events can have multiple arguments', t => {
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

		test( 'Splicing arrays correctly modifies proxy events', t => {
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

		test( 'Splicing arrays correctly modifies two-way bindings', t => {
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

		test( 'Calling ractive.off() without a keypath removes all handlers', t => {
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

		test( 'Changes triggered by two-way bindings propagate properly (#460)', t => {
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

		test( 'Multiple events can share the same directive', t => {
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

		test( 'Superfluous whitespace is ignored', t => {
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

		test( 'Multiple space-separated events can be handled with a single callback (#731)', t => {
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

		test( 'Events really do not call addEventListener when no proxy name', t => {
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

		test( '@index can be used in proxy event directives', t => {
			var ractive = new Ractive({
				el: fixture,
				template: `{{#each letters}}
				             <button class="proxy" on-click="select:{{@index}}"></button>
				             <button class="method" on-click="select(@index)"></button>
				           {{/each}}`,
				data: { letters: [ 'a', 'b', 'c' ] }
			});

			expect( 3 );

			ractive.select = ( idx ) => t.equal( idx, 1 );

			ractive.on( 'select', ( event, index ) => t.equal( index, 1 ) );

			simulant.fire( ractive.findAll( 'button[class=proxy]' )[1], 'click' );
			simulant.fire( ractive.findAll( 'button[class=method]' )[1], 'click' );

			ractive.splice( 'letters', 0, 1 );
			ractive.splice( 'letters', 1, 0, 'a' );
			simulant.fire( ractive.findAll( 'button[class=method]' )[1], 'click' );
		});

		test( 'Calling a builtin method', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: `<button on-click='set("foo",foo+1)'>{{foo}}</button>`,
				data: { foo: 0 }
			});

			simulant.fire( ractive.find( 'button' ), 'click' );
			t.equal( ractive.get( 'foo' ), 1 );
			t.htmlEqual( fixture.innerHTML, '<button>1</button>' );
		});

		test( 'Calling a custom method', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: `<button on-click='activate()'>{{foo}}</button>`,
				activate: function () {
					t.ok( true );
					t.equal( this, ractive );
				}
			});

			ractive = new Widget({
				el: fixture
			});

			expect( 2 );
			simulant.fire( ractive.find( 'button' ), 'click' );
		});

		test( 'Calling an unknown method', function ( t ) {
			var Widget, ractive, onerror;

			Widget = Ractive.extend({
				template: `<button on-click='activate()'>{{foo}}</button>`
			});

			ractive = new Widget({
				el: fixture
			});

			// Catching errors inside handlers for programmatically-fired events
			// is a world of facepalm http://jsfiddle.net/geoz2tks/
			onerror = window.onerror;
			window.onerror = function ( err ) {
				t.ok( /Attempted to call a non-existent method \(\"activate\"\)/.test( err ) )
				return true;
			};

			simulant.fire( ractive.find( 'button' ), 'click' );
			window.onerror = onerror;
		});

		test( 'Passing the event object to a method', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: `<button on-click='activate(event)'>{{foo}}</button>`,
				activate: function ( event ) {
					t.equal( event.original.type, 'click' );
				}
			});

			ractive = new Widget({
				el: fixture
			});

			expect( 1 );
			simulant.fire( ractive.find( 'button' ), 'click' );
		});

		test( 'Passing a child of the event object to a method', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: `<button on-click='activate(event.original.type)'>{{foo}}</button>`,
				activate: function ( type ) {
					t.equal( type, 'click' );
				}
			});

			ractive = new Widget({
				el: fixture
			});

			expect( 1 );
			simulant.fire( ractive.find( 'button' ), 'click' );
		});

		// Bit of a cheeky workaround...
		test( 'Passing a reference to this.event', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: `<button on-click='activate(.event)'>{{foo}}</button>`,
				activate: function ( event ) {
					t.equal( event, 'Christmas' );
				}
			});

			ractive = new Widget({
				el: fixture,
				data: {
					event: 'Christmas'
				}
			});

			expect( 1 );
			simulant.fire( ractive.find( 'button' ), 'click' );
		});

		test( 'Current event is available to method handler as this.event (#1403)', t => {
			var ractive = new Ractive({
				el: fixture,
				template: '<button on-click="test(event)"></button>',
				test: function( event ) {
					t.equal( event, this.event );
					t.equal( ractive, this );
				}
			});

			expect( 2 );
			simulant.fire( ractive.find( 'button' ), 'click' );
		});


		var Component, Middle, View, setup;

		setup = {
			setup: function(){
				Component = Ractive.extend({
					template: '<span id="test" on-click="someEvent">click me</span>'
				});

				Middle = Ractive.extend({
					template: '<component/>'
				});

				View = Ractive.extend({
					el: fixture,
					template: '<middle/>',
					components: {
						component: Component,
						middle: Middle
					}
				});

			},
			teardown: function(){
				Component = Middle = View = void 0;
			}
		};

		function fired ( event ) {
			ok( true );
		}

		function goodEvent( event ) {
			ok( event.context || event === 'foo' );
		}

		function goodEventWithArg( event, arg ) {
			equal( arg || event, 'foo' );
		}

		function shouldNotFire () {
			throw new Error( 'This event should not fire' );
		}

		function notOnOriginating () {
			throw new Error( 'Namespaced event should not fire on originating component' );
		}

		function shouldBeNoBubbling () {
			throw new Error( 'Event bubbling should not have happened' );
		}

		function testEventBubbling( fire ) {

			test( 'Events bubble under "eventname", and also "component.eventname" above firing component', t => {
				var ractive, middle, component;

				expect( 3 );

				ractive = new View();
				middle = ractive.findComponent( 'middle' );
				component = ractive.findComponent( 'component' );

				component.on( 'someEvent', goodEvent );
				component.on( 'component.someEvent', notOnOriginating );

				middle.on( 'someEvent', shouldNotFire );
				middle.on( 'component.someEvent', goodEvent );

				ractive.on( 'someEvent', shouldNotFire );
				ractive.on( 'component.someEvent', goodEvent );

				fire( ractive.findComponent( 'component' ) );
			});

			test( 'arguments bubble', t => {
				var ractive, middle, component;

				expect( 3 );

				Component.prototype.template = '<span id="test" on-click="someEvent:foo">click me</span>'

				ractive = new View();
				middle = ractive.findComponent( 'middle' );
				component = ractive.findComponent( 'component' );

				component.on( 'someEvent', goodEventWithArg );
				component.on( 'component.someEvent', notOnOriginating );

				middle.on( 'someEvent', shouldNotFire );
				middle.on( 'component.someEvent', goodEventWithArg );

				ractive.on( 'someEvent', shouldNotFire );
				ractive.on( 'component.someEvent', goodEventWithArg );

				fire( ractive.findComponent( 'component' ) );
			});

			test( 'bubbling events can be stopped by returning false', t => {
				var ractive, middle, component;

				expect( 2 );

				ractive = new View();
				middle = ractive.findComponent( 'middle' );
				component = ractive.findComponent( 'component' );

				component.on( 'someEvent', goodEvent );
				component.on( 'component.someEvent', notOnOriginating );

				middle.on( 'component.someEvent', function( event ) {
					return false;
				});
				// still fires on same level
				middle.on( 'component.someEvent', goodEvent );

				ractive.on( 'component.someEvent', shouldBeNoBubbling );

				fire( ractive.findComponent( 'component' ) );
			});

			test( 'bubbling events with event object have component reference', t => {
				var ractive, middle, component;

				expect( 3 );

				ractive = new View();
				middle = ractive.findComponent( 'middle' );
				component = ractive.findComponent( 'component' );

				function hasComponentRef( event, arg ) {
					event.original ? t.equal( event.component, component ) : t.ok( true );
				}

				component.on( 'someEvent', function( event ) {
					t.ok( !event.component );
				});
				middle.on( 'component.someEvent', hasComponentRef );
				ractive.on( 'component.someEvent', hasComponentRef );

				fire( ractive.findComponent( 'component' ) );
			});

		}


		module( 'Component events bubbling proxy events', setup )

		testEventBubbling( function ( component ) {
			simulant.fire( component.nodes.test, 'click' );
		});

		module( 'Component events bubbling fire() events', setup )

		testEventBubbling( function ( component ) {
			component.fire( 'someEvent', 'foo' );
		});

		module( 'Event pattern matching' );

		test( 'handlers can use pattern matching', t => {
			var ractive;

			expect( 4 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="some.event">click me</span>'
			});

			ractive.on( '*.*', fired);
			ractive.on( 'some.*', fired);
			ractive.on( '*.event', fired);
			ractive.on( 'some.event', fired);

			simulant.fire( ractive.nodes.test, 'click' );
		});

		test( 'bubbling handlers can use pattern matching', t => {
			var Component, component, ractive;

			expect( 4 );

			Component = Ractive.extend({
				template: '<span id="test" on-click="foo">click me</span>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<component/>',
				components: {
					component: Component
				}
			});

			ractive.on( '*.*', fired);
			ractive.on( 'component.*', fired);
			ractive.on( '*.foo', fired);
			ractive.on( 'component.foo', fired);

			component = ractive.findComponent( 'component' );
			simulant.fire( component.nodes.test, 'click' );

			// otherwise we get cross test failure due to "teardown" event
			// becasue we're reusing fixture element
			ractive.off();
		});

		test( 'component "on-someEvent" implicitly cancels bubbling', t => {
			var Component, component, ractive;

			expect( 1 );

			Component = Ractive.extend({
				template: '<span id="test" on-click="someEvent">click me</span>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<component on-someEvent="foo"/>',
				components: {
					component: Component
				}
			});

			ractive.on( 'foo', fired);
			ractive.on( 'component.someEvent', shouldBeNoBubbling);

			component = ractive.findComponent( 'component' );
			simulant.fire( component.nodes.test, 'click' );
		});

		test( 'component "on-" wildcards match', t => {
			var Component, component, ractive;

			expect( 3 );

			Component = Ractive.extend({
				template: '<span id="test" on-click="foo.bar">click me</span>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<component on-foo.*="foo" on-*.bar="bar" on-*.*="both"/>',
				components: {
					component: Component
				}
			});

			ractive.on( 'foo', fired);
			ractive.on( 'bar', fired);
			ractive.on( 'both', fired);

			component = ractive.findComponent( 'component' );
			simulant.fire( component.nodes.test, 'click' );
		});

		test( 'component "on-" do not get auto-namespaced events', t => {
			var Component, component, ractive;

			expect( 1 );

			Component = Ractive.extend({
				template: '<span id="test" on-click="someEvent">click me</span>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<component on-component.someEvent="foo"/>',
				components: {
					component: Component
				}
			});

			ractive.on( 'foo', shouldNotFire);

			component = ractive.findComponent( 'component' );
			simulant.fire( component.nodes.test, 'click' );
			t.ok( true );
		});

		test( 'component "on-" handles arguments correctly', t => {
			var Component, component, ractive;

			expect( 4 );

			Component = Ractive.extend({
				template: '<span id="test" on-click="foo:\'foo\'">click me</span>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<component on-foo="foo-reproxy" on-bar="bar-reproxy" on-bizz="bizz-reproxy"/>',
				components: {
					component: Component
				}
			});

			ractive.on( 'foo-reproxy', ( e, arg ) => {
				t.equal( e.original.type, 'click' );
				t.equal( arg, 'foo' );
			});
			ractive.on( 'bar-reproxy', ( arg ) => {
				t.equal( arg, 'bar' );
			});
			ractive.on( 'bizz-reproxy', () => {
				t.equal( arguments.length, 0 );
			});

			component = ractive.findComponent( 'component' );
			simulant.fire( component.nodes.test, 'click' );
			component.fire( 'bar', 'bar' );
			component.fire( 'bizz' );
		});


		module( 'Touch events' );

		test( 'touch events safe to include when they don\'t exist in browser', t => {
			var ractive;

			expect( 1 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test1" on-touchstart-touchend-touchleave-touchmove-touchcancel="foo"/>' +
					'<span id="test2" on-touchstart-mousedown="foo"/>',
				debug: true
			});

			ractive.on( 'foo', function () {
				t.ok( true );
			})

			simulant.fire( ractive.nodes.test2, 'mousedown' );

		});

		module( 'this.events' );

		test( 'set to current event object', t => {
			var ractive;

			expect( 1 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="foo"/>'
			});

			ractive.on( 'foo', function ( event ) {
				t.equal( this.event, event );
			})

			simulant.fire( ractive.nodes.test, 'click' );

		});

		test( 'exists on ractive.fire()', t => {
			var ractive, data = { foo: 'bar' };

			expect( 4 );

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="foo"/>',
				data: data
			});

			ractive.on( 'foo', function () {
				var e;
				t.ok( e = this.event );
				t.equal( e.name, 'foo' );
				t.equal( e.keypath, '' );
				t.equal( e.context, data );
			})

			ractive.fire( 'foo' );
		});

		test( 'wildcard and multi-part listeners have correct event name', t => {
			var ractive, fired = [], events;

			ractive = new Ractive({
				el: fixture,
				template: '<span id="test" on-click="foo"/>'
			});

			ractive.on( 'foo.* fuzzy *.bop', function () {
				fired.push( this.event.name );
			})

			events = [ 'foo.bar', 'fuzzy', 'foo.fizz', 'bip.bop' ];
			events.forEach( ractive.fire.bind( ractive ) );

			t.deepEqual( fired, events );
		});

		module( 'Issues' );

		asyncTest( 'Grandchild component teardown when nested in element (#1360)', t => {
			var ractive, Child, Grandchild, torndown = [];

			Child = Ractive.extend({
				template:  `<div>
								{{#each model.grandChildTitles}}
	    							<grandchild item="{{.}}" />
	    						{{/each}}
	    					</div>`,
	    		onteardown: function() {
					torndown.push( this );
				}
			});

			Grandchild = Ractive.extend({
				template: '{{title}}',
	    		onteardown: function() {
					torndown.push( this );
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#if model.childTitle}}<child model="{{model}}"/>{{/if}}',
				data: {
					model : {
						title : 'parent',
						childTitle : 'child',
						grandChildTitles : [
							{ title : 'one' },
							{ title : 'two' },
							{ title : 'three' }
						]
					}
				},
				components: {
					child: Child,
					grandchild: Grandchild
				}
			});

			setTimeout(function() {
				ractive.set('model', {});
				t.equal( torndown.length, 4 );
				QUnit.start()
			});


		});

		test( 'event references in method call handler should not create a null resolver (#1438)', t => {
			let ractive = new Ractive({
				el: fixture,
				template: `{{#foo}}<button on-click="test(event.keypath + '.foo')">Click</button>{{/}}`,
				test: function() { }
			});

			ractive.set( 'foo', true );

			// NOTE: if this throws and you're testing in browser, it will probably cause a half-ton of
			// other unrelated tests to fail as well
			ractive.set( 'foo', false );

			t.htmlEqual( fixture.innerHTML, '' );
		});

		test( 'twoway may be overridden on a per-element basis', t => {
			let ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" twoway="true" />',
				data: { foo: 'test' },
				twoway: false
			});

			let node = ractive.find( 'input' );
			node.value = 'bar';
			simulant.fire( node, 'change' );
			t.equal( ractive.get( 'foo' ), 'bar' );

			ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" twoway="false" />',
				data: { foo: 'test' },
				twoway: true
			});

			node = ractive.find( 'input' );
			node.value = 'bar';
			simulant.fire( node, 'change' );
			t.equal( ractive.get( 'foo' ), 'test' );
		});

		test( 'lazy may be overriden on a per-element basis', t => {
			let ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="true" />',
				data: { foo: 'test' },
				lazy: false
			});

			let node = ractive.find( 'input' );
			node.value = 'bar';
			simulant.fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'test' );
			simulant.fire( node, 'blur' );
			t.equal( ractive.get( 'foo' ), 'bar' );

			ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="false" />',
				data: { foo: 'test' },
				lazy: true
			});

			node = ractive.find( 'input' );
			node.value = 'bar';
			simulant.fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'bar' );
		});

		asyncTest( 'lazy may be set to a number to trigger on a timeout', t => {
			let ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="50" />',
				data: { foo: 'test' }
			});

			let node = ractive.find( 'input' );
			node.value = 'bar';
			simulant.fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'test' );

			setTimeout( () => {
				t.equal( ractive.get( 'foo' ), 'test' );
			}, 5 );

			setTimeout( () => {
				t.equal( ractive.get( 'foo' ), 'bar' );
				QUnit.start();
			}, 60 );
		});
	};

});
