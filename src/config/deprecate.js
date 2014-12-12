import warn from 'utils/log/warn';
import { isArray } from 'utils/is';

function deprecate ( options, deprecated, correct ) {

	if ( deprecated in options ) {

		if( !( correct in options ) ) {

			warn( getMessage( deprecated, correct ) );

			options[ correct ] = options[ deprecated ];

		}
		else {

			throw new Error( getMessage( deprecated, correct, true ) );

		}

	}
}

function getMessage( deprecated, correct, isError ) {
	return 'options.' + deprecated + ' has been deprecated in favour of options.' + correct + '.'
		+ ( isError ? ' You cannot specify both options, please use options.' + correct + '.' : '' );
}


function deprecateEventDefinitions ( options ) {

	deprecate( options, 'eventDefinitions', 'events' );
}

function deprecateAdaptors ( options ) {

	// Using extend with Component instead of options,
	// like Human.extend( Spider ) means adaptors as a registry
	// gets copied to options. So we have to check if actually an array
	if ( isArray( options.adaptors ) ) {

		deprecate( options, 'adaptors', 'adapt' );

	}

}

export default function deprecateOptions ( options ) {
	deprecate( options, 'beforeInit', 'onconstruct' );
	deprecate( options, 'init', 'onrender' );
	deprecate( options, 'complete', 'oncomplete' );
	deprecateEventDefinitions( options );
	deprecateAdaptors( options );
}
