/* global document */
import { fire } from 'simulant';
import { hasUsableConsole, onWarn, initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'twoway.js' );

	test( 'Two-way bindings work with index references', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#items:i}}<label><input value="{{items[i].name}}"> {{name}}</label>{{/items}}',
			data: { items: [{ name: 'foo' }, { name: 'bar' }] }
		});

		const input = ractive.find( 'input' );

		input.value = 'baz';
		fire( input, 'change' );
		t.equal( ractive.get( 'items[0].name' ), 'baz' );
		t.htmlEqual( fixture.innerHTML, '<label><input> baz</label><label><input> bar</label>' );
	});

	test( 'Two-way bindings work with foo["bar"] type notation', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<label><input value={{foo["bar"]["baz"]}}> {{foo.bar.baz}}</label>',
			data: { foo: { bar: { baz: 1 } } }
		});

		const input = ractive.find( 'input' );

		input.value = 2;
		fire( input, 'change' );

		t.equal( ractive.get( 'foo.bar.baz' ), 2 );
		t.htmlEqual( fixture.innerHTML, '<label><input> 2</label>' );
	});

	test( 'Two-way bindings work with arbitrary expressions that resolve to keypaths', t => {
		const ractive = new Ractive({
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

		const input = ractive.find( 'input' );

		input.value = 'it works';
		fire( input, 'change' );

		t.equal( ractive.get( 'foo.bar[1].baz.qux[1]' ), 'it works' );
		t.htmlEqual( fixture.innerHTML, '<label><input> it works</label>' );
	});

	test( 'An input whose value is updated programmatically will update the model on blur (#644)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}">',
			data: { foo: 'bar' }
		});

		try {
			ractive.find( 'input' ).value = 'baz';
			fire( ractive.find( 'input' ), 'blur' );

			t.equal( ractive.get( 'foo' ), 'baz' );
		} catch ( err ) {
			t.ok( true ); // otherwise phantomjs throws a hissy fit
		}
	});

	test( 'Model is validated on blur, and the view reflects the validate model (#644)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}">',
			data: { foo: 'bar' }
		});

		ractive.observe( 'foo', function ( foo ) {
			this.set( 'foo', foo.toUpperCase() );
		});

		try {
			ractive.find( 'input' ).value = 'baz';
			fire( ractive.find( 'input' ), 'blur' );

			t.equal( ractive.find( 'input' ).value, 'BAZ' );
		} catch ( err ) {
			t.ok( true ); // phantomjs
		}
	});

	test( 'Two-way data binding is not attempted on elements with no mustache binding', t => {
		t.expect( 0 );

		// This will throw an error if the binding is attempted (Issue #750)
		new Ractive({
			el: fixture,
			template: '<input type="radio"><input type="checkbox"><input type="file"><select></select><textarea></textarea><div contenteditable="true"></div>'
		});
	});

	test( 'Uninitialised values should be initialised with whatever the \'empty\' value is (#775)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}">'
		});

		t.equal( ractive.get( 'foo' ), '' );
	});

	test( 'Contenteditable elements can be bound via the value attribute', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div contenteditable="true" value="{{content}}"><strong>some content</strong></div>'
		});

		t.equal( ractive.get( 'content' ), '<strong>some content</strong>' );
		t.htmlEqual( fixture.innerHTML, '<div contenteditable="true"><strong>some content</strong></div>' );

		ractive.set( 'content', '<p>some different content</p>' );
		t.htmlEqual( fixture.innerHTML, '<div contenteditable="true"><p>some different content</p></div>' );
	});

	try {
		fire( document.createElement( 'div' ), 'change' );

		test( 'Contenteditable elements can be bound with a bindable contenteditable attribute.', ( t ) => {
			const ractive = new Ractive({
				el: fixture,
				template: '<div contenteditable="{{editable}}" value="{{content}}"><strong>some content</strong></div>',
				data: { editable: false }
			});

			const div = ractive.find( 'div' );
			div.innerHTML = 'foo';
			fire( div, 'change' );

			t.equal( div.innerHTML, ractive.get( 'content' ) );
			t.equal( ractive.get( 'content' ), 'foo' );
		});
	} catch ( err ) {
		// do nothing
	}

	test( 'Existing model data overrides contents of contenteditable elements', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div contenteditable="true" value="{{content}}"><strong>some content</strong></div>',
			data: { content: 'overridden' }
		});

		t.equal( ractive.get( 'content' ), 'overridden' );
		t.htmlEqual( fixture.innerHTML, '<div contenteditable="true">overridden</div>' );
	});

	test( 'The order of attributes does not affect contenteditable (#1134)', t => {
		new Ractive({
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

	[ 'number', 'range' ].forEach( ( type ) => {
		test( 'input type=' + type + ' values are coerced', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<input value="{{a}}" type="' + type + '"><input value="{{b}}" type="' + type + '">{{a}}+{{b}}={{a+b}}'
			});

			t.equal( ractive.get( 'a' ), undefined );
			t.equal( ractive.get( 'b' ), undefined );

			const inputs = ractive.findAll( 'input' );
			inputs[0].value = '40';
			inputs[1].value = '2';
			ractive.updateModel();
			t.htmlEqual( fixture.innerHTML, '<input type="' + type + '"><input type="' + type + '">40+2=42' );
		});
	});

	test( 'The model updates to reflect which checkbox inputs are checked at render time', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="green" type="checkbox" name="{{colors}}" value="blue" checked><input id="blue" type="checkbox" name="{{colors}}" value="green" checked>'
		});

		t.deepEqual( ractive.get( 'colors' ), [ 'blue', 'green' ] );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( ractive.find( '#blue' ).checked );
		t.ok( ractive.find( '#green' ).checked );

		ractive = new Ractive({
			el: fixture,
			template: '<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="green" type="checkbox" name="{{colors}}" value="blue"><input id="blue" type="checkbox" name="{{colors}}" value="green">'
		});

		t.deepEqual( ractive.get( 'colors' ), [] );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( !ractive.find( '#green' ).checked );
	});

	test( 'Checkbox Name bindings use property attributes to determined if checked or not', t => {
		let ractive = new Ractive({
			el: fixture,
			data: {
				selected: [ { id: 'green' } ],
				colors: [ { id: 'red', name: 'Red' }, { id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' } ]
			},
			template: '{{#each colors}}<input id="{{id}}" type="checkbox" name="{{selected}}" value-comparator="id" value="{{.}}">{{/each}}'
		});
		t.deepEqual( ractive.get( 'selected' ), [ { id: 'green' } ] );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( ractive.find( '#green' ).checked );

		ractive = new Ractive({
			el: fixture,
			data: {
				selected: [ { id: 'green' }, { id: 'red' } ],
				colors: [ { id: 'red', name: 'Red' }, { id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' } ]
			},
			template: '{{#each colors}}<input id="{{id}}" type="checkbox" name="{{selected}}" value-comparator="id" value="{{.}}">{{/each}}'
		});
		t.deepEqual( ractive.get( 'selected' ), [ { id: 'green' }, { id: 'red' } ] );
		t.ok( ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( ractive.find( '#green' ).checked );

		// using function as comparator
		ractive = new Ractive({
			el: fixture,
			comparatorFn( v, a ) {
				return v.id === a.id;
			},
			data: {
				selected: [ { id: 'green' } ],
				colors: [ { id: 'red', name: 'Red' }, { id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' } ]
			},
			template: '{{#each colors}}<input id="{{id}}" type="checkbox" name="{{selected}}" value-comparator="{{@this.comparatorFn}}" value="{{.}}">{{/each}}'
		});
		t.deepEqual( ractive.get( 'selected' ), [ { id: 'green' } ] );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( ractive.find( '#green' ).checked );

		ractive = new Ractive({
			el: fixture,
			data: {
				selected: [],
				colors: [ { id: 'red', name: 'Red' }, { id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' } ]
			},
			template: '{{#each colors}}<input id="{{id}}" type="checkbox" name="{{selected}}" value-comparator="id" value="{{.}}">{{/each}}'
		});
		t.deepEqual( ractive.get( 'selected' ), [] );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( !ractive.find( '#green' ).checked );

		fire( ractive.find( '#blue' ), 'click' );

		t.deepEqual( ractive.get( 'selected' ), [ { id: 'blue', name: 'Blue' } ] );

		fire( ractive.find( '#green' ), 'click' );

		t.deepEqual( ractive.get( 'selected' ), [ { id: 'blue', name: 'Blue' }, { id: 'green', name: 'Green'} ] );
	});

	test( 'Radio Name bindings use value-comparator to determined if checked or not', t => {
		let ractive = new Ractive({
			el: fixture,
			data: {
				selected: { id: 'green' },
				colors: [ { id: 'red', name: 'Red' }, { id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' } ]
			},
			template: '{{#each colors}}<input id="{{id}}" type="radio" name="{{selected}}" value-comparator="id" value="{{.}}">{{/each}}'
		});
		t.deepEqual( ractive.get( 'selected' ), { id: 'green' } );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( ractive.find( '#green' ).checked );

		// using function as comparator
		ractive = new Ractive({
			el: fixture,
			comparatorFn( v, a ) {
				return v.id === a.id;
			},
			data: {
				selected: { id: 'green' },
				colors: [ { id: 'red', name: 'Red' }, { id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' } ]
			},
			template: '{{#each colors}}<input id="{{id}}" type="radio" name="{{selected}}" value-comparator="{{@this.comparatorFn}}" value="{{.}}">{{/each}}'
		});
		t.deepEqual( ractive.get( 'selected' ), { id: 'green' } );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( ractive.find( '#green' ).checked );

		ractive = new Ractive({
			el: fixture,
			data: {
				selected: undefined,
				colors: [ { id: 'red', name: 'Red' }, { id: 'green', name: 'Green' }, { id: 'blue', name: 'Blue' } ]
			},
			template: '{{#each colors}}<input id="{{id}}" type="radio" name="{{selected}}" value-comparator="id" value="{{.}}">{{/each}}'
		});
		t.deepEqual( ractive.get( 'selected' ), undefined );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( !ractive.find( '#green' ).checked );

		fire( ractive.find( '#blue' ), 'click' );

		t.deepEqual( ractive.get( 'selected' ), { id: 'blue', name: 'Blue' } );

		fire( ractive.find( '#green' ), 'click' );

		t.deepEqual( ractive.get( 'selected' ), { id: 'green', name: 'Green'} );
	});

	test( 'The model overrides which checkbox inputs are checked at render time', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<input id="red" type="checkbox" name="{{colors}}" value="red">
				<input id="blue" type="checkbox" name="{{colors}}" value="blue" checked>
				<input id="green" type="checkbox" name="{{colors}}" value="green" checked>`,
			data: { colors: [ 'red', 'blue' ] }
		});

		t.deepEqual( ractive.get( 'colors' ), [ 'red', 'blue' ] );
		t.ok( ractive.find( '#red' ).checked );
		t.ok( ractive.find( '#blue' ).checked );
		t.ok( !ractive.find( '#green' ).checked );
	});

	test( 'Named checkbox bindings are kept in sync with data changes (#1610)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
			<input type="checkbox" name="{{colors}}" value="red" />
			<input type="checkbox" name="{{colors}}" value="blue" />
			<input type="checkbox" name="{{colors}}" value="green" /> `,
			data: { colors: [ 'red', 'blue' ] }
		});

		ractive.set( 'colors', [ 'green' ] );
		t.deepEqual( ractive.get( 'colors' ), [ 'green' ] );

		fire( ractive.find( 'input' ), 'click' );
		t.deepEqual( ractive.get( 'colors' ), [ 'green', 'red' ]);
	});

	test( 'The model updates to reflect which radio input is checked at render time', t => {
		let ractive = new Ractive({
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

	test( 'The model overrides which radio input is checked at render time', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input id="red" type="radio" name="{{color}}" value="red"><input id="blue" type="radio" name="{{color}}" value="blue" checked><input id="green" type="radio" name="{{color}}" value="green">',
			data: { color: 'green' }
		});

		t.deepEqual( ractive.get( 'color' ), 'green' );
		t.ok( !ractive.find( '#red' ).checked );
		t.ok( !ractive.find( '#blue' ).checked );
		t.ok( ractive.find( '#green' ).checked );
	});

	test( 'updateModel correctly updates the value of a text input', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{name}}">',
			data: { name: 'Bob' }
		});

		ractive.find( 'input' ).value = 'Jim';
		ractive.updateModel( 'name' );

		t.equal( ractive.get( 'name' ), 'Jim' );
	});

	test( 'updateModel correctly updates the value of a select', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<select value="{{selected}}"><option selected value="red">red</option><option value="blue">blue</option><option value="green">green</option></select>'
		});

		t.equal( ractive.get( 'selected' ), 'red' );

		ractive.findAll( 'option' )[1].selected = true;
		ractive.updateModel();

		t.equal( ractive.get( 'selected' ), 'blue' );
	});

	test( 'updateModel correctly updates the value of a textarea', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<textarea value="{{name}}"></textarea>',
			data: { name: 'Bob' }
		});

		ractive.find( 'textarea' ).value = 'Jim';
		ractive.updateModel( 'name' );

		t.equal( ractive.get( 'name' ), 'Jim' );
	});

	test( 'updateModel correctly updates the value of a checkbox', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input type="checkbox" checked="{{active}}">',
			data: { active: true }
		});

		ractive.find( 'input' ).checked = false;
		ractive.updateModel();

		t.equal( ractive.get( 'active' ), false );
	});

	test( 'updateModel correctly updates the value of a radio', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input type="radio" checked="{{active}}">',
			data: { active: true }
		});

		ractive.find( 'input' ).checked = false;
		ractive.updateModel();

		t.equal( ractive.get( 'active' ), false );
	});

	test( 'updateModel correctly updates the value of an indirect (name-value) checkbox', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input type="checkbox" name="{{colour}}" value="red"><input type="checkbox" name="{{colour}}" value="blue" checked><input type="checkbox" name="{{colour}}" value="green">'
		});

		t.deepEqual( ractive.get( 'colour' ), [ 'blue' ] );

		ractive.findAll( 'input' )[2].checked = true;
		ractive.updateModel();

		t.deepEqual( ractive.get( 'colour' ), [ 'blue', 'green' ] );
	});

	test( 'updateModel correctly updates the value of an indirect (name-value) radio', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input type="radio" name="{{colour}}" value="red"><input type="radio" name="{{colour}}" value="blue" checked><input type="radio" name="{{colour}}" value="green">'
		});

		t.deepEqual( ractive.get( 'colour' ), 'blue' );

		ractive.findAll( 'input' )[2].checked = true;
		ractive.updateModel();

		t.deepEqual( ractive.get( 'colour' ), 'green' );
	});

	test( 'Radio inputs will update the model if another input in their group is checked', t => {
		const ractive = new Ractive({
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

		const inputs = ractive.findAll( 'input' );
		t.equal( inputs[0].checked, true );

		inputs[1].checked = true;
		fire( inputs[1], 'change' );
		t.equal( ractive.get( 'items[0].checked' ), false );
		t.equal( ractive.get( 'items[1].checked' ), true );
	});

	test( "Radio name inputs don't get stuck after one pass on each value (#2638)", t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#items}}<input type="radio" name="{{~/color}}" value="{{.}}" />{{/items}}',
			data: {
				items: [
					'red', 'blue'
				],
				color: 'red'
			}
		});

		const inputs = r.findAll( 'input' );
		t.equal( inputs[0].checked, true );
		t.equal( r.get( 'color' ), 'red' );

		inputs[1].checked = true;
		fire( inputs[1], 'change' );
		t.equal( r.get( 'color' ), 'blue' );
		inputs[0].checked = true;
		fire( inputs[0], 'change' );
		t.equal( r.get( 'color' ), 'red' );
		inputs[1].checked = true;
		fire( inputs[1], 'change' );
		t.equal( r.get( 'color' ), 'blue' );
		inputs[0].checked = true;
		fire( inputs[0], 'change' );
		t.equal( r.get( 'color' ), 'red' );
	});

	test( 'Radio name inputs respond to model changes (regression, see #783)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#items}}<input type="radio" name="{{foo}}" value="{{this}}"/>{{/items}}',
			data: {
				foo: undefined,
				items: [ 'a', 'b', 'c' ]
			}
		});

		const inputs = ractive.findAll( 'input' );

		t.equal( ractive.get( 'foo' ), undefined );

		ractive.set( 'foo', 'b' );
		t.ok( inputs[1].checked );

		ractive.set( 'items', [ 'd', 'e', 'f' ]);
		t.equal( ractive.get( 'foo' ), undefined );
		t.ok( !inputs[1].checked );
	});


	test(`bindings that trigger their own immediate update via computation should not get stuck (#2427)`, t => {
		const r = new Ractive({
			el: fixture,
			data: {
				list: [ { v: 'a', o: 0 }, { v: 'a', o: 1 }, { v: 'b', o: 2 }, { v: 'c', o: 3 } ]
			},
			computed: {
				rows() {
					const list = this.get( 'list' ).slice(0);
					return list.sort( ( a, b ) => a.v.localeCompare( b.v ) ).map( o => o.o );
				}
			},
			template: `{{#each rows}}{{#with list[.]}}<input value="{{.v}}" />{{/with}}{{/each}}`
		});
		const inputs = r.findAll( 'input' );
		inputs[0].value = 'z';
		fire( inputs[0], 'change' );

		t.equal( inputs[0].value, 'a' );
		t.equal( inputs[1].value, 'b' );
		t.equal( inputs[2].value, 'c' );
		t.equal( inputs[3].value, 'z' );
	});

	test( 'Post-blur validation works (#771)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}">{{foo}}'
		});

		ractive.observe( 'foo', function ( foo ) {
			this.set( 'foo', foo.toUpperCase() );
		});

		const input = ractive.find( 'input' );
		input.value = 'bar';
		fire( input, 'change' );

		t.equal( input.value, 'bar' );
		t.equal( ractive.get( 'foo' ), 'BAR' );
		t.htmlEqual( fixture.innerHTML, '<input>BAR' );

		fire( input, 'change' );
		try {
			fire( input, 'blur' );

			t.equal( input.value, 'BAR' );
			t.equal( ractive.get( 'foo' ), 'BAR' );
			t.htmlEqual( fixture.innerHTML, '<input>BAR' );
		} catch ( err ) {
			// Oh PhantomJS. You are so very WTF
		}
	});

	test( 'Reference expression radio bindings rebind correctly inside reference expression sections (#904)', t => {
		const ractive = new Ractive({
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

	test( 'Static bindings can only be one-way (#1149)', t => {
		const ractive = new Ractive({
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

	test( 'input[type="checkbox"] with bound checked and name attributes, updates as expected (#1749)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input type="checkbox" name="{{name}}" checked="{{on}}">',
			data: {
				name: 'foo',
				on: 'true'
			}
		});

		const checkbox = ractive.find( 'input' );

		// Assert initial bindings
		t.ok( checkbox.checked );
		t.equal( checkbox.name, 'foo' );

		// Test name binding
		ractive.set( 'name', 'bar' );

		t.equal( checkbox.name, 'bar' );
		t.ok( checkbox.checked );

		// Test checked binding
		ractive.set( 'on', false );

		t.ok( !checkbox.checked );
		t.equal( checkbox.name, 'bar' );
	});

	test( 'input[type="checkbox"] with bound name updates as expected (#1305)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input type="checkbox" name="{{ch}}" value="foo">',
			data: { ch: 'bar' }
		});

		ractive.set( 'ch', 'foo' );
		t.ok( ractive.find( 'input' ).checked );
	});

	test( 'input[type="checkbox"] with bound name updates as expected, with array mutations (#1305)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<input type="checkbox" name="{{array}}" value="foo">
				<input type="checkbox" name="{{array}}" value="bar">
				<input type="checkbox" name="{{array}}" value="baz">`,
			data: {
				array: [ 'foo', 'bar' ]
			}
		});

		const checkboxes = ractive.findAll( 'input' );

		t.ok( checkboxes[0].checked );
		t.ok( checkboxes[1].checked );

		ractive.push( 'array', 'baz' );

		t.ok( checkboxes[0].checked );
		t.ok( checkboxes[1].checked );
		t.ok( checkboxes[2].checked );

		ractive.shift( 'array' );

		t.ok( !checkboxes[0].checked );
		t.ok( checkboxes[1].checked );
	});

	test( 'input[type="checkbox"] works with array of numeric values (#1305)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<input type="checkbox" name="{{array}}" value="1">
				<input type="checkbox" name="{{array}}" value="2">
				<input type="checkbox" name="{{array}}" value="3">`,
			data: {
				array: [ 1, 2 ]
			}
		});

		const checkboxes = ractive.findAll( 'input' );

		t.ok( checkboxes[0].checked );
		t.ok( checkboxes[1].checked );

		ractive.push( 'array', 3 );

		t.ok( checkboxes[0].checked );
		t.ok( checkboxes[1].checked );
		t.ok( checkboxes[2].checked );
	});

	test( 'input[type="checkbox"] works with array mutated on init (#1305)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<input type="checkbox" name="{{array}}" value="a">
				<input type="checkbox" name="{{array}}" value="b">
				<input type="checkbox" name="{{array}}" value="c">`,
			data: {
				array: [ 'a', 'b']
			},
			oninit () {
				this.push( 'array', 'c' );
			}
		});

		const checkboxes = ractive.findAll( 'input' );

		t.ok( checkboxes[0].checked );
		t.ok( checkboxes[1].checked );
		t.ok( checkboxes[2].checked );
	});

	test( 'Downstream expression objects in two-way bindings do not trigger a warning (#1421)', t => {
		// TODO what exactly is being tested here...?
		onWarn( () => {} ); // suppress

		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo()}}<input value="{{.}}">{{/}}',
			data: { foo: () => ['bar'] }
		});

		t.equal( ractive.find('input').value, 'bar' );
	});

	test( 'Changes made in oninit are reflected on render (#1390)', t => {
		let inputs;

		new Ractive({
			el: fixture,
			template: '{{#each items}}<input type="checkbox" name="{{selected}}" value="{{this}}">{{/each}}',
			data: {
				items: [ 'a', 'b', 'c' ],
				// will fail without this
				selected: null
			},
			oninit () {
				this.set( 'selected', [ 'b' ]);
			},
			onrender () {
				inputs = this.findAll( 'input' );
			}
		});

		t.ok( !inputs[0].checked );
		t.ok(  inputs[1].checked );
		t.ok( !inputs[2].checked );
	});

	test( 'Changes made after render to unresolved', t => {

		const ractive = new Ractive({
			el: fixture,
			template: '{{#each items}}<input type="checkbox" name="{{selected}}" value="{{this}}">{{/each}}',
			data: {
				items: [ 'a', 'b', 'c' ],
				// will fail without this
				selected: null
			}
		});

		ractive.set( 'selected', [ 'b' ] );

		const inputs = ractive.findAll( 'input' );

		t.ok( !inputs[0].checked );
		t.ok(  inputs[1].checked );
		t.ok( !inputs[2].checked );
	});

	test( 'If there happen to be unresolved references next to binding resolved references, the unresolveds should not be evicted by mistake (#1608)', t => {
		onWarn( () => {} ); // suppress

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#context}}
					<select value="{{bar}}">
						<option>baz</option>
					</select>
					<input type="checkbox" checked="{{foo}}">
					<div>{{foo}}: {{#foo}}true{{else}}false{{/}}</div>
				{{/}}`,
			data: {
				context: { x: true }
			}
		});

		const div = ractive.find( 'div' );
		t.htmlEqual( div.innerHTML, 'false: false' );
		fire( ractive.find( 'input' ), 'click' );
		t.htmlEqual( div.innerHTML, 'true: true' );
	});

	test( 'Change events propagate after the model has been updated (#1371)', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value='{{value}}' on-change='@this.checkValue(value)'>
					<option value='1'>1</option>
					<option value='2'>2</option>
				</select>`,
			checkValue ( value ) {
				t.equal( value, 2 );
			}
		});

		ractive.findAll( 'option' )[1].selected = true;
		fire( ractive.find( 'select' ), 'change' );
	});

	if ( hasUsableConsole ) {
		test( 'Using expressions in two-way bindings triggers a warning (#1399)', t => {
			onWarn( message => {
				t.ok( ~message.indexOf( 'Cannot use two-way binding on <input> element: foo() is read-only' ) );
			});

			new Ractive({
				el: fixture,
				template: '<input value="{{foo()}}">',
				data: { foo: () => 'bar' }
			});
		});

		test( 'Using expressions with keypath in two-way bindings triggers a warning (#1399/#1421)', t => {
			onWarn( () => {
				t.ok( true );
			});

			new Ractive({
				el: fixture,
				template: '<input value="{{foo.bar()[\'biz.bop\']}}">',
				data: { foo: { bar: () => 'bar' } }
			});
		});

		test( '@key cannot be used for two-way binding', t => {
			t.expect( 3 );

			onWarn( msg => {
				t.ok( /Cannot use two-way binding/.test( msg ) );
			});

			new Ractive({
				el: fixture,
				template: `{{#each obj}}<input value='{{@key}}'>{{/each}}`,
				data: {
					obj: { foo: 1, bar: 2, baz: 3 }
				}
			});
		});
	}

	test( 'Radio input can have name/checked attributes without two-way binding (#783)', t => {
		t.expect( 0 );

		new Ractive({
			el: fixture,
			template: '<input type="radio" name="a" value="a" checked>'
		});
	});

	test( 'Two-way binding can be set up against expressions that resolve to regular keypaths', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#items:i}}<label><input value="{{ proxies[i].name }}"> name: {{ proxies[i].name }}</label>{{/items}}',
			data: {
				items: [{}],
				proxies: []
			}
		});

		const input = ractive.find( 'input' );
		input.value = 'foo';
		ractive.updateModel();

		t.deepEqual( ractive.get( 'proxies' ), [{name: 'foo'  }] );
		t.htmlEqual( fixture.innerHTML, '<label><input> name: foo</label>' );
	});

	test( 'Contenteditable works with lazy: true (#1933)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div contenteditable="true" value="{{value}}"></div>',
			lazy: true
		});

		const div = ractive.find( 'div' );
		div.innerHTML = 'foo';

		try {
			fire( div, 'blur' );
			t.equal( ractive.get( 'value' ), 'foo' );
		} catch ( err ) {
			t.ok( true ); // phantomjs ಠ_ಠ
		}
	});

	test( 'select with no matching value option selects none (#2494)', t => {
		const r = new Ractive({
			el: fixture,
			template: '<select value="{{foo}}">{{#if opt1}}<option>1</option>{{/if}}<option>2</option></select>',
			data: { opt1: true }
		});

		t.equal( r.get( 'foo' ), '1' );

		r.set( 'foo', 'nerp' );
		t.equal( r.find( 'select' ).selectedIndex, -1 );

		r.set( 'foo', '1' );
		t.equal( r.find( 'select' ).selectedIndex, 0 );

		r.toggle( 'opt1' );
		t.equal( r.find( 'select' ).selectedIndex, 0 );
	});

	test( 'type attribute does not have to be first (#1968)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input id="red" name="{{selectedColors}}" value="red" type="checkbox">'
		});

		ractive.set( 'selectedColors', [ 'red' ]);

		t.ok( ractive.find( '#red' ).checked );
	});

	test( 'input type=number binds (#2082)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `{{number}} <input type="number" value="{{number}}">`,
			data: { number: 10 }
		});

		const input = ractive.find( 'input' );
		input.value = '20';
		fire( input, 'change' );
		t.equal( ractive.get( 'number' ), 20 );
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
		fire( node, 'change' );
		t.equal( ractive.get( 'foo' ), 'bar' );

		ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" twoway="false" />',
			data: { foo: 'test' },
			twoway: true
		});

		node = ractive.find( 'input' );
		node.value = 'bar';
		fire( node, 'change' );
		t.equal( ractive.get( 'foo' ), 'test' );
	});

	test( 'Presence of lazy or twoway without value is considered true', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" twoway lazy/>',
			twoway: false
		});

		const input = ractive.find( 'input' );

		input.value = 'changed';

		// input events shouldn't trigger change (because lazy=true)...
		fire( input, 'input' );
		t.equal( ractive.get( 'foo' ), '' );

		// ...but change events still should (because twoway=true)
		fire( input, 'change' );
		t.equal( ractive.get( 'foo' ), 'changed' );
	});

	test( '`lazy=0` is not mistaken for `lazy`', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" lazy="0"/>'
		});

		const input = ractive.find( 'input' );

		input.value = 'changed';

		// input events should trigger change
		fire( input, 'input' );
		t.equal( ractive.get( 'foo' ), 'changed' );
	});

	test( '`twoway=0` is not mistaken for `twoway`', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" twoway="0"/>'
		});

		const input = ractive.find( 'input' );

		input.value = 'changed';

		fire( input, 'input' );
		t.equal( ractive.get( 'foo' ), undefined );

		fire( input, 'change' );
		t.equal( ractive.get( 'foo' ), undefined );
	});

	test( 'checkbox name binding with the same value on multiple boxes still works (#2163)', t => {
		const common = {};
		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}<input type="checkbox" name="{{list}}" value="{{.}}" />{{/each}}',
			data: { list: [ common ], items: [ common, common, {} ] }
		});

		const inputs = r.findAll( 'input' );
		t.ok( inputs[0].checked && inputs[1].checked && !inputs[2].checked );

		fire( inputs[0], 'click' );
		t.ok( !( inputs[0].checked || inputs[1].checked || inputs[2].checked ) );

		fire( inputs[2], 'click' );
		t.ok( !inputs[0].checked && !inputs[1].checked && inputs[2].checked );

		fire( inputs[1], 'click' );
		t.ok( inputs[0].checked && inputs[1].checked && inputs[2].checked );
	});

	test( 'checkbox name bindings work across component boundaries (#2163)', t => {
		const things = [
			{id: 1, color: '#cc8'},
			{id: 2, color: '#c88'},
			{id: 4, color: '#8c8'},
			{id: 8, color: '#8cc'}
		];

		const Switcher = Ractive.extend({
			template: `
				<label class='switcher'>
					<input type='checkbox' value='{{id}}' name='{{name}}'>
					{{yield}}
				</label>`,
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each things}}
					<Switcher name='{{filters}}'>{{id}}</Switcher>
				{{/each}}`,
			data () {
				return { things, filters: [ 2, 4 ] };
			},
			components: { Switcher }
		});

		Ractive.components.Switcher = Switcher;

		const inputs = ractive.findAll( 'input' );
		const checked = () => inputs.map( input => input.checked );

		t.deepEqual( checked(), [ false, true, true, false ]);

		fire( inputs[0], 'click' );
		t.deepEqual( checked(), [ true, true, true, false ]);

		fire( inputs[1], 'click' );
		t.deepEqual( checked(), [ true, false, true, false ]);
	});

	test( 'textarea with a single interpolator as content should set up a twoway binding (#2197)', t => {
		const r = new Ractive({
			el: fixture,
			template: '<textarea>{{foo}}</textarea>',
			data: { foo: 'bar' }
		});

		t.equal( r.find( 'textarea' ).value, 'bar' );
		r.set( 'foo', 'baz' );
		t.equal( r.find( 'textarea' ).value, 'baz' );
		r.find( 'textarea' ).value = 'bop';
		r.updateModel( 'foo' );
		t.equal( r.get( 'foo' ), 'bop' );
	});

	test( 'conditional twoway should apply/unapply correctly', t => {
		const r = new Ractive({
			el: fixture,
			template: `<input value="{{foo}}" {{#if twoway}}twoway{{/if}} /><span>{{foo}}</span>`,
			data: { twoway: false },
			twoway: false
		});

		const [ input, span ] = r.findAll( '*' );

		r.set( 'foo', 'test' );
		t.equal( input.value, 'test' );

		input.value = 'foo';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'test' );

		r.set( 'twoway', true );
		input.value = 'bar';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'bar' );
	});

	test( 'bound twoway should apply/unapply correctly', t => {
		const r = new Ractive({
			el: fixture,
			template: `<input value="{{foo}}" twoway="{{#if twoway}}true{{else}}false{{/if}}" /><span>{{foo}}</span>`,
			data: { twoway: false },
			twoway: false
		});

		const [ input, span ] = r.findAll( '*' );

		r.set( 'foo', 'test' );
		t.equal( input.value, 'test' );

		input.value = 'foo';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'test' );

		r.set( 'twoway', true );
		input.value = 'bar';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'bar' );
	});

	test( 'conditional lazy should apply/unapply correctly', t => {
		const r = new Ractive({
			el: fixture,
			template: `<input value="{{foo}}" {{#if lazy}}lazy{{/if}} /><span>{{foo}}</span>`,
			data: { lazy: false },
			lazy: false
		});

		const [ input, span ] = r.findAll( '*' );

		r.set( 'foo', 'test' );
		t.equal( input.value, 'test' );

		input.value = 'foo';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'foo' );

		r.set( 'lazy', true );
		input.value = 'bar';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'foo' );

		try {
			fire( input, 'blur' );
			t.equal( span.innerHTML, 'bar' );
		} catch ( err ) {
			t.ok( true ); // phantom...
		}
	});

	test( 'bound lazy should apply/unapply correctly', t => {
		const r = new Ractive({
			el: fixture,
			template: `<input value="{{foo}}" lazy="{{#if lazy}}true{{else}}false{{/if}}" /><span>{{foo}}</span>`,
			data: { lazy: false },
			lazy: false
		});

		const [ input, span ] = r.findAll( '*' );

		r.set( 'foo', 'test' );
		t.equal( input.value, 'test' );

		input.value = 'foo';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'foo' );

		r.set( 'lazy', true );
		input.value = 'bar';
		fire( input, 'input' );
		t.equal( span.innerHTML, 'foo' );

		try {
			fire( input, 'blur' );
			t.equal( span.innerHTML, 'bar' );
		} catch ( err ) {
			t.ok( true ); // phantom...
		}
	});

	test( 'textarea with a single static interpolator as content should not set up a twoway binding', t => {
		const r = new Ractive({
			el: fixture,
			template: '<textarea>[[foo]]</textarea>',
			data: { foo: 'bar' }
		});

		t.equal( r.find( 'textarea' ).value, 'bar' );
		r.set( 'foo', 'baz' );
		t.equal( r.find( 'textarea' ).value, 'bar' );
		r.find( 'textarea' ).value = 'bop';
		r.updateModel( 'foo' );
		t.equal( r.get( 'foo' ), 'baz' );
	});

	test( 'ComputationChild will allow bindings if requested', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each some.expr()}}<div>{{.val}}</div><input value="{{.val}}" />{{/each}}`,
			data: {
				array: [ { val: 'a' } ]
			},
			syncComputedChildren: true
		});
		r.set( 'some.expr', () => { return r.get('array'); } );

		const input = r.find( 'input' );
		const label = r.find( 'div' );

		t.equal( label.innerHTML, 'a' );
		input.value = 'test1';
		fire( input, 'change' );
		t.equal( label.innerHTML, 'test1' );
	});

	test( 'ComputationChild bindings also notify other interested parties when changed', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each some.expr()}}<input value="{{.val}}" />{{/each}}<div>{{'yep' + JSON.stringify(some.expr())}}</div>`,
			data: {
				array: [ { val: 'a' } ]
			},
			syncComputedChildren: true
		});
		r.set( 'some.expr', () => { return r.get('array'); } );

		const input = r.find( 'input' );
		const label = r.find( 'div' );

		t.equal( label.innerHTML, 'yep[{"val":"a"}]' );
		input.value = 'test1';
		fire( input, 'change' );
		t.equal( label.innerHTML, 'yep[{"val":"test1"}]' );
	});

	test( 'ComputationChild name bindings work for checkboxes', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foos()}}<input type="checkbox" name="{{.array}}" value="{{+1}}" /><input type="checkbox" name="{{.array}}" value="{{+2}}" />{{/with}}`,
			data: {
				foo: { array: [ 1, 2 ] }
			},
			syncComputedChildren: true
		});

		r.set( 'foos',() => { return r.get( 'foo' ); });

		const [ check1, check2 ] = r.findAll( 'input' );

		t.equal( check1.checked, true );
		t.equal( check2.checked, true );

		r.set( 'foo.array', [] );

		t.equal( check1.checked, false );
		t.equal( check2.checked, false );

		fire( check1, 'click' );
		fire( check2, 'click' );

		t.equal( r.get( 'foo.array.0' ), 1 );
		t.equal( r.get( 'foo.array.1' ), 2 );
	});

	test( 'ComputationChild name bindings work for radio buttons', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foos()}}<input type="radio" name="{{.value}}" value="{{+1}}" /><input type="radio" name="{{.value}}" value="{{+2}}" />{{/with}}`,
			data: {
				foo: { value: 1 },
				foos () { return this.get( 'foo' ); }
			},
			syncComputedChildren: true
		});

		const [ radio1, radio2 ] = r.findAll( 'input' );

		t.equal( radio1.checked, true );
		t.equal( radio2.checked, false );

		r.set( 'foo.value', 2 );

		t.equal( radio1.checked, false );
		t.equal( radio2.checked, true );

		fire( radio1, 'click' );
		t.equal( r.get( 'foo.value' ), 1 );

		fire( radio2, 'click' );
		t.equal( r.get( 'foo.value' ), 2 );
	});

	test( 'textareas with non-model context should still bind correctly (#2099)', t => {
		onWarn( () => {} ); // suppress

		const r = new Ractive({
			el: fixture,
			template: `{{#with { foo: 'bar' }}}<textarea>{{.foo}}</textarea><button on-click="event.set('.foo', 'baz')">click me</button>{{/with}}`
		});

		t.equal( r.find( 'textarea' ).value, 'bar' );
		r.find( 'button' ).click();
		t.equal( r.find( 'textarea' ).value, 'baz' );
	});

	test( 'binding to an reference proxy does not cause out-of-syncitude with the actual model', t => {
		const r = new Ractive({
			el: fixture,
			template: '<span>{{foo.bar.baz}}</span>{{#with foo[what]}}<input value="{{.baz}}" />{{/with}}',
			data: {
				foo: {
					bar: { baz: 'yep' },
					bat: { baz: 'also yep' }
				},
				what: 'bar'
			}
		});

		const span = r.find( 'span' );
		const input = r.find( 'input' );

		t.equal( span.innerHTML, 'yep' );

		input.value = 'hey';
		fire( input, 'change' );
		t.equal( span.innerHTML, 'hey' );

		r.set( 'foo.bar.baz', 'yep again' );
		t.equal( input.value, 'yep again' );

		r.set( 'what', 'bat' );
		t.equal( input.value, 'also yep' );
	});

	test( `binding to a valid reference expression doesn't warn about unresolved paths`, t => {
		t.expect( 1 );
		onWarn( () => t.ok( false, 'should not warn' ) );
		const r = new Ractive({
			target: fixture,
			data: { foo: {} },
			template: `<input value="{{randomFoo132123['bar']}}" />`
		});
		const input = r.find( 'input' );

		input.value = 'yep';
		fire( input, 'change' );

		t.equal( r.get( 'randomFoo132123.bar' ), 'yep' );
	});

	test( `binding a select with mismatched option values shouldn't break section rendering (#2424)`, t => {
		const cmp = Ractive.extend({ template: `<div>{{yield}}</div>` });
		const r = new Ractive({
			el: fixture,
			components: { cmp },
			template: `{{#if .condition}}<span>Once</span>
				{{#each .foo}}<cmp><select value="{{.bar}}">
					<option></option>
					<option>a</option>
					<option>b</option>
					<option>c</option>
				</select></cmp>{{/each}}
			{{/if}}`
		});

		r.set({
			condition: true,
			foo: [{ bar: 'd' }, { bar: 'e' }, { bar: 'f' }]
		});

		t.equal( fixture.querySelectorAll( 'span' ).length, 1 );
		t.equal( fixture.querySelectorAll( 'div' ).length, 3 );
	});

	test( 'bindings stay up to date when updated from the model (#2643)', t => {
		t.expect( 5 );

		const r = new Ractive({
			el: fixture,
			template: '<input type="checkbox" checked="{{foo.bar}}" />',
			data: { foo: { bar: false } }
		});
		const input = r.find( 'input' );

		fire( input, 'click' );
		t.ok( input.checked, 'input checked by click' );
		t.ok( r.get( 'foo.bar' ), 'model is true from click' );

		r.get( 'foo' ).bar = false;
		r.update();
		t.ok( !input.checked, 'input unchecked by update' );

		r.observe( 'foo', v => t.ok( v, 'new value true observed from click' ), { init: false } );
		fire( input, 'click' );
		t.ok( input.checked, 'input checked by click' );
	});

	test( `numeric bindings update correctly if set to undefined from initial value (#2761)`, t => {
		const r = new Ractive({
			el: fixture,
			template: '<input type="number" value="{{x}}" />',
			data: { x: 1 }
		});

		let hit = false;
		r.observe( 'x', () => hit = true, { init: false } );

		const input = r.find( 'input' );
		input.value = undefined;
		fire( input, 'input' );

		t.ok( hit );
	});

	test( `options that exist across a component boundary register with their parent select correctly`, t => {
		const cmp = Ractive.extend({ template: '<select value="{{foo}}">{{yield}}</select>' });
		const r = new Ractive({
			el: fixture,
			template: '<cmp foo="{{foo}}"><option>a</option><option>b</option></cmp>',
			components: { cmp }
		});

		t.equal( r.get( 'foo' ), 'a' );
	});

	test( `multi select binding`, t => {
		fixture.innerHTML = '<select multiple><option value="1">one</option><option value="2">two</option><option value="3">three</option></select>';
		const r = new Ractive({
			target: fixture,
			template: `<select multiple value="{{list}}"><option value="1">one</option><option value="2" selected>two</option><option value="3">three</option></select>`,
			enhance: true
		});

		t.deepEqual( r.get( 'list' ), [ '2' ] );

		const opts = r.findAll( 'option' );
		const sel = r.find( 'select' );

		opts[0].selected = true;
		opts[2].selected = true;
		fire( sel, 'change' );
		t.deepEqual( r.get( 'list' ), [ '1', '2', '3' ] );

		r.set( 'list', [ '1', '2' ] );
		t.ok( !opts[2].selected );

		opts[2].selected = true;
		opts[0].selected = false;
		fire( sel, 'change' );
		t.deepEqual( r.get( 'list' ), [ '2', '3' ] );
	});

	test( `radio name bindings survive a shuffle (#2939)`, t => {
		t.expect( 3 );

		const r = new Ractive({
			el: fixture,
			template: `{{#each xs as x}}{{#each [1, 2, 3]}}<input type="radio" value="{{.}}" name="{{x.selected}}" />{{/each}}{{/each}}`,
			data: {
				xs: [
					{ selected: 1 },
					{ selected: 2 },
					{ selected: 1 },
					{ selected: 3 }
				]
			}
		});

		r.splice( 'xs', 2, 1 );

		r.get( 'xs' ).forEach( ( x, i ) => t.equal( x.selected, i + 1 ) );
	});

	test( `value attributes are always set with a string safe value (#2944)`, t => {
		new Ractive({
			el: fixture,
			template: '<div value="{{foo}}" />'
		});

		t.equal( fixture.innerHTML, '<div value=""></div>' );
	});

	test( `trying to bind to more than two attributes should not throw (#3043)`, t => {
		t.expect( 0 );

		const r = new Ractive({
			target: fixture,
			template: '<input bind-twoway value="{{foo}}{{bar}}" />',
			data: { twoway: false }
		});

		r.set( 'twoway', true );
	});
}
