const { module, test } = QUnit;
import renderTests from '../helpers/samples/render';
import cheerio from 'cheerio';

function normaliseHTML(html) {
	return cheerio.load(html).html().trim().replace(/^\s+/gm, '').replace(/\n/g, ' ');
}

function getData(data) {
	return typeof data === 'function' ? data() : deepClone(data);
}

function deepClone(source) {
	if (!source || typeof source !== 'object') {
		return source;
	}

	if (Array.isArray(source)) {
		return source.slice();
	}

	const target = {};

	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			target[key] = deepClone(source[key]);
		}
	}

	return target;
}

export default function () {
	module('ractive.toHTML()');

	renderTests.forEach( theTest => {
		test(theTest.name, t => {

			const ractive = new Ractive({
				template: theTest.template,
				partials: theTest.partials,
				data: getData(theTest.data)
			});

			t.equal(normaliseHTML(ractive.toHTML()), normaliseHTML(theTest.result));

			if (theTest.new_data) {
				ractive.set(getData(theTest.new_data));
				t.equal(normaliseHTML(ractive.toHTML()), normaliseHTML(theTest.new_result));
			}

			// TODO array of data/expected

			ractive.teardown();
		});
	});

	test('doctype declarations handle updates (#2679)', t => {
		// the select triggers an update during bind
		const template = Ractive.parse('<!DOCTYPE html><html><select value="{{foo}}"><option value="bar">bar</option></select></html>');
		const r = new Ractive({
			template
		});

		// If the code reached this point, then the lines before it didn't blow up.
		t.ok(true);

		r.teardown();
	});

}
