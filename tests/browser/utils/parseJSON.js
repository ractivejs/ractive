import parseJSON from '../../../src/utils/parseJSON';
import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'utils/parseJSON.ks' );

	QUnit.test( 'Unquoted string', t => {
		const parsed = parseJSON( 'foo' );
		t.ok( !parsed );
	});

	QUnit.test( 'Single-quoted string', t => {
		const parsed = parseJSON( `'foo'` );
		t.equal( parsed.value, 'foo' );
	});

	QUnit.test( 'Double-quoted string', t => {
		const parsed = parseJSON( '"foo"' );
		t.equal( parsed.value, 'foo' );
	});

	QUnit.test( 'Number', t => {
		const parsed = parseJSON( '42' );
		t.equal( parsed.value, 42 );
	});

	QUnit.test( 'Array', t => {
		const parsed = parseJSON( '["a","b"]' );
		t.deepEqual( parsed.value, ['a','b'] );
	});

	QUnit.test( 'Interpolated value', t => {
		const parsed = parseJSON( '${answer}', { answer: 42 } );
		t.equal( parsed.value, 42);
	});

	QUnit.test( 'Array of interpolated values', t => {
		const parsed = parseJSON( '[${a},${b},${c}]', { a: 1, b: 2, c: 3 } );
		t.deepEqual( parsed.value, [1,2,3]);
	});

	QUnit.test( 'Array of interpolated values with funky whitespace', t => {
		const parsed = parseJSON( '[  ${a} , ${b} , ${c}  ]', { a: 1, b: 2, c: 3 } );
		t.deepEqual( parsed.value, [1,2,3]);
	});

	QUnit.test( 'Interpolated falsy values (#621)', t => {
		const parsed = parseJSON( '"${a}"', { a: 0 });
		t.equal( parsed.value, '0' );
	});

	QUnit.test( 'Empty array (#810)', t => {
		const parsed = parseJSON( '[]' );
		t.deepEqual( parsed.value, [] );
	});

	QUnit.test( 'Empty object (#810)', t => {
		const parsed = parseJSON( '{}' );
		t.deepEqual( parsed.value, {} );
	});

	QUnit.test( 'Object with leading whitespace (#1157)', t => {
		const parsed = parseJSON( ' { foo: "bar" }' );
		t.deepEqual( parsed.value, { foo: 'bar' });
	});
}
