import { test } from 'qunit';
import { initModule, onWarn } from '../helpers/test-config';

export default function () {
	initModule( 'parser' );

	test( `global defaults apply to parsing even with no instance`, t => {
		const delimiters = Ractive.defaults.delimiters;
		Ractive.defaults.delimiters = [ '<%', '%>' ];
		const parsed = Ractive.parse( '<% foo %>' );
		t.deepEqual( parsed, { v: 4, t: [{ t: 2, r: 'foo' }] } );
		Ractive.defaults.delimiters = delimiters;
	});

	test( `block sections with only a reference warn about non-matching closing tags (#2925)`, t => {
		t.expect( 1 );

		onWarn( m => t.ok( /expected.*foo.bar.*but found.*foobar/i.test( m ) ) );

		Ractive.parse( '{{#foo.bar}}...{{/foobar}}' );
		Ractive.parse( '{{#foo.bar}}...{{/}}' );
		Ractive.parse( '{{#[1, 2, 3]}} ... {{/who cares}}' );
		Ractive.parse( '{{#foo.bar}}...{{/foo.bar}}' );
	});

	test( `expressions can be completely disabled by the parser`, t => {
		t.expect( 3 );

		t.ok( Ractive.parse( '{{.foo()}}' ) );
		t.throws( () => Ractive.parse( '{{ .foo() }}', { allowExpressions: false } ), /expected closing delimiter/i );
		t.throws( () => new Ractive({
			template: '{{.foo()}}',
			allowExpressions: false
		}), /expected closing delimiter/i );
	});

	test( `expressions on a template provided to an instance with disallowed expressions are not executed`, t => {
		t.expect( 1 );

		new Ractive({
			target: fixture,
			template: Ractive.parse( '{{ foo() }}-{{ foo( 42, "abc" ) }}' ),
			data: {
				foo () { t.ok( false, 'should not run' ); }
			},
			allowExpressions: false
		});

		t.equal( fixture.innerHTML, '-' );
	});
}
