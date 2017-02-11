import { test } from 'qunit';
import { hasUsableConsole, onWarn } from '../test-config';
import { initModule } from '../test-config';

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

	test( `an existing constructor can be specified using the class option`, t => {
		class Foo extends Ractive {
			constructor ( opts ) {
				super( opts );
			}

			go () {
				this.set( 'name', 'classy' );
			}
		}

		Ractive.initClass( Foo, {
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
			Ractive.initClass( Foo );
		}, /inherit the appropriate prototype/ );
	});

	test( `existing constructors supploed to extend should call super`, t => {
		t.expect( 1 );

		class Foo extends Ractive {}

		t.throws( () => {
			Ractive.initClass( Foo );
		}, /call super/ );
	});
}
