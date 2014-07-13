#!/usr/bin/env node

var exec = require( 'exec-sync' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	version = require( '../package.json' ).version,
	templates = {},
	task;

templates = {
	pkg: fs.readFileSync( __dirname + '/templates/package.json' ).toString(),
	bower: fs.readFileSync( __dirname + '/templates/bower.json' ).toString(),
	component: fs.readFileSync( __dirname + '/templates/component.json' ).toString(),
	releaseScript: fs.readFileSync( __dirname + '/templates/release.sh' ).toString()
}

// Create temporary package.json and bower.json files
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'package.json' ), replace( templates.pkg ) );
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'bower.json' ), replace( templates.bower ) );
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'component.json' ), replace( templates.component ) );
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'release.sh' ), replace( templates.releaseScript ) );


// Execute script
task = require( 'child_process' ).spawn( 'sh',
	[ path.join( __dirname, '..', 'tmp', 'release.sh' ) ],
	{
		cwd: path.join( __dirname, '..' ),
		stdio: 'inherit'
	});

task.on( 'exit', function () {
	console.log( 'Finished publishing' );
});

function replace ( str ) {
	return str.replace( /\$\{VERSION\}/g, version );
}
