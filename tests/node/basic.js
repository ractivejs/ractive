const { module, test } = QUnit;

export default function () {

	module( 'Ractive' );

	test( 'should be a function', t => {
		t.equal( typeof Ractive, 'function' );
	});

}
