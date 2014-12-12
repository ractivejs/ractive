var fs = require( 'fs' ),
	path = require( 'path' ),
	crc32 = require( 'buffer-crc32' ),
	sander = require( '../' );

sander.rimrafSync( __dirname, 'output' );

tests = [
	{
		name: 'copydir',
		test: function () {
			return sander.copydir( __dirname, 'input', 'dir' ).to( __dirname, 'output', '1' ).then( function () {
				checkEquality([ __dirname, 'input', 'dir' ], [ __dirname, 'output', '1' ]);
			});
		}
	}
];

runNextTest();

function runNextTest () {
	var test = tests.shift(),
		promise;

	if ( !test ) {
		console.log( 'done' );
		return;
	}

	promise = test.test();

	if ( promise && typeof promise.then === 'function' ) {
		promise.then( runNextTest ).catch( function ( err ) {
			setTimeout( function () {
				throw err;
			});
		});
	} else {
		runNextTest();
	}
}

function checkEquality ( a, b ) {
	var statsA, statsB, filesA, filesB, crcA, crcB;

	a = path.resolve.apply( null, a );
	b = path.resolve.apply( null, b );

	statsA = fs.statSync( a );
	statsB = fs.statSync( b );

	if ( statsA.isDirectory() ) {
		if ( !statsB.isDirectory() ) {
			throw new Error( a + ' is a directory but ' + b + ' is not' );
		}

		filesA = fs.readdirSync( a );
		filesB = fs.readdirSync( b );

		if ( !compareArrays( filesA, filesB ) ) {
			throw new Error( 'Directory contents differ: ' + a + ', ' + b );
		}

		i = filesA.length;
		while ( i-- ) {
			checkEquality([ a, filesA[i] ], [ b, filesB[i] ]);
		}
	}

	else {
		crcA = crc32( fs.readFileSync( a ) );
		crcB = crc32( fs.readFileSync( b ) );

		if ( crcA.toString() !== crcB.toString() ) {
			throw new Error( 'File contents differ' );
		}
	}
}

function compareArrays ( a, b ) {
	var i = a.length;

	if ( b.length !== i ) {
		return false;
	}

	a.sort();
	b.sort();

	while ( i-- ) {
		if ( a[i] !== b[i] ) {
			return false;
		}
	}

	return true;
}
