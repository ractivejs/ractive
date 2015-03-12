/*global test, module, simulant */
module( 'get()' );


test( 'Returns mappings on root .get()', t => {
	var ractive;

	ractive = new Ractive({
		el: fixture,
		template: `<c bar='{{foo}}' qux='{{qux}}'/>`,
		data: {
			foo: 'foo',
			qux: 'qux'
		},
		components: {
			c: Ractive.extend({
				template: '{{JSON.stringify(.)}}',
				data: {
					foo: 'mine'
				}
			})
		}
	});

	var expected = { foo: 'mine', bar: 'foo', qux: 'qux' };
	t.deepEqual( ractive.findComponent('c').get(), expected );
	t.deepEqual( fixture.innerHTML, JSON.stringify( expected ) );
});
