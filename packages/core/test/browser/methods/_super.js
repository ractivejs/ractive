import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function () {
	initModule('super.js');

	test('_super can call parent method', t => {
		const Parent = Ractive.extend({ foo() { t.ok(true); } });
		const Child = Parent.extend({ foo() { this._super(); } });

		const instance = new Child();
		instance.foo();
	});

	test('_super can call parent through prototype chain', t => {
		const GrandParent = Ractive.extend({ foo() { t.ok(true); } });
		const Parent = GrandParent.extend({});
		const Child = Parent.extend({ foo() { this._super(); } });

		const instance = new Child();
		instance.foo();
	});

	test('_super can be called with a parent added dynamically', t => {
		const Parent = Ractive.extend({});
		const Child = Parent.extend({ foo() { this._super(); } });

		const instance = new Child();

		Parent.prototype.foo = () => t.ok(true);

		instance.foo();
	});

	test('_super can be called without a parent', t => {
		const Child = Ractive.extend({
			foo() {
				this._super();
				t.ok(true);
			}
		});

		const instance = new Child();
		instance.foo();
	});

	test('_super context is the current instance', t => {
		const Parent = Ractive.extend({ foo() { t.strictEqual(this, instance); } });
		const Child = Parent.extend({ foo() { this._super(); } });

		const instance = new Child();
		instance.foo();
	});

	test('_super returns a value if parent is a property', t => {
		const data = { message: 'Hello World!' };
		const Parent = Ractive.extend({ foo: data });
		const Child = Parent.extend({ foo() { return this._super(); } });

		const instance = new Child();
		t.strictEqual(instance.foo(), data);
	});

	test('_super wrapping is not applied when not used', t => {
		const fn = function () { };

		const Parent = Ractive.extend({ foo() { } });
		const Child = Parent.extend({ foo: fn });

		const instance = new Child();
		t.strictEqual(instance.foo, fn);
	});

	test('_super wrapping is applied when used', t => {
		const fn = function () { this._super(); };

		const Parent = Ractive.extend({ foo() { } });
		const Child = Parent.extend({ foo: fn });

		const instance = new Child();
		t.notEqual(instance.foo, fn);
	});

	test('_super gives access to unwrapped version of method', t => {
		const fn = function () { this._super(); };

		const Parent = Ractive.extend({ foo() { } });
		const Child = Parent.extend({ foo: fn });

		const instance = new Child();
		t.strictEqual(instance.foo._method, fn);
	});

	test('_super parent can be changed dynamically', t => {
		const Father = Ractive.extend({ foo() { t.ok(false); } });
		const Mother = Ractive.extend({ foo() { t.ok(true); } });
		const Child = Father.extend({ foo() { this._super(); } });

		const instance = new Child();

		t.strictEqual(instance.foo._parent, Father.prototype);

		instance.foo._parent = Mother.prototype;

		instance.foo();
	});
}
