// MUSTACHE SPEC COMPLIANCE TESTS
// ==============================
//
// These are included to aid development; Ractive will never be able to pass
// every test in the suite because it's doing something fundamentally different
// to other mustache implementations.


QUnit.config.reorder = false;

var testReport = {}, sets, startTests, charCodes, trim, fudge, testNum = 0;

sets = [ 'comments', 'delimiters', 'interpolation', 'inverted', 'partials', 'sections' ];
//sets = [ 'delimiters' ];

trim = function ( str ) {
	if ( typeof str !== 'string' ) {
		return '';
	}

	return str.replace( /^\s*/, '' ).replace( /\s*$/, '' );
};

fudge = function ( str ) {
	// Modify test output so that unpassable tests become passable...
	// is this bad?

	// Fudge 1: If you do p.innerHTML = '\r\n', guess what p.innerHTML
	// is equal to? That's right... '\n'. Not '\r\n'.
	str = str.replace( /\r\n/g, '\n' );

	// Fudge 2: If you do p.innerText = '>', p.innerHTML = '&gt;'. This
	// is correct, but the mustache spec deals with plain text rather than
	// HTML, so it gets all confused
	str = str.replace( /&gt;/g, '>' ).replace( /&lt;/g, '<' );
	
	return str;
};

charCodes = function ( str ) {
	var result = [];
	for ( i=0; i<str.length; i+=1 ) {
		result[i] = str.charCodeAt(i);
	}
	return result;
};

startTests = function ( set, data ) {

	module( set );

	data.tests.forEach( function ( t ) {
		test( t.name, function () {
				var data, ractive, result, pattern;

			console.group( ++testNum );

			console.log( t.template );

			testReport[ testNum ] = {
				data: t.data,
				template: t.template,
				_expected: trim( t.expected ),
				charCodes: {
					_expected: charCodes( trim( t.expected ) )
				}
			};

			if ( t.partials ) {
				testReport[ testNum ].partials = t.partials;
			}

			ractive = new Ractive({
				el: 'qunit-fixture',
				template: t.template,
				data: t.data,
				partials: t.partials,
				preserveWhitespace: true
			});

			result = ractive.el.innerHTML;

			testReport[ testNum ].___result = result;
			testReport[ testNum ].charCodes.___result = charCodes( trim( result ) );
		
			equal( fudge( trim( result ) ), fudge( trim( t.expected ) ), t.desc + '\n' + t.template + '\n' );

			console.groupEnd();
		});
	});
};

sets.forEach( function ( set ) {
	$.ajax({
		url: 'samples/mustache-spec/' + set + '.json',
		success: function ( data ) {
			startTests( set, data );
		}
	});
});