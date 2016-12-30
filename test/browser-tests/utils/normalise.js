import { test } from 'qunit';
import { normalise } from '../../shared/keypaths';
import { initModule } from '../test-config';

export default function() {
	initModule( 'utils/normalise.js' );

	test( 'Regular keypath', function ( t ) {
		t.equal( normalise( 'foo.bar' ), 'foo.bar' );
	});

	test( 'Keypath with array notation', function ( t ) {
		t.equal( normalise( 'foo[1]' ), 'foo.1' );
	});
}
