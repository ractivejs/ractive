import { hasUsableConsole, afterEach, onWarn, initModule } from '../../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	const defaultData = Ractive.defaults.data;
	const defaultTemplate = Ractive.defaults.template;

	afterEach( () => {
		Ractive.defaults.data = defaultData;
		Ractive.defaults.template = defaultTemplate;
	});

	initModule( 'init/initialisation/data.js' );

	test( 'default data function called on initialize', t => {
		const data = { foo: 'bar' } ;

		Ractive.defaults.data = function () { return data; };
		const ractive = new Ractive();
		t.strictEqual( ractive.viewmodel.value, data );
	});

	test( 'instance data function called on initialize', t => {
		const data = { foo: 'bar' } ;

		const ractive = new Ractive({
			data () { return data; }
		});
		t.strictEqual( ractive.viewmodel.value, data );
	});

	// TODO is this important/desirable?
	//test( 'Instance data is used as data object when parent is also object', t => {
	//
	// 	var ractive, data = { foo: 'bar' };
	//
	// 	Ractive.defaults.data = { bar: 'bizz' };
	// 	ractive = new Ractive( { data: data } );
	//
	// 	t.equal( ractive.get(), data );
	// });

	// TODO see above...
	//test( 'Data functions are inherited and pojo keys are copied', t => {
	// 	var ractive, data1 = { bizz: 'bop' }, data2 = { foo: 'bar' };
	//
	// 	Ractive.defaults.data = function () { return data1; };
	// 	ractive = new Ractive( { data: data2 } );
	//
	// 	t.equal( ractive.get(), data2 );
	// 	t.equal( ractive.get('foo'), 'bar' );
	// 	t.equal( ractive.get('bizz'), 'bop' );
	// });

	test( 'instance data function is added to default data function', t => {
		Ractive.defaults.data = () => ({ foo: 'fizz' });

		const ractive = new Ractive({
			data () {
				return { bar: 'bizz' };
			}
		});

		t.equal( ractive.get( 'bar' ), 'bizz' );
		t.equal( ractive.get( 'foo' ), 'fizz' );
	});

	if ( hasUsableConsole ) {
		test( 'initing data with a non-POJO results in a warning', t => {
			t.expect( 2 );

			onWarn( warning => {
				t.ok( /should be a plain JavaScript object/.test( warning ) );
			});

			function Foo () { this.foo = 'bar'; }

			new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: new Foo ()
			});

			t.equal( fixture.innerHTML, 'bar' );
		});
	}

	test( 'instance data takes precedence over default data but includes unique properties', t => {
		Ractive.defaults.data = {
			unique () { return; },
			format () { return 'not me'; }
		};

		const ractive = new Ractive( {
			data: {
				foo: 'bar',
				format () { return 'foo'; }
			}
		});

		t.ok( ractive.get( 'foo' ), 'has instance data' );
		t.ok( ractive.get( 'format' ), 'has default data' );
		t.ok( ractive.get( 'unique' ), 'has default data' );
		t.equal( ractive.get( 'format' )(), 'foo' );
	});

	test( 'initing data with a primitive results in an error', t => {
		t.expect( 1 );

		try {
			new Ractive({
				el: fixture,
				template: '{{ test }}',
				data: 1
			});
		} catch ( err ) {
			t.equal( err.message, 'data option must be an object or a function, `1` is not valid' );
		}
	});

	test( 'data and computed properties available in onconfig and later', t => {
		t.expect( 3 );

		const ractive = new Ractive({
			data: { foo: 'bar' },
			computed: {
				bizz: '${foo} + "ftw"'
			},
			onconfig () {
				t.equal( this.get( 'foo' ), 'bar' );
				t.equal( this.get( 'bizz' ), 'barftw' );
				this.set( 'qux', 'config' );
			}
		});

		t.equal( ractive.get('qux'), 'config' );
	});
}
