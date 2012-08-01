var sets, startTests;

sets = [ 'comments', 'delimiters', 'interpolation', 'inverted', 'partials', 'sections' ];

var trim = function ( str ) {
	return str.replace( /^\s*/, '' ).replace( /\s*$/, '' );
};

startTests = function ( set, data ) {
	
	module( set );

	_.each( data.tests, function ( t ) {
		var viewModel, binding, result, pattern;

		binding = new Binding({
			el: 'qunit-fixture',
			template: t.template,
			viewModel: ( t.data ),
			preserveWhitespace: true
		});

		pattern = /<a class="binding-anchor"><\/a>/g;
		result = binding.el.innerHTML.replace( pattern, '' );
				
		test( t.name, function () {
			equal( trim( result ), trim( t.expected ), t.desc + '\n' + t.template + '\n' );
		});
	});
};

_.each( sets, function ( set ) {
	$.ajax({
		url: 'samples/mustache-spec/' + set + '.json',
		success: function ( data ) {
			startTests( set, data );
		}
	});
});