// TODO


test( 'new Ractive() creates an Ractive instance', function () {
	var ractive = new Ractive();

	ok( ractive instanceof Ractive );
});


test( 'instance has a viewmodel, which is an instance of Ractive.ViewModel', function () {
	var ractive = new Ractive();

	ok( ractive.viewmodel instanceof Ractive.ViewModel );
});