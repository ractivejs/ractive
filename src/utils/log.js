/* global console */
import { hasConsole } from 'config/environment';
import Ractive from 'Ractive';
import noop from 'utils/noop';

var alreadyWarned = {}, log, printWarning, welcome;

if ( hasConsole ) {
	let welcomeMessage = `You're running Ractive <@version@> in debug mode - messages will be printed to the console to help you find problems and optimise your application.

To disable debug mode, add this line at the start of your app:
  Ractive.DEBUG = false;

To disable debug mode when your app is minified, add this snippet:
  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});

Get help and support:
  http://docs.ractivejs.org
  http://stackoverflow.com/questions/tagged/ractivejs
  http://groups.google.com/forum/#!forum/ractive-js
  http://twitter.com/ractivejs

Found a bug? Raise an issue:
  https://github.com/ractivejs/ractive/issues

`;

	welcome = () => {
		console.log.apply( console, [ '%cRactive.js: %c' + welcomeMessage, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);' ] );
		welcome = noop;
	};

	printWarning = ( message, args ) => {
		welcome();
		console.warn.apply( console, [ '%cRactive.js: %c' + message, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);' ].concat( args ) );
	};

	log = function () {
		console.log.apply( console, arguments );
	};
} else {
	printWarning = log = welcome = noop;
}

function format ( message, args ) {
	return message.replace( /%s/g, () => args.shift() );
}

function consoleError ( err ) {
	if ( hasConsole ) {
		console.error( err );
	} else {
		throw err;
	}
}

function fatal ( message, ...args ) {
	message = format( message, args );
	throw new Error( message );
}

function logIfDebug () {
	if ( Ractive.DEBUG ) {
		log.apply( null, arguments );
	}
}

function warn ( message, ...args ) {
	message = format( message, args );
	printWarning( message, args );
}

function warnOnce ( message, ...args ) {
	message = format( message, args );

	if ( alreadyWarned[ message ] ) {
		return;
	}

	alreadyWarned[ message ] = true;
	printWarning( message, args );
}

function warnIfDebug () {
	if ( Ractive.DEBUG ) {
		warn.apply( null, arguments );
	}
}

function warnOnceIfDebug () {
	if ( Ractive.DEBUG ) {
		warnOnce.apply( null, arguments );
	}
}

export { consoleError, fatal, log, logIfDebug, warn, warnOnce, warnIfDebug, warnOnceIfDebug, welcome };
