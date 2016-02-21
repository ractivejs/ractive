/* global console */
import { hasConsole } from '../config/environment';
import Ractive from '../Ractive';
import noop from './noop';

const messagesAlreadyWarned = {};

function format ( message, args ) {
	return message.replace( /%s/g, () => args.shift() );
}

// printWarning and printLog are custom implementations of console.warn and
// console.log. Should any modifications be done, they're the ones you should
// be modifying.

function printWarning ( message, args ) {

	// extract information about the instance this message pertains to, if applicable
	if ( typeof args[ args.length - 1 ] === 'object' ) {
		let options = args.pop();
		let ractive = options ? options.ractive : null;

		if ( ractive ) {
			// if this is an instance of a component that we know the name of, add
			// it to the message
			let name;
			if ( ractive.component && ( name = ractive.component.name ) ) {
				message = `<${name}> ${message}`;
			}

			let node;
			if ( node = ( options.node || ( ractive.fragment && ractive.fragment.rendered && ractive.find( '*' ) ) ) ) {
				args.push( node );
			}
		}
	}

	console.warn( `%cRactive.js:\n%c${message}`, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);', ...args );
}

function printLog ( message, args ){
	console.log( `%cRactive.js:\n%c${message}`, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);', ...args );
}

// The public APIs of this module.

function log ( message, ...args ) {
	message = format( message, args );
	printLog( message, args );
}

function logIfDebug () {
	if ( !Ractive.DEBUG ) return;
	log( ...arguments );
}

function warn ( message, ...args ) {
	message = format( message, args );
	printWarning( message, args );
}

function warnOnce ( message, ...args ) {
	message = format( message, args );

	if ( message && messagesAlreadyWarned[ message ] ) return;

	messagesAlreadyWarned[ message ] = true;
	printWarning( message, args );
}

function warnIfDebug () {
	if ( !Ractive.DEBUG ) return;
	warn( ...arguments );
}

function warnOnceIfDebug () {
	if ( !Ractive.DEBUG ) return;
	warnOnce( ...arguments );
}

function fatal( message, ...args ) {
	message = format( message, args );
	throw new Error( message );
}

// Override when no console is found. Note that we're also noop'ing format to
// avoid the operation when we actually cannot log.

if ( !hasConsole ) printWarning = printLog = format = noop;

export { fatal, log, logIfDebug, warn, warnOnce, warnIfDebug, warnOnceIfDebug };

