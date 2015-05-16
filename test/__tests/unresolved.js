module( 'Unresolved References' );

test( 'Array member by index number', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#with bar}}{{1}}{{/with}}'
	});

	ractive.set( 'bar', ['a', 'b', 'c'] );
	t.equal( fixture.innerHTML, 'b' );
});
