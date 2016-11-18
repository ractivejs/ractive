import '../legacy';
import { doc } from '../config/environment';
import { createElement } from './dom';

let create, defineProperty, defineProperties;

try {
	Object.defineProperty({}, 'test', { get() {}, set() {} });

	if ( doc ) {
		Object.defineProperty( createElement( 'div' ), 'test', { value: 0 });
	}

	defineProperty = Object.defineProperty;
} catch ( err ) {
	// Object.defineProperty doesn't exist, or we're in IE8 where you can
	// only use it with DOM objects (what were you smoking, MSFT?)
	defineProperty = function ( obj, prop, desc ) {
		if ( desc.get ) obj[ prop ] = desc.get();
		else obj[ prop ] = desc.value;
	};
}

try {
	try {
		Object.defineProperties({}, { test: { value: 0 } });
	} catch ( err ) {
		// TODO how do we account for this? noMagic = true;
		throw err;
	}

	if ( doc ) {
		Object.defineProperties( createElement( 'div' ), { test: { value: 0 } });
	}

	defineProperties = Object.defineProperties;
} catch ( err ) {
	defineProperties = function ( obj, props ) {
		let prop;

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
		const F = function () {};

		return function ( proto, props ) {
			if ( proto === null ) {
				return {};
			}

			F.prototype = proto;
			const obj = new F();

			if ( props ) {
				Object.defineProperties( obj, props );
			}

			return obj;
		};
	}());
}

export { create, defineProperty, defineProperties };

export function extend ( target, ...sources ) {
	let prop;

	sources.forEach( source => {
		for ( prop in source ) {
			if ( hasOwn.call( source, prop ) ) {
				target[ prop ] = source[ prop ];
			}
		}
	});

	return target;
}

export function fillGaps ( target, ...sources ) {
	sources.forEach( s => {
		for ( const key in s ) {
			if ( hasOwn.call( s, key ) && !( key in target ) ) {
				target[ key ] = s[ key ];
			}
		}
	});

	return target;
}

export const hasOwn = Object.prototype.hasOwnProperty;

export function toPairs ( obj = {} ) {
	const res = [];
	for ( const k in obj ) {
		if ( hasOwn.call( obj, k ) ) res.push( [ k, obj[k] ] );
	}
	return res;
}
