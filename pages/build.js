/* Anglebars examples build script */
/*global require, process */

var fs, srcFolder, result, remainingFolders, processFolder;

fs = require( 'fs' );
srcFolder = process.cwd() + '/examples/src';
result = [];

processFolder = function ( folder ) {
	var example, remainingFiles, exampleFolder, index, slug, title, check;

	index = +( folder.substr( 0, folder.indexOf( '.' ) ) ) - 1;
	title = folder.substring( folder.indexOf( '.' ) + 2 );
	slug = title.toLowerCase().replace( /[^a-z ]/g, '' ).replace( / /g, '-' );

	check = function () {
		if ( --remainingFiles ) {
			return;
		}

		result[ index ] = example;

		if ( --remainingFolders ) {
			return;
		}

		fs.writeFile( process.cwd() + '/examples/examples.json', JSON.stringify( result ) );
	};

	example = {
		title: title,
		slug: slug
	};

	remainingFiles = 4;
	exampleFolder = srcFolder + '/' + folder;

	fs.readFile( exampleFolder + '/setup.js', function ( err, data ) {
		example.setup = data.toString();
		check();
	});

	fs.readFile( exampleFolder + '/example.js', function ( err, data ) {
		example.example = data.toString();
		check();
	});

	fs.readFile( exampleFolder + '/template.html', function ( err, data ) {
		example.template = data.toString();
		check();
	});

	fs.readFile( exampleFolder + '/notes.html', function ( err, data ) {
		example.notes = data.toString();
		check();
	});
};

fs.readdir( srcFolder, function ( err, folders ) {
	var i, numFolders, result;

	remainingFolders = numFolders = folders.length;
	for ( i=0; i<numFolders; i+=1 ) {
		processFolder( folders[i] );
	}
});

