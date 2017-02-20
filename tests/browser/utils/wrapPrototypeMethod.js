import wrap from '../../../src/Ractive/config/wrapPrototypeMethod';
import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'utils/wrapPrototypeMethod.js' );

	function callSuper () { this._super(); }

	QUnit.test( 'can call _super on parent', t => {
		t.expect(1);

		const parent = { talk: () => t.ok( true ) };
		const instance = Object.create( parent );

		instance.talk = wrap( parent, 'talk', callSuper );

		instance.talk();
	});

	QUnit.test( '"this" in methods refers to correct instance', t => {
		t.expect(2);

		const parent = {
			talk () { // no fat arrows! that would bind "this" to test method or module!
				t.equal( this, instance, '_super method has correct "this"' );
			}
		};

		const instance = Object.create( parent );

		instance.talk = wrap( parent, 'talk', function () {
			t.equal( this, instance, 'instance method has correct "this"' );
			this._super();
		});

		instance.talk();
	});

	QUnit.test( 'can find _super in prototype chain', t => {
		t.expect(1);

		const grandparent = { talk: () => t.ok( true ) };
		const parent = Object.create( grandparent );
		const instance = Object.create( parent );

		instance.talk = wrap( parent, 'talk', callSuper );
		instance.talk();
	});

	QUnit.test( 'safe to use _super with no parent', t => {
		t.expect( 1 );

		const parent = {};
		const instance = Object.create( parent );

		instance.talk = wrap( parent, 'talk', function () {
			this._super();
			t.ok( true );
		});

		instance.talk();
	});

	QUnit.test( 'parent _super can be added later', t => {
		t.expect( 1 );

		const parent = {};
		const instance = Object.create( parent );

		instance.talk = wrap( parent, 'talk', callSuper );

		parent.talk = () => t.ok( true );
		instance.talk();
	});

	QUnit.test( 'only wraps when this._super used in method', t => {
		t.expect( 1 );

		const parent = { talk: () => t.ok( true ) };
		const method = function () {};

		t.equal( wrap( parent, 'talk', method ), method );
	});

	QUnit.test( 'if this._super is non-function, returns as value', t => {
		t.expect( 1 );

		const data = { foo: 'bar' };
		const parent = { talk: data };
		const instance = Object.create( parent );
		const method = function () { return this._super(); };

		instance.talk = wrap( parent, 'talk', method );

		t.equal( instance.talk() , data );
	});

	QUnit.test( 'parent instance can be changed', t => {
		t.expect( 2 );

		const parent = { talk: () => false };
		const newParent = { talk: () => t.ok( true ) };
		const instance = Object.create( parent );

		instance.talk = wrap( parent, 'talk', callSuper );
		t.equal( instance.talk._parent, parent );
		instance.talk._parent = newParent;

		instance.talk();
	});

	QUnit.test( 'can access original via _method', t => {
		const method = wrap( parent, 'talk', callSuper );
		t.equal( method._method, callSuper );
	});
}
