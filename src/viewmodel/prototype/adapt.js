import config from 'config/config';
import arrayAdaptor from 'viewmodel/prototype/get/arrayAdaptor';
import log from 'utils/log';
import magicAdaptor from 'viewmodel/prototype/get/magicAdaptor';
import magicArrayAdaptor from 'viewmodel/prototype/get/magicArrayAdaptor';

var prefixers = {};

export default function Viewmodel$adapt ( keypath, value ) {
	var ractive = this.ractive, len, i, adaptor, wrapped;

	// Do we have an adaptor for this value?
	len = ractive.adapt.length;
	for ( i = 0; i < len; i += 1 ) {
		adaptor = ractive.adapt[i];

		// Adaptors can be specified as e.g. [ 'Backbone.Model', 'Backbone.Collection' ] -
		// we need to get the actual adaptor if that's the case
		if ( typeof adaptor === 'string' ) {
			let found = config.registries.adaptors.find( ractive, adaptor );

			if ( !found ) {
				// will throw. "return" for safety, if we downgrade :)
				return log.critical({
					debug: ractive.debug,
					message: 'missingPlugin',
					args: {
						plugin: 'adaptor',
						name: adaptor
					}
				});
			}

			adaptor = ractive.adapt[i] = found;
		}

		if ( adaptor.filter( value, keypath, ractive ) ) {
			wrapped = this.wrapped[ keypath ] = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
			wrapped.value = value;
			return value;
		}
	}

	if ( ractive.magic ) {
		if ( magicArrayAdaptor.filter( value, keypath, ractive ) ) {
			this.wrapped[ keypath ] = magicArrayAdaptor.wrap( ractive, value, keypath );
		}

		else if ( magicAdaptor.filter( value, keypath, ractive ) ) {
			this.wrapped[ keypath ] = magicAdaptor.wrap( ractive, value, keypath );
		}
	}

	else if ( ractive.modifyArrays && arrayAdaptor.filter( value, keypath, ractive ) ) {
		this.wrapped[ keypath ] = arrayAdaptor.wrap( ractive, value, keypath );
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
