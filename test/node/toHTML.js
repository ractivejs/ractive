var Ractive, renderTests, cheerio, normaliseHTML;

Ractive = require( '../../tmp/ractive' );
renderTests = require( '../samples/render' );
cheerio = require( 'cheerio' );

normaliseHTML = function ( html ) {
	return cheerio.load( html ).html();
};

renderTests.forEach( function ( theTest ) {
	exports[ theTest.name ] = function ( test ) {
		[ false, true ].forEach( function ( magic ) {
			var data, ractive;

			data = typeof theTest.data === 'function' ? theTest.data() : deepClone( theTest.data );

			ractive = new Ractive({
				template: theTest.template,
				data: data,
				partials: theTest.partials,
				magic: magic
			});

			test.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.result ) );

			if ( theTest.new_data ) {
				data = typeof theTest.new_data === 'function' ? theTest.new_data() : deepClone( theTest.new_data );

				ractive.set( data );
				test.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.new_result ) );
			}

			ractive.teardown();
		});

		test.done();
	};
});

/*
exports[ 'select tag renders option selected' ] = function ( test ) { 
	ractive = new Ractive({
				template: '<select value="{{selected}}" data-selected="{{selected}}">{{#items}}<option value="{{.}}">{{.}}</option>{{/}}</select>',
				data: {
					selected: 2,
					items: [1,2,3]
				}
	});

	test.equal( 
		ractive.toHTML() , 
		'<select><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option></select>'
	);

	test.done();
};
*/

function deepClone ( source ) {
	var target, key;

	if ( !source || typeof source !== 'object' ) {
		return source;
	}

	if ( Array.isArray( source ) ) {
		return source.slice();
	}

	target = {};

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = deepClone( source[ key ] );
		}
	}

	return target;
}
