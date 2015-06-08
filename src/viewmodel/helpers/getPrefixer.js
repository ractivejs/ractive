let prefixers = {};

function prefixKeypath ( obj, prefix ) {
	var prefixed = {}, key;

	if ( !prefix ) {
		return obj;
	}

	prefix += '.';

	for ( key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			prefixed[ prefix + key ] = obj[ key ];
		}
	}

	return prefixed;
}

export default function getPrefixer ( rootKeypath ) {
	var rootDot;

	if ( !prefixers[ rootKeypath ] ) {
		rootDot = rootKeypath ? rootKeypath + '.' : '';

		prefixers[ rootKeypath ] = function ( relativeKeypath, value ) {
			var obj;

			if ( typeof relativeKeypath === 'string' ) {
				obj = {};
				obj[ rootDot + relativeKeypath ] = value;
				return obj;
			}

			if ( typeof relativeKeypath === 'object' ) {
				// 'relativeKeypath' is in fact a hash, not a keypath
				return rootDot ? prefixKeypath( relativeKeypath, rootKeypath ) : relativeKeypath;
			}
		};
	}

	return prefixers[ rootKeypath ];
}
