import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/update.js' );

	test( 'resolves any unresolved references from parent contexts (#2141)', t => {
		const foo = {};
		const r = new Ractive({
			el: fixture,
			template: `{{#foo}}{{#bar.baz}}{{#bat}}yep{{/}}{{/}}{{/}}`,
			data: { foo }
		});

		foo.bar = { baz: { bat: true } };
		r.update( 'foo.bar.baz.bat' );

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});
}
