import { test } from 'qunit';
import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'methods/observeList.js' );

	test( 'List observers report array modifications', t => {
		let shuffle;

		const ractive = new Ractive({
			data: { fruits: [ 'apple', 'orange', 'banana' ] },
			oninit () {
				this.observeList( 'fruits', ( shfl ) => {
					shuffle = shfl;
				});
			}
		});

		t.deepEqual( shuffle.inserted, [ 'apple', 'orange', 'banana' ] );
		t.deepEqual( shuffle.deleted, [] );
		t.ok( !shuffle.start );

		ractive.splice( 'fruits', 1, 2, 'pear' );

		t.deepEqual( shuffle.inserted, [ 'pear' ] );
		t.deepEqual( shuffle.deleted, [ 'orange', 'banana' ] );
		t.equal( shuffle.start, 1 );
	});

	test( 'List observers correctly report value change on no init', t => {
		let shuffle;

		const ractive = new Ractive({
			data: { fruits: [ 'apple', 'orange', 'banana' ] },
			oninit () {
				this.observeList( 'fruits', ( shfl ) => {
					shuffle = shfl;
				}, { init: false } );
			}
		});

		ractive.splice( 'fruits', 1, 2, 'pear' );

		t.deepEqual( shuffle.inserted, [ 'pear' ] );
		t.deepEqual( shuffle.deleted, [ 'orange', 'banana' ] );
		t.equal( shuffle.start, 1 );
	});

	test( 'List observers report full array value changes as inserted/deleted', t => {
		let shuffle;

		const ractive = new Ractive({
			data: { fruits: [ 'apple', 'orange', 'banana' ] },
			oninit () {
				this.observeList( 'fruits', ( shfl ) => {
					shuffle = shfl;
				}, { init: false } );
			}
		});

		ractive.set( 'fruits', [ 'pear', 'mango' ] );

		t.deepEqual( shuffle.inserted, [ 'pear', 'mango' ] );
		t.deepEqual( shuffle.deleted, [ 'apple', 'orange', 'banana' ] );
	});

	test( 'Pattern observers on arrays fire correctly after mutations', t => {
		const ractive = new Ractive({
			data: {
				items: [ 'a', 'b', 'c' ]
			}
		});

		let index;
		let deleted;
		let inserted;

		ractive.observeList( 'items', shuffle => {
			index = shuffle.start;
			inserted = shuffle.inserted;
			deleted = shuffle.deleted;
		}, { init: false });

		ractive.push( 'items', 'd' );
		t.equal( index, '3' );
		t.equal( deleted[0], undefined );
		t.equal( inserted[0], 'd' );

		ractive.pop( 'items' );
		t.equal( index, '3' );
		t.equal( inserted[0], undefined );
		t.equal( deleted[0], 'd' );
	});
}
