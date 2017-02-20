import { initModule } from '../../../helpers/test-config';

export default function() {
	initModule( 'init/hooks/onconstruct.js' );

	QUnit.test( 'has access to options', t => {
		const View = Ractive.extend({
			onconstruct ( ctx, options ){
				options.template = '{{foo}}';
				options.data = { foo: 'bar' };
			}
		});

		new View({
			el: fixture
		});

		t.equal( fixture.innerHTML, 'bar' );
	});
}
