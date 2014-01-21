// RENDERING TESTS
// ===============
//
// TODO: add moar tests

define([ 'Ractive', 'samples/render' ], function ( Ractive, tests ) {

	window.Ractive = Ractive;

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' ), runTest, theTest, hasSvg;

		module ( 'Render' );

		hasSvg = document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );

		// argh IE
		if ( ![].reduce ) {
			Array.prototype.reduce = function ( reducer, start ) {
				var i, len, reduced;

				reduced = start || 0;

				len = this.length;
				for ( i=0; i<len; i+=1 ) {
					if ( this.hasOwnProperty( i ) ) {
						reduced = reducer( reduced, this[i] );
					}
				}

				return reduced;
			};
		}

		runTest = function ( i ) {
			var theTest = tests[i];

			test( theTest.name, function ( t ) {
				var view;

				view = new Ractive({
					el: fixture,
					data: theTest.data,
					template: theTest.template,
					partials: theTest.partials,
					debug: true
				});

				t.htmlEqual( fixture.innerHTML, theTest.result );
				t.htmlEqual( view.toHTML(), theTest.result );

				if ( theTest.new_data ) {
					view.set( theTest.new_data );

					t.htmlEqual( fixture.innerHTML, theTest.new_result );
					t.htmlEqual( view.toHTML(), theTest.new_result );
				}
			});
		};

		for ( i=0; i<tests.length; i+=1 ) {
			if ( !hasSvg && tests[i].svg ) {
				continue;
			}

			runTest( i );
		}

	};

});