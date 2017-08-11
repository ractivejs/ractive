import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'init/config.js' );

	test( 'Ractive.defaults', t => {
		const expectedDefaults = [
			'el',
			'append',
			'delegate',
			'template',
			'delimiters',
			'tripleDelimiters',
			'staticDelimiters',
			'staticTripleDelimiters',
			'csp',
			'interpolate',
			'preserveWhitespace',
			'sanitize',
			'stripComments',
			'contextLines',
			'parserTransforms',
			'data',
			'computed',
			'syncComputedChildren',
			'resolveInstanceMembers',
			'warnAboutAmbiguity',
			'adapt',
			'isolated',
			'twoway',
			'lazy',
			'noIntro',
			'noOutro',
			'transitionsEnabled',
			'complete',
			'nestedTransitions',
			'css',
			'noCssTransform'
		];

		const actualDefaults = expectedDefaults.filter(key => Ractive.defaults.hasOwnProperty(key));

		t.strictEqual( Ractive.defaults, Ractive.prototype, 'defaults aliases prototype' );
		t.deepEqual(actualDefaults, expectedDefaults, 'defaults contain expected keys');
	});

	test('instance has config options', t => {
		const ractive = new Ractive();

		const expectedConfig = [
			'append',
			'complete',
			'computed',
			'contextLines',
			'csp',
			'delegate',
			'delimiters',
			'el',
			'interpolate',
			'isolated',
			'lazy',
			'nestedTransitions',
			'noCssTransform',
			'noIntro',
			'noOutro',
			'parserTransforms',
			'preserveWhitespace',
			'resolveInstanceMembers',
			'sanitize',
			'staticDelimiters',
			'staticTripleDelimiters',
			'stripComments',
			'syncComputedChildren',
			'transitionsEnabled',
			'tripleDelimiters',
			'twoway',
			'warnAboutAmbiguity'
		];

		const expectedInstanceRegistries = [
			'adaptors',
			'components',
			'decorators',
			'easing',
			'events',
			'interpolators',
			'partials',
			'transitions'
		];

		const expectedPrototypeRegistries = [
			'computed'
		];

		expectedInstanceRegistries.forEach(registry => {
			t.ok(ractive.hasOwnProperty(registry), `Instance has ${registry} registry`);
		});

		expectedPrototypeRegistries.forEach(registry => {
			t.ok(registry in ractive, `Instance has ${registry} registry`);
			t.deepEqual(ractive[registry], Ractive.prototype[registry], `Instance has ${registry} registry on prototype`);
		});

		expectedConfig.forEach(config => {
			t.ok(config in ractive, `Instance has ${config} config`);
			t.deepEqual(ractive[config], Ractive.prototype[config], `Instance has ${config} config on prototype`);
		});

	});

	test( 'non-configurations options are added to instance', t => {
		const ractive = new Ractive({
			foo: 'bar',
			fumble () {
				return true;
			}
		});

		t.equal( ractive.foo, 'bar' );
		t.ok( ractive.fumble() );
	});

	test( 'target element can be specified with target as well as el (#1848)', t => {
		const r = new Ractive({
			target: fixture,
			template: 'yep'
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
		t.strictEqual( fixture, r.target );
		t.strictEqual( fixture, r.el );
	});

	test( 'events can be subscribed with the on option', t => {
		t.expect( 2 );

		const r = new Ractive({
			on: {
				foo() { t.ok( true ); },
				bar: {
					once: true,
					handler() { t.ok( true ); }
				}
			}
		});

		r.fire( 'foo' );
		r.fire( 'bar' );
		r.fire( 'bar' );
	});

	test( 'observers can be subscribed with the observe option', t => {
		t.expect( 4 );

		const r = new Ractive({
			observe: {
				foo() { t.ok( true ); },
				bar: {
					once: true,
					handler() { t.ok( true ); }
				},
				baz: {
					init: false,
					handler() { t.ok( true ); }
				}
			}
		});

		// foo has already run once, because init defaults to true
		r.toggle( 'foo' );
		r.toggle( 'bar' );
		r.toggle( 'bar' );
		r.toggle( 'baz' );
	});

	test( `lifecycle events can be subscribed with the on option`, t => {
		const ev = [];
		const r = new Ractive({
			on: {
				construct() { ev.push( 'construct' ); },
				config() { ev.push( 'config' ); },
				init() { ev.push( 'init' ); },
				render() { ev.push( 'render' ); },
				unrender() { ev.push( 'unrender' ); },
				teardown() { ev.push( 'teardown' ); }
			},
			template: 'hello',
			target: fixture
		});

		r.teardown();

		t.equal( ev.join( ' ' ), 'construct config init render unrender teardown' );
	});

	test( `observers subscribe after the root fragment is created (#3053)`, t => {
		let v;

		const cmp = Ractive.extend({
			isolated: false,
			observe: {
				'thing.value' ( val ) {
					v = val;
				}
			}
		});

		const r = new Ractive({
			template: '<cmp />',
			data: { thing: {} },
			components: { cmp },
			target: fixture
		});

		t.ok( v === undefined );
		r.set( 'thing.value', 42 );
		t.equal( v, 42 );
	});
}
