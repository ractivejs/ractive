// RENDERING TESTS
// ===============
//
// TODO: add moar tests

define([ 'ractive', 'samples/render' ], function ( Ractive, tests ) {

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' ), runTest, theTest, magicModes, hasSvg, i;

		module ( 'Render' );

		try {
			var obj = {}, _foo;
			Object.defineProperty( obj, 'foo', {
				get: function () {
					return _foo;
				},
				set: function ( value ) {
					_foo = value;
				}
			});
			magicModes = [ false, true ];
		} catch ( err ) {
			magicModes = [ false ];
		}

		hasSvg = document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );

		// argh IE
		if ( ![].reduce ) {
			Array.prototype.reduce = function ( reducer, start ) {
				var i, len, reduced;

				reduced = start || 0;

				len = this.length;
				for ( i=0; i<len; i+=1 ) {
					if ( this.hasOwnProperty( i ) ) {
						reduced = reducer( reduced, this[i] );
					}
				}

				return reduced;
			};
		}

		runTest = function ( i ) {
			var theTest = tests[i];

			if ( theTest.nodeOnly ) {
				return;
			}

			test( theTest.name, function ( t ) {
				magicModes.forEach( function ( magic ) {
					var view, data;

					data = typeof theTest.data === 'function' ? theTest.data() : deepClone( theTest.data );

					view = new Ractive({
						el: fixture,
						data: data,
						template: theTest.template,
						partials: theTest.partials,
						handlebars: theTest.handlebars, // TODO remove this if handlebars mode becomes default
						debug: true,
						magic: magic
					});

					t.htmlEqual( fixture.innerHTML, theTest.result, 'innerHTML should match result' );
					t.htmlEqual( view.toHTML(), theTest.result, 'toHTML() should match result' );

					if ( theTest.new_data ) {
						data = typeof theTest.new_data === 'function' ? theTest.new_data() : deepClone( theTest.new_data );
						view.set( data );

						t.htmlEqual( fixture.innerHTML, theTest.new_result, 'innerHTML should match result' );
						t.htmlEqual( view.toHTML(), theTest.new_result, 'toHTML() should match result' );
					}

					view.teardown();
				});
			});
		};

		for ( i=0; i<tests.length; i+=1 ) {
			if ( !hasSvg && tests[i].svg ) {
				continue;
			}

			runTest( i );
		}

		if ( Ractive.svg ) {
			test('Style elements have content inserted that becomes .textContent gh #569', function(t){
				var ractive = new Ractive({
						el: fixture,
						template: '<svg><style id="style">text { font-size: 40px }</style></svg>'
					}),
					style = document.getElementById('style');

				t.ok( style );
				t.equal( style.textContent, 'text { font-size: 40px }' )
			});
		}

		test('Nested reference expression updates when array index member changes', function(t){
			var ractive = new Ractive({
				el: fixture,
				template: '{{#item}}{{foo[bar]}}{{/}}',
				data: { item: { foo: ['fizz', 'bizz'], bar: 0 } }
			});

			t.equal( fixture.innerHTML, 'fizz' )
			ractive.set( 'item.bar', 1)
			t.equal( fixture.innerHTML, 'bizz' )

		});

		test('Conditional section with reference expression updates when keypath changes', function(t){
			var ractive = new Ractive({
				el: fixture,
				template: '{{#foo[bar]}}buzz{{/}}',
				data: {
					foo:{ fop: false, bizz: true } ,
					bar: 'fop',
				}
			});

			t.equal( fixture.innerHTML, '' );
			ractive.set( 'bar', 'bizz' );
			t.equal( fixture.innerHTML, 'buzz' );

		});

		test('Input with reference expression updates target when keypath changes', function(t){
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo[bar]}}"/>',
				data: {
					foo:{ fop: 'fop', bizz: 'bizz' } ,
					bar: 'fop',
				}
			});

			ractive.set( 'bar', 'bizz' );
			ractive.find( 'input' ).value = 'buzz';
			ractive.updateModel();
			t.equal( ractive.data.foo.bizz, 'buzz' );

		});

		test('List of inputs with referenceExpression name update correctly', function(t){
			var ractive = new Ractive({
				el: fixture,
				template: "<input type='radio' name='{{responses[topic]}}'/>",
				data: {
					topic: 'Product',
					responses: {}
				}
			});

			ractive.set( 'topic', 'Color' );
			var input = ractive.find('input');
			t.ok( input );
			t.equal( input.name, '{{responses.Color}}' );

		});

		test('List of inputs with nested referenceExpression name updates correctly', function(t){
			var ractive = new Ractive({
				el: fixture,
				template: "{{#step}}{{#options}}<input type='radio' name='{{responses[step.name]}}' value='{{.}}'/>{{/}}{{/}}",
				data: {
					step: {
						name: 'Products',
						options: ['1', '2']
					},
					responses: {}
				}
			});

			ractive.set( 'step', {
				name: 'Colors',
				options: ['red', 'blue', 'yellow']
			});

			expect(3);

			ractive.findAll('input').forEach(function(input){
				t.equal( input.name, '{{responses.Colors}}' )
			});

		});

		test( 'Rendering a non-append instance into an already-occupied element removes the other instance (#1430)', t => {
			var ractive;

			ractive = new Ractive({
				template: 'instance1'
			});
			ractive.render( fixture );

			t.htmlEqual( fixture.innerHTML, 'instance1' );

			ractive = new Ractive({
				template: 'instance2'
			});
			ractive.render( fixture );

			t.htmlEqual( fixture.innerHTML, 'instance2' );
		});

		test( 'Render may be called with a selector (#1430)', t => {
			let ractive = new Ractive({
				template: 'foo'
			});

			fixture.innerHTML = '<div id="foo">bar</div>';

			ractive.render( '#foo' );

			t.htmlEqual( fixture.innerHTML, '<div id="foo">foo</div>' );
		});

		test( 'Array roots should not get confused deps in sections (#1494)', t => {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#.}}{{.foo}}{{/}}',
				data: [{ foo: 'a' }, { foo: 'b' }, { foo: 'c' }]
			});

			t.equal( fixture.innerHTML, 'abc' );
			ractive.set('0.foo', 'z');
			t.equal( fixture.innerHTML, 'zbc' );
		});

		test( 'Value changes in object iteration should cause updates (#1476)', t => {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#obj[sel]:sk}}{{sk}} {{@key}} {{.}}{{/}}',
				data: {
					obj: {
						key1: { a: 'a1', b: 'b1' },
						key2: { a: 'a2', b: 'b2', c: 'c2' },
						key3: { c: 'c3' }
					},
					sel: 'key1'
				}
			});

			t.htmlEqual( fixture.innerHTML, 'a a a1b b b1' );

			ractive.set( 'sel', 'key2' );
			t.htmlEqual( fixture.innerHTML, 'a a a2b b b2c c c2' );

			ractive.set( 'sel', 'key3' );
			t.htmlEqual( fixture.innerHTML, 'c c c3' );

			ractive.set( 'sel', 'key1' );
			t.htmlEqual( fixture.innerHTML, 'a a a1b b b1' );
		});

	};

	function deepClone ( source ) {
		var target, key;

		if ( !source || typeof source !== 'object' ) {
			return source;
		}

		if ( isArray( source ) ) {
			return source.slice();
		}

		target = {};

		for ( key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = deepClone( source[ key ] );
			}
		}

		return target;
	}

	function isArray ( thing ) {
		return Object.prototype.toString.call( thing ) === '[object Array]';
	}

});
