import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'evalObjectString.js' );

	test( 'Unquoted string', t => {
		const parsed = Ractive.evalObjectString( 'foo' );
		t.ok( !parsed );
	});

	test( 'Single-quoted string', t => {
		const parsed = Ractive.evalObjectString( `'foo'` );
		t.equal( parsed.value, 'foo' );
	});

	test( 'Double-quoted string', t => {
		const parsed = Ractive.evalObjectString( '"foo"' );
		t.equal( parsed.value, 'foo' );
	});

	test( 'Number', t => {
		const parsed = Ractive.evalObjectString( '42' );
		t.equal( parsed.value, 42 );
	});

	test( 'Array', t => {
		const parsed = Ractive.evalObjectString( '["a","b"]' );
		t.deepEqual( parsed.value, ['a','b'] );
	});

	test( 'Interpolated value', t => {
		const parsed = Ractive.evalObjectString( '${answer}', { answer: 42 } );
		t.equal( parsed.value, 42);
	});

	test( 'Array of interpolated values', t => {
		const parsed = Ractive.evalObjectString( '[${a},${b},${c}]', { a: 1, b: 2, c: 3 } );
		t.deepEqual( parsed.value, [1,2,3]);
	});

	test( 'Array of interpolated values with funky whitespace', t => {
		const parsed = Ractive.evalObjectString( '[  ${a} , ${b} , ${c}  ]', { a: 1, b: 2, c: 3 } );
		t.deepEqual( parsed.value, [1,2,3]);
	});

	test( 'Interpolated falsy values (#621)', t => {
		const parsed = Ractive.evalObjectString( '"${a}"', { a: 0 });
		t.equal( parsed.value, '0' );
	});

	test( 'Empty array (#810)', t => {
		const parsed = Ractive.evalObjectString( '[]' );
		t.deepEqual( parsed.value, [] );
	});

	test( 'Empty object (#810)', t => {
		const parsed = Ractive.evalObjectString( '{}' );
		t.deepEqual( parsed.value, {} );
	});

	test( 'Object with leading whitespace (#1157)', t => {
		const parsed = Ractive.evalObjectString( ' { foo: "bar" }' );
		t.deepEqual( parsed.value, { foo: 'bar' });
	});
}
