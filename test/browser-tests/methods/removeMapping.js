import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/removeMapping.js' );

	test( 'removeMapping removes a mapping and rebinds', t => {
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
		r.findComponent().removeMapping( 'foo' );
		t.equal( fixture.innerHTML, '' );
	});

	test( 'removeMapping allows implicit mappings to resume', t => {
		const cmp = Ractive.extend({
			template: '{{bar}}'
		});
		const r = new Ractive({
			el: fixture,
			template: '<cmp />',
			data: { bar: 'foo', baz: { bat: 'yep' } },
			components: { cmp }
		});

		t.equal( fixture.innerHTML, 'foo' );
		r.findComponent().addMapping( 'bar', 'baz.bat' );
		t.equal( fixture.innerHTML, 'yep' );
		r.findComponent().removeMapping( 'bar' );
		t.equal( fixture.innerHTML, 'foo' );
	});
}

