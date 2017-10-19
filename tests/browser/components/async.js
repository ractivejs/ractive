/* global document */
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'components/async.js' );

	test( `loading a components from a promise`, t => {
		const done = t.async();

		const cmp = Promise.resolve( Ractive.extend({ template: 'hello' }) );
		new Ractive({
			target: fixture,
			template: '<cmp />',
			components: { cmp }
		});

		t.equal( fixture.innerHTML, '' );

		setTimeout( () => {
			t.equal( fixture.innerHTML, 'hello' );
			done();
		});
	});

	test( `loading a component from a promise with a an async-loading placeholder`, t => {
		const done = t.async();

		const cmp = Promise.resolve( Ractive.extend({ template: 'hello' }) );
		new Ractive({
			target: fixture,
			template: '<cmp>{{#partial async-loading}}loading...{{/partial}}</cmp>',
			components: { cmp }
		});

		t.equal( fixture.innerHTML, 'loading...' );

		setTimeout( () => {
			t.equal( fixture.innerHTML, 'hello' );
			done();
		});
	});


	test( `component function returning a promise`, t => {
		const done = t.async();

		const cmp = Promise.resolve( Ractive.extend({ template: 'hello' }) );
		new Ractive({
			target: fixture,
			template: '<cmp />',
			components: { cmp: () => cmp }
		});

		t.equal( fixture.innerHTML, '' );

		setTimeout( () => {
			t.equal( fixture.innerHTML, 'hello' );
			done();
		});
	});

	test( `component function returning a promise and an async loading placeholder`, t => {
		const done = t.async();

		const cmp = Promise.resolve( Ractive.extend({ template: 'hello' }) );
		new Ractive({
			target: fixture,
			template: '<cmp>{{#partial async-loading}}loading...{{/partial}}</cmp>',
			components: { cmp: () => cmp }
		});

		t.equal( fixture.innerHTML, 'loading...' );

		setTimeout( () => {
			t.equal( fixture.innerHTML, 'hello' );
			done();
		});
	});

	test( `async component with a loading placeholder`, t => {
		const done = t.async();

		const cmp = Promise.resolve( Ractive.extend({ template: 'hello' }) );
		new Ractive({
			target: fixture,
			template: `<cmp>{{#partial async-loading}}loading...{{/partial}}{{#partial async-loaded}}<div class="loaded">{{>component}}</div>{{/partial}}</cmp>`,
			components: { cmp }
		});

		t.equal( fixture.innerHTML, 'loading...' );

		setTimeout( () => {
			t.equal( fixture.innerHTML, '<div class="loaded">hello</div>' );
			done();
		});
	});
}
