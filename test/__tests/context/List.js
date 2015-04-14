import DynamicReference from 'viewmodel/models/DynamicReference';
import Root from 'viewmodel/models/Root';

var root, items, block, array,
	indices, aliasIndices, keys, aliasKeys,
	static0, static2, dep0, dep2;

function flush () {
	root.notify( 'default' );
}

class Dependent {
	setValue ( value ) {
		this.value = value;
	}
}

class Block {

	setMembers( members ) {
		this.contexts = members;
	}

	updateMembers( splice ) {
		this.start = splice.start;
		this.remove = splice.remove;
		this.insert = splice.insert;
	}

}

module( 'Reference', {
	setup: () => {
		root = new Root( { changes: [] }, {} );
		items = root.join( 'items' );

		block = new Block();
		items.listRegister( block, { index: 'i', key: 'k' } );

		array = [ 'a', 'b', 'c' ];
		items.set( array );
		flush();

		// simulate dependant registrations
		indices = items.members.map( m => createDependent( m, '@index' ) );
		aliasIndices = items.members.map( m => createDependent( m, 'i') );
		keys = items.members.map( m => createDependent( m, '@key' ) );
		aliasKeys = items.members.map( m => createDependent( m, 'k') );
		static0 = items.join('0');
		static2 = items.join('2');
		static0.register( dep0 = new Dependent() );
		static2.register( dep2 = new Dependent() );
		flush();
	}
});

function createDependent ( member, key ) {
	var dependent = new Dependent();
	member.join( key ).register( dependent );
	return dependent;
}

function testContexts () {
	var i, contexts = block.contexts, context;
	equal( contexts, items.members, 'contexts is items.members' );
	equal( contexts.length, array.length, 'contexts has same length as value array' );

	for( i = 0; i < contexts.length; i++ ) {
		context = contexts[i];
		equal( context.get(), array[i], 'context has correct value' );
		equal( indices[i].value, i, 'context has correct @index' );
		equal( aliasIndices[i].value, i, 'context has correct i' );
		equal( keys[i].value, i, 'context has correct @key' );
		equal( aliasKeys[i].value, i, 'context has correct k' );
	}

	equal( dep0.value, array[0], 'static dependent 0 has array value 0' );
	equal( dep2.value, array[2], 'static dependent 2 has array value 2' );
}

test( 'set triggers setMembers with array of contexts', t => {

	testContexts();

	items.set( array = [ 'd', 'e', 'f' ] );
	flush();
	testContexts();

	items.set( array = [ 'g', 'h' ] );
	flush();
	testContexts();

	items.set( array = [ 'i', 'j', 'k', 'l' ] );

	// simulate new bindings against '@index' and 'i'
	indices[3] = createDependent( items.members[3], '@index' );
	aliasIndices[3] = createDependent( items.members[3], 'i' );
	// simulate new bindings against '@key' and 'k'
	keys[3] = createDependent( items.members[3], '@key' );
	aliasKeys[3] = createDependent( items.members[3], 'k' );

	flush();
	testContexts();

});

test( 'push shuffle', t => {

	items.shuffle( 'push', 'd' );
	// simulate new bindings against '@index' and 'i'
	indices[3] = createDependent( items.members[3], '@index' );
	aliasIndices[3] = createDependent( items.members[3], 'i' );
	// simulate new bindings against '@index' and 'i'
	keys[3] = createDependent( items.members[3], '@key' );
	aliasKeys[3] = createDependent( items.members[3], 'k' );
	flush();

	testContexts();

	t.equal( block.start, 3 );
	t.equal( block.remove, 0 );
	t.equal( block.insert, 1 );

});

test( 'splice shuffle', t => {

	items.shuffle( 'splice', 1, 1, 'd', 'e' );
	indices = [
		indices[0],
		createDependent( items.members[1], '@index' ),
		createDependent( items.members[2], '@index' ),
		indices[2]
	];
	aliasIndices = [
		aliasIndices[0],
		createDependent( items.members[1], 'i' ),
		createDependent( items.members[2], 'i' ),
		aliasIndices[2]
	];
	keys = [
		keys[0],
		createDependent( items.members[1], '@key' ),
		createDependent( items.members[2], '@key' ),
		keys[2]
	];
	aliasKeys = [
		aliasKeys[0],
		createDependent( items.members[1], 'k' ),
		createDependent( items.members[2], 'k' ),
		aliasKeys[2]
	];
	flush();

	testContexts();
	t.equal( block.start, 1 );
	t.equal( block.remove, 1 );
	t.equal( block.insert, 2 );


	items.shuffle( 'splice', 0, 3 );
	flush();
	testContexts();

	t.equal( block.start, 0 );
	t.equal( block.remove, 3 );
	t.equal( block.insert, 0 );

});
