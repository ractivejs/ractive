var testReport = {}, sets, startTests, charCodes, trim, testNum = 0;

sets = [ 'comments', 'delimiters', 'interpolation', 'inverted', 'partials', 'sections' ];
//sets = [ 'partials' ];


trim = function ( str ) {
	return str.replace( /^\s*/, '' ).replace( /\s*$/, '' );
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
		var data, anglebars, result, pattern;

		console.log( ++testNum + ': START\n' );

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

		try {
			anglebars = new Anglebars({
				el: 'qunit-fixture',
				template: t.template,
				data: t.data,
				partials: t.partials,
				preserveWhitespace: true
			});

			result = anglebars.el.innerHTML;

			testReport[ testNum ].___result = result;
			testReport[ testNum ].charCodes.___result = charCodes( trim( result ) );
		} catch ( err ) {
			console.error( err );
			//throw err;
		}


		test( t.name, function () {
			equal( trim( result ), trim( t.expected ), t.desc + '\n' + t.template + '\n' );
		});
		console.log( testNum + ': END\n' );
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