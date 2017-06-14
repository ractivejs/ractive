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

	test( `parser transforms can drop elements`, t => {
		const parsed = Ractive.parse( `<foo /><div />`, {
			transforms: [
				n => n.e === 'foo' ? { remove: true } : undefined
			]
		});

		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div' }] } );
	});

	test( `parser transforms can modify an element in place`, t => {
		const parsed = Ractive.parse( `<div />`, {
			transforms: [
				n => n.e === 'div' ? ( n.m || ( n.m = [] ) ).push({ t: 13, f: 'bar', n: 'class' }) && n : undefined
			]
		});

		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div', m: [{ t: 13, f: 'bar', n: 'class' }] }] } );
	});

	test( `parser transforms can replace an element`, t => {
		const parsed = Ractive.parse( `<bar />`, {
			transforms: [
				function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<div id="replaced">yep</div>` ).t[0] } : undefined; }
			]
		});

		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div', m: [{ t: 13, f: 'replaced', n: 'id' }], f: [ 'yep' ] }] } );
	});

	test( `parser transforms can replace an element with multiple elements`, t => {
		const parsed = Ractive.parse( `<bar />`, {
			transforms: [
				function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<div id="replaced">yep</div><span>sure</span>` ).t } : undefined; }
			]
		});

		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div', m: [{ t: 13, f: 'replaced', n: 'id' }], f: [ 'yep' ] }, { t: 7, e: 'span', f: [ 'sure' ] }] } );
	});

	test( `parser transforms can replace an element with multiple elements, which can also be replaced`, t => {
		const parsed = Ractive.parse( `<bar />`, {
			transforms: [
				function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<div id="replaced">yep</div><baz>sure</baz>` ).t } : undefined; },
				function ( n ) { if ( n.e === 'baz' ) n.e = 'span'; }
			]
		});

		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div', m: [{ t: 13, f: 'replaced', n: 'id' }], f: [ 'yep' ] }, { t: 7, e: 'span', f: [ 'sure' ] }] } );
	});

	test( `parser transforms contribute to the parsed expression map`, t => {
		const parsed = Ractive.parse( `<bar />`, {
			transforms: [
				function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<div id="{{'' + replaced}}">yep</div>` ).t[0] } : undefined; }
			]
		});

		t.deepEqual( parsed.t, [{ t: 7, e: 'div', m: [{ t: 13, f: [{ t: 2, x: { s: `""+_0`, r: ['replaced'] } }], n: 'id' }], f: [ 'yep' ] }] );
		t.ok( typeof parsed.e[`""+_0`] === 'function' );
	});

	test( `parser transforms may be global`, t => {
		Ractive.defaults.parserTransforms.push(
			function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<div id="replaced">yep</div>` ).t[0] } : undefined; }
		);

		const parsed = Ractive.parse( `<bar />` );
		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div', m: [{ t: 13, f: 'replaced', n: 'id' }], f: [ 'yep' ] }] } );

		Ractive.defaults.parserTransforms.pop();
	});

	test( `parser transforms include local and global options`, t => {
		Ractive.defaults.parserTransforms.push(
			function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<baz id="replaced">yep</baz>` ).t[0] } : undefined; }
		);

		const parsed = Ractive.parse( `<bar />`, {
			transforms: [
				function ( n ) { if ( n.e === 'baz' ) n.e = 'div'; }
			]
		});
		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div', m: [{ t: 13, f: 'replaced', n: 'id' }], f: [ 'yep' ] }] } );

		Ractive.defaults.parserTransforms.pop();
	});

	test( `parser transforms also apply to inline partials`, t => {
		const parsed = Ractive.parse( `<div>{{#partial foo}}<bar />{{/partial}}</div>`, {
			transforms: [
				function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<div id="replaced">yep</div>` ).t[0] } : undefined; }
			]
		});

		t.deepEqual( parsed, { v: 4, t: [{ t: 7, e: 'div', p: { foo: [{ t: 7, e: 'div', m: [{ t: 13, f: 'replaced', n: 'id' }], f: [ 'yep' ] }] } }] } );
	});

	test( `parser transforms also apply to root inline partials`, t => {
		const parsed = Ractive.parse( `{{#partial foo}}<bar />{{/partial}}`, {
			transforms: [
				function ( n ) { return n.e === 'bar' ? { replace: this.parse( `<div id="replaced">yep</div>` ).t[0] } : undefined; }
			]
		});

		t.deepEqual( parsed, { v: 4, t: [], p: { foo: [{ t: 7, e: 'div', m: [{ t: 13, f: 'replaced', n: 'id' }], f: [ 'yep' ] }] } } );
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
