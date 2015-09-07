import { test } from 'qunit';
import { fire } from 'simulant';

test( 'Resetting a form resets an input with two-way binding', t => {
	const ractive = new Ractive({
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

	const input = ractive.find( 'input' );

	input.value = 'bar';
	ractive.updateModel();

	fire( ractive.find( 'button' ), 'click' );
	t.equal( input.value, 'foo' );
	t.equal( ractive.get( 'value' ), 'foo' );
});

test( 'Resetting a form resets widgets with one-way bindings', t => {
	const ractive = new Ractive({
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

	const nodes = {
		input: ractive.find( 'input' ),
		select: ractive.find( 'select' ),
		textarea: ractive.find( 'textarea' )
	};

	nodes.input.value = 'bar';
	nodes.select.value = 'c';
	nodes.textarea.value = 'yuiop';

	fire( ractive.find( 'button' ), 'click' );

	t.equal( nodes.input.value, 'foo' );
	t.equal( nodes.select.value, 'b' );
	t.equal( nodes.textarea.value, 'qwert' );
});

test( 'Resetting a form resets widgets with no bindings', t => {
	const ractive = new Ractive({
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

	const nodes = {
		input: ractive.find( 'input' ),
		select: ractive.find( 'select' ),
		textarea: ractive.find( 'textarea' )
	};

	t.equal( nodes.input.value, 'foo' );
	t.equal( nodes.select.value, 'b' );
	t.equal( nodes.textarea.value, 'qwert' );

	nodes.input.value = 'bar';
	nodes.select.value = 'c';
	nodes.textarea.value = 'yuiop';

	fire( ractive.find( 'button' ), 'click' );

	t.equal( nodes.input.value, 'foo' );
	t.equal( nodes.select.value, 'b' );
	t.equal( nodes.textarea.value, 'qwert' );
});
