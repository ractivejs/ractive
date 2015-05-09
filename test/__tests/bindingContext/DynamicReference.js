import DynamicContextReference from 'viewmodel/context/DynamicContextReference';
import RootContext from 'viewmodel/context/RootContext';

var root, base, ref, a, b;

function flush () {
	root.notify( 'default' );
}

class Dependent {
	setValue ( value ) {
		this.value = value;
	}
}

module( 'Reference', {
	setup: () => {
		root = new Root( { changes: [] }, {} );
		base = root.join( 'foo' );
		ref = root.join( 'prop' );
		a = base.join( 'a' );
		b = base.join( 'b' );
	}
});

test( 'one level, all resolved, gets and sets, rebind', t => {

	let depA = new Dependent(),
		depB = new Dependent(),
		depRef = new Dependent();

	a.register( depA );
	b.register( depB );

	ref.set( 'a' );
	a.set( 'A' );
	b.set( 'B' );
	flush();

	let refModel = new DynamicReference( ref.key, ref, base );
	base.addChild( refModel );
	refModel.register( depRef );

	t.equal( refModel.get(), 'A' );
	refModel.set( 'new A' );
	t.equal( a.get(), 'new A' );
	flush();

	t.equal( depA.value, 'new A' );
	t.equal( depB.value, 'B' );
	t.equal( depRef.value, 'new A' );

	ref.set( 'b' );
	t.equal( refModel.get(), 'B' );
	flush();

	t.equal( depA.value, 'new A' );
	t.equal( depB.value, 'B' );
	t.equal( depRef.value, 'B' );

	refModel.set( 'new B' );
	t.equal( b.get(), 'new B' );
	flush();

	t.equal( depA.value, 'new A' );
	t.equal( depB.value, 'new B' );
	t.equal( depRef.value, 'new B' );

});

test( 'second level, all resolved, gets and sets, rebind', t => {


	ref.set( 'a' );
	a.set( { qux: 'A' } );
	b.set( { qux: 'B' } );

	let refModel = new DynamicReference( ref.key, ref, base );
	base.addChild( refModel );

	let aChild = a.join( 'qux' ),
		bChild = b.join( 'qux' ),
		refChild = refModel.join( 'qux' ),
		depA = new Dependent(),
		depB = new Dependent(),
		depRef = new Dependent();


	aChild.register( depA );
	bChild.register( depB );
	refChild.register( depRef );

	flush();

	t.equal( refChild.get(), 'A' );
	refChild.set( 'new A' );
	t.equal( aChild.get(), 'new A' );
	flush();

	t.equal( depA.value, 'new A' );
	t.equal( depB.value, 'B' );
	t.equal( depRef.value, 'new A' );

	ref.set( 'b' );
	t.equal( refChild.get(), 'B', 'reference change' );
	flush();

	t.equal( depA.value, 'new A' );
	t.equal( depB.value, 'B' );
	t.equal( depRef.value, 'B' );

	refChild.set( 'new B' );
	t.equal( bChild.get(), 'new B' );
	flush();

	t.equal( depA.value, 'new A' );
	t.equal( depB.value, 'new B' );
	t.equal( depRef.value, 'new B' );

	b.set( { qux: 'new obj' } );
	t.equal( bChild.get(), 'new obj' );
	flush();

	t.equal( depA.value, 'new A' );
	t.equal( depB.value, 'new obj' );
	t.equal( depRef.value, 'new obj' );

});

module( 'Unresolved ReferenceModels', {
	setup: () => {
		root = new Root( { changes: [] }, {} );
		base = root.join( 'foo' );
		ref = root.join( 'prop' );
		a = base.join( 'a' );
	}
});

test( 'unresolved reference', t => {
	let depA = new Dependent(),
		depRef = new Dependent();

	a.set( 'A' );
	a.register( depA );

	let refModel = new DynamicReference( ref.key, ref, base );
	base.addChild( refModel );
	refModel.register( depRef );

	flush();

	t.equal( refModel.get(), undefined );
	t.equal( depA.value, 'A' );
	t.equal( depRef.value, undefined );

	ref.set( 'a' );
	t.equal( refModel.get(), 'A' );
	flush();
	t.equal( depA.value, 'A' );
	t.equal( depRef.value, 'A' );

});
