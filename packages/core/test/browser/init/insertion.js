import { beforeEach, initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	let target;
	let child;

	beforeEach( () => {
		target = document.createElement( 'div' );
		child = document.createElement( 'div' );

		target.id = 'target';

		child.innerHTML = 'bar';
		target.appendChild( child );

		fixture.appendChild( target );
	});

	initModule( 'init/insertion.js' );

	test( 'Element by id selector', t => {
		new Ractive({
			el: '#target',
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Element by id (hashless)', t => {
		new Ractive({
			el: 'target',
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Element by query selector', t => {
		new Ractive({
			el: 'div[id=target]',
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Element by node', t => {
		new Ractive({
			el: target,
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Element by nodelist', t => {
		new Ractive({
			el: fixture.querySelectorAll('div'),
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Element by any array-like', t => {
		new Ractive({
			el: [target],
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Default replaces content', t => {
		new Ractive({
			el: target,
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Default replaces content', t => {
		new Ractive({
			el: target,
			template: '<div>foo</div>'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Append false (normal default) replaces content', t => {
		new Ractive({
			el: target,
			template: '<div>foo</div>',
			append: false
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
	});

	test( 'Append true option inserts as last child node', t => {
		new Ractive({
			el: target,
			template: '<div>foo</div>',
			append: true
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>bar</div><div>foo</div></div>' );
	});

	test( 'Append with anchor inserts before anchor', t => {
		new Ractive({
			el: target,
			template: '<div>foo</div>',
			append: child
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div><div>bar</div></div>' );
	});
}
