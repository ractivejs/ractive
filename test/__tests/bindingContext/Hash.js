// import RootContext from 'viewmodel/context/RootContext';
//
// var root, items, block, hash, indices, keys,
// 	static0, static2, dep0, dep2;
//
// function flush () {
// 	root.notify( 'default' );
// }
//
// class Dependent {
// 	setValue ( value ) {
// 		this.value = value;
// 	}
// }
//
// class Block {
//
// 	setMembers( members ) {
// 		this.contexts = members;
// 	}
//
// 	updateMembers( splice ) {
// 		this.start = splice.start;
// 		this.remove = splice.remove;
// 		this.insert = splice.insert;
// 	}
//
// }
//
// module( 'Reference', {
// 	setup: () => {
// 		root = new Root( { changes: [] }, {} );
// 		items = root.join( 'items' );
//
// 		block = new Block();
// 		items.listRegister( block );
//
// 		hash = { a: 'A', b: 'B', c: 'C' };
// 		items.set( hash );
// 		flush();
//
// 		// simulate dependant registrations
// 		keys = items.members.map( m => createDependent( m, '@key' ) );
// 		indices = items.members.map( m => createDependent( m, '@index' ) );
// 		// static0 = items.join('0');
// 		// static2 = items.join('2');
// 		// static0.register( dep0 = new Dependent() );
// 		// static2.register( dep2 = new Dependent() );
// 		flush();
// 	}
// });
//
// function createDependent ( member, key ) {
// 	var dependent = new Dependent();
// 	member.join( key ).register( dependent );
// 	return dependent;
// }
//
// function testContexts () {
// 	var i, contexts = block.contexts, context, hashKeys = Object.keys(hash);
//
// 	equal( contexts, items.members, 'contexts is items.members' );
// 	equal( contexts.length, hashKeys.length, 'contexts has same length as value hash' );
//
// 	for( i = 0; i < contexts.length; i++ ) {
// 		context = contexts[i];
// 		equal( context.get(), hash[ hashKeys[i] ], 'context has correct value' );
// 		equal( indices[i].value, i, 'context has correct @index' );
// 		equal( keys[i].value, hashKeys[i], 'context has correct @key' );
// 	}
//
// 	// equal( dep0.value, hash[ hashKeys[0] ], 'static dependent 0 has hash value ' );
// 	// equal( dep2.value, hash[ hashKeys[2] ], 'static dependent 2 has hash value ' );
// }
//
// test( 'set new object updates members', t => {
//
// 	testContexts();
//
// 	items.set( hash = { d: 'D', e: 'E', f: 'F' } );
// 	flush();
// 	testContexts();
//
// 	items.set( hash = { g: 'G', h: 'H' } );
// 	flush();
//
// 	// simulate last dependant going away
// 	indices.length = 2;
// 	keys.length = 2;
//
// 	testContexts();
//
// 	items.set( hash = { i: 'I', j: 'J', k: 'K', l: 'L' } );
//
// 	// simulate new bindings against last two new items
// 	indices[2] = createDependent( items.members[2], '@index' );
// 	keys[2] = createDependent( items.members[2], '@key' );
// 	indices[3] = createDependent( items.members[3], '@index' );
// 	keys[3] = createDependent( items.members[3], '@key' );
//
// 	flush();
// 	testContexts();
//
// });
//
// test( 'add new property adds to members', t => {
//
// 	var context = items.join( 'd' );
// 	context.set( 'D' );
//
// 	// simulate new bindings
// 	indices[3] = createDependent( items.members[3], '@index' );
// 	keys[3] = createDependent( items.members[3], '@key' );
// 	flush();
//
// 	testContexts();
// });
//
// test( 'delete of property and mark() updates members', t => {
//
// 	var hash = items.get();
// 	delete hash.b;
// 	items.mark();
//
// 	// simulate binding changes
// 	indices.pop();
// 	keys.pop();
//
// 	flush();
// 	testContexts();
// });
//
// /*
// test( 'splice shuffle', t => {
//
// 	items.shuffle( 'splice', 1, 1, 'd', 'e' );
// 	indices = [
// 		indices[0],
// 		createDependent( items.members[1], '@index' ),
// 		createDependent( items.members[2], '@index' ),
// 		indices[2]
// 	];
// 	aliasIndices = [
// 		aliasIndices[0],
// 		createDependent( items.members[1], 'i' ),
// 		createDependent( items.members[2], 'i' ),
// 		aliasIndices[2]
// 	];
// 	keys = [
// 		keys[0],
// 		createDependent( items.members[1], '@key' ),
// 		createDependent( items.members[2], '@key' ),
// 		keys[2]
// 	];
// 	aliasKeys = [
// 		aliasKeys[0],
// 		createDependent( items.members[1], 'k' ),
// 		createDependent( items.members[2], 'k' ),
// 		aliasKeys[2]
// 	];
// 	flush();
//
// 	testContexts();
// 	t.equal( block.start, 1 );
// 	t.equal( block.remove, 1 );
// 	t.equal( block.insert, 2 );
//
//
// 	items.shuffle( 'splice', 0, 3 );
// 	flush();
// 	testContexts();
//
// 	t.equal( block.start, 0 );
// 	t.equal( block.remove, 3 );
// 	t.equal( block.insert, 0 );
//
// });
// */
