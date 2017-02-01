import { normalise } from '../../../src/shared/keypaths';
import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'utils/normalise.js' );

	QUnit.test( 'Regular keypath', ( t ) => {
		t.equal( normalise( 'foo.bar' ), 'foo.bar' );
	});

	QUnit.test( 'Keypath with array notation', ( t ) => {
		t.equal( normalise( 'foo[1]' ), 'foo.1' );
	});
}
