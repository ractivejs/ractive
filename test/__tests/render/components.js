import { test } from 'qunit';

test( 'Components are rendered in the correct place', t => {
	var Component, ractive;

	Component = Ractive.extend({
		template: '<p>this is a component!</p>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<h2>Here is a component:</h2><component/><p>(that was a component)</p>',
		components: {
			component: Component
		}
	});

	t.htmlEqual( fixture.innerHTML, '<h2>Here is a component:</h2><p>this is a component!</p><p>(that was a component)</p>' );
});

test( 'Top-level sections in components are updated correctly', t => {
	var ractive, Component;

	Component = Ractive.extend({
		template: '{{#foo}}foo is truthy{{/foo}}{{^foo}}foo is falsy{{/foo}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component foo="{{foo}}"/>',
		components: {
			component: Component
		}
	});

	t.htmlEqual( fixture.innerHTML, 'foo is falsy' );

	ractive.set( 'foo', true );
	t.htmlEqual( fixture.innerHTML, 'foo is truthy' );
});

test( 'Element order is maintained correctly with components with multiple top-level elements', t => {
	var ractive, TestComponent;

	TestComponent = Ractive.extend({
		template: '{{#bool}}TRUE{{/bool}}{{^bool}}FALSE{{/bool}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<p>before</p> <test bool="{{bool}}"/> <p>after</p>',
		components: { test: TestComponent }
	});

	t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );

	ractive.set( 'bool', true );
	t.htmlEqual( fixture.innerHTML, '<p>before</p> TRUE <p>after</p>' );

	ractive.set( 'bool', false );
	t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );
});

test( 'Top-level list sections in components do not cause elements to be out of order (#412 regression)', t => {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '{{#numbers:o}}<p>{{.}}</p>{{/numbers}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<h1>Names</h1><widget numbers="{{first}}"/><widget numbers="{{second}}"/>',
		components: {
			widget: Widget
		},
		data: {
			first: { one: 'one', two: 'two' },
			second: { three: 'three', four: 'four' }
		}
	});

	t.htmlEqual( fixture.innerHTML, '<h1>Names</h1><p>one</p><p>two</p><p>three</p><p>four</p>' );
});
