import { fire } from 'simulant';
import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'forms.js' );

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

	test( 'textarea with html content and no bindings should render the html text as a normal textarea would (#2198)', t => {
		new Ractive({
			el: fixture,
			template: '<textarea><div class="foo"><strong>bar</strong></div><p>WAT</p></textarea>'
		});

		t.equal( fixture.querySelector( 'textarea' ).value, '<div class="foo"><strong>bar</strong></div><p>WAT</p>' );
	});

	test( 'textareas without binding allow any template content (#2063)', t => {
		const r = new Ractive({
			el: fixture,
			template: '<textarea><i>{{foo}}</i>{{bar}} {{{baz}}}</textarea>',
			data: { foo: 'part1', bar: 'part2', baz: '<div>hello</div>' }
		});

		t.equal( fixture.querySelector( 'textarea' ).value, '<i>part1</i>part2 <div>hello</div>' );
		r.set( 'foo', 'change1' );
		t.equal( fixture.querySelector( 'textarea' ).value, '<i>change1</i>part2 <div>hello</div>' );
		r.set( 'bar', 'change2' );
		t.equal( fixture.querySelector( 'textarea' ).value, '<i>change1</i>change2 <div>hello</div>' );
		r.set( 'baz', '<strong>change3</strong>' );
		t.equal( fixture.querySelector( 'textarea' ).value, '<i>change1</i>change2 <strong>change3</strong>' );
	});

	test( 'input that has binding change to undefined should be blank (#2279)', t => {
		const r = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" />'
		});

		t.equal( r.find( 'input' ).value, '' );
		r.set( 'foo', undefined );
		t.equal( r.find( 'input' ).value, '' );
	});

	test( 'forms should unrender properly #2352', t => {
		const r = new Ractive({
			el: fixture,
			template: 'foo: {{#if foo}}<form>Yep</form>{{/if}}',
			data: { foo: true }
		});

		r.toggle( 'foo' );
		t.htmlEqual( fixture.innerHTML, 'foo:' );
		r.toggle( 'foo' );
		t.htmlEqual( fixture.innerHTML, 'foo: <form>Yep</form>' );
	});

	test( `non-twoway selects should not reset to their attribute value on update unless actually dirty (#2965)`, t => {
		const r = new Ractive({
			el: fixture,
			template: '<label>{{foo}} <select twoway="false" value="{{bar}}"><option value="{{baz}}">baz</option><option value="2">2</option></select></label>',
			data: {
				foo: 'a',
				bar: '1',
				baz: '1'
			}
		});

		const select = r.find( 'select' );
		const options = r.findAll( 'option' );

		t.equal( select.value, '1' );
		t.ok( options[0].selected );

		r.set( 'bar', '2' );
		t.equal( select.value, '2' );
		t.ok( options[1].selected );

		select.value = '1';
		t.ok( options[0].selected );

		r.set( 'foo', 'b' );
		t.equal( select.value, '1' );
		t.ok( options[0].selected );

		r.set( 'bar', 2 );
		t.equal( select.value, '2' );
		t.ok( options[1].selected );

		r.set( 'baz', '42' );
		r.set( 'bar', '42' );
		t.equal( select.value, '42' );
		t.ok( options[0].selected );
	});
}
