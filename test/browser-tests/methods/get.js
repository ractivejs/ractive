import { test } from 'qunit';

test( 'Returns mappings on root .get()', t => {
	const ractive = new Ractive({
		el: fixture,
		template: `<Widget bar='{{foo}}' qux='{{qux}}'/>`,
		data: {
			foo: 'foo',
			qux: 'qux'
		},
		components: {
			Widget: Ractive.extend({
				template: '{{JSON.stringify(.)}}',
				data: {
					foo: 'mine'
				}
			})
		}
	});

	const expected = { foo: 'mine', bar: 'foo', qux: 'qux' };
	t.deepEqual( ractive.findComponent( 'Widget' ).get(), expected );
	t.deepEqual( fixture.innerHTML, JSON.stringify( expected ) );
});

test( 'use context to resolve get path if given', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar.baz.bat}}<span>{{.last}}</span>{{/with}}`,
		data: { foo: { bar: { baz: { bat: { last: 'yep' } } } } }
	});

	t.equal( r.get( '.last', r.find( 'span' ) ), 'yep' );
});

test( 'context gets have access to aliases', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar as alias}}<span></span>{{/with}}`,
		data: { foo: { bar: { val: 'yep' } } }
	});

	t.equal( r.get( 'alias.val', r.find( 'span' ) ), 'yep' );
});
