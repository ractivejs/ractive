import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/updateModel.js' );

	test( 'Works across component boundary', t => {
		const widget = Ractive.extend({
			template: '{{bar}}'
		});

		const ractive = new Ractive({
			el: fixture,
			template: `<input value='{{foo.bar}}'/><widget bar='{{foo.bar}}'/>`,
			data: {
				foo: {
					bar: 'change me'
				}
			},
			components: {
				widget
			}
		});

		ractive.find( 'input' ).value = 'changed';
		ractive.updateModel( 'foo' );
		t.equal( ractive.get( 'foo.bar' ), 'changed' );

		t.equal( fixture.innerHTML, '<input value="changed">changed' );
		t.equal( ractive.findComponent( 'widget' ).get( 'bar' ), 'changed' );
	});
}
