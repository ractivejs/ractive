/*global test, module, simulant */
define([ 'ractive' ], function ( Ractive ) {

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'Forms' );

		test( 'Resetting a form resets an input with two-way binding', t => {
			var ractive, input;

			ractive = new Ractive({
				el: fixture,
				template: `
					<form>
						<input value="{{value}}">
						<button type='reset'>reset</button>
					</form>`,
				data: {
					value: 'foo'
				}
			});

			input = ractive.find( 'input' );

			input.value = 'bar';
			ractive.updateModel();

			simulant.fire( ractive.find( 'button' ), 'click' );
			t.equal( input.value, 'foo' );
			t.equal( ractive.get( 'value' ), 'foo' );
		});

		test( 'Resetting a form resets widgets with one-way bindings', t => {
			var ractive, widgets = {};

			ractive = new Ractive({
				el: fixture,
				template: `
					<form>
						<input value="{{value}}">
						<select value='{{selected}}'>
							<option>a</option>
							<option>b</option>
							<option>c</option>
						</select>
						<textarea value='{{textarea}}'></textarea>
						<button type='reset'>reset</button>
					</form>`,
				data: {
					value: 'foo',
					selected: 'b',
					textarea: 'qwert'
				},
				twoway: false
			});

			widgets = {
				input: ractive.find( 'input' ),
				select: ractive.find( 'select' ),
				textarea: ractive.find( 'textarea' )
			};

			widgets.input.value = 'bar';
			widgets.select.value = 'c';
			widgets.textarea.value = 'yuiop';

			simulant.fire( ractive.find( 'button' ), 'click' );

			t.equal( widgets.input.value, 'foo' );
			t.equal( widgets.select.value, 'b' );
			t.equal( widgets.textarea.value, 'qwert' );
		});

		test( 'Resetting a form resets widgets with no bindings', t => {
			var ractive, widgets = {};

			ractive = new Ractive({
				el: fixture,
				template: `
					<form>
						<input value="foo">
						<select value='b'>
							<option>a</option>
							<option>b</option>
							<option>c</option>
						</select>
						<textarea>qwert</textarea>
						<button type='reset'>reset</button>
					</form>`,
				twoway: false
			});

			widgets = {
				input: ractive.find( 'input' ),
				select: ractive.find( 'select' ),
				textarea: ractive.find( 'textarea' )
			};

			t.equal( widgets.input.value, 'foo' );
			t.equal( widgets.select.value, 'b' );
			t.equal( widgets.textarea.value, 'qwert' );

			widgets.input.value = 'bar';
			widgets.select.value = 'c';
			widgets.textarea.value = 'yuiop';

			simulant.fire( ractive.find( 'button' ), 'click' );

			t.equal( widgets.input.value, 'foo' );
			t.equal( widgets.select.value, 'b' );
			t.equal( widgets.textarea.value, 'qwert' );
		});
	};

});
