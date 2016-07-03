import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/addMapping.js' );

	test( 'addMapping adds a mapping', t => {
		const cmp = Ractive.extend({
			template: '{{foo}}'
		});
		const r = new Ractive({
			el: fixture,
			template: '<cmp />',
			data: { bar: 'foo' },
			components: { cmp }
		});

		t.equal( fixture.innerHTML, '' );
		r.findComponent().addMapping( 'foo', 'bar' );
		t.equal( fixture.innerHTML, 'foo' );
	});

	test( `addMapping resolves from surrounding context`, t => {
		const cmp = Ractive.extend({
			template: '{{foo}}'
		});
		const r = new Ractive({
			el: fixture,
			template: '{{#bar.baz}}<cmp />{{/}}',
			data: { bar: { bar: 'outer', baz: { bar: 'inner' } } },
			components: { cmp }
		});

		t.equal( fixture.innerHTML, '' );
		r.findComponent().addMapping( 'foo', '.bar' );
		t.equal( fixture.innerHTML, 'inner' );
	});

	test( `addMapping will use a given instance`, t => {
		const cmp = Ractive.extend({
			template: '{{foo}}'
		});
		const r = new Ractive({
			el: fixture,
			template: '<cmp />',
			data: { bar: 'foo' },
			components: { cmp }
		});
		const other = new Ractive({
			data: { bar: 'hello' }
		});

		t.equal( fixture.innerHTML, '' );
		r.findComponent().addMapping( 'foo', 'bar', { ractive: other } );
		t.equal( fixture.innerHTML, 'hello' );
		other.set( 'bar', 'yep' );
		t.equal( fixture.innerHTML, 'yep' );
	});
}
