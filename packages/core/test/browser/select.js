import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'select.js' );

	test( 'Use as a string to compare', t => {
		const ractive = new Ractive({
			el: fixture,
			comparatorFn( option, value ) {
				return option.id == value.id;
			},
			template: `
				<select id="select" value-comparator="id" value="{{selected}}">
					{{#options}}
						<option value="{{.}}">{{.}}</option>
					{{/options}}
				</select>`
		});

		ractive.set({
			selected: { id: 2 },
			options: [ { id: 1 }, { id: 2 }, { id: 3 } ]
		});

		t.equal( ractive.get( 'selected.id' ), '2' );
		t.equal( ractive.find( 'select' ).value, { id: 2 } );
	});

	test( 'Use as a function to compare', t => {
		const ractive = new Ractive({
			el: fixture,
			comparatorFn( option, value ) {
				return option.id == value.id;
			},
			template: `
				<select id="select" value-comparator="{{@this.comparatorFn}}" value="{{selected}}">
					{{#options}}
						<option value="{{.}}">{{.}}</option>
					{{/options}}
				</select>`
		});

		ractive.set({
			selected: { id: 2 },
			options: [ { id: 1 }, { id: 2 }, { id: 3 } ]
		});

		t.equal( ractive.get( 'selected.id' ), '2' );
		t.equal( ractive.find( 'select' ).value, { id: 2 } );
	});

	test( 'If a select\'s value attribute is updated at the same time as the available options, the correct option will be selected', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select id="select" value="{{selected}}">
					{{#options}}
						<option value="{{.}}">{{.}}</option>
					{{/options}}
				</select>`
		});

		t.htmlEqual( fixture.innerHTML, '<select id="select"></select>' );

		ractive.set({
			selected: 'c',
			options: [ 'a', 'b', 'c', 'd' ]
		});

		t.equal( ractive.get( 'selected' ), 'c' );
		t.equal( ractive.find( '#select' ).value, 'c' );
	});

	test( 'If a select value with two-way binding has a selected option at render time, the model updates accordingly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{color}}">
					<option value="red">red</option>
					<option value="blue">blue</option>
					<option value="green" selected>green</option>
				</select>

				<p>selected {{color}}</p>`
		});

		t.equal( ractive.get( 'color' ), 'green' );
		t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select> <p>selected green</p>' );
	});

	test( 'If a select value with two-way binding has no selected option at render time, the model defaults to the top value', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{color}}">
					<option value="red">red</option>
					<option value="blue">blue</option>
					<option value="green">green</option>
				</select>
				<p>selected {{color}}</p>`
		});

		t.equal( ractive.get( 'color' ), 'red' );
		t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select> <p>selected red</p>' );
	});


	test( 'If the value of a select is specified in the model, it overrides the markup', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{color}}">
					<option value="red">red</option>
					<option id="blue" value="blue">blue</option>
					<option id="green" value="green" selected>green</option>
				</select>`,
			data: { color: 'blue' }
		});

		t.equal( ractive.get( 'color' ), 'blue' );
		t.ok( ractive.find( '#blue' ).selected );
		t.ok( !ractive.find( '#green' ).selected );
	});

	test( 'A select value with static options with numeric values will show the one determined by the model, whether a string or a number is used', t => {
		let ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{i}}">
					<option id="_1" value="1">one</option>
					<option id="_2" value="2">two</option>
					<option id="_3" value="3">three</option>
				</select>`,
			data: { i: 2 }
		});

		t.ok( !ractive.find( '#_1' ).selected );
		t.ok(  ractive.find( '#_2' ).selected );
		t.ok( !ractive.find( '#_3' ).selected );

		ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{i}}">
					<option id="_1" value="1">one</option>
					<option id="_2" value="2">two</option>
					<option id="_3" value="3">three</option>
				</select>`,
			data: { i: '3' }
		});

		t.ok( !ractive.find( '#_1' ).selected );
		t.ok( !ractive.find( '#_2' ).selected );
		t.ok(  ractive.find( '#_3' ).selected );
	});
	/*
test( 'Setting the value of a select works with options added via a triple', t => {
		const ractive = new Ractive({
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
	*/
	test( 'A two-way select updates to the actual value of its selected option, not the stringified value', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{selected}}">
					{{#options}}
						<option value="{{.}}">{{description}}</option>
					{{/options}}
				</select>
				<p>Selected {{selected.description}}</p>`,
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
test( 'If a multiple select value with two-way binding has a selected option at render time, the model updates accordingly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<select value="{{colors}}" multiple><option value="red">red</option><option value="blue" selected>blue</option><option value="green" selected>green</option></select>'
		});

		t.deepEqual( ractive.get( 'colors' ), [ 'blue', 'green' ] );
	});
	*/

	test( 'If a multiple select value with two-way binding has no selected option at render time, the model defaults to an empty array', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{colors}}" multiple>
					<option value="red">red</option>
					<option value="blue">blue</option>
					<option value="green">green</option>
				</select>`
		});

		t.deepEqual( ractive.get( 'colors' ), [] );
	});

	test( 'If the value of a multiple select is specified in the model, it overrides the markup', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{colors}}" multiple>
					<option id="red" value="red">red</option>
					<option id="blue" value="blue">blue</option>
					<option id="green" value="green" selected>green</option>
				</select>`,
			data: { colors: [ 'red', 'green' ] }
		});

		t.deepEqual( ractive.get( 'colors' ), [ 'red', 'green' ] );
		t.ok( ractive.find( '#red' ).selected );
		t.ok( !ractive.find( '#blue' ).selected );
		t.ok( ractive.find( '#green' ).selected );
	});

	test( 'updateModel correctly updates the value of a multiple select', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select multiple value="{{selected}}">
					<option selected value="red">red</option>
					<option value="blue">blue</option>
					<option value="green">green</option>
				</select>`
		});

		t.deepEqual( ractive.get( 'selected' ), [ 'red' ] );

		ractive.findAll( 'option' )[1].selected = true;
		ractive.updateModel();

		t.deepEqual( ractive.get( 'selected' ), [ 'red', 'blue' ] );
	});

	test( 'Options added to a select after the initial render will be selected if the value matches', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{value_id}}">
					{{#post_values}}
						<option value="{{id}}">{{id}} &mdash; {{name}}</option>
					{{/post_values}}
				</select>`,
			data: {
				value_id: 42,
				values: [
					{ id: 1, name: 'Boo' },
					{ id: 42, name: 'Here \'tis' }
				]
			}
		});

		let options = ractive.findAll( 'option' );
		t.ok( !options.length );

		ractive.set('post_values', ractive.get('values'));
		options = ractive.findAll( 'option' );

		t.equal( options.length, 2 );
		t.ok( !options[0].selected );
		t.ok( options[1].selected );
	});

	test( 'If an empty select with a binding has options added to it, the model should update', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{id}}">
					{{#items}}
						<option value="{{id}}">{{text}}</option>
					{{/items}}
				</select>
				<strong>Selected: {{id || "nothing"}}</strong>`
		});

		ractive.set('items', [ { id: 1, text: 'one' }, { id: 2, text: 'two' } ]);
		t.equal( ractive.get( 'id' ), 1 );
		t.htmlEqual( fixture.innerHTML, '<select><option value="1">one</option><option value="2">two</option></select><strong>Selected: 1</strong>' );
	});

	test( 'Regression test for #339', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#items:i}}
					<p>{{i}}:
						<select value="{{.color}}">
							<option value="red">Red</option>
						</select>
					</p>
				{{/items}}`,
			data: { items: [{}] }
		});

		const selects = ractive.findAll( 'select', { live: true });

		t.equal( selects[0].value, 'red' );

		ractive.push( 'items', {} );

		t.htmlEqual( fixture.innerHTML, '<p>0: <select><option value="red">Red</option></select></p><p>1: <select><option value="red">Red</option></select></p>' );
		t.deepEqual( ractive.get(), { items: [ {color: 'red'}, {color: 'red'} ] } );
	});

	test( 'Regression test for #351', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{selected}}" multiple>
					{{#items}}
						<option value="{{id}}">{{name}}</option>
					{{/items}}
				</select>`
		});

		ractive.set( 'items', [{name:'one', id:1}, {name:'two', id:2}]);

		t.htmlEqual( fixture.innerHTML, '<select multiple><option value="1">one</option><option value="2">two</option></select>' );
	});

	test( '<option>{{foo}}</option> behaves the same as <option value="{{foo}}">{{foo}}</option>', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{test1}}">
					<option>a</option>
					<option>b</option>
					<option>c</option>
				</select>
				<select value="{{test2}}">
					{{#options}}
						<option>{{.}}</option>
					{{/options}}
				</select>`,
			data: { options: [ 'a', 'b', 'c' ]}
		});

		t.equal( ractive.get( 'test1' ), 'a' );
		t.equal( ractive.get( 'test2' ), 'a' );

		const options = ractive.findAll( 'option' );

		options[1].selected = true;
		options[5].selected = true;

		ractive.updateModel();

		t.equal( ractive.get( 'test1' ), 'b' );
		t.equal( ractive.get( 'test2' ), 'c' );
	});

	test( 'A select whose options are re-rendered will update its binding', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{selected}}">
					{{#options}}
						<option>{{.}}</option>
					{{/options}}
				</select>
				<p>selected: {{selected}}</p>`,
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

	test( 'Options can be inside a partial (#707)', t => {
		new Ractive({
			el: fixture,
			template: `
				<select>
					{{#options}}{{>option}}{{/options}}
				</select>`,
			data: { options: [ 'a', 'b' ] },
			partials: { option: '<option>{{this}}</option>' }
		});

		t.htmlEqual( fixture.innerHTML, '<select><option value="a">a</option><option value="b">b</option></select>' );
	});

	test( 'Disabled options have no implicit value (#786)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<p>{{selected}}</p>
				<select value="{{selected}}">
					<option selected disabled>Select a letter</option>
					{{#letters}}
						<option>{{this}}</option>
					{{/letters}}
				</select>`,
			data: {
				letters: [ 'a', 'b', 'c' ]
			}
		});

		t.equal( ractive.get( 'selected' ), undefined );
		t.htmlEqual( fixture.innerHTML, '<p></p><select><option disabled>Select a letter</option><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>' );
	});

	test( 'Uninitialised <select> elements will use the first *non-disabled* option', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<p>{{selected}}</p>
				<select value="{{selected}}">
					<option disabled>Select a letter</option>
					{{#letters}}
						<option>{{this}}</option>
					{{/letters}}
				</select>`,
			data: {
				letters: [ 'a', 'b', 'c' ]
			}
		});

		t.equal( ractive.get( 'selected' ), 'a' );
		t.htmlEqual( fixture.innerHTML, '<p>a</p><select><option disabled>Select a letter</option><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>' );
		t.equal( ractive.find( 'select' ).value, 'a' );
	});

	test( 'Removing selected options from a list causes the select element\'s binding to update (#776)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select value="{{value}}">
					{{#each options}}
						<option>{{this}}</option>
					{{/each}}
					<option selected>999</option>
					{{{lol}}}
				</select>`,
			data: {
				options: [1,2,3,4],
				lol: '<option>lol</option>'
			}
		});

		ractive.set( 'value', 1 );
		ractive.set( 'options', [] );
		t.equal( ractive.get( 'value' ), '999' );
	});

	test( 'Select bindings work even if there is only a disabled option', t => {
		t.expect( 0 );

		new Ractive({
			el: fixture,
			template: `
				<select value="{{foo}}">
					<option disabled>yo</option>
				</select>`
		});
	});

	test( 'Model -> view binding works with <select multiple> (#1009)', t => {
		const ractive = new Ractive({
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

		const options = ractive.findAll( 'option' );

		ractive.set( 'selectedColors', [ 'green', 'purple' ]);
		t.ok( !options[0].selected );
		t.ok( options[1].selected );
		t.ok( !options[2].selected );
		t.ok( options[3].selected );
	});

	test( 'A multiple select uses non-strict comparison', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select multiple value="{{i}}">
					<option id="_1" value="1">one</option>
					<option id="_2" value="2">two</option>
					<option id="_3" value="3">three</option>
				</select>`,
			data: { i: [ 1, '2' ] }
		});

		t.ok(  ractive.find( '#_1' ).selected );
		t.ok(  ractive.find( '#_2' ).selected );
		t.ok( !ractive.find( '#_3' ).selected );

		ractive.set( 'i', [ 2, '3' ] );

		t.ok( !ractive.find( '#_1' ).selected );
		t.ok(  ractive.find( '#_2' ).selected );
		t.ok(  ractive.find( '#_3' ).selected );
	});

	test( 'safe to render options into select outside of ractive', t => {
		const select = document.createElement( 'SELECT' );
		fixture.appendChild( select );

		new Ractive({
			el: select,
			template: `
				{{#items}}
					<option>{{.}}</option>
				{{/}}`,
			data: {
				items: [ 'a' ]
			}
		});

		t.htmlEqual( select.innerHTML, '<option>a</option>' );
	});

	test( `select options fragment should update correctly (#2428)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `
				<select multiple>{{#each .list}}{{#if .selected}}<option value="{{@index}}">{{.name}}</option>{{/if}}{{/each}}</select>
				{{#each .list}}<input type="checkbox" checked="{{.selected}}" />{{/each}}
			`,
			data: {}
		});
		r.set( 'list', [ { value: 'a', selected: true }, { value: 'b', selected: false }, { value: 'c' } ] );

		t.equal( r.findAll( 'option' ).length, 1 );

		r.set( 'list.2.selected', true );

		t.equal( r.findAll( 'option' ).length, 2 );
	});

	test( `check to see if a multiselect value is an array before looking for options (#2825)`, t => {
		t.expect( 0 );

		new Ractive({
			el: fixture,
			template: `<select multiple value="{{value}}">
				{{#each values}}
					<option value="{{.value}}">{{.text}}</option>
				{{/each}}
			</select>`,
			data: {
				value: null,
				values: [
					{ value: 'foo', text: 'a foo' },
					{ value: 'bar', text: 'a bar' }
				]
			}
		});
	});
}
