import { vendors } from 'config/environment';

export let visible;
let hidden = 'hidden';

if ( typeof document !== 'undefined' ) {
	let prefix;

	if ( hidden in document ) {
		prefix = '';
	} else {
		let i = vendors.length;
		while ( i-- ) {
			const vendor = vendors[i];
			hidden = vendor + 'Hidden';

			if ( hidden in document ) {
				prefix = vendor;
				document.addEventListener( prefix + 'visibilitychange', onChange );
				onChange();

				break;
			}
		}
	}

	if ( prefix === undefined ) {
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

        visible = true; // until proven otherwise. Not ideal but hey
    }
}

function onChange () {
	visible = !document[ hidden ];
}

function onHide () {
	visible = false;
}

function onShow () {
	visible = true;
}
