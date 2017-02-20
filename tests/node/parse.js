import parseTests from '../helpers/samples/parse';

export default function(){

	QUnit.module( 'Ractive.parse()' );

	parseTests.forEach( test => {

		// disable for tests unless explicitly specified
		// we can just test the signatures, so set csp false
		test.options = test.options || { csp: false };
		if ( !test.options.hasOwnProperty( 'csp' ) ) {
			test.options.csp = false;
		}

		QUnit.test( test.name, t => {
			if (test.error) {
				t.throws( () => {
					Ractive.parse( test.template, test.options );
				}, error => {
					if (error.name !== 'ParseError') {
						throw error;
					}
					if ( test.error.test ) {
						t.ok( test.error.test( error.message ) );
					} else {
						t.equal( error.message, test.error );
					}
					return true;
				}, 'Expected ParseError');
			} else {
				const parsed = Ractive.parse( test.template, test.options );

				if (parsed.e && test.parsed.e) {
					const expectedKeys = Object.keys(test.parsed.e);
					const parsedKeys = Object.keys(parsed.e);

					t.deepEqual(parsedKeys, expectedKeys);

					expectedKeys.forEach(key => {
						// normalize function whitepace for browser vs phantomjs
						const actual = parsed.e[key].toString().replace(') \{', ')\{');
						t.equal(actual, test.parsed.e[key]);
					});

					delete parsed.e;
					delete test.parsed.e;
				}

				t.deepEqual( parsed, test.parsed );
			}
		});
	});
}
