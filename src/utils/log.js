/* global console */
import { hasConsole } from 'config/environment';
import noop from 'utils/noop';

var alreadyWarned = {}, log, printWarning;

if ( hasConsole ) {
	printWarning = ( message, args ) => {
		console.warn.apply( console, [ '%cRactive.js: %c' + message, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);' ].concat( args ) );
	};

	log = function () {
		console.log.apply( console, arguments );
	};
} else {
	printWarning = log = noop;
}

function format ( message, args ) {
	return message.replace( /%s/g, () => args.shift() );
}

export function consoleError ( err ) {
	if ( hasConsole ) {
		console.error( err );
	} else {
		throw err;
	}
}

export function fatal ( message, ...args ) {
	message = format( message, args );
	throw new Error( message );
}

export { log };

export function warn ( message, ...args ) {
	message = format( message, args );
	printWarning( message, args );
}

export function warnOnce ( message, ...args ) {
	message = format( message, args );

	if ( alreadyWarned[ message ] ) {
		return;
	}

	alreadyWarned[ message ] = true;
	printWarning( message, args );
}