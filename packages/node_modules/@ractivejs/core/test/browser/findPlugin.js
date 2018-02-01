import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function () {
	initModule('findPlugin.js');

	test('find registry in hierarchy', t => {
		const adaptor1 = {};
		const adaptor2 = {};
		const parent = new Ractive({ adaptors: { foo: adaptor1 } });
		const ractive = new Ractive({ adaptors: { bar: adaptor2 }, isolated: false });

		ractive.parent = parent;

		t.equal(Ractive.findPlugin('foo', 'adaptors', ractive), adaptor1);
		t.equal(Ractive.findPlugin('bar', 'adaptors', ractive), adaptor2);
	});

}
