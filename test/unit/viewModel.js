var viewModel;

module( 'viewModel', {
	setup: function () {
		viewModel = new Miso.ViewModel({
			hello: 'world'
		});
	}
});


test( 'viewModel init', function() {
	ok( viewModel instanceof Miso.ViewModel, 'instance of Miso.ViewModel' );
	ok( viewModel.subscriptions, 'initialised with a subscriber list' );
});

test( 'subscriptions', function () {
	var binding,
		level = 0,
		result,
		subscriptionRefs,
		callback = function () { callbackRan = true; };

	subscriptionRefs = viewModel.subscribe( 'test', 0, function ( value ) {
		result = value;
	});

	viewModel.set( 'test', 'callback executed once' );
	equal( result, 'callback executed once', 'subscribe and set' );

	viewModel.unsubscribeAll( subscriptionRefs );

	viewModel.set( 'test', 'callback executed twice' );
	equal( result, 'callback executed once', 'unsubscribe' );

	subscriptionRefs = viewModel.subscribe( 'one.two.three.four', 2, function ( value ) {
		result = value;
	});

	viewModel.set( 'one.two.three.four', 'setting nested property' );
	equal( result, 'setting nested property', 'nested properties' );

	viewModel.set( 'one', { two: { three: { four: "setting nested property's parent" } } } );
	equal( result, "setting nested property's parent", 'nested properties cascade' );

	deepEqual( viewModel.get( 'one.two.three' ), { four: "setting nested property's parent" }, 'get indirectly set property' );
});