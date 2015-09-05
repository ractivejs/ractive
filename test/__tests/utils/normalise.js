import { normalise } from 'shared/keypaths';

test( 'Regular keypath', function ( t ) {
	t.equal( normalise( 'foo.bar' ), 'foo.bar' );
});

test( 'Keypath with array notation', function ( t ) {
	t.equal( normalise( 'foo[1]' ), 'foo.1' );
});
