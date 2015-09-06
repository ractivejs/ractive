import { test } from 'qunit';

test( 'Array member by index number', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '{{#with bar}}{{1}}{{/with}}'
	});

	ractive.set( 'bar', ['a', 'b', 'c'] );
	t.equal( fixture.innerHTML, 'b' );
});
