var prefixers = {};

export default function Viewmodel$adapt ( keypath, value ) {
	var len, i, adaptor, wrapped;

	if ( !this.adaptors ) return;

	// Do we have an adaptor for this value?
	len = this.adaptors.length;
	for ( i = 0; i < len; i += 1 ) {
		adaptor = this.adaptors[i];

		if ( adaptor.filter( value, keypath, this.ractive ) ) {
			wrapped = this.wrapped[ keypath ] = adaptor.wrap( this.ractive, value, keypath, getPrefixer( keypath ) );
			wrapped.value = value;
			return;
		}
	}
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
