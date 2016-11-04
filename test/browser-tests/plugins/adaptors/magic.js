import { test } from 'qunit';
import { initModule } from '../../test-config';

export default function() {
	initModule( 'plugins/adaptors/magic.js' );

	let fixture2;
	let makeObj;

	// only run these tests if magic mode is supported
	try {
		const obj = {};
		let _foo;
		Object.defineProperty( obj, 'foo', {
			get () {
				return _foo;
			},
			set ( value ) {
				_foo = value;
			}
		});

		fixture2 = document.createElement( 'div' );

		const MagicRactive = Ractive.extend({
			template: '{{name}}: {{type}}',
			magic: true
		});

		makeObj = function () {
			return {
				name: 'Kermit',
				type: 'frog'
			};
		};

		test( 'Mustaches update when property values change', t => {
			const muppet = makeObj();

			new MagicRactive({
				el: fixture,
				data: muppet
			});

			muppet.name = 'Rizzo';
			muppet.type = 'rat';

			t.htmlEqual( fixture.innerHTML, 'Rizzo: rat' );

			muppet.name = 'Fozzie';
			muppet.type = 'bear';

			t.htmlEqual( fixture.innerHTML, 'Fozzie: bear' );
		});

		test( 'Multiple instances can share an object', t => {
			const muppet = makeObj();

			new MagicRactive({
				el: fixture,
				data: muppet
			});

			new MagicRactive({
				el: fixture2,
				data: muppet
			});

			muppet.name = 'Rizzo';
			muppet.type = 'rat';

			t.htmlEqual( fixture.innerHTML, 'Rizzo: rat' );
			t.htmlEqual( fixture2.innerHTML, 'Rizzo: rat' );

			muppet.name = 'Fozzie';
			muppet.type = 'bear';

			t.htmlEqual( fixture.innerHTML, 'Fozzie: bear' );
			t.htmlEqual( fixture2.innerHTML, 'Fozzie: bear' );
		});

		test( 'Direct property access can be used interchangeably with ractive.set()', t => {
			const muppet = makeObj();

			const ractive1 = new MagicRactive({
				el: fixture,
				data: muppet
			});

			const ractive2 = new MagicRactive({
				el: fixture2,
				data: muppet
			});

			muppet.name = 'Rizzo';
			muppet.type = 'rat';

			t.htmlEqual( fixture.innerHTML, 'Rizzo: rat' );
			t.htmlEqual( fixture2.innerHTML, 'Rizzo: rat' );

			ractive1.set({
				name: 'Fozzie',
				type: 'bear'
			});

			t.htmlEqual( fixture.innerHTML, 'Fozzie: bear' );
			t.htmlEqual( fixture2.innerHTML, 'Fozzie: bear' );

			ractive2.set({
				name: 'Miss Piggy',
				type: 'pig'
			});

			t.htmlEqual( fixture.innerHTML, 'Miss Piggy: pig' );
			t.htmlEqual( fixture2.innerHTML, 'Miss Piggy: pig' );

			muppet.name = 'Pepe';
			muppet.type = 'king prawn';

			t.htmlEqual( fixture.innerHTML, 'Pepe: king prawn' );
			t.htmlEqual( fixture2.innerHTML, 'Pepe: king prawn' );
		});

		test( 'Magic mode works with existing accessors', t => {
			let _foo = 'Bar';
			const data = {};

			Object.defineProperty( data, 'foo', {
				get () {
					return _foo.toLowerCase();
				},
				set ( value ) {
					_foo = value;
				},
				configurable: true,
				enumerable: true
			});

			new MagicRactive({
				el: fixture,
				template: '{{foo}}',
				data
			});

			t.htmlEqual( fixture.innerHTML, 'bar' );

			data.foo = 'BAZ';
			t.htmlEqual( fixture.innerHTML, 'baz' );
		});

		test( 'Magic mode preserves "this" for existing accessors', t => {
			const data = {};
			let thisObservedInGetter = undefined;
			let thisObservedInSetter = undefined;

			Object.defineProperty( data, 'propertyLoggingObservedThisOnCall', {
				get () {
					thisObservedInGetter = this;
					return 'foo';
				},
				set () {
					thisObservedInSetter = this;
				},
				configurable: true,
				enumerable: true
			});

			new MagicRactive({
				el: fixture,
				template: '{{foo}}',
				data
			});

			t.strictEqual( thisObservedInGetter, data );

			data.propertyLoggingObservedThisOnCall = 'foo';
			t.strictEqual( thisObservedInSetter, data );
		});

		test( 'Setting properties in magic mode triggers change events', t => {
			t.expect( 1 );

			const foo = { bar: 'baz' };

			const ractive = new MagicRactive({
				el: fixture,
				template: '{{foo.bar}}',
				data: { foo }
			});

			ractive.on( 'change', changeHash => {
				t.deepEqual( changeHash, { 'foo.bar': 'qux' });
			});

			foo.bar = 'qux';
		});

		test( 'A magic component is magic regardless of whether its parent is magic', t => {
			t.expect( 3 );

			const data = {
				magician: 'Harry Houdini'
			};

			const Magician = MagicRactive.extend({
				template: '<p>{{magician}}</p>',
				magic: true,
				data,
				changeMagician () {
					this.viewmodel.value.magician = 'David Copperfield';
				},
				oninit () {
					t.ok( this.magic );
				}
			});

			window.Magician = Magician;

			const ractive = new MagicRactive({
				el: fixture,
				magic: false,
				template: '<magician/>',
				components: { magician: Magician }
			});

			t.htmlEqual( fixture.innerHTML, '<p>Harry Houdini</p>' );
			ractive.findComponent( 'magician' ).changeMagician();
			t.htmlEqual( fixture.innerHTML, '<p>David Copperfield</p>' );
		});

		test( "Magic adapters shouldn't tear themselves down while resetting (#1342)", t => {
			const list = 'abcde'.split('');
			const r = new MagicRactive({
				el: fixture,
				template: '{{#list}}{{.}}{{/}}',
				data: { list },
				magic: true
			});

			t.htmlEqual( fixture.innerHTML, 'abcde' );
			// if the wrapper causes itself to be recreated, this is where it happens
			// during reset
			r.pop( 'list' );
			t.htmlEqual( fixture.innerHTML, 'abcd' );
			// since the wrapper now has two magic adapters, two fragments get popped
			r.pop( 'list' );
			t.htmlEqual( fixture.innerHTML, 'abc' );
		});

		test( 'Data passed into component updates from outside component in magic mode', t => {
			const Widget = Ractive.extend({
				template: '{{world}}',
				magic: true
			});

			const data = { world: 'mars' };

			new Ractive({
				el: fixture,
				template: '{{world}}<widget world="{{world}}"/>',
				magic: true,
				components: { widget: Widget },
				data
			});

			data.world = 'venus';

			t.htmlEqual( fixture.innerHTML, 'venusvenus' );
		});

		test( `splicing arrays around a magic array doesn't cause rendering errors (#2005)`, t => {
			const items = [
				{ num: 1, items: [] },
				{ num: 2, items: [] },
				{ num: 3, items: [] },
				{ num: 4, items: [] }
			];
			const third = items[2];
			new Ractive({
				el: fixture,
				template: `{{#items}}{{.num}}{{#.items}}-{{.num}}{{/}}{{/}}`,
				data: { items },
				magic: true,
				modifyArrays: true
			});

			t.htmlEqual( fixture.innerHTML, '1234' );
			third.items.push(items.splice(0, 1)[0]);
			t.htmlEqual( fixture.innerHTML, '23-14' );
			third.items.push(items.splice(0, 1)[0]);
			t.htmlEqual( fixture.innerHTML, '3-1-24' );
		});

		test( 'Indirect changes propagate across components in magic mode (#480)', t => {
			const Blocker = Ractive.extend({
				template: '{{foo.bar.baz}}'
			});

			const ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo.bar.baz}}"><Blocker foo="{{foo}}"/>',
				data: { foo: { bar: { baz: 50 } } },
				magic: true,
				components: { Blocker }
			});

			ractive.set( 'foo.bar.baz', 42 );
			t.equal( ractive.get( 'foo.bar.baz' ), 42 );

			ractive.get( 'foo.bar' ).baz = 1337;
			//t.equal( ractive.data.foo.bar.baz, 1337 );
			t.equal( ractive.get( 'foo.bar.baz' ), 1337 );

			const blocker = ractive.findComponent( 'Blocker' );

			blocker.set( 'foo.bar.baz', 42 );
			t.equal( blocker.get( 'foo.bar.baz' ), 42 );

			//blocker.data.foo.bar.baz = 1337;
			blocker.set( 'foo.bar.baz', 1337 ); // TODO necessary since #1373. Might need to review some of these tests
			//t.equal( blocker.data.foo.bar.baz, 1337 );
			t.equal( blocker.get( 'foo.bar.baz' ), 1337 );
		});

	} catch ( err ) {
		// don't run these tests
	}
}
