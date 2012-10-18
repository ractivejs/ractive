var sets, startTests;

sets = [ 'comments', 'delimiters', 'interpolation', 'inverted', 'partials', 'sections' ];

var trim = function ( str ) {
	return str.replace( /^\s*/, '' ).replace( /\s*$/, '' );
};

startTests = function ( set, data ) {
	
	module( set );

	data.tests.forEach( function ( t ) {
		var data, anglebars, result, pattern;

		anglebars = new Anglebars({
			el: 'qunit-fixture',
			template: t.template,
			data: ( t.data ),
			preserveWhitespace: true
		});

		pattern = /<a class="anglebars-anchor"><\/a>/g;
		result = anglebars.el.innerHTML.replace( pattern, '' );
				
		test( t.name, function () {
			equal( trim( result ), trim( t.expected ), t.desc + '\n' + t.template + '\n' );
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