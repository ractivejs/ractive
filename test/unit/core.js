// TODO


test( 'new Anglebars() creates an Anglebars instance', function () {
	var anglebars = new Anglebars();

	ok( anglebars instanceof Anglebars );
});


test( 'instance has a viewmodel, which is an instance of Anglebars.ViewModel', function () {
	var anglebars = new Anglebars();

	ok( anglebars.viewmodel instanceof Anglebars.ViewModel );
});