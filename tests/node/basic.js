export default function(){

	QUnit.module( 'Ractive' );

	QUnit.test( 'should be a function', t => {
		t.equal( typeof Ractive, 'function' );
	});

}
