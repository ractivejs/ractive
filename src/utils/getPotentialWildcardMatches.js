var starMaps = {};

// This function takes a keypath such as 'foo.bar.baz', and returns
// all the variants of that keypath that include a wildcard in place
// of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
// These are then checked against the dependants map (ractive.viewmodel.depsMap)
// to see if any pattern observers are downstream of one or more of
// these wildcard keypaths (e.g. 'foo.bar.*.status')
export default function getPotentialWildcardMatches ( keypath ) {
	var keys, starMap, mapper, i, result, wildcardKeypath;

	keys = keypath.split( '.' );
	if( !( starMap = starMaps[ keys.length ]) ) {
		starMap = getStarMap( keys.length );
	}

	result = [];

	mapper = function ( star, i ) {
		return star ? '*' : keys[i];
	};

	i = starMap.length;
	while ( i-- ) {
		wildcardKeypath = starMap[i].map( mapper ).join( '.' );

		if ( !result.hasOwnProperty( wildcardKeypath ) ) {
			result.push( wildcardKeypath );
			result[ wildcardKeypath ] = true;
		}
	}

	return result;
}

// This function returns all the possible true/false combinations for
// a given number - e.g. for two, the possible combinations are
// [ true, true ], [ true, false ], [ false, true ], [ false, false ].
// It does so by getting all the binary values between 0 and e.g. 11
function getStarMap ( num ) {
	var ones = '', max, binary, starMap, mapper, i;

	if ( !starMaps[ num ] ) {
		starMap = [];

		while ( ones.length < num ) {
			ones += 1;
		}

		max = parseInt( ones, 2 );

		mapper = function ( digit ) {
			return digit === '1';
		};

		for ( i = 0; i <= max; i += 1 ) {
			binary = i.toString( 2 );
			while ( binary.length < num ) {
				binary = '0' + binary;
			}

			starMap[i] = Array.prototype.map.call( binary, mapper );
		}

		starMaps[ num ] = starMap;
	}

	return starMaps[ num ];
}



