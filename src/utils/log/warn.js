/* global console */
import { hasConsole } from 'config/environment';
import noop from 'utils/noop';

var warn, warned = {};

if ( hasConsole ) {
	warn = function ( message, allowDuplicates ) {
		if ( !allowDuplicates ) {
			if ( warned[ message ] ) {
				return;
			}

			warned[ message ] = true;
		}

		console.warn( '%cRactive.js: %c' + message, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);' );
	};
} else {
	warn = noop;
}

export default warn;
