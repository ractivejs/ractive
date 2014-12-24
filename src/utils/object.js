import { isClient } from 'config/environment';
import { createElement } from 'utils/dom';
import 'legacy';

var create, defineProperty, defineProperties;

try {
	Object.defineProperty({}, 'test', { value: 0 });

	if ( isClient ) {
		Object.defineProperty( document.createElement( 'div' ), 'test', { value: 0 });
	}

	defineProperty = Object.defineProperty;
} catch ( err ) {
	// Object.defineProperty doesn't exist, or we're in IE8 where you can
	// only use it with DOM objects (what were you smoking, MSFT?)
	defineProperty = function ( obj, prop, desc ) {
		obj[ prop ] = desc.value;
	};
}

try {
	try {
		Object.defineProperties({}, { test: { value: 0 } });
	} catch ( err ) {
		// TODO how do we account for this? noMagic = true;
		throw err;
	}

	if ( isClient ) {
		Object.defineProperties( createElement( 'div' ), { test: { value: 0 } });
	}

	defineProperties = Object.defineProperties;
} catch ( err ) {
	defineProperties = function ( obj, props ) {
		var prop;

		for ( prop in props ) {
			if ( props.hasOwnProperty( prop ) ) {
				defineProperty( obj, prop, props[ prop ] );
			}
		}
	};
}

try {
	Object.create( null );

	create = Object.create;
} catch ( err ) {
	// sigh
	create = (function () {
		var F = function () {};

		return function ( proto, props ) {
			var obj;

			if ( proto === null ) {
				return {};
			}

			F.prototype = proto;
			obj = new F();

			if ( props ) {
				Object.defineProperties( obj, props );
			}

			return obj;
		};
	}());
}

export { create, defineProperty, defineProperties };

export function extend ( target, ...sources ) {
	var prop, source;

	while ( source = sources.shift() ) {
		for ( prop in source ) {
			if ( source.hasOwnProperty ( prop ) ) {
				target[ prop ] = source[ prop ];
			}
		}
	}

	return target;
}

export function fillGaps ( target, ...sources ) {
	sources.forEach( s => {
		for ( let key in s ) {
			if ( s.hasOwnProperty( key ) && !( key in target ) ) {
				target[ key ] = s[ key ];
			}
		}
	});

	return target;
}

export var hasOwn = Object.prototype.hasOwnProperty;
