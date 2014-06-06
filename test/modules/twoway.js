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

		test( 'Number and range input values are coerced', function ( t ) {
			var ractive, inputs;

			ractive = new Ractive({
				el: fixture,
				template: '<input value="{{a}}" type="number"><input value="{{b}}" type="number">{{a}}+{{b}}={{a+b}}'
			});

			t.equal( ractive.get( 'a' ), undefined );
			t.equal( ractive.get( 'b' ), undefined );

			inputs = ractive.findAll( 'input' );
			inputs[0].value = '40';
			inputs[1].value = '2';
			ractive.updateModel();
			t.htmlEqual( fixture.innerHTML, '<input type="number"><input type="number">40+2=42' );
		});

	};

});
