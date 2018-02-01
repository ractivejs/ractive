import { win, doc, vendors } from './environment';

export let visible;
let hidden = 'hidden';

if ( doc ) {
	let prefix;

	/* istanbul ignore next */
	if ( hidden in doc ) {
		prefix = '';
	} else {
		let i = vendors.length;
		while ( i-- ) {
			const vendor = vendors[i];
			hidden = vendor + 'Hidden';

			if ( hidden in doc ) {
				prefix = vendor;
				break;
			}
		}
	}

	/* istanbul ignore else */
	if ( prefix !== undefined ) {
		doc.addEventListener( prefix + 'visibilitychange', onChange );
		onChange();
	} else {
		// gah, we're in an old browser
		if ( 'onfocusout' in doc ) {
			doc.addEventListener( 'focusout', onHide );
			doc.addEventListener( 'focusin', onShow );
		}

		else {
			win.addEventListener( 'pagehide', onHide );
			win.addEventListener( 'blur', onHide );

			win.addEventListener( 'pageshow', onShow );
			win.addEventListener( 'focus', onShow );
		}

		visible = true; // until proven otherwise. Not ideal but hey
	}
}

function onChange () {
	visible = !doc[ hidden ];
}

/* istanbul ignore next */
function onHide () {
	visible = false;
}

/* istanbul ignore next */
function onShow () {
	visible = true;
}
