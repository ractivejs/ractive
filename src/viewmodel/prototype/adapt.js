var prefixers = {};

export default function Viewmodel$adapt ( keypath, value ) {
	var ractive = this.ractive, len, i, adaptor, wrapped;

	// Do we have an adaptor for this value?
	len = ractive.adapt.length;
	for ( i = 0; i < len; i += 1 ) {
		adaptor = ractive.adapt[i];

		if ( adaptor.filter( value, keypath, ractive ) ) {
			wrapped = this.wrapped[ keypath ] = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
			wrapped.value = value;
			return value;
		}
	}

	return value;
}

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

function getPrefixer ( rootKeypath ) {
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
