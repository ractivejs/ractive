var sets, startTests;

sets = [ 'comments', 'delimiters', 'interpolation', 'inverted', 'partials', 'sections' ];

sets = [ 'interpolation' ];

startTests = function ( set, data ) {
	
	module( set );

	_.each( data.tests, function ( t ) {
		var viewModel, binding, result;

		binding = new Binding({
			el: 'qunit-fixture',
			template: t.template,
			viewModel: ( t.data )
		});

		result = binding.el.innerHTML;
				
		test( t.name, function () {
			equal( result, t.expected, t.desc + '\n' + t.template + '\n' );
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