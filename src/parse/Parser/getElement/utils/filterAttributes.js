define([
	'utils/isArray'
], function (
	isArray
) {

	'use strict';

	return function ( items ) {
		var attrs, proxies, filtered, i, len, item;

		filtered = {};
		attrs = [];
		proxies = [];

		len = items.length;
		for ( i=0; i<len; i+=1 ) {
			item = items[i];

			// Transition?
			if ( item.name === 'intro' ) {
				if ( filtered.intro ) {
					throw new Error( 'An element can only have one intro transition' );
				}

				filtered.intro = item;
			} else if ( item.name === 'outro' ) {
				if ( filtered.outro ) {
					throw new Error( 'An element can only have one outro transition' );
				}

				filtered.outro = item;
			} else if ( item.name === 'intro-outro' ) {
				if ( filtered.intro || filtered.outro ) {
					throw new Error( 'An element can only have one intro and one outro transition' );
				}

				filtered.intro = item;
				filtered.outro = deepClone( item );
			}

			// Proxy?
			else if ( item.name.substr( 0, 6 ) === 'proxy-' ) {
				item.name = item.name.substring( 6 );
				proxies.push( item );
			}

			else if ( item.name.substr( 0, 3 ) === 'on-' ) {
				item.name = item.name.substring( 3 );
				proxies.push( item );
			}

			// Decorator?
			else if ( item.name === 'decorator' ) {
				filtered.decorator = item;
			}

			// Attribute?
			else {
				attrs.push( item );
			}
		}

		filtered.attrs = attrs;
		filtered.proxies = proxies;

		return filtered;
	};

	function deepClone ( obj ) {
		var result, key;

		if ( typeof obj !== 'object' ) {
			return obj;
		}

		if ( isArray( obj ) ) {
			return obj.map( deepClone );
		}

		result = {};
		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				result[ key ] = deepClone( obj[ key ] );
			}
		}

		return result;
	}

});
