import { fillGaps } from 'utils/object';

export default function ( params, defaults ) {
	if ( typeof params === 'number' ) {
		params = { duration: params };
	}

	else if ( typeof params === 'string' ) {
		if ( params === 'slow' ) {
			params = { duration: 600 };
		} else if ( params === 'fast' ) {
			params = { duration: 200 };
		} else {
			params = { duration: 400 };
		}
	} else if ( !params ) {
		params = {};
	}

	return fillGaps( {}, params, defaults );
}
