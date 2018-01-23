import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/readLink.js' );

	test( `readLink returns the immediately linked path by default`, t => {
		const r = new Ractive({
			target: fixture
		});
		r.set( 'foo.bar.baz.bat', true );
		r.link( 'foo.bar.baz.bat', 'bop' );

		t.equal( r.get( 'foo.bar.baz.bat' ), true );
		t.equal( r.get( 'bop' ), true );

		t.equal( r.readLink( 'bop' ).keypath, 'foo.bar.baz.bat' );
		t.ok( r.readLink( 'bop' ).ractive === r );
	});

	test( `readLink on a non-link returns undefined`, t => {
		const r = new Ractive({
			target: fixture
		});
		r.set( 'bop', true );

		t.ok( r.readLink( 'bop' ) === undefined );
	});

	test( `readLink with a mapped path returns the source instance`, t => {
		const cmp = Ractive.extend();
		const r = new Ractive({
			on: { init() { this.set( 'foo.bar.baz.bat', true ); } },
			target: fixture,
			components: { cmp },
			template: `<cmp bop="{{foo.bar.baz.bat}}" />`
		});

		const child = r.findComponent( 'cmp' );
		t.equal( child.readLink( 'bop' ).keypath, 'foo.bar.baz.bat' );
		t.ok( child.readLink( 'bop' ).ractive === r );
	});

	test( `readLink is canonical by default`, t => {
		const cmp1 = Ractive.extend({
			template: '<cmp2 fizz="{{bop}}" />',
			isolated: false
		});
		const cmp2 = Ractive.extend({ isolated: false });
		const r = new Ractive({
			on: { init() { this.set( 'foo.bar.baz.bat', true ); } },
			target: fixture,
			components: { cmp1, cmp2 },
			template: `<cmp1 bop="{{foo.bar.baz.bat}}" />`
		});

		const child = r.findComponent( 'cmp2' );
		t.equal( child.readLink( 'fizz' ).keypath, 'foo.bar.baz.bat' );
		t.ok( child.readLink( 'fizz' ).ractive === r );
	});

	test( `readLink can optionally be uncanonical`, t => {
		const cmp1 = Ractive.extend({
			template: '<cmp2 fizz="{{bop}}" />',
			isolated: false
		});
		const cmp2 = Ractive.extend({ isolated: false });
		const r = new Ractive({
			on: { init() { this.set( 'foo.bar.baz.bat', true ); } },
			target: fixture,
			components: { cmp1, cmp2 },
			template: `<cmp1 bop="{{foo.bar.baz.bat}}" />`
		});

		const child = r.findComponent( 'cmp2' );
		t.equal( child.readLink( 'fizz', { canonical: false } ).keypath, 'bop' );
		t.ok( child.readLink( 'fizz', { canonical: false } ).ractive === r.findComponent( 'cmp1' ) );
	});
}
