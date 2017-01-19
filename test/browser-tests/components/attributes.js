import { test } from 'qunit';
import { onWarn } from '../test-config';
import { initModule } from '../test-config';

export default function() {
	initModule( 'components/attributes.js' );

	test( `by default all attributes are mapped`, t => {
		const cmp = Ractive.extend({
			template: '{{foo}} {{bar}}'
		});

		t.equal( cmp.attributes, undefined );

		new Ractive({
			target: fixture,
			template: '<cmp foo="{{baz}}" bar="{{bat}}" />',
			components: { cmp },
			data: {
				baz: 1,
				bat: 2
			}
		});

		t.htmlEqual( fixture.innerHTML, '1 2' );
	});

	test( `attributes as an array of strings are all optional`, t => {
		const cmp = Ractive.extend({
			attributes: [ 'foo', 'bar' ]
		});

		t.deepEqual( cmp.attributes, { optional: [ 'foo', 'bar' ], required: [] } );
	});

	test( `attributes may contain optional, required, neither, or both`, t => {
		const optional = Ractive.extend({
			attributes: { optional: [ 'foo' ] }
		});
		const required = Ractive.extend({
			attributes: { required: [ 'bar' ] }
		});
		const both = Ractive.extend({
			attributes: { optional: [ 'foo' ], required: [ 'bar' ] }
		});
		const neither = Ractive.extend({
			attributes: {}
		});

		t.deepEqual( optional.attributes, { optional: [ 'foo' ], required: [] } );
		t.deepEqual( required.attributes, { optional: [], required: [ 'bar' ] } );
		t.deepEqual( both.attributes, { optional: [ 'foo' ], required: [ 'bar' ] } );
		t.deepEqual( neither.attributes, { optional: [], required: [] } );
	});

	test( `only named attributes are mapped into component`, t => {
		const cmp = Ractive.extend({
			attributes: [ 'foo', 'bar' ],
			template: '{{foo}} {{bar}} {{baz}}',
			isolated: true
		});
		new Ractive({
			target: fixture,
			template: `<cmp foo="{{foo}}" bar="{{bar}}" baz="{{baz}}" />`,
			components: { cmp },
			data: {
				foo: 'foo', bar: 'bar', baz: 'baz'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'foo bar' );
	});

	test( `leaving off a required attribute issues a warning`, t => {
		t.expect( 2 );
		onWarn( msg => t.ok( /.*cmp.*requires attribute.*foo.*/.test( msg ) ) );
		const cmp = Ractive.extend({
			attributes: {
				required: [ 'foo' ]
			},
			template: 'yep'
		});
		new Ractive({
			target: fixture,
			template: `<cmp />`,
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( `extra attributes are collected into a partial and attached to the instance`, t => {
		const cmp = Ractive.extend({
			attributes: [ 'item', 'color' ],
			template: `<div {{yield extra-attributes}} style-color="{{color}}">{{item}}</div>`,
			data: { bar: 21 }
		});

		new Ractive({
			target: fixture,
			template: `<cmp class="big" data-foo="{{bar}}" item="{{item}}" color="green" />`,
			components: { cmp },
			data: { bar: 'yep', item: 'thing' }
		});

		t.htmlEqual( fixture.innerHTML, '<div class="big" data-foo="yep" style="color: green;">thing</div>' );
	});
}
