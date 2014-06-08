import isArray from 'utils/isArray';
import isBoolean from 'utils/isBoolean';
import isDate from 'utils/isDate';
import isNumber from 'utils/isNumber';
import isRegExp from 'utils/isRegExp';
import isString from 'utils/isString';

export default function ( source ) {
	var target, key;

	if ( !source || isBoolean( source ) || isNumber( source ) || isString( source ) ) {
		return source;
	}

	if ( isArray( source ) ) {
		return source.slice();
	}

	if ( isDate( source ) ) {
		return new Date( source );
	}

	if ( isRegExp( source ) ) {
		return new RegExp( source );
	}

	target = {};

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = source[ key ];
		}
	}

	return target;
}
