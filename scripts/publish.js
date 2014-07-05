#!/usr/bin/env node

var exec = require( 'exec-sync' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	version = require( '../package.json' ).version,
	templates = {},
	dummyPackage = fs.readFileSync( __dirname + '/dummy-package.json' ).toString(),
	dummyBower = fs.readFileSync( __dirname + '/dummy-bower.json' ).toString(),
	command;

templates = {
	pkg: fs.readFileSync( __dirname + '/templates/package.json' ).toString(),
	bower: fs.readFileSync( __dirname + '/templates/bower.json' ).toString(),
	deploy: fs.readFileSync( __dirname + '/templates/deploy.sh' ).toString()
}

// Create temporary package.json and bower.json files
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'package.json' ), replace( templates.pkg ) );
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'bower.json' ), replace( templates.bower ) );
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'deploy.sh' ), replace( templates.deploy ) );


// Execute script
var deploy = require( 'child_process' ).spawn( 'sh',
	[ path.join( __dirname, '..', 'tmp', 'deploy.sh' ) ],
	{
		cwd: path.join( __dirname, '..' ),
		stdio: 'inherit'
	});

deploy.on( 'exit', function () {
	console.log( 'Finished publishing' );
});

function replace ( str ) {
	return str.replace( /\$\{VERSION\}/g, version );
}
