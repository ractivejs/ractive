/* global console */
import { hasConsole } from '../config/environment';
import Ractive from '../Ractive';
import noop from './noop';
import messages from './messages';

export let welcome, message;
let print;

if ( hasConsole ) {
	let welcomeIntro = [
		`%cRactive.js %c<@version@> %cin debug mode, %cmore...`,
		'color: rgb(114, 157, 52); font-weight: normal;',
		'color: rgb(85, 85, 85); font-weight: normal;',
		'color: rgb(85, 85, 85); font-weight: normal;',
		'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;'
	];

	welcome = () => {
		if ( Ractive.WELCOME_MESSAGE === false ) {
			welcome = noop;
			return;
		}
		const message = 'WELCOME_MESSAGE' in Ractive ? Ractive.WELCOME_MESSAGE : messages.WELCOME_MESSAGE.m;
		const hasGroup = !!console.groupCollapsed;
		if ( hasGroup ) console.groupCollapsed.apply( console, welcomeIntro );
		console.log( message );
		if ( hasGroup ) {
			console.groupEnd( welcomeIntro );
		}

		welcome = noop;
	};

	print = ( warn, message, args ) => {
		welcome();

		console[ warn ? 'warn' : 'log' ].apply( console, [ '%cRactive.js: %c' + message, 'color: rgb(114, 157, 52);', 'color: rgb(85, 85, 85);' ].concat( args ) );
	};

	const issued = {};
	const replaceArgs = /\{\s*(\d+)\s*\}/g;
	message = function message ( id, ...args ) {
		const lastArg = args[ args.length - 1 ];
		const msg = messages[ id ] || {};
		const opts = typeof lastArg === 'object' && lastArg.constructor === Object ? args.pop() : {};
		if ( !( 'error' in opts ) ) opts.error = msg.e;
		if ( !( 'once' in opts ) ) opts.once = msg.o;
		if ( !( 'warn' in opts ) ) opts.warn = 'w' in msg ? msg.w : true;
		if ( !( 'debug' in opts ) ) opts.debug = 'd' in msg ? msg.d : true;
		if ( !( id in messages ) ) {
			return message( 'UNKNOWN_MESSAGE', id, opts );
		}

		if ( opts.debug && !Ractive.DEBUG && !opts.error ) return;

		let consumed = -1;
		const str = `${opts.ractive && opts.ractive.component && opts.ractive.component.name ? '<' + opts.ractive.component.name +'> ' : ''}${id}: ` + msg.m.replace( replaceArgs, function( _, num ) {
			if ( +num > consumed ) consumed = +num;
			return args[ num ] || '<UNKNOWN>';
		});

		if ( opts.error ) {
			const error = new Error( str );
			if ( opts.ractive ) error.ractive = opts.ractive;
			if ( opts.node ) error.node = opts.node;
			throw error;
		}

		if ( opts.once ) {
			if ( str in issued ) return;
			issued[ str ] = true;
		}

		const params = [];
		if ( consumed + 1 < args.length ) params.push.apply( params, args.slice( consumed + 1 ) );
		if ( opts.ractive ) params.push( opts.ractive );

		if ( opts.node ) params.push( opts.node );
		else if ( opts.ractive && opts.ractive.fragment && opts.ractive.fragment.rendered ) params.push( opts.ractive.find( '*' ) );

		print( opts.warn, str, params );
	};
} else {
	print = welcome = noop;

	message = function message ( id, ...args ) {
		const lastArg = args[ args.length - 1 ];
		const msg = messages[ id ] || {};
		const opts = typeof lastArg === 'object' && lastArg.constructor === Object ? args.pop() : {};
		if ( !( 'error' in opts ) ) opts.error = msg.e;
		if ( !( 'once' in opts ) ) opts.once = msg.o;
		if ( !( 'warn' in opts ) ) opts.warn = 'w' in msg ? msg.w : true;
		if ( !( 'debug' in opts ) ) opts.debug = 'd' in msg ? msg.d : true;
		if ( !( id in messages ) ) {
			return message( 'UNKNOWN_MESSAGE', id, opts );
		}

		const str = `${opts.ractive && opts.ractive.component && opts.ractive.component.name ? '<' + opts.ractive.component.name +'> ' : ''}${id}: ` + msg.m.replace( replaceArgs, function( _, num ) {
			return args[ num ] || '<UNKNOWN>';
		});

		if ( opts.error ) {
			const error = new Error( str );
			if ( opts.ractive ) error.ractive = opts.ractive;
			if ( opts.node ) error.node = opts.node;
			throw error;
		}
	};
}
