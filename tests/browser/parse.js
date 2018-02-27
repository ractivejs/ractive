import tests from '../helpers/samples/parse';
import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

/* global navigator */

export default function() {
	initModule('parse.js');

	test('Mismatched template version causes error', t => {
		t.throws(() => {
			new Ractive({
				template: { v: 'nope', t: [] }
			});
		});
	});

	tests.forEach(theTest => {
		test(theTest.name, t => {
			// disable for tests unless explicitly specified
			// we can just test the signatures, so set false
			theTest.options = theTest.options || { csp: false };
			if (!theTest.options.hasOwnProperty('csp')) {
				theTest.options.csp = false;
			}
			if (theTest.error) {
				t.throws(
					() => {
						Ractive.parse(theTest.template, theTest.options);
					},
					error => {
						if (error.name !== 'ParseError') {
							throw error;
						}
						if (theTest.error.test) {
							t.ok(theTest.error.test(error.message));
						} else {
							t.equal(error.message, theTest.error);
						}
						return true;
					},
					'Expected ParseError'
				);
			} else {
				const parsed = Ractive.parse(theTest.template, theTest.options);

				if (parsed.e && theTest.parsed.e) {
					const expectedKeys = Object.keys(theTest.parsed.e);
					t.deepEqual(Object.keys(parsed.e), expectedKeys);
					expectedKeys.forEach(key => {
						const actual = parsed.e[key].toString();
						t.equal(actual, theTest.parsed.e[key]);
					});

					delete parsed.e;
					delete theTest.parsed.e;
				}

				t.deepEqual(parsed, theTest.parsed);
			}
		});
	});
}
