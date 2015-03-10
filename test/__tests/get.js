/*global test, module, simulant */
module( 'get()' );

test( 'Returns computations on root .get()', t => {
	var ractive, result;

	ractive = new Ractive({
		el: fixture,
		// template: '{{JSON.stringify(.)}}',
		data: {
			foo: 'foo'
		},
		computed: {
			bar: '${foo} + "bar"'
		}
	});

	result = { foo: 'foo', bar: 'foobar' };
	t.deepEqual( ractive.get(), result );
	// t.equal( fixture.innerHTML, JSON.stringify(result) );
});

test( 'Returns mappings on root .get()', t => {
	var ractive, component;

	component = Ractive.extend({
		data: {
			foo: 'foo'
		}
	});

	ractive = new Ractive({
		el: fixture,
		template: `<c bar='{{foo}}' qux='{{qux}}'/>`,
		data: {
			foo: 'foo',
			qux: 'qux'
		},
		components: {
			c: Ractive.extend({
				data: {
					foo: 'mine'
				}
			})
		}
	});

	t.deepEqual( ractive.findComponent('c').get(), { foo: 'mine', bar: 'foo', qux: 'qux' } );
});
