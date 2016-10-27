import { test } from 'qunit';
import { fire } from 'simulant';
import { initModule } from './test-config';

export default function() {
	initModule( 'references.js' );

	test( '@index special ref finds the nearest index', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each outer}}{{#each .list}}{{@index}}{{/each}}{{/each}}',
			data: {
				outer: [ {}, {}, { list: [ 0, 0, 0 ] }, {} ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '012' );
	});

	test( '@key special ref finds the nearest key', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each outer}}{{#each .list}}{{@key}}{{/each}}{{/each}}',
			data: {
				outer: { one: {}, two: {}, three: { list: { a: 1, b: 1, c: 1 } }, four: {} }
			}
		});

		t.htmlEqual( fixture.innerHTML, 'abc' );
	});

	test( 'component @keypath references should be relative to the component', t => {
		const cmp = Ractive.extend({
			template: '{{#with foo.bar}}{{@keypath}}{{/with}}'
		});

		new Ractive({
			el: fixture,
			template: '<cmp foo="{{baz.bat}}" />',
			data: {
				baz: { bat: { bar: 'yep' } }
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'foo.bar' );
	});

	test( 'nested component @keypath references should be relative to the nested component', t => {
		const cmp1 = Ractive.extend({
			template: '{{#with foo.bar}}{{@keypath}}{{/with}}'
		}),
		cmp2 = Ractive.extend({
			template: '{{#with baz.bat}}<cmp1 foo="{{.}}" />{{/with}}',
			components: { cmp1 }
		});

		new Ractive({
			el: fixture,
			template: '<cmp2 baz="{{~/bop}}" />',
			data: {
				bop: { bat: { bar: 'yep' } }
			},
			components: { cmp2 }
		});

		t.htmlEqual( fixture.innerHTML, 'foo.bar' );
	});

	test( 'component @rootpath references should be relative to the root', t => {
		const cmp = Ractive.extend({
			template: '{{#with foo.bar}}{{@rootpath}}{{/with}}'
		});

		new Ractive({
			el: fixture,
			template: '<cmp foo="{{baz.bat}}" />',
			data: {
				baz: { bat: { bar: 'yep' } }
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'baz.bat.bar' );
	});

	test( 'instance property shortcut @foo === @this.foo', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{@foo}} {{@bar.baz}}',
			foo: 'foo',
			bar: { baz: 'baz' }
		});

		t.htmlEqual( fixture.innerHTML, 'foo baz' );
	});

	test( 'calling set with an instance property shortcut', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{@foo}} {{@bar.baz}}',
		});

		// just checking
		r.set( '@nope.not', '???' );

		r.set( '@foo', 'foo' );
		r.set( '@bar.baz', 'baz' );

		t.htmlEqual( fixture.innerHTML, 'foo baz' );
	});

	test( '@node is a reserved special ref', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{@node}}',
			node: 'nope'
		});

		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( `can't set with one of the reserved read-only special refs`, t => {
		const r = new Ractive({});
		t.throws( () => r.set( '@node', true ), /invalid keypath/ );
		t.throws( () => r.set( '@index', true ), /invalid keypath/ );
		t.throws( () => r.set( '@key', true ), /invalid keypath/ );
		t.throws( () => r.set( '@keypath', true ), /invalid keypath/ );
		t.throws( () => r.set( '@rootpath', true ), /invalid keypath/ );
	});

	test( 'context popping with ^^/', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#with some.path}}{{#with ~/other}}{{^^/foo}}{{#with .foo}}{{" " + ^^/^^/foo}}{{/with}}{{/with}}{{/with}}',
			data: {
				some: {
					path: { foo: 'yep' }
				},
				other: {
					foo: 'nope'
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep yep' );
	});

	test( 'context popping with path popping ^^/../', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#with some.path}}{{#with ~/other}}{{^^/../up.foo}}{{#with .foo}}{{" " + ^^/^^/../up.foo}}{{/with}}{{/with}}{{/with}}',
			data: {
				some: {
					path: { foo: 'no' },
					up: { foo: 'yep' }
				},
				other: {
					foo: 'nope'
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep yep' );
	});

	test( 'direct ancestor reference to a context', t => {
		const bar = { baz: 'yep' };
		const r = new Ractive({
			el: fixture,
			template: '{{#with foo.bar.baz}}{{JSON.stringify(../)}}{{/with}}',
			data: { foo: { bar } }
		});

		t.htmlEqual( fixture.innerHTML, JSON.stringify( bar ) );
	});

	test( 'direct context pop reference to a context', t => {
		const bar = { baz: 'yep' };
		const r = new Ractive({
			el: fixture,
			template: '{{#with foo.bar}}{{#with ~/other}}{{JSON.stringify(^^/)}}{{/with}}{{/with}}',
			data: { foo: { bar }, other: { foo: 'nope' } }
		});

		t.htmlEqual( fixture.innerHTML, JSON.stringify( bar ) );
	});

	test( 'direct context pop and ancestor reference to a context', t => {
		const bar = { baz: 'yep' };
		const r = new Ractive({
			el: fixture,
			template: '{{#with foo.bar.baz}}{{#with ~/other}}{{JSON.stringify(^^/../)}}{{/with}}{{/with}}',
			data: { foo: { bar }, other: { foo: 'nope' } }
		});

		t.htmlEqual( fixture.innerHTML, JSON.stringify( bar ) );
	});
}
