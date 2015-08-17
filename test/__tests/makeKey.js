/*global test, module */
module( 'makeKey()' );


test( 'Returns keypath from a series of keys', t => {
	var keys = ['a', 'b', 'c', 'd'],
		expected = 'a.b.c.d';

	t.equal(Ractive.makeKey.apply(this, keys), expected);
});
