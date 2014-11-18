import hasConsole from 'utils/log/hasConsole';

/* global console */
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
	warn = function () {};
}

export default warn;
