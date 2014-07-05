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
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'package.json' ), templates.pkg.replace( '${VERSION}', version ) );
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'bower.json' ), templates.pkg.replace( '${VERSION}', version ) );
fs.writeFileSync( path.join( __dirname, '..', 'tmp', 'deploy.sh' ), templates.deploy.replace( '${VERSION}', version ) );


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


command = [
	'cd build-branch',

	'git add -A',
	'git commit -m "' + version + ' release"',
	'git push',
	// 'git tag -a v' + version + ' -m "version ' + version + '"',
	// 'git push origin v' + version,

	//'npm publish'
].join( '; ' );

//exec( command );
