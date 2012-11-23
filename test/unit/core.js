test( 'new Anglebars() creates an Anglebars instance', function () {
	var anglebars = new Anglebars();

	ok( anglebars instanceof Anglebars );
});


test( 'instance has expected default properties', function () {
	var anglebars = new Anglebars();

	equal( anglebars.namespace, null );
	equal( anglebars.preserveWhitespace, false );
	equal( anglebars.replaceSrcAttributes, true );
});


test( 'instance has a viewmodel, which is an instance of Anglebars.ViewModel', function () {
	var anglebars = new Anglebars();

	ok( anglebars.viewmodel instanceof Anglebars.ViewModel );
});