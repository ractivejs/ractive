import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/attachChild.js' );

	test( 'child instances can be attached to parents to inherit data implicitly', t => {
		const r1 = new Ractive({
			data: {
				foo: 'bar'
			}
		});
		const r2 = new Ractive({
			template: '{{foo}}'
		});

		t.equal( r2.toHTML(), '' );
		r1.attachChild( r2 );
		t.equal( r2.toHTML(), 'bar' );
	});

	test( 'child instances can be attached to an anchor', t => {
		const r1 = new Ractive({
			template: '{{>>foo}}',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'hello' );
	});

	test( 'targeted child instances are rendered and unrendered with their anchor', t => {
		const r1 = new Ractive({
			template: '{{#if show}}{{>>foo}}{{/if}}',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, '' );
		r1.set( 'show', true );
		t.equal( fixture.innerHTML, 'hello' );
		r1.set( 'show', false );
		t.equal( fixture.innerHTML, '' );
	});

	test( 'non-targeted instances stay where they are when attached', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r1.attachChild( r2 );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
	});

	test( 'targeted instances are unrendered before being attached', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1{{>>foo}}'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r1.attachChild( r2, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1r2</div><div id="r2"></div>' );
	});

	test( 'targeted instances are unrendered event if their anchor doesn\'t exist when attached', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r1.attachChild( r2, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2"></div>' );
	});

	test( 'single tenant anchors render the latest available child', t => {
		const r1 = new Ractive({
			template: '{{>>foo}}',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});
		const r3 = new Ractive({
			template: 'world'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'hello' );
		r1.attachChild( r3, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'world' );
		r1.detachChild( r3 );
		t.equal( fixture.innerHTML, 'hello' );
		r1.detachChild( r2 );
		t.equal( fixture.innerHTML, '' );
	});

	test( 'multitenant anchors render instances as they attach', t => {
		const r1 = new Ractive({
			template: '{{>>foo multi}}',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});
		const r3 = new Ractive({
			template: 'world'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'hello' );
		r1.attachChild( r3, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'helloworld' );
		r1.detachChild( r2 );
		t.equal( fixture.innerHTML, 'world' );
		r1.detachChild( r3 );
		t.equal( fixture.innerHTML, '' );
	});

	test( 'attached children\'s events bubble to the parent', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1{{>>foo}}'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		let count = 0;
		r1.on( 'r2.test', () => count++ );

		r1.attachChild( r2, { name: 'r2' } );
		r2.fire( 'test' );
		r1.detachChild( r2 );
		r2.fire( 'test' );
		r1.attachChild( r2, { target: 'foo', name: 'r2' } );
		r2.fire( 'test' );

		t.equal( count, 2 );
	});

	// TODO: tests involving transitions
	// TODO: test for attaching the same child twice or attaching a child that is attached elsewhere
}

