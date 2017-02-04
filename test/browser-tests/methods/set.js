import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/set.js' );

	test( `deep set merges data into the existing model tree`, t => {
		const r = new Ractive({
			data: { foo: { bar: 42, bip: 'yep' } }
		});

		r.set( 'foo', { bar: { bat: 42 }, baz: [ true ] }, { deep: true } );
		t.deepEqual( r.get( 'foo' ), { bar: { bat: 42 }, bip: 'yep', baz: [ true ] } );
	});

	test( `deep setting with numeric keys will update array indices`, t => {
		const r = new Ractive({
			data: { foo: [ 1, 2, 3 ] }
		});

		r.set( '', { foo: { 1: 42 } }, { deep: true } );
		t.deepEqual( r.get( 'foo' ), [ 1, 42, 3 ] );

		r.set( '', { foo: [ 99 ] }, { deep: true } );
		t.deepEqual( r.get( 'foo' ), [ 99, 42, 3 ] );
	});
}
