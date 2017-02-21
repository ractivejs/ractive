const { module, test } = QUnit;
import parseTests from '../helpers/samples/parse';

export default function(){

	module( 'Ractive.parse()' );

	parseTests.forEach( parseTest => {

		// disable for tests unless explicitly specified
		// we can just test the signatures, so set csp false
		parseTest.options = parseTest.options || { csp: false };
		if ( !parseTest.options.hasOwnProperty( 'csp' ) ) {
			parseTest.options.csp = false;
		}

		test( parseTest.name, t => {
			if ( parseTest.error ) {
				t.throws( () => {
					Ractive.parse( parseTest.template, parseTest.options );
				}, error => {
					if ( error.name !== 'ParseError' ) {
						throw error;
					}
					if ( parseTest.error.test ) {
						t.ok( parseTest.error.test( error.message ) );
					} else {
						t.equal( error.message, parseTest.error );
					}
					return true;
				}, 'Expected ParseError');
			} else {
				const parsed = Ractive.parse( parseTest.template, parseTest.options );

				if ( parsed.e && parseTest.parsed.e ) {
					const expectedKeys = Object.keys( parseTest.parsed.e) ;
					const parsedKeys = Object.keys( parsed.e );

					t.deepEqual(parsedKeys, expectedKeys);

					expectedKeys.forEach(key => {
						// normalize function whitepace for browser vs phantomjs
						const actual = parsed.e[key].toString().replace( ') \{', ')\{' );
						t.equal( actual, parseTest.parsed.e[key] );
					});

					delete parsed.e;
					delete parseTest.parsed.e;
				}

				t.deepEqual( parsed, parseTest.parsed );
			}
		});
	});
}
