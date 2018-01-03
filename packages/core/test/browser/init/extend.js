import { hasUsableConsole, onWarn, initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'init/extend.js' );

	test( 'multiple options arguments applied left to right', t => {
		const X = Ractive.extend({
			template: 'ignore',
			data: { foo: 'foo' }
		}, {
			template: 'ignore',
			data: { bar: 'bar' }
		}, {
			template: 'good',
			data: { qux: 'qux' }
		});

		const ractive = new X();

		t.equal( ractive.get( 'foo' ), 'foo' );
		t.equal( ractive.get( 'bar' ), 'bar' );
		t.equal( ractive.get( 'qux' ), 'qux' );

		t.equal( ractive.template, 'good' );
	});

	test( 'data is inherited from grand parent extend (#923)', t => {
		const Child = Ractive.extend({
			append: true,
			template: 'title:{{format(title)}}',
			data: {
				format ( title ) {
					return title.toUpperCase();
				}
			}
		});

		const Grandchild = Child.extend();

		new Child({
			el: fixture,
			data: { title: 'child' }
		});

		new Grandchild({
			el: fixture,
			data: { title: 'grandchild' }
		});

		t.equal( fixture.innerHTML, 'title:CHILDtitle:GRANDCHILD' );
	});

	test( 'instantiated .extend() component with data function called on initialize', t => {
		const data = { foo: 'bar' };

		const Component = Ractive.extend({
			data () { return data; }
		});

		const ractive = new Component();
		t.strictEqual( ractive.viewmodel.value, data );
	});

	test( 'extend data option includes Ractive defaults.data', t => {
		const defaultData = Ractive.defaults.data;
		Ractive.defaults.data = {
			format () { return 'default'; },
			defaultOnly: {}
		};

		const Component = Ractive.extend({
			data: () => ({
				format () { return 'component'; },
				componentOnly: {}
			})
		});

		const ractive = new Component( {
			el: fixture,
			template: '{{format()}}',
			data: { foo: 'bar' }
		});

		t.ok( ractive.get( 'foo' ), 'has instance data' );
		t.ok( ractive.get( 'componentOnly' ), 'has Component data' );
		t.ok( ractive.get( 'defaultOnly' ), 'has Ractive.default data' );
		t.equal( fixture.innerHTML, 'component' );

		Ractive.defaults.data = defaultData;
	});

	test( 'instantiated .extend() with template function called on initialize', t => {
		const Component = Ractive.extend({
			template () { return '{{foo}}'; }
		});

		new Component({
			el: fixture,
			data: { foo: 'bar' }
		});

		t.equal( fixture.innerHTML, 'bar' );
	});

	test( 'extend template replaces Ractive defaults.template', t => {
		const defaultTemplate = Ractive.defaults.template;
		Ractive.defaults.template = function () { return '{{fizz}}'; };

		const Component = Ractive.extend({
			template () { return '{{foo}}'; }
		});

		new Component( {
			el: fixture,
			data: { foo: 'bar', fizz: 'bizz' }
		});

		t.equal( fixture.innerHTML, 'bar' );

		Ractive.defaults.template = defaultTemplate;
	});

	test( '"this" refers to ractive instance in init method with _super (#840)', t => {
		t.expect( 4 );

		let cThis;
		const C = Ractive.extend({
			oninit () {
				t.ok( this instanceof Ractive );
				cThis = this;
			}
		});

		let dThis;
		const D = C.extend({
			oninit () {
				t.ok( this instanceof Ractive );
				dThis = this;
				this._super();
			}
		});

		const ractive = new D({
			el: fixture
		});

		t.equal( cThis, ractive );
		t.equal( dThis, ractive );
	});

	test( '"parent" and "root" properties are correctly set', t => {
		const GrandChild = Ractive.extend({
			template: 'this space for rent'
		});

		const Child = Ractive.extend({
			template: '<GrandChild/>',
			components: { GrandChild }
		});

		const ractive = new Ractive( {
			el: fixture,
			template: '<Child/>',
			components: { Child }
		});

		const child = ractive.findComponent( 'Child' );
		const grandchild = ractive.findComponent( 'GrandChild' );

		t.equal( ractive.root, ractive );
		t.ok( !ractive.parent );

		t.equal( child.root, ractive );
		t.equal( child.parent, ractive );

		t.equal( grandchild.root, ractive );
		t.equal( grandchild.parent, child );
	});

	if ( hasUsableConsole ) {
		test( 'data function returning wrong value causes error/warning', t => {
			// non-objects are an error
			const Bad = Ractive.extend({
				data () {
					return 'disallowed';
				}
			});

			t.throws( () => new Bad(), /Data function must return an object/ );

			// non-POJOs should trigger a warning
			function Foo () {}

			let warned;
			onWarn( () => warned = true );

			const LessBad = Ractive.extend({
				data () {
					return new Foo();
				}
			});

			new LessBad();
			t.ok( warned );
		});
	}

	test( 'children inherit subscribers', t => {
		t.expect( 7 );

		const cmp = Ractive.extend({
			on: {
				foo() { t.ok( true ); }
			},
			observe: {
				foo() { t.ok( true ); }
			}
		});
		const two = cmp.extend({
			on: {
				foo() { t.ok( true ); },
				bar() { t.ok( true ); }
			},
			observe: {
				bar() { t.ok( true ); }
			}
		});

		const r = new two();

		r.fire( 'foo' );
		r.fire( 'bar' );
		r.toggle( 'foo' );
		r.toggle( 'bar' );
	});

	test( `inherited lifecycle events fire in the correct order`, t => {
		const ev = [];
		const cmp = Ractive.extend({
			on: {
				construct() { ev.push( 'construct1' ); },
				config() { ev.push( 'config1' ); },
				init() { ev.push( 'init1' ); },
				render() { ev.push( 'render1' ); },
				unrender() { ev.push( 'unrender1' ); },
				teardown() { ev.push( 'teardown1' ); }
			}
		});

		const two = cmp.extend({
			on: {
				construct() { ev.push( 'construct2' ); },
				config() { ev.push( 'config2' ); },
				init() { ev.push( 'init2' ); },
				render() { ev.push( 'render2' ); },
				unrender() { ev.push( 'unrender2' ); },
				teardown() { ev.push( 'teardown2' ); }
			}
		});

		const r = new two({
			template: 'hello',
			target: fixture,
			on: {
				construct() { ev.push( 'construct3' ); },
				config() { ev.push( 'config3' ); },
				init() { ev.push( 'init3' ); },
				render() { ev.push( 'render3' ); },
				unrender() { ev.push( 'unrender3' ); },
				teardown() { ev.push( 'teardown3' ); }
			}
		});

		r.teardown();

		t.equal( ev.join( ' ' ), 'construct1 construct2 construct3 config1 config2 config3 init1 init2 init3 render1 render2 render3 unrender1 unrender2 unrender3 teardown1 teardown2 teardown3' );
	});

	test( `an existing constructor can be specified using the class option`, t => {
		class Foo extends Ractive {
			constructor ( opts ) {
				super( opts );
			}

			go () {
				this.set( 'name', 'classy' );
			}
		}

		Ractive.extendWith( Foo, {
			template: 'hello, {{name}}'
		});

		const f = new Foo({
			target: fixture
		});

		f.go();
		t.htmlEqual( fixture.innerHTML, 'hello, classy' );
	});

	test( `existing constructors supplied to extend should inherit from Ractive`, t => {
		t.expect( 1 );

		class Foo {}

		t.throws( () => {
			Ractive.extendWith( Foo );
		}, /inherit the appropriate prototype/ );
	});

	test( `existing constructors supplied to extend should call super`, t => {
		t.expect( 1 );

		class Foo extends Ractive {}

		t.throws( () => {
			Ractive.extendWith( Foo );
		}, /call super/ );
	});

	test( `multiple construction objects with functions passed to extend are layered correctly`, t => {
		t.expect( 5 );

		let count = 0;
		const c1 = {
			data () {
				t.equal( count, 1 ); //child data fn has been called
				count++;
				return { foo: 1 };
			},
			onrender () {
				t.equal( count, 3 ); //all other fns have been called
				count++;
			}
		};
		const c2 = {
			data () {
				t.equal( count, 0 ); //first to be called
				count++;
				return { bar: 2 };
			},
			onrender () {
				t.equal( count, 2 ); //first render called
				count++;
				this._super();
			}
		};

		const cmp = Ractive.extend( c1, c2 );

		new cmp({
			target: fixture,
			template: '{{foo}} {{bar}}'
		});

		t.htmlEqual( fixture.innerHTML, '1 2' );
	});

	test( `trying to extend with a component  arg throws`, t => {
		const cmp = Ractive.extend();
		t.throws( () => {
			Ractive.extend( cmp );
		}, /no longer supports multiple inheritance/ );
	});

	test('Default template', t => {
		const Component = Ractive.extend({ template: '' });
		const template = Component.prototype.template;

		t.ok(template, 'on prototype');
		t.ok(Object.prototype.toString.call(template), 'is an object');
		t.ok(template.v, 'has a version');
		t.ok(template.t, 'has a template');
		t.strictEqual(template.t.length, 0, 'has no items');
	});

	test('Empty template', t => {
		const Parent = Ractive.extend({ template: '' });
		const Child = Parent.extend();
		const template = Child.prototype.template;

		t.ok(template, 'on prototype');
		t.ok(Object.prototype.toString.call(template), 'is an object');
		t.ok(template.v, 'has a version');
		t.ok(template.t, 'has a template');
		t.strictEqual(template.t.length, 0, 'has no items');
	});

	test('Non-empty template', t => {
		const Parent = Ractive.extend({ template: '' });
		const Child = Parent.extend({ template: '{{ foo }}' });
		const template = Child.prototype.template;

		t.deepEqual(template, { v: 4, t: [{ r: 'foo', t: 2 }] });
	});

	test('Multiple configuration', t => {
		const Parent = Ractive.extend({ template: '' });
		const Child = Parent.extend({ template: '{{ foo }}' }, { template: '{{ bar }}' });
		const template = Child.prototype.template;

		t.deepEqual(template, { v: 4, t: [{ r: 'bar', t: 2 }] });
	});

	test('Child parse options', t => {
		const Parent = Ractive.extend({ template: '' });
		const Child = Parent.extend({ template: '<#foo#>', delimiters: ['<#', '#>'] });
		const template = Child.prototype.template;

		t.deepEqual(template, { v: 4, t: [{ r: 'foo', t: 2 }] });
	});

	test( `Ractive and Parent are exposed`, t => {
		const Parent = Ractive.extend();
		const Child = Parent.extend();

		const instance = new Child();

		t.ok( instance.constructor.Parent === Parent );
		t.ok( instance.constructor.Ractive === Ractive );
		t.ok( Child.Parent === Parent );
		t.ok( Child.Ractive === Ractive );
		t.ok( Parent.Ractive === Parent.Parent && Parent.Parent === Ractive );
	});

	test( `isInstance returns true for instances of ractive or a component (#2914)`, t => {
		const Parent = Ractive.extend();
		const Child = Parent.extend();

		const r1 = new Child();
		const r2 = new Parent();
		const r3 = {};

		t.ok( Ractive.isInstance( r1 ) );
		t.ok( Ractive.isInstance( r2 ) );
		t.ok( !Ractive.isInstance( r3 ) );
		t.ok( Parent.isInstance( r1 ) );
		t.ok( Parent.isInstance( r2 ) );
		t.ok( Child.isInstance( r1 ) );
		t.ok( !Child.isInstance( r2 ) );
		t.ok( Ractive.isInstance( Ractive() ) );
		t.ok( !Parent.isInstance( new Ractive() ) );
	});
}
