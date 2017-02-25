const path = require( 'path' );
const fs = require( 'fs' );

function stat ( file ) {
	try {
		return fs.statSync( file );
	} catch ( e ) {}
}

function readToString ( stream ) {
	return new Promise( ( ok, fail ) => {
		const data = [];
		stream.on( 'data', chunk => data.push( chunk ) );
		stream.on( 'end', () => ok( Buffer.concat( data ).toString( 'utf8' ) ) );
		stream.on( 'error', fail );
	});
}

function reducePromiseFunctions ( fnList, init ) {
	if ( !fnList || !fnList.length ) return Promise.resolve( init );
	const fns = fnList.slice();
	let res = init;

	return new Promise(( done, fail ) => {
		function step () {
			const fn = fns.shift();
			if ( !fn ) done( res );
			else {
				Promise.resolve( Promise.resolve( fn( res ) ).then( r => {
					res = r;
					step();
				}, fail ) );
			}
		}
		step();
	});
}

// find Ractive
const basePath = path.resolve( path.dirname( fs.realpathSync( __filename ) ) );
const devFile = path.resolve( basePath, '../.build/ractive.js' );
const modFile = path.resolve( basePath, '../ractive.js' );
const Ractive = require( stat( modFile ) ? modFile : devFile );

function writeToStream ( stream, string ) {
	return new Promise ( ok => {
		stream.on( 'drain', ok );
		stream.write( string, 'utf8' );
	});
}

module.exports = { Ractive, stat, readToString, writeToStream, reducePromiseFunctions };
