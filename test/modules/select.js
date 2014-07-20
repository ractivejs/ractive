define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture;

		module( '&lt;select&gt; elements' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'If a select\'s value attribute is updated at the same time as the available options, the correct option will be selected', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select id="select" value="{{selected}}">{{#options}}<option value="{{.}}">{{.}}</option>{{/options}}</select>'
			});

			t.htmlEqual( fixture.innerHTML, '<select id="select"></select>' );

			ractive.set({
				selected: 'c',
				options: [ 'a', 'b', 'c', 'd' ]
			});

			t.equal( ractive.get( 'selected' ), 'c' );
			t.equal( ractive.nodes.select.value, 'c' );
		});

		test( 'If a select value with two-way binding has a selected option at render time, the model updates accordingly', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option value="blue">blue</option><option value="green" selected>green</option></select> <p>selected {{color}}</p>'
			});

			t.equal( ractive.get( 'color' ), 'green' );
			t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select> <p>selected green</p>' );
		});

		test( 'If a select value with two-way binding has no selected option at render time, the model defaults to the top value', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select> <p>selected {{color}}</p>'
			});

			t.equal( ractive.get( 'color' ), 'red' );
			t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select> <p>selected red</p>' );
		});


		test( 'If the value of a select is specified in the model, it overrides the markup', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option id="blue" value="blue">blue</option><option id="green" value="green" selected>green</option></select>',
				data: { color: 'blue' }
			});

			t.equal( ractive.get( 'color' ), 'blue' );
			t.ok( ractive.nodes.blue.selected );
			t.ok( !ractive.nodes.green.selected );
		});

		test( 'A select value with static options with numeric values will show the one determined by the model, whether a string or a number is used', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{i}}"><option id="_1" value="1">one</option><option id="_2" value="2">two</option><option id="_3" value="3">three</option></select>',
				data: { i: 2 }
			});

			t.ok( !ractive.nodes._1.selected );
			t.ok(  ractive.nodes._2.selected );
			t.ok( !ractive.nodes._3.selected );

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{i}}"><option id="_1" value="1">one</option><option id="_2" value="2">two</option><option id="_3" value="3">three</option></select>',
				data: { i: "3" }
			});

			t.ok( !ractive.nodes._1.selected );
			t.ok( !ractive.nodes._2.selected );
			t.ok(  ractive.nodes._3.selected );
		});

		test( 'Setting the value of a select works with options added via a triple', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{value}}">{{{triple}}}</select>',
				data: {
					value: 2,
					triple: '<option value="1">1</option><option value="2">2</option>'
				}
			});

			t.equal( ractive.find( 'select' ).value, 2);
			t.ok( ractive.findAll( 'option' )[1].selected );

			ractive.set( 'triple', '<option value="1" selected>1</option><option value="2">2</option>' );
			t.equal( ractive.find( 'select' ).value, 1 );
			t.equal( ractive.get( 'value' ), 1 );
		});

		test( 'A two-way select updates to the actual value of its selected option, not the stringified value', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{selected}}">{{#options}}<option value="{{.}}">{{description}}</option>{{/options}}</select><p>Selected {{selected.description}}</p>',
				data: {
					options: [
						{ description: 'foo' },
						{ description: 'bar' },
						{ description: 'baz' }
					]
				}
			});

			t.deepEqual( ractive.get( 'selected' ), { description: 'foo' });

			ractive.findAll( 'option' )[1].selected = true;
			ractive.updateModel();
			t.deepEqual( ractive.get( 'selected' ), { description: 'bar' });

			ractive.set( 'selected', ractive.get( 'options[2]' ) );
			t.ok( ractive.findAll( 'option' )[2].selected );
		});

		/*
		test( 'If a multiple select value with two-way binding has a selected option at render time, the model updates accordingly', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{colors}}" multiple><option value="red">red</option><option value="blue" selected>blue</option><option value="green" selected>green</option></select>'
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'blue', 'green' ] );
		});
		*/

		test( 'If a multiple select value with two-way binding has no selected option at render time, the model defaults to an empty array', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{colors}}" multiple><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select>'
			});

			t.deepEqual( ractive.get( 'colors' ), [] );
		});

		test( 'If the value of a multiple select is specified in the model, it overrides the markup', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{colors}}" multiple><option id="red" value="red">red</option><option id="blue" value="blue">blue</option><option id="green" value="green" selected>green</option></select>',
				data: { colors: [ 'red', 'green' ] }
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'red', 'green' ] );
			t.ok( ractive.nodes.red.selected );
			t.ok( !ractive.nodes.blue.selected );
			t.ok( ractive.nodes.green.selected );
		});

		test( 'updateModel correctly updates the value of a multiple select', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select multiple value="{{selected}}"><option selected value="red">red</option><option value="blue">blue</option><option value="green">green</option></select>'
			});

			t.deepEqual( ractive.get( 'selected' ), [ 'red' ] );

			ractive.findAll( 'option' )[1].selected = true;
			ractive.updateModel();

			t.deepEqual( ractive.get( 'selected' ), [ 'red', 'blue' ] );
		});

		test( 'Options added to a select after the initial render will be selected if the value matches', function ( t ) {
			var ractive, options;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{value_id}}">{{#post_values}}<option value="{{id}}">{{id}} &mdash; {{name}}</option>{{/post_values}}</select>',
				data: {
					value_id: 42,
					values: [
						{ id: 1, name: "Boo" },
						{ id: 42, name: "Here 'tis" }
					]
				}
			});

			options = ractive.findAll( 'option', { live: true });
			t.ok( !options.length );

			ractive.set('post_values', ractive.get('values'));

			t.equal( options.length, 2 );
			t.ok( !options[0].selected );
			t.ok( options[1].selected );
		});

		test( 'If an empty select with a binding has options added to it, the model should update', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{id}}">{{#items}}<option value="{{id}}">{{text}}</option>{{/items}}</select><strong>Selected: {{id || "nothing"}}</strong>'
			});

			ractive.set('items', [ { id: 1, text: 'one' }, { id: 2, text: 'two' } ]);
			t.equal( ractive.get( 'id' ), 1 );
			t.htmlEqual( fixture.innerHTML, '<select><option value="1">one</option><option value="2">two</option></select><strong>Selected: 1</strong>' );
		});

		test( 'Regression test for #339', function ( t ) {
			var ractive, selects;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<p>{{i}}: <select value="{{.color}}"><option value="red">Red</option></select></p>{{/items}}',
				data: { items: [{}] }
			});

			selects = ractive.findAll( 'select', { live: true });

			t.equal( selects[0].value, 'red' );

			ractive.get( 'items' ).push({});

			t.htmlEqual( fixture.innerHTML, '<p>0: <select><option value="red">Red</option></select></p><p>1: <select><option value="red">Red</option></select></p>')
			t.deepEqual( ractive.get(), { items: [ {color: 'red'}, {color: 'red'} ] } );
		});

		test( 'Regression test for #351', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{selected}}" multiple>{{#items}}<option value="{{id}}">{{name}}</option>{{/items}}</select>'
			});

			ractive.set( 'items', [{name:'one', id:1}, {name:'two', id:2}]);

			t.htmlEqual( fixture.innerHTML, '<select multiple><option value="1">one</option><option value="2">two</option></select>' );
		});

		test( '<option>{{foo}}</option> behaves the same as <option value="{{foo}}">{{foo}}</option>', function ( t ) {
			var ractive, options;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{test1}}"><option>a</option><option>b</option><option>c</option></select><select value="{{test2}}">{{#options}}<option>{{.}}</option>{{/options}}</select>',
				data: { options: [ 'a', 'b', 'c' ]}
			});

			t.equal( ractive.get( 'test1' ), 'a' );
			t.equal( ractive.get( 'test2' ), 'a' );

			options = ractive.findAll( 'option' );

			options[1].selected = true;
			options[5].selected = true;

			ractive.updateModel();

			t.equal( ractive.get( 'test1' ), 'b' );
			t.equal( ractive.get( 'test2' ), 'c' );
		});

		test( 'A select whose options are re-rendered will update its binding', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{selected}}">{{#options}}<option>{{.}}</option>{{/options}}</select><p>selected: {{selected}}</p>',
				data: {
					options: [ 'a', 'b', 'c' ]
				}
			});

			t.htmlEqual( fixture.innerHTML, '<select><option value="a">a</option><option value="b">b</option><option value="c">c</option></select><p>selected: a</p>' );

			ractive.set( 'selected', 'b' );
			ractive.set( 'options', [ 'd', 'e', 'f' ] );
			t.equal( ractive.get( 'selected' ), 'd' );
			t.htmlEqual( fixture.innerHTML, '<select><option value="d">d</option><option value="e">e</option><option value="f">f</option></select><p>selected: d</p>' );
		});

		test( 'Options can be inside a partial (#707)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select>{{#options}}{{>option}}{{/options}}</select>',
				data: { options: [ 'a', 'b' ] },
				partials: { option: '<option>{{this}}</option>' }
			});

			t.htmlEqual( fixture.innerHTML, '<select><option value="a">a</option><option value="b">b</option></select>' );
		});

		test( 'Disabled options have no implicit value (#786)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<p>{{selected}}</p><select value="{{selected}}"><option selected disabled>Select a letter</option>{{#letters}}<option>{{this}}</option>{{/letters}}</select>',
				data: {
					letters: [ 'a', 'b', 'c' ]
				}
			});

			t.equal( ractive.get( 'selected' ), undefined );
			t.htmlEqual( fixture.innerHTML, '<p></p><select><option disabled>Select a letter</option><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>' );
		});

		test( 'Uninitialised <select> elements will use the first *non-disabled* option', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<p>{{selected}}</p><select value="{{selected}}"><option disabled>Select a letter</option>{{#letters}}<option>{{this}}</option>{{/letters}}</select>',
				data: {
					letters: [ 'a', 'b', 'c' ]
				}
			});

			t.equal( ractive.get( 'selected' ), 'a' );
			t.htmlEqual( fixture.innerHTML, '<p>a</p><select><option disabled>Select a letter</option><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>' );
			t.equal( ractive.find( 'select' ).value, 'a' );
		});

		test( 'Removing selected options from a list causes the select element\'s binding to update (#776)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{value}}">{{#each options}}<option>{{this}}</option>{{/each}}<option selected>999</option>{{{lol}}}</select>',
				data: {
					options: [1,2,3,4],
					lol: '<option>lol</option>'
				}
			});

			ractive.set( 'value', 1 );
			ractive.set( 'options', [] );
			t.equal( ractive.get( 'value' ), '999' );
		});

		test( 'Select bindings work even if there is only a disabled option', function ( t ) {
			expect( 0 );

			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{foo}}"><option disabled>yo</option></select>'
			});
		});

		test( 'Model -> view binding works with <select multiple> (#1009)', function ( t ) {
			var ractive, options;

			ractive = new Ractive({
				el: fixture,
				template: `
					<select value='{{selectedColors}}' multiple>
						{{#each colors}}
							<option>{{this}}</option>
						{{/each}}
					</select>`,
				data: {
					colors: [ 'red', 'green', 'blue', 'purple' ]
				}
			});

			options = ractive.findAll( 'option' );

			ractive.set( 'selectedColors', [ 'green', 'purple' ]);
			t.ok( !options[0].selected );
			t.ok( options[1].selected );
			t.ok( !options[2].selected );
			t.ok( options[3].selected );
		});

	};

});
