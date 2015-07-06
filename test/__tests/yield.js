import hasUsableConsole from 'hasUsableConsole';
import cleanup from 'helpers/cleanup';

module( 'Yield', { afterEach: cleanup });

test( 'Basic yield', function ( t ) {
	const Widget = Ractive.extend({
		template: '<p>{{yield}}</p>'
	});

	new Ractive({
		el: fixture,
		template: '<Widget>yeah!</Widget>',
		components: { Widget }
	});

	t.htmlEqual( fixture.innerHTML, '<p>yeah!</p>' );
});

test( 'References are resolved in parent context', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '<p>{{yield}}</p>',
		isolated: true
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget>{{foo}}</widget>',
		data: { foo: 'yeah!' },
		components: { widget: Widget }
	});

	t.htmlEqual( fixture.innerHTML, '<p>yeah!</p>' );
});

test( 'References are resolved in parent context through multiple layers', function ( t ) {
	var Widget, WidgetInner, Middle, ractive;

	WidgetInner = Ractive.extend({
		template: '<p>{{yield}}</p>',
		isolated: true
	});

	Widget = Ractive.extend({
		template: '<widget-inner>{{yield}}</widget-inner>',
		isolated: true,
		components: { 'widget-inner': WidgetInner }
	});

	Middle = Ractive.extend({
		template: '<strong>{{yield}}</strong>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget><middle>{{foo}}</middle></widget>',
		data: { foo: 'yeah!' },
		components: { widget: Widget, middle: Middle }
	});

	t.htmlEqual( fixture.innerHTML, '<p><strong>yeah!</strong></p>' );
});

test( 'Events fire in parent context', function ( t ) {
	var Widget, WidgetInner, Middle, ractive;

	WidgetInner = Ractive.extend({
		template: '<p>{{yield}}</p>',
		isolated: true
	});

	Widget = Ractive.extend({
		template: '<widget-inner>{{yield}}</widget-inner>',
		isolated: true,
		components: { 'widget-inner': WidgetInner }
	});

	Middle = Ractive.extend({
		template: '<strong>{{yield}}</strong>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget><middle><button on-click="test(foo)">click me</button></middle></widget>',
		data: { foo: 'yeah!' },
		components: { widget: Widget, middle: Middle }
	});

	ractive.test = function ( foo ) {
		t.equal( foo, 'yeah!' );
	};

	expect( 1 );
	simulant.fire( ractive.find( 'button' ), 'click' );
});

test( 'A component can only have one {{yield}}', function () {
	const Widget = Ractive.extend({
		template: '<p>{{yield}}{{yield}}</p>'
	});

	throws( () => {
		new Ractive({
			el: fixture,
			template: '<Widget>yeah!</Widget>',
			components: { Widget }
		});
	}, /one {{yield}} declaration/ );
});

test( 'A component {{yield}} can be rerendered in conditional section block', function ( t ) {
	const Widget = Ractive.extend({
		template: '<p>{{#foo}}{{yield}}{{/}}</p>'
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<Widget>yield</Widget>',
		components: { Widget },
		data: { foo: true }
	});

	ractive.set( 'foo', false );
	ractive.set( 'foo', true );

	t.htmlEqual( fixture.innerHTML, '<p>yield</p>' );
});

test( 'A component {{yield}} can be rerendered in list section block', function ( t ) {
	const Widget = Ractive.extend({
		template: `
			{{#each items:i}}
				{{this}}{{#if i===1}}:{{yield}}:{{/if}}
			{{/each}}`
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<Widget>yield</Widget>',
		components: { Widget },
		data: { items: [ 'a', 'b', 'c' ] }
	});

	ractive.merge('items', [ 'c', 'a' ] );

	t.htmlEqual( fixture.innerHTML, 'cayield' );
});

test( 'A component {{yield}} should be parented by the fragment holding the yield and not the fragment holding the component', t => {
	const Widget = Ractive.extend({
		template: '<div>{{yield}}</div>',
		data: {
			foo: true
		}
	});

	const ractive = new Ractive({
		el: fixture,
		template: `
			<Widget foo='{{foo}}'>
				{{#if foo}}foo!{{/if}}
				{{#if foo}}foo!{{/if}}
			</Widget>`,
		components: { Widget }
	});

	const widget = ractive.findComponent( 'Widget' );

	t.htmlEqual( fixture.innerHTML, '<div>foo! foo!</div>' );
});

test( 'Named yield with a hyphenated name (#1681)', t => {
	let template, widget;

	template = `
		<widget>
			{{#partial foo-bar}}
				<p>this is foo-bar</p>
			{{/partial}}
		</widget>`;

	widget = Ractive.extend({
		template: '{{yield foo-bar}}'
	});

	new Ractive({
		el: fixture,
		template: template,
		components: { widget }
	});

	t.htmlEqual( fixture.innerHTML, '<p>this is foo-bar</p>' );
});

test( 'Named yield must have valid name, not expression (#1681)', t => {
	t.throws( () => {
		Ractive.extend({
			template: '{{yield "<p>nope</p>"}}'
		});
	}, /expected legal partial name/ );
});

test( 'Named yield with Ractive.extend() works as with new Ractive() (#1680)', t => {
	let template, widget, ractive, Container;

	widget = Ractive.extend({
		template: '{{yield foo}}'
	});

	template = `
		<widget>
			{{#partial foo}}
				<p>this is foo</p>
			{{/partial}}
		</widget>`;

	ractive = new Ractive({
		el: fixture,
		template,
		components: { widget }
	});

	t.htmlEqual( fixture.innerHTML, '<p>this is foo</p>' );

	Container = Ractive.extend({
		template,
		components: { widget }
	});

	new Container({
		el: fixture
	});

	t.htmlEqual( fixture.innerHTML, '<p>this is foo</p>' );
});

test( 'Components inherited from more than one generation off work with named yields', t => {
	let widget = Ractive.extend({
		template: '{{yield foo}}'
	});

	let Base = Ractive.extend({
		components: { widget }
	});

	let Step1 = Base.extend();
	let Step2 = Step1.extend();
	let Step3 = Step2.extend({
		template: `<widget>
				{{#partial foo}}
					<p>this is foo</p>
				{{/partial}}
			</widget>`
	});

	new Step3({
		el: fixture
	});

	t.htmlEqual( fixture.innerHTML, '<p>this is foo</p>' );
});

if ( hasUsableConsole ) {
	test( 'Yield with missing partial (#1681)', t => {
		/* global console */
		let warn = console.warn;
		console.warn = msg => {
			t.ok( /Could not find template for partial "missing"/.test( msg ) );
		};

		let Widget = Ractive.extend({
			template: '{{yield missing}}'
		});

		new Ractive({
			template: '<Widget/>',
			components: { Widget }
		});

		console.warn = warn;
	});
}
