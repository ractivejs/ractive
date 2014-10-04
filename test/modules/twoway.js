define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'Two-way bindings' );

		test( 'Two-way bindings work with index references', function ( t ) {
			var input, ractive;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<label><input value="{{items[i].name}}"> {{name}}</label>{{/items}}',
				data: { items: [{ name: 'foo' }, { name: 'bar' }] }
			});

			input = ractive.find( 'input' );

			input.value = 'baz';
			simulant.fire( input, 'change' );
			t.equal( ractive.get( 'items[0].name' ), 'baz' );
			t.htmlEqual( fixture.innerHTML, '<label><input> baz</label><label><input> bar</label>' );
		});

		test( 'Two-way bindings work with foo["bar"] type notation', function ( t ) {
			var input, ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<label><input value={{foo["bar"]["baz"]}}> {{foo.bar.baz}}</label>',
				data: { foo: { bar: { baz: 1 } } }
			});

			input = ractive.find( 'input' );

			input.value = 2;
			simulant.fire( input, 'change' );

			t.equal( ractive.get( 'foo.bar.baz' ), 2 );
			t.htmlEqual( fixture.innerHTML, '<label><input> 2</label>' );
		});

		test( 'Two-way bindings work with arbitrary expressions that resolve to keypaths', function ( t ) {
			var input, ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<label><input value={{foo["bar"][ a+1 ].baz[ b ][ 1 ] }}> {{ foo.bar[1].baz.qux[1] }}</label>',
				data: {
					foo: {
						bar: [
							null,
							{ baz: { qux: [ null, 'yes' ] } }
						]
					},
					a: 0,
					b: 'qux'
				}
			});

			input = ractive.find( 'input' );

			input.value = 'it works';
			simulant.fire( input, 'change' );

			t.equal( ractive.get( 'foo.bar[1].baz.qux[1]' ), 'it works' );
			t.htmlEqual( fixture.innerHTML, '<label><input> it works</label>' );
		});

		test( 'An input whose value is updated programmatically will update the model on blur (#644)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}">',
				data: { foo: 'bar' }
			});

			try {
				ractive.find( 'input' ).value = 'baz';
				simulant.fire( ractive.find( 'input' ), 'blur' );

				t.equal( ractive.get( 'foo' ), 'baz' );
			} catch ( err ) {
				t.ok( true ); // otherwise phantomjs throws a hissy fit
			}
		});

		test( 'Model is validated on blur, and the view reflects the validate model (#644)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}">',
				data: { foo: 'bar' }
			});

			ractive.observe( 'foo', function ( foo ) {
				this.set( 'foo', foo.toUpperCase() );
			});

			try {
				ractive.find( 'input' ).value = 'baz';
				simulant.fire( ractive.find( 'input' ), 'blur' );

				t.equal( ractive.find( 'input' ).value, 'BAZ' );
			} catch ( err ) {
				t.ok( true ); // phantomjs
			}
		});

		test( 'Two-way data binding is not attempted on elements with no mustache binding', function ( t ) {
			expect(0);

			// This will throw an error if the binding is attempted (Issue #750)
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="radio"><input type="checkbox"><input type="file"><select></select><textarea></textarea><div contenteditable="true"></div>'
			});
		});

		test( 'Uninitialised values should be initialised with whatever the \'empty\' value is (#775)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}">'
			});

			t.equal( ractive.get( 'foo' ), '' );
		});

		test( 'Contenteditable elements can be bound via the value attribute', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<div contenteditable="true" value="{{content}}"><strong>some content</strong></div>',
			});

			t.equal( ractive.get( 'content' ), '<strong>some content</strong>' );
			t.htmlEqual( fixture.innerHTML, '<div contenteditable="true"><strong>some content</strong></div>' );

			ractive.set( 'content', '<p>some different content</p>' );
			t.htmlEqual( fixture.innerHTML, '<div contenteditable="true"><p>some different content</p></div>' );
		});

		test( 'Existing model data overrides contents of contenteditable elements', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<div contenteditable="true" value="{{content}}"><strong>some content</strong></div>',
				data: { content: 'overridden' }
			});

			t.equal( ractive.get( 'content' ), 'overridden' );
			t.htmlEqual( fixture.innerHTML, '<div contenteditable="true">overridden</div>' );
		});

		test( 'The order of attributes does not affect contenteditable (#1134)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: `
					<div value='{{foo}}' contenteditable='true'></div>
					<div contenteditable='true' value='{{bar}}'></div>`,
				data: {
					foo: 'one',
					bar: 'two'
				}
			});

			t.htmlEqual( fixture.innerHTML, '<div contenteditable="true">one</div><div contenteditable="true">two</div>' );
		});

		[ 'number', 'range' ].forEach( function ( type ) {
			test( 'input type=' + type + ' values are coerced', function ( t ) {
				var ractive, inputs;

				ractive = new Ractive({
					el: fixture,
					template: '<input value="{{a}}" type="' + type + '"><input value="{{b}}" type="' + type + '">{{a}}+{{b}}={{a+b}}'
				});

				t.equal( ractive.get( 'a' ), undefined );
				t.equal( ractive.get( 'b' ), undefined );

				inputs = ractive.findAll( 'input' );
				inputs[0].value = '40';
				inputs[1].value = '2';
				ractive.updateModel();
				t.htmlEqual( fixture.innerHTML, '<input type="' + type + '"><input type="' + type + '">40+2=42' );
			});
		});

		test( 'The model updates to reflect which checkbox inputs are checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="green" type="checkbox" name="{{colors}}" value="blue" checked><input id="blue" type="checkbox" name="{{colors}}" value="green" checked>'
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'blue', 'green' ] );
			t.ok( !ractive.nodes.red.checked );
			t.ok( ractive.nodes.blue.checked );
			t.ok( ractive.nodes.green.checked );

			ractive = new Ractive({
				el: fixture,
				template: '<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="green" type="checkbox" name="{{colors}}" value="blue"><input id="blue" type="checkbox" name="{{colors}}" value="green">'
			});

			t.deepEqual( ractive.get( 'colors' ), [] );
			t.ok( !ractive.nodes.red.checked );
			t.ok( !ractive.nodes.blue.checked );
			t.ok( !ractive.nodes.green.checked );
		});

		test( 'The model overrides which checkbox inputs are checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="blue" type="checkbox" name="{{colors}}" value="blue" checked><input id="green" type="checkbox" name="{{colors}}" value="green" checked>',
				data: { colors: [ 'red', 'blue' ] }
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'red', 'blue' ] );
			t.ok( ractive.nodes.red.checked );
			t.ok( ractive.nodes.blue.checked );
			t.ok( !ractive.nodes.green.checked );
		});

		test( 'The model updates to reflect which radio input is checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" name="{{color}}" value="red"><input type="radio" name="{{color}}" value="blue" checked><input type="radio" name="{{color}}" value="green">'
			});

			t.deepEqual( ractive.get( 'color' ), 'blue' );

			ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" name="{{color}}" value="red"><input type="radio" name="{{color}}" value="blue"><input type="radio" name="{{color}}" value="green">'
			});

			t.deepEqual( ractive.get( 'color' ), undefined );
		});

		test( 'The model overrides which radio input is checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input id="red" type="radio" name="{{color}}" value="red"><input id="blue" type="radio" name="{{color}}" value="blue" checked><input id="green" type="radio" name="{{color}}" value="green">',
				data: { color: 'green' }
			});

			t.deepEqual( ractive.get( 'color' ), 'green' );
			t.ok( !ractive.nodes.red.checked );
			t.ok( !ractive.nodes.blue.checked );
			t.ok( ractive.nodes.green.checked );
		});

		test( 'updateModel correctly updates the value of a text input', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{name}}">',
				data: { name: 'Bob' }
			});

			ractive.find( 'input' ).value = 'Jim';
			ractive.updateModel( 'name' );

			t.equal( ractive.get( 'name' ), 'Jim' );
		});

		test( 'updateModel correctly updates the value of a select', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{selected}}"><option selected value="red">red</option><option value="blue">blue</option><option value="green">green</option></select>'
			});

			t.equal( ractive.get( 'selected' ), 'red' );

			ractive.findAll( 'option' )[1].selected = true;
			ractive.updateModel();

			t.equal( ractive.get( 'selected' ), 'blue' );
		});

		test( 'updateModel correctly updates the value of a textarea', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<textarea value="{{name}}"></textarea>',
				data: { name: 'Bob' }
			});

			ractive.find( 'textarea' ).value = 'Jim';
			ractive.updateModel( 'name' );

			t.equal( ractive.get( 'name' ), 'Jim' );
		});

		test( 'updateModel correctly updates the value of a checkbox', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="checkbox" checked="{{active}}">',
				data: { active: true }
			});

			ractive.find( 'input' ).checked = false;
			ractive.updateModel();

			t.equal( ractive.get( 'active' ), false );
		});

		test( 'updateModel correctly updates the value of a radio', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" checked="{{active}}">',
				data: { active: true }
			});

			ractive.find( 'input' ).checked = false;
			ractive.updateModel();

			t.equal( ractive.get( 'active' ), false );
		});

		test( 'updateModel correctly updates the value of an indirect (name-value) checkbox', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="checkbox" name="{{colour}}" value="red"><input type="checkbox" name="{{colour}}" value="blue" checked><input type="checkbox" name="{{colour}}" value="green">'
			});

			t.deepEqual( ractive.get( 'colour' ), [ 'blue' ] );

			ractive.findAll( 'input' )[2].checked = true;
			ractive.updateModel();

			t.deepEqual( ractive.get( 'colour' ), [ 'blue', 'green' ] );
		});

		test( 'updateModel correctly updates the value of an indirect (name-value) radio', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" name="{{colour}}" value="red"><input type="radio" name="{{colour}}" value="blue" checked><input type="radio" name="{{colour}}" value="green">'
			});

			t.deepEqual( ractive.get( 'colour' ), 'blue' );

			ractive.findAll( 'input' )[2].checked = true;
			ractive.updateModel();

			t.deepEqual( ractive.get( 'colour' ), 'green' );
		});

		test( 'Radio inputs will update the model if another input in their group is checked', function ( t ) {
			var ractive, inputs;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<input type="radio" name="plan" checked="{{ checked }}"/>{{/items}}',
				data: {
					items: [
						{ key: 'a', checked: true  },
						{ key: 'b', checked: false },
						{ key: 'c', checked: false }
					]
				}
			});

			inputs = ractive.findAll( 'input' );
			t.equal( inputs[0].checked, true );

			inputs[1].checked = true;
			simulant.fire( inputs[1], 'change' );
			t.equal( ractive.get( 'items[0].checked' ), false );
			t.equal( ractive.get( 'items[1].checked' ), true );
		});

		test( 'Radio name inputs respond to model changes (regression, see #783)', function ( t ) {
			var ractive, inputs;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<input type="radio" name="{{foo}}" value="{{this}}"/>{{/items}}',
				data: {
					items: [ 'a', 'b', 'c' ]
				}
			});

			inputs = ractive.findAll( 'input' );
			t.equal( ractive.get( 'foo' ), undefined );

			ractive.set( 'foo', 'b' );
			t.ok( inputs[1].checked );

			ractive.set( 'items', [ 'd', 'e', 'f' ]);

			t.equal( ractive.get( 'foo' ), undefined );
			t.ok( !inputs[1].checked );
		});

		test( 'Post-blur validation works (#771)', function ( t ) {
			var ractive, input;

			ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}">{{foo}}'
			});

			ractive.observe( 'foo', function ( foo ) {
				this.set( 'foo', foo.toUpperCase() );
			});

			input = ractive.find( 'input' );
			input.value = 'bar';
			simulant.fire( input, 'change' );

			t.equal( input.value, 'bar' );
			t.equal( ractive.get( 'foo' ), 'BAR' );
			t.htmlEqual( fixture.innerHTML, '<input>BAR' );

			simulant.fire( input, 'change' );
			try {
				simulant.fire( input, 'blur' );

				t.equal( input.value, 'BAR' );
				t.equal( ractive.get( 'foo' ), 'BAR' );
				t.htmlEqual( fixture.innerHTML, '<input>BAR' );
			} catch ( err ) {
				// Oh PhantomJS. You are so very WTF
			}
		});

		test( 'Reference expression radio bindings rebind correctly inside reference expression sections (#904)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#with steps[current] }}<input type="radio" name="{{~/selected[name]}}" value="{{value}}">{{/with}}',
				data: {
					steps: [{ name: 'one', value: 'a' }, { name: 'two', value: 'b' }],
					current: 0
				}
			});

			ractive.find( 'input' ).checked = true;
			ractive.updateModel();
			t.deepEqual( ractive.get( 'selected' ), { one: 'a' });

			ractive.set( 'current', 1 );
			ractive.find( 'input' ).checked = true;
			ractive.updateModel();
			t.deepEqual( ractive.get( 'selected' ), { one: 'a', two: 'b' });
		});

		test( 'Ambiguous reference expressions in two-way bindings attach to the root (#900)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: `
					<p>foo[{{bar}}]: {{foo[bar]}}</p>
					{{#with whatever}}
						<input value='{{foo[bar]}}'>
					{{/with}}`,
				data: {
					bar: 0
				}
			});

			ractive.find( 'input' ).value = 'test';
			ractive.updateModel();

			t.deepEqual( ractive.get( 'foo' ), [ 'test' ] );
			t.htmlEqual( fixture.innerHTML, '<p>foo[0]: test</p><input>' );
		});

		test( 'Static bindings can only be one-way (#1149)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="[[foo]]">{{foo}}',
				data: {
					foo: 'static'
				}
			});

			ractive.find( 'input' ).value = 'dynamic';
			ractive.updateModel();
			t.equal( ractive.get( 'foo' ), 'static' );
			t.htmlEqual( fixture.innerHTML, '<input>static' );
		});

		test( 'input[type="checkbox"] with bound name updates as expected (#1305)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="checkbox" name="{{ch}}" value="foo">',
				data: { ch: 'bar' }
			});

			ractive.set( 'ch', 'foo' );
			t.ok( ractive.find( 'input' ).checked );
		});

	};

});
