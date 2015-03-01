module( 'Yield' );

test( 'Basic yield', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '<p>{{yield}}</p>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget>yeah!</widget>',
		components: { widget: Widget }
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

test( 'A component can only have one {{yield}}', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '<p>{{yield}}{{yield}}</p>'
	});

	throws( () => {
		ractive = new Ractive({
			el: fixture,
			template: '<widget>yeah!</widget>',
			components: { widget: Widget }
		});
	}, /one {{yield}} declaration/ );
});

test( 'A component {{yield}} can be rerendered in conditional section block', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '<p>{{#foo}}{{yield}}{{/}}</p>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget>yield</widget>',
		components: { widget: Widget },
		data: { foo: true }
	});

	ractive.set('foo', false);
	ractive.set('foo', true);

	t.htmlEqual( fixture.innerHTML, '<p>yield</p>' );
});

test( 'A component {{yield}} can be rerendered in list section block', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '{{#items:i}}{{.}}{{#i===1}}{{yield}}{{/}}{{/}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget>yield</widget>',
		components: { widget: Widget },
		data: { items: [ 'a', 'b', 'c' ] }
	});

	ractive.merge('items', [ 'c', 'a' ] );

	t.htmlEqual( fixture.innerHTML, 'cayield' );
});

test( 'A component {{yield}} should be parented by the fragment holding the yield and not the fragment holding the component', t => {
	let template, widget;

	template = `<widget foo='{{foo}}'>
		{{#if foo}}foo!{{/if}}
		{{#if foo}}foo!{{/if}}
	</widget>`;

	widget = Ractive.extend({
		template: '<div>{{yield}}</div>',
		data: {
			foo: true
		}
	});

	new Ractive({
		el: fixture,
		template: template,
		components: { widget }
	});

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
		let widget = Ractive.extend({
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
