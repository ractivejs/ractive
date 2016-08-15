import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/get.js' );

	test( 'getting and adapted keypath should return the adaptee (#2513)', t => {
		function Foo ( content ) {
			this.content = content;
		}

		const fooAdaptor = {
			filter ( object ) {
				return object instanceof Foo;
			},
			wrap ( ractive, foo ) {
				const wrapper = {
					get () {
						return foo.content;
					},
					teardown () {
						delete foo._wrapper;
					}
				};
				foo._wrapper = wrapper;
				return wrapper;
			}
		};

		const r = new Ractive({
			adapt: [ fooAdaptor ],
			el: fixture,
			data: {
				model: new Foo()
			}
		});

		const foo = r.get( 'model' );

		t.ok( foo instanceof Foo );
	});

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

		const expected = { foo: 'mine', qux: 'qux', bar: 'foo' };
		t.deepEqual( ractive.findComponent( 'Widget' ).get(), expected );
		t.deepEqual( fixture.innerHTML, JSON.stringify( expected ) );
	});
}
