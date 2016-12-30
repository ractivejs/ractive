import { test } from 'qunit';
import parseJSON from '../../utils/parseJSON';
import { initModule } from '../test-config';

export default function() {
	initModule( 'utils/parseJSON.ks' );

	test( 'Unquoted string', t => {
		const parsed = parseJSON( 'foo' );
		t.ok( !parsed );
	});

	test( 'Single-quoted string', t => {
		const parsed = parseJSON( `'foo'` );
		t.equal( parsed.value, 'foo' );
	});

	test( 'Double-quoted string', t => {
		const parsed = parseJSON( '"foo"' );
		t.equal( parsed.value, 'foo' );
	});

	test( 'Number', t => {
		const parsed = parseJSON( '42' );
		t.equal( parsed.value, 42 );
	});

	test( 'Array', t => {
		const parsed = parseJSON( '["a","b"]' );
		t.deepEqual( parsed.value, ['a','b'] );
	});

	test( 'Interpolated value', t => {
		const parsed = parseJSON( '${answer}', { answer: 42 } );
		t.equal( parsed.value, 42);
	});

	test( 'Array of interpolated values', t => {
		const parsed = parseJSON( '[${a},${b},${c}]', { a: 1, b: 2, c: 3 } );
		t.deepEqual( parsed.value, [1,2,3]);
	});

	test( 'Array of interpolated values with funky whitespace', t => {
		const parsed = parseJSON( '[  ${a} , ${b} , ${c}  ]', { a: 1, b: 2, c: 3 } );
		t.deepEqual( parsed.value, [1,2,3]);
	});

	test( 'Interpolated falsy values (#621)', t => {
		const parsed = parseJSON( '"${a}"', { a: 0 });
		t.equal( parsed.value, '0' );
	});

	test( 'Empty array (#810)', t => {
		const parsed = parseJSON( '[]' );
		t.deepEqual( parsed.value, [] );
	});

	test( 'Empty object (#810)', t => {
		const parsed = parseJSON( '{}' );
		t.deepEqual( parsed.value, {} );
	});

	test( 'Object with leading whitespace (#1157)', t => {
		const parsed = parseJSON( ' { foo: "bar" }' );
		t.deepEqual( parsed.value, { foo: 'bar' });
	});
}
