import { vendors } from 'config/environment';

var hidden, vendor, prefix, i, visibility;

if ( typeof document !== 'undefined' ) {
	hidden = 'hidden';

	visibility = {};

	if ( hidden in document ) {
		prefix = '';
	} else {
		i = vendors.length;
		while ( i-- ) {
			vendor = vendors[i];
			hidden = vendor + 'Hidden';

			if ( hidden in document ) {
				prefix = vendor;
			}
		}
	}

	if ( prefix !== undefined ) {
		document.addEventListener( prefix + 'visibilitychange', onChange );

		// initialise
		onChange();
	}

	else {
        // gah, we're in an old browser
        if ( 'onfocusout' in document ) {
        	document.addEventListener( 'focusout', onHide );
        	document.addEventListener( 'focusin', onShow );
        }

        else {
        	window.addEventListener( 'pagehide', onHide );
        	window.addEventListener( 'blur', onHide );

        	window.addEventListener( 'pageshow', onShow );
        	window.addEventListener( 'focus', onShow );
        }

        visibility.hidden = false; // until proven otherwise. Not ideal but hey
    }
}

function onChange () {
	visibility.hidden = document[ hidden ];
}

function onHide () {
	visibility.hidden = true;
}

function onShow () {
	visibility.hidden = false;
}

export default visibility;
