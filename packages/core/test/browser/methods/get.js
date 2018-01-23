import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

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

	test( `get doesn't return children unless they are a value or virtual`, t => {
		const r = new Ractive({
			data: { base: { foo: 1, bar: 2, baz: { bat: 3 } } }
		});

		const base = r.get( 'base' );
		delete base.foo;
		t.ok( !( 'foo' in r.get( 'base' ) ) );

		r.reset( base );
		r.get( 'bar' );
		delete base.bar;
		t.ok( !( 'bar' in r.get() ) );

		r.link( 'baz.bat', 'bar' );
		t.ok( 'bar' in r.get() );
		t.equal( r.get().bar, 3 );
	});

	test( `get doesn't return links in non-root models unless asked`, t => {
		const r = new Ractive({
			data: { base: { foo: { baz: 2 }, bar: 1 } }
		});

		r.link( 'base.bar', 'base.foo.bar' );
		t.ok( !( 'bar' in r.get( 'base.foo' ) ) );
		t.ok( 'bar' in r.get( 'base.foo', { virtual: true } ) );
	});

	test( `get returns links in root models unless asked not to`, t => {
		const r = new Ractive({
			data: { base: { foo: { baz: 2 }, bar: 1 } }
		});

		r.link( 'base.bar', 'bip' );
		t.ok( !( 'bip' in r.get({ virtual: false }) ) );
		t.ok( 'bip' in r.get({ virtual: true } ) );
		t.ok( 'bip' in r.get() );
	});
}
