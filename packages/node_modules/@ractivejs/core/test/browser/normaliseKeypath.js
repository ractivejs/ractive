import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'utils/normalise.js' );

	test( 'Regular keypath', ( t ) => {
		t.equal( Ractive.normaliseKeypath( 'foo.bar' ), 'foo.bar' );
	});

	test( 'Keypath with array notation', ( t ) => {
		t.equal( Ractive.normaliseKeypath( 'foo[1]' ), 'foo.1' );
	});
}
