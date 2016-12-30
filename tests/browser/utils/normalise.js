import { test } from 'qunit';
import { normalise } from '../../../src/shared/keypaths';
import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'utils/normalise.js' );

	test( 'Regular keypath', ( t ) => {
		t.equal( normalise( 'foo.bar' ), 'foo.bar' );
	});

	test( 'Keypath with array notation', ( t ) => {
		t.equal( normalise( 'foo[1]' ), 'foo.1' );
	});
}
