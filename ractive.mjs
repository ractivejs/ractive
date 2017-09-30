/*
	Ractive.js v0.9.4
	Build: bfb687b620991b7313ef17aea1092d1af98fc3bf
	Date: Sat Sep 30 2017 01:15:45 GMT+0000 (UTC)
	Website: http://ractivejs.org
	License: MIT
*/
/* istanbul ignore if */
if (!Array.prototype.find) {
	Object.defineProperty( Array.prototype, 'find', {
		value (callback, thisArg) {
			if (this === null || this === undefined)
				throw new TypeError('Array.prototype.find called on null or undefined');

			if (typeof callback !== 'function')
				throw new TypeError(`${callback} is not a function`);

			const array = Object(this);
			const arrayLength = array.length >>> 0;

			for (let index = 0; index < arrayLength; index++) {
				if (!Object.hasOwnProperty.call(array, index)) continue;
				if (!callback.call(thisArg, array[index], index, array)) continue;
				return array[index];
			}

			return undefined;
		},
		configurable: true,
		writable: true
	});
}

// NOTE: Node doesn't exist in IE8. Nothing can be done.
/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Node && window.Node.prototype && !window.Node.prototype.contains) {
	Node.prototype.contains = function (node) {
		if (!node)
			throw new TypeError('node required');

		do {
			if (this === node) return true;
		} while (node = node && node.parentNode);

		return false;
	};
}

/* istanbul ignore if */
if (!Object.assign) {
	Object.assign = function (target, ...sources) {
		if (target == null)
			throw new TypeError('Cannot convert undefined or null to object');

		const to = Object(target);
		const sourcesLength = sources.length;

		for (let index = 0; index < sourcesLength; index++) {
			const nextSource = sources[index];
			for (const nextKey in nextSource) {
				if (!Object.prototype.hasOwnProperty.call(nextSource, nextKey)) continue;
				to[nextKey] = nextSource[nextKey];
			}
		}

		return to;
	};
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.performance && !window.performance.now) {
	window.performance = window.performance || {};

	const nowOffset = Date.now();

	window.performance.now = function () {
		return Date.now() - nowOffset;
	};
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && !window.Promise) {
	const PENDING = {};
	const FULFILLED = {};
	const REJECTED = {};

	const Promise = window.Promise = function (callback) {
		const fulfilledHandlers = [];
		const rejectedHandlers = [];
		let state = PENDING;
		let result;
		let dispatchHandlers;

		const makeResolver = (newState) => {
			return function (value) {
				if (state !== PENDING) return;
				result = value;
				state = newState;
				dispatchHandlers = makeDispatcher((state === FULFILLED ? fulfilledHandlers : rejectedHandlers), result);
				wait(dispatchHandlers);
			};
		};

		const fulfill = makeResolver(FULFILLED);
		const reject = makeResolver(REJECTED);

		try {
			callback(fulfill, reject);
		} catch (err) {
			reject(err);
		}

		return {
			// `then()` returns a Promise - 2.2.7
			then(onFulfilled, onRejected) {
				const promise2 = new Promise((fulfill, reject) => {

					const processResolutionHandler = (handler, handlers, forward) => {
						if (typeof handler === 'function') {
							handlers.push(p1result => {
								try {
									resolve(promise2, handler(p1result), fulfill, reject);
								} catch (err) {
									reject(err);
								}
							});
						} else {
							handlers.push(forward);
						}
					};

					processResolutionHandler(onFulfilled, fulfilledHandlers, fulfill);
					processResolutionHandler(onRejected, rejectedHandlers, reject);

					if (state !== PENDING) {
						wait(dispatchHandlers);
					}

				});
				return promise2;
			},
			'catch'(onRejected) {
				return this.then(null, onRejected);
			}
		};
	};

	Promise.all = function (promises) {
		return new Promise((fulfil, reject) => {
			const result = [];
			let pending;
			let i;

			if (!promises.length) {
				fulfil(result);
				return;
			}

			const processPromise = (promise, i) => {
				if (promise && typeof promise.then === 'function') {
					promise.then(value => {
						result[i] = value;
						--pending || fulfil(result);
					}, reject);
				} else {
					result[i] = promise;
					--pending || fulfil(result);
				}
			};

			pending = i = promises.length;

			while (i--) {
				processPromise(promises[i], i);
			}
		});
	};

	Promise.resolve = function (value) {
		return new Promise(fulfill => {
			fulfill(value);
		});
	};

	Promise.reject = function (reason) {
		return new Promise((fulfill, reject) => {
			reject(reason);
		});
	};

	// TODO use MutationObservers or something to simulate setImmediate
	const wait = function (callback) {
		setTimeout(callback, 0);
	};

	const makeDispatcher = function (handlers, result) {
		return function () {
			for (let handler; handler = handlers.shift();) {
				handler(result);
			}
		};
	};

	const resolve = function (promise, x, fulfil, reject) {
		let then;
		if (x === promise) {
			throw new TypeError(`A promise's fulfillment handler cannot return the same promise`);
		}
		if (x instanceof Promise) {
			x.then(fulfil, reject);
		} else if (x && (typeof x === 'object' || typeof x === 'function')) {
			try {
				then = x.then;
			} catch (e) {
				reject(e);
				return;
			}
			if (typeof then === 'function') {
				let called;

				const resolvePromise = function (y) {
					if (called) return;
					called = true;
					resolve(promise, y, fulfil, reject);
				};
				const rejectPromise = function (r) {
					if (called) return;
					called = true;
					reject(r);
				};

				try {
					then.call(x, resolvePromise, rejectPromise);
				} catch (e) {
					if (!called) {
						reject(e);
						called = true;
						return;
					}
				}
			} else {
				fulfil(x);
			}
		} else {
			fulfil(x);
		}
	};

}

/* istanbul ignore if */
if (typeof window !== 'undefined' && !(window.requestAnimationFrame && window.cancelAnimationFrame)) {
	let lastTime = 0;
	window.requestAnimationFrame = function (callback) {
		const currentTime = Date.now();
		const timeToNextCall = Math.max(0, 16 - (currentTime - lastTime));
		const id = window.setTimeout(() => { callback(currentTime + timeToNextCall); }, timeToNextCall);
		lastTime = currentTime + timeToNextCall;
		return id;
	};
	window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}

var defaults = {
	// render placement:
	el:                     void 0,
	append:                 false,
	delegate:               true,

	// template:
	template:               null,

	// parse:
	delimiters:             [ '{{', '}}' ],
	tripleDelimiters:       [ '{{{', '}}}' ],
	staticDelimiters:       [ '[[', ']]' ],
	staticTripleDelimiters: [ '[[[', ']]]' ],
	csp:                    true,
	interpolate:            false,
	preserveWhitespace:     false,
	sanitize:               false,
	stripComments:          true,
	contextLines:           0,
	parserTransforms:       [],

	// data & binding:
	data:                   {},
	computed:               {},
	syncComputedChildren:   false,
	resolveInstanceMembers: true,
	warnAboutAmbiguity:     false,
	adapt:                  [],
	isolated:               true,
	twoway:                 true,
	lazy:                   false,

	// transitions:
	noIntro:                false,
	noOutro:                false,
	transitionsEnabled:     true,
	complete:               void 0,
	nestedTransitions:      true,

	// css:
	css:                    null,
	noCssTransform:         false
};

// These are a subset of the easing equations found at
// https://raw.github.com/danro/easing-js - license info
// follows:

// --------------------------------------------------
// easing.js v0.5.4
// Generic set of easing functions with AMD support
// https://github.com/danro/easing-js
// This code may be freely distributed under the MIT license
// http://danro.mit-license.org/
// --------------------------------------------------
// All functions adapted from Thomas Fuchs & Jeremy Kahn
// Easing Equations (c) 2003 Robert Penner, BSD license
// https://raw.github.com/danro/easing-js/master/LICENSE
// --------------------------------------------------

// In that library, the functions named easeIn, easeOut, and
// easeInOut below are named easeInCubic, easeOutCubic, and
// (you guessed it) easeInOutCubic.
//
// You can add additional easing functions to this list, and they
// will be globally available.


var easing = {
	linear ( pos ) { return pos; },
	easeIn ( pos ) {
		/* istanbul ignore next */
		return Math.pow( pos, 3 );
	},
	easeOut ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
	easeInOut ( pos ) {
		/* istanbul ignore next */
		if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
		/* istanbul ignore next */
		return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
	}
};

const toString = Object.prototype.toString;


function isEqual ( a, b ) {
	if ( a === null && b === null ) {
		return true;
	}

	if ( typeof a === 'object' || typeof b === 'object' ) {
		return false;
	}

	return a === b;
}

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
function isNumeric ( thing ) {
	return !isNaN( parseFloat( thing ) ) && isFinite( thing );
}

function isObject ( thing ) {
	return ( thing && toString.call( thing ) === '[object Object]' );
}

function isObjectLike ( thing ) {
	if ( !thing ) return false;
	const type = typeof thing;
	if ( type === 'object' || type === 'function' ) return true;
}

/* eslint no-console:"off" */
const win = typeof window !== 'undefined' ? window : null;
const doc = win ? document : null;
const isClient = !!doc;
const hasConsole = ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' );

const svg = doc ?
	doc.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' ) :
	false;

const vendors = [ 'o', 'ms', 'moz', 'webkit' ];

var noop = function () {};

/* global console */
/* eslint no-console:"off" */

const alreadyWarned = {};
let log;
let printWarning;
let welcome;

if ( hasConsole ) {
	const welcomeIntro = [
		`%cRactive.js %c0.9.4 %cin debug mode, %cmore...`,
		'color: rgb(114, 157, 52); font-weight: normal;',
		'color: rgb(85, 85, 85); font-weight: normal;',
		'color: rgb(85, 85, 85); font-weight: normal;',
		'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;'
	];
	const welcomeMessage = `You're running Ractive 0.9.4 in debug mode - messages will be printed to the console to help you fix problems and optimise your application.

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
		if ( Ractive.WELCOME_MESSAGE === false ) {
			welcome = noop;
			return;
		}
		const message = 'WELCOME_MESSAGE' in Ractive ? Ractive.WELCOME_MESSAGE : welcomeMessage;
		const hasGroup = !!console.groupCollapsed;
		if ( hasGroup ) console.groupCollapsed.apply( console, welcomeIntro );
		console.log( message );
		if ( hasGroup ) {
			console.groupEnd( welcomeIntro );
		}

		welcome = noop;
	};

	printWarning = ( message, args ) => {
		welcome();

		// extract information about the instance this message pertains to, if applicable
		if ( typeof args[ args.length - 1 ] === 'object' ) {
			const options = args.pop();
			const ractive = options ? options.ractive : null;

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

// Error messages that are used (or could be) in multiple places
const badArguments = 'Bad arguments';
const noRegistryFunctionReturn = 'A function was specified for "%s" %s, but no %s was returned';
const missingPlugin = ( name, type ) => `Missing "${name}" ${type} plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#${type}s`;

function findInViewHierarchy ( registryName, ractive, name ) {
	const instance = findInstance( registryName, ractive, name );
	return instance ? instance[ registryName ][ name ] : null;
}

function findInstance ( registryName, ractive, name ) {
	while ( ractive ) {
		if ( name in ractive[ registryName ] ) {
			return ractive;
		}

		if ( ractive.isolated ) {
			return null;
		}

		ractive = ractive.parent;
	}
}

function interpolate ( from, to, ractive, type ) {
	if ( from === to ) return null;

	if ( type ) {
		const interpol = findInViewHierarchy( 'interpolators', ractive, type );
		if ( interpol ) return interpol( from, to ) || null;

		fatal( missingPlugin( type, 'interpolator' ) );
	}

	return interpolators.number( from, to ) ||
	       interpolators.array( from, to ) ||
	       interpolators.object( from, to ) ||
	       null;
}

const interpolators = {
	number ( from, to ) {
		if ( !isNumeric( from ) || !isNumeric( to ) ) {
			return null;
		}

		from = +from;
		to = +to;

		const delta = to - from;

		if ( !delta ) {
			return function () { return from; };
		}

		return function ( t ) {
			return from + ( t * delta );
		};
	},

	array ( from, to ) {
		let len, i;

		if ( !Array.isArray( from ) || !Array.isArray( to ) ) {
			return null;
		}

		const intermediate = [];
		const interpolators = [];

		i = len = Math.min( from.length, to.length );
		while ( i-- ) {
			interpolators[i] = interpolate( from[i], to[i] );
		}

		// surplus values - don't interpolate, but don't exclude them either
		for ( i=len; i<from.length; i+=1 ) {
			intermediate[i] = from[i];
		}

		for ( i=len; i<to.length; i+=1 ) {
			intermediate[i] = to[i];
		}

		return function ( t ) {
			let i = len;

			while ( i-- ) {
				intermediate[i] = interpolators[i]( t );
			}

			return intermediate;
		};
	},

	object ( from, to ) {
		if ( !isObject( from ) || !isObject( to ) ) {
			return null;
		}

		const properties = [];
		const intermediate = {};
		const interpolators = {};

		for ( const prop in from ) {
			if ( from.hasOwnProperty( prop ) ) {
				if ( to.hasOwnProperty( prop ) ) {
					properties.push( prop );
					interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] ) || ( () => to[ prop ] );
				}

				else {
					intermediate[ prop ] = from[ prop ];
				}
			}
		}

		for ( const prop in to ) {
			if ( to.hasOwnProperty( prop ) && !from.hasOwnProperty( prop ) ) {
				intermediate[ prop ] = to[ prop ];
			}
		}

		const len = properties.length;

		return function ( t ) {
			let i = len;

			while ( i-- ) {
				const prop = properties[i];

				intermediate[ prop ] = interpolators[ prop ]( t );
			}

			return intermediate;
		};
	}
};

const refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
const splitPattern = /([^\\](?:\\\\)*)\./;
const escapeKeyPattern = /\\|\./g;
const unescapeKeyPattern = /((?:\\)+)\1|\\(\.)/g;

function escapeKey ( key ) {
	if ( typeof key === 'string' ) {
		return key.replace( escapeKeyPattern, '\\$&' );
	}

	return key;
}

function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

function splitKeypath ( keypath ) {
	const result = [];
	let match;

	keypath = normalise( keypath );

	while ( match = splitPattern.exec( keypath ) ) {
		const index = match.index + match[1].length;
		result.push( keypath.substr( 0, index ) );
		keypath = keypath.substr( index + 1 );
	}

	result.push( keypath );

	return result;
}

function unescapeKey ( key ) {
	if ( typeof key === 'string' ) {
		return key.replace( unescapeKeyPattern, '$1$2' );
	}

	return key;
}

function addToArray ( array, value ) {
	const index = array.indexOf( value );

	if ( index === -1 ) {
		array.push( value );
	}
}

function arrayContains ( array, value ) {
	for ( let i = 0, c = array.length; i < c; i++ ) {
		if ( array[i] == value ) {
			return true;
		}
	}

	return false;
}

function arrayContentsMatch ( a, b ) {
	let i;

	if ( !Array.isArray( a ) || !Array.isArray( b ) ) {
		return false;
	}

	if ( a.length !== b.length ) {
		return false;
	}

	i = a.length;
	while ( i-- ) {
		if ( a[i] !== b[i] ) {
			return false;
		}
	}

	return true;
}

function ensureArray ( x ) {
	if ( typeof x === 'string' ) {
		return [ x ];
	}

	if ( x === undefined ) {
		return [];
	}

	return x;
}

function lastItem ( array ) {
	return array[ array.length - 1 ];
}

function removeFromArray ( array, member ) {
	if ( !array ) {
		return;
	}

	const index = array.indexOf( member );

	if ( index !== -1 ) {
		array.splice( index, 1 );
	}
}

function combine ( ...arrays ) {
	const res = arrays.concat.apply( [], arrays );
	let i = res.length;
	while ( i-- ) {
		const idx = res.indexOf( res[i] );
		if ( ~idx && idx < i ) res.splice( i, 1 );
	}

	return res;
}

function toArray ( arrayLike ) {
	const array = [];
	let i = arrayLike.length;
	while ( i-- ) {
		array[i] = arrayLike[i];
	}

	return array;
}

function findMap ( array, fn ) {
	const len = array.length;
	for ( let i = 0; i < len; i++ ) {
		const result = fn( array[i] );
		if ( result ) return result;
	}
}

const stack = [];
let captureGroup;

function startCapturing () {
	stack.push( captureGroup = [] );
}

function stopCapturing () {
	const dependencies = stack.pop();
	captureGroup = stack[ stack.length - 1 ];
	return dependencies;
}

function capture ( model ) {
	if ( captureGroup ) {
		captureGroup.push( model );
	}
}

class KeyModel {
	constructor ( key, parent ) {
		this.value = key;
		this.isReadonly = this.isKey = true;
		this.deps = [];
		this.links = [];
		this.parent = parent;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );
		return unescapeKey( this.value );
	}

	getKeypath () {
		return unescapeKey( this.value );
	}

	rebind ( next, previous ) {
		let i = this.deps.length;
		while ( i-- ) this.deps[i].rebind( next, previous, false );

		i = this.links.length;
		while ( i-- ) this.links[i].relinking( next, false );
	}

	register ( dependant ) {
		this.deps.push( dependant );
	}

	registerLink ( link ) {
		addToArray( this.links, link );
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}

	unregisterLink ( link ) {
		removeFromArray( this.links, link );
	}
}

KeyModel.prototype.reference = noop;
KeyModel.prototype.unreference = noop;

function bind               ( x ) { x.bind(); }
function cancel             ( x ) { x.cancel(); }
function destroyed          ( x ) { x.destroyed(); }
function handleChange       ( x ) { x.handleChange(); }
function mark               ( x ) { x.mark(); }
function markForce          ( x ) { x.mark( true ); }
function marked             ( x ) { x.marked(); }
function markedAll          ( x ) { x.markedAll(); }
function render             ( x ) { x.render(); }
function shuffled           ( x ) { x.shuffled(); }
function teardown           ( x ) { x.teardown(); }
function unbind             ( x ) { x.unbind(); }
function unrender           ( x ) { x.unrender(); }
function unrenderAndDestroy ( x ) { x.unrender( true ); }
function update             ( x ) { x.update(); }
function toString$1           ( x ) { return x.toString(); }
function toEscapedString    ( x ) { return x.toString( true ); }

class KeypathModel {
	constructor ( parent, ractive ) {
		this.parent = parent;
		this.ractive = ractive;
		this.value = ractive ? parent.getKeypath( ractive ) : parent.getKeypath();
		this.deps = [];
		this.children = {};
		this.isReadonly = this.isKeypath = true;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );
		return this.value;
	}

	getChild ( ractive ) {
		if ( !( ractive._guid in this.children ) ) {
			const model = new KeypathModel( this.parent, ractive );
			this.children[ ractive._guid ] = model;
			model.owner = this;
		}
		return this.children[ ractive._guid ];
	}

	getKeypath () {
		return this.value;
	}

	handleChange () {
		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			this.children[ keys[i] ].handleChange();
		}

		this.deps.forEach( handleChange );
	}

	rebindChildren ( next ) {
		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			const child = this.children[keys[i]];
			child.value = next.getKeypath( child.ractive );
			child.handleChange();
		}
	}

	rebind ( next, previous ) {
		const model = next ? next.getKeypathModel( this.ractive ) : undefined;

		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			this.children[ keys[i] ].rebind( next, previous, false );
		}

		i = this.deps.length;
		while ( i-- ) {
			this.deps[i].rebind( model, this, false );
		}
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	removeChild( model ) {
		if ( model.ractive ) delete this.children[ model.ractive._guid ];
	}

	teardown () {
		if ( this.owner ) this.owner.removeChild( this );

		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			this.children[ keys[i] ].teardown();
		}
	}

	unregister ( dep ) {
		removeFromArray( this.deps, dep );
		if ( !this.deps.length ) this.teardown();
	}
}

KeypathModel.prototype.reference = noop;
KeypathModel.prototype.unreference = noop;

const fnBind = Function.prototype.bind;

function bind$1 ( fn, context ) {
	if ( !/this/.test( fn.toString() ) ) return fn;

	const bound = fnBind.call( fn, context );
	for ( const prop in fn ) bound[ prop ] = fn[ prop ];

	return bound;
}

const hasProp = Object.prototype.hasOwnProperty;

const shuffleTasks = { early: [], mark: [] };
const registerQueue = { early: [], mark: [] };

class ModelBase {
	constructor ( parent ) {
		this.deps = [];

		this.children = [];
		this.childByKey = {};
		this.links = [];

		this.keyModels = {};

		this.bindings = [];
		this.patternObservers = [];

		if ( parent ) {
			this.parent = parent;
			this.root = parent.root;
		}
	}

	addShuffleTask ( task, stage = 'early' ) { shuffleTasks[stage].push( task ); }
	addShuffleRegister ( item, stage = 'early' ) { registerQueue[stage].push({ model: this, item }); }

	downstreamChanged () {}

	findMatches ( keys ) {
		const len = keys.length;

		let existingMatches = [ this ];
		let matches;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const key = keys[i];

			if ( key === '*' ) {
				matches = [];
				existingMatches.forEach( model => {
					matches.push.apply( matches, model.getValueChildren( model.get() ) );
				});
			} else {
				matches = existingMatches.map( model => model.joinKey( key ) );
			}

			existingMatches = matches;
		}

		return matches;
	}

	getKeyModel ( key, skip ) {
		if ( key !== undefined && !skip ) return this.parent.getKeyModel( key, true );

		if ( !( key in this.keyModels ) ) this.keyModels[ key ] = new KeyModel( escapeKey( key ), this );

		return this.keyModels[ key ];
	}

	getKeypath ( ractive ) {
		if ( ractive !== this.ractive && this._link ) return this._link.target.getKeypath( ractive );

		if ( !this.keypath ) {
			const parent = this.parent && this.parent.getKeypath( ractive );
			this.keypath = parent ? `${this.parent.getKeypath( ractive )}.${escapeKey( this.key )}` : escapeKey( this.key );
		}

		return this.keypath;
	}

	getValueChildren ( value ) {
		let children;
		if ( Array.isArray( value ) ) {
			children = [];
			if ( 'length' in this && this.length !== value.length ) {
				children.push( this.joinKey( 'length' ) );
			}
			value.forEach( ( m, i ) => {
				children.push( this.joinKey( i ) );
			});
		}

		else if ( isObject( value ) || typeof value === 'function' ) {
			children = Object.keys( value ).map( key => this.joinKey( key ) );
		}

		else if ( value != null ) {
			return [];
		}

		return children;
	}

	getVirtual ( shouldCapture ) {
		const value = this.get( shouldCapture, { virtual: false } );
		if ( isObject( value ) ) {
			const result = Array.isArray( value ) ? [] : {};

			const keys = Object.keys( value );
			let i = keys.length;
			while ( i-- ) {
				const child = this.childByKey[ keys[i] ];
				if ( !child ) result[ keys[i] ] = value[ keys[i] ];
				else if ( child._link ) result[ keys[i] ] = child._link.getVirtual();
				else result[ keys[i] ] = child.getVirtual();
			}

			i = this.children.length;
			while ( i-- ) {
				const child = this.children[i];
				if ( !( child.key in result ) && child._link ) {
					result[ child.key ] = child._link.getVirtual();
				}
			}

			return result;
		} else return value;
	}

	has ( key ) {
		if ( this._link ) return this._link.has( key );

		const value = this.get();
		if ( !value ) return false;

		key = unescapeKey( key );
		if ( hasProp.call( value, key ) ) return true;

		// We climb up the constructor chain to find if one of them contains the key
		let constructor = value.constructor;
		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
			if ( hasProp.call( constructor.prototype, key ) ) return true;
			constructor = constructor.constructor;
		}

		return false;
	}

	joinAll ( keys, opts ) {
		let model = this;
		for ( let i = 0; i < keys.length; i += 1 ) {
			if ( opts && opts.lastLink === false && i + 1 === keys.length && model.childByKey[keys[i]] && model.childByKey[keys[i]]._link ) return model.childByKey[keys[i]];
			model = model.joinKey( keys[i], opts );
		}

		return model;
	}

	notifyUpstream ( startPath ) {
		let parent = this.parent;
		const path = startPath || [ this.key ];
		while ( parent ) {
			if ( parent.patternObservers.length ) parent.patternObservers.forEach( o => o.notify( path.slice() ) );
			path.unshift( parent.key );
			parent.links.forEach( l => l.notifiedUpstream( path, this.root ) );
			parent.deps.forEach( d => d.handleChange( path ) );
			parent.downstreamChanged( startPath );
			parent = parent.parent;
		}
	}

	rebind ( next, previous, safe ) {
		if ( this._link ) {
			this._link.rebind( next, previous, false );
		}

		// tell the deps to move to the new target
		let i = this.deps.length;
		while ( i-- ) {
			if ( this.deps[i].rebind ) this.deps[i].rebind( next, previous, safe );
		}

		i = this.links.length;
		while ( i-- ) {
			const link = this.links[i];
			// only relink the root of the link tree
			if ( link.owner._link ) link.relinking( next, safe );
		}

		i = this.children.length;
		while ( i-- ) {
			const child = this.children[i];
			child.rebind( next ? next.joinKey( child.key ) : undefined, child, safe );
		}

		if ( this.keypathModel ) this.keypathModel.rebind( next, previous, false );

		i = this.bindings.length;
		while ( i-- ) {
			this.bindings[i].rebind( next, previous, safe );
		}
	}

	reference () {
		'refs' in this ? this.refs++ : this.refs = 1;
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	registerLink ( link ) {
		addToArray( this.links, link );
	}

	registerPatternObserver ( observer ) {
		this.patternObservers.push( observer );
		this.register( observer );
	}

	registerTwowayBinding ( binding ) {
		this.bindings.push( binding );
	}

	unreference () {
		if ( 'refs' in this ) this.refs--;
	}

	unregister ( dep ) {
		removeFromArray( this.deps, dep );
	}

	unregisterLink ( link ) {
		removeFromArray( this.links, link );
	}

	unregisterPatternObserver ( observer ) {
		removeFromArray( this.patternObservers, observer );
		this.unregister( observer );
	}

	unregisterTwowayBinding ( binding ) {
		removeFromArray( this.bindings, binding );
	}

	updateFromBindings ( cascade ) {
		let i = this.bindings.length;
		while ( i-- ) {
			const value = this.bindings[i].getValue();
			if ( value !== this.value ) this.set( value );
		}

		// check for one-way bindings if there are no two-ways
		if ( !this.bindings.length ) {
			const oneway = findBoundValue( this.deps );
			if ( oneway && oneway.value !== this.value ) this.set( oneway.value );
		}

		if ( cascade ) {
			this.children.forEach( updateFromBindings );
			this.links.forEach( updateFromBindings );
			if ( this._link ) this._link.updateFromBindings( cascade );
		}
	}
}

// TODO: this may be better handled by overreiding `get` on models with a parent that isRoot
function maybeBind ( model, value, shouldBind ) {
	if ( shouldBind && typeof value === 'function' && model.parent && model.parent.isRoot ) {
		if ( !model.boundValue ) {
			model.boundValue = bind$1( value._r_unbound || value, model.parent.ractive );
		}

		return model.boundValue;
	}

	return value;
}

function updateFromBindings ( model ) {
	model.updateFromBindings( true );
}

function findBoundValue( list ) {
	let i = list.length;
	while ( i-- ) {
		if ( list[i].bound ) {
			const owner = list[i].owner;
			if ( owner ) {
				const value = owner.name === 'checked' ?
					owner.node.checked :
					owner.node.value;
				return { value };
			}
		}
	}
}

function fireShuffleTasks ( stage ) {
	if ( !stage ) {
		fireShuffleTasks( 'early' );
		fireShuffleTasks( 'mark' );
	} else {
		const tasks = shuffleTasks[stage];
		shuffleTasks[stage] = [];
		let i = tasks.length;
		while ( i-- ) tasks[i]();

		const register = registerQueue[stage];
		registerQueue[stage] = [];
		i = register.length;
		while ( i-- ) register[i].model.register( register[i].item );
	}
}

function shuffle ( model, newIndices, link, unsafe ) {
	model.shuffling = true;

	let i = newIndices.length;
	while ( i-- ) {
		const idx = newIndices[ i ];
		// nothing is actually changing, so move in the index and roll on
		if ( i === idx ) {
			continue;
		}

		// rebind the children on i to idx
		if ( i in model.childByKey ) model.childByKey[ i ].rebind( !~idx ? undefined : model.joinKey( idx ), model.childByKey[ i ], !unsafe );

		if ( !~idx && model.keyModels[ i ] ) {
			model.keyModels[i].rebind( undefined, model.keyModels[i], false );
		} else if ( ~idx && model.keyModels[ i ] ) {
			if ( !model.keyModels[ idx ] ) model.childByKey[ idx ].getKeyModel( idx );
			model.keyModels[i].rebind( model.keyModels[ idx ], model.keyModels[i], false );
		}
	}

	const upstream = model.source().length !== model.source().value.length;

	model.links.forEach( l => l.shuffle( newIndices ) );
	if ( !link ) fireShuffleTasks( 'early' );

	i = model.deps.length;
	while ( i-- ) {
		if ( model.deps[i].shuffle ) model.deps[i].shuffle( newIndices );
	}

	model[ link ? 'marked' : 'mark' ]();
	if ( !link ) fireShuffleTasks( 'mark' );

	if ( upstream ) model.notifyUpstream();

	model.shuffling = false;
}

KeyModel.prototype.addShuffleTask = ModelBase.prototype.addShuffleTask;
KeyModel.prototype.addShuffleRegister = ModelBase.prototype.addShuffleRegister;
KeypathModel.prototype.addShuffleTask = ModelBase.prototype.addShuffleTask;
KeypathModel.prototype.addShuffleRegister = ModelBase.prototype.addShuffleRegister;

// this is the dry method of checking to see if a rebind applies to
// a particular keypath because in some cases, a dep may be bound
// directly to a particular keypath e.g. foo.bars.0.baz and need
// to avoid getting kicked to foo.bars.1.baz if foo.bars is unshifted
function rebindMatch ( template, next, previous, fragment ) {
	const keypath = template.r || template;

	// no valid keypath, go with next
	if ( !keypath || typeof keypath !== 'string' ) return next;

	// completely contextual ref, go with next
	if ( keypath === '.' || keypath[0] === '@' || ( next || previous ).isKey || ( next || previous ).isKeypath ) return next;

	const parts = keypath.split( '/' );
	let keys = splitKeypath( parts[ parts.length - 1 ] );
	const last = keys[ keys.length - 1 ];

	// check the keypath against the model keypath to see if it matches
	let model = next || previous;

	// check to see if this was an alias
	if ( model && keys.length === 1 && last !== model.key && fragment ) {
		keys = findAlias( last, fragment ) || keys;
	}

	let i = keys.length;
	let match = true;
	let shuffling = false;

	while ( model && i-- ) {
		if ( model.shuffling ) shuffling = true;
		// non-strict comparison to account for indices in keypaths
		if ( keys[i] != model.key ) match = false;
		model = model.parent;
	}

	// next is undefined, but keypath is shuffling and previous matches
	if ( !next && match && shuffling ) return previous;
	// next is defined, but doesn't match the keypath
	else if ( next && !match && shuffling ) return previous;
	else return next;
}

function findAlias ( name, fragment ) {
	while ( fragment ) {
		const z = fragment.aliases;
		if ( z && z[ name ] ) {
			const aliases = ( fragment.owner.iterations ? fragment.owner : fragment ).owner.template.z;
			for ( let i = 0; i < aliases.length; i++ ) {
				if ( aliases[i].n === name ) {
					const alias = aliases[i].x;
					if ( !alias.r ) return false;
					const parts = alias.r.split( '/' );
					return splitKeypath( parts[ parts.length - 1 ] );
				}
			}
			return;
		}

		fragment = fragment.componentParent || fragment.parent;
	}
}

// temporary placeholder target for detached implicit links
const Missing = {
	key: '@missing',
	animate: noop,
	applyValue: noop,
	get: noop,
	getKeypath () { return this.key; },
	joinAll () { return this; },
	joinKey () { return this; },
	mark: noop,
	registerLink: noop,
	shufle: noop,
	set: noop,
	unregisterLink: noop
};
Missing.parent = Missing;

class LinkModel extends ModelBase {
	constructor ( parent, owner, target, key ) {
		super( parent );

		this.owner = owner;
		this.target = target;
		this.key = key === undefined ? owner.key : key;
		if ( owner.isLink ) this.sourcePath = `${owner.sourcePath}.${this.key}`;

		target.registerLink( this );

		if ( parent ) this.isReadonly = parent.isReadonly;

		this.isLink = true;
	}

	animate ( from, to, options, interpolator ) {
		return this.target.animate( from, to, options, interpolator );
	}

	applyValue ( value ) {
		if ( this.boundValue ) this.boundValue = null;
		this.target.applyValue( value );
	}

	attach ( fragment ) {
		const model = resolveReference( fragment, this.key );
		if ( model ) {
			this.relinking( model, false );
		} else { // if there is no link available, move everything here to real models
			this.owner.unlink();
		}
	}

	detach () {
		this.relinking( Missing, false );
	}

	get ( shouldCapture, opts = {} ) {
		if ( shouldCapture ) {
			capture( this );

			// may need to tell the target to unwrap
			opts.unwrap = true;
		}

		const bind$$1 = 'shouldBind' in opts ? opts.shouldBind : true;
		opts.shouldBind = this.mapping && this.target.parent && this.target.parent.isRoot;

		return maybeBind( this, this.target.get( false, opts ), bind$$1 );
	}

	getKeypath ( ractive ) {
		if ( ractive && ractive !== this.root.ractive ) return this.target.getKeypath( ractive );

		return super.getKeypath( ractive );
	}

	getKeypathModel ( ractive ) {
		if ( !this.keypathModel ) this.keypathModel = new KeypathModel( this );
		if ( ractive && ractive !== this.root.ractive ) return this.keypathModel.getChild( ractive );
		return this.keypathModel;
	}

	handleChange () {
		this.deps.forEach( handleChange );
		this.links.forEach( handleChange );
		this.notifyUpstream();
	}

	isDetached () { return this.virtual && this.target === Missing; }

	joinKey ( key ) {
		// TODO: handle nested links
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new LinkModel( this, this, this.target.joinKey( key ), key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark ( force ) {
		this.target.mark( force );
	}

	marked () {
		if ( this.boundValue ) this.boundValue = null;

		this.links.forEach( marked );

		this.deps.forEach( handleChange );
	}

	markedAll () {
		this.children.forEach( markedAll );
		this.marked();
	}

	notifiedUpstream ( startPath, root ) {
		this.links.forEach( l => l.notifiedUpstream( startPath, this.root ) );
		this.deps.forEach( handleChange );
		if ( startPath && this.rootLink && this.root !== root ) {
			const path = startPath.slice( 1 );
			path.unshift( this.key );
			this.notifyUpstream( path );
		}
	}

	relinked () {
		this.target.registerLink( this );
		this.children.forEach( c => c.relinked() );
	}

	relinking ( target, safe ) {
		if ( this.rootLink && this.sourcePath ) target = rebindMatch( this.sourcePath, target, this.target );
		if ( !target || this.target === target ) return;

		this.target.unregisterLink( this );
		if ( this.keypathModel ) this.keypathModel.rebindChildren( target );

		this.target = target;
		this.children.forEach( c => {
			c.relinking( target.joinKey( c.key ), safe );
		});

		if ( this.rootLink ) this.addShuffleTask( () => {
			this.relinked();
			if ( !safe ) {
				this.markedAll();
				this.notifyUpstream();
			}
		});
	}

	set ( value ) {
		if ( this.boundValue ) this.boundValue = null;
		this.target.set( value );
	}

	shuffle ( newIndices ) {
		// watch for extra shuffles caused by a shuffle in a downstream link
		if ( this.shuffling ) return;

		// let the real model handle firing off shuffles
		if ( !this.target.shuffling ) {
			this.target.shuffle( newIndices );
		} else {
			shuffle( this, newIndices, true );
		}

	}

	source () {
		if ( this.target.source ) return this.target.source();
		else return this.target;
	}

	teardown () {
		if ( this._link ) this._link.teardown();
		this.target.unregisterLink( this );
		this.children.forEach( teardown );
	}
}

ModelBase.prototype.link = function link ( model, keypath, options ) {
	const lnk = this._link || new LinkModel( this.parent, this, model, this.key );
	lnk.implicit = options && options.implicit;
	lnk.mapping = options && options.mapping;
	lnk.sourcePath = keypath;
	lnk.rootLink = true;
	if ( this._link ) this._link.relinking( model, false );
	this.rebind( lnk, this, false );
	fireShuffleTasks();

	this._link = lnk;
	lnk.markedAll();

	this.notifyUpstream();
	return lnk;
};

ModelBase.prototype.unlink = function unlink () {
	if ( this._link ) {
		const ln = this._link;
		this._link = undefined;
		ln.rebind( this, ln, false );
		fireShuffleTasks();
		ln.teardown();
		this.notifyUpstream();
	}
};

class TransitionManager {
	constructor ( callback, parent ) {
		this.callback = callback;
		this.parent = parent;

		this.intros = [];
		this.outros = [];

		this.children = [];
		this.totalChildren = this.outroChildren = 0;

		this.detachQueue = [];
		this.outrosComplete = false;

		if ( parent ) {
			parent.addChild( this );
		}
	}

	add ( transition ) {
		const list = transition.isIntro ? this.intros : this.outros;
		transition.starting = true;
		list.push( transition );
	}

	addChild ( child ) {
		this.children.push( child );

		this.totalChildren += 1;
		this.outroChildren += 1;
	}

	decrementOutros () {
		this.outroChildren -= 1;
		check( this );
	}

	decrementTotal () {
		this.totalChildren -= 1;
		check( this );
	}

	detachNodes () {
		this.detachQueue.forEach( detach );
		this.children.forEach( _detachNodes );
		this.detachQueue = [];
	}

	ready () {
		if ( this.detachQueue.length ) detachImmediate( this );
	}

	remove ( transition ) {
		const list = transition.isIntro ? this.intros : this.outros;
		removeFromArray( list, transition );
		check( this );
	}

	start () {
		this.children.forEach( c => c.start() );
		this.intros.concat( this.outros ).forEach( t => t.start() );
		this.ready = true;
		check( this );
	}
}

function detach ( element ) {
	element.detach();
}

function _detachNodes ( tm ) { // _ to avoid transpiler quirk
	tm.detachNodes();
}

function check ( tm ) {
	if ( !tm.ready || tm.outros.length || tm.outroChildren ) return;

	// If all outros are complete, and we haven't already done this,
	// we notify the parent if there is one, otherwise
	// start detaching nodes
	if ( !tm.outrosComplete ) {
		tm.outrosComplete = true;

		if ( tm.parent && !tm.parent.outrosComplete ) {
			tm.parent.decrementOutros( tm );
		} else {
			tm.detachNodes();
		}
	}

	// Once everything is done, we can notify parent transition
	// manager and call the callback
	if ( !tm.intros.length && !tm.totalChildren ) {
		if ( typeof tm.callback === 'function' ) {
			tm.callback();
		}

		if ( tm.parent && !tm.notifiedTotal ) {
			tm.notifiedTotal = true;
			tm.parent.decrementTotal();
		}
	}
}

// check through the detach queue to see if a node is up or downstream from a
// transition and if not, go ahead and detach it
function detachImmediate ( manager ) {
	const queue = manager.detachQueue;
	const outros = collectAllOutros( manager );

	let i = queue.length;
	let j = 0;
	let node, trans;
	start: while ( i-- ) {
		node = queue[i].node;
		j = outros.length;
		while ( j-- ) {
			trans = outros[j].element.node;
			// check to see if the node is, contains, or is contained by the transitioning node
			if ( trans === node || trans.contains( node ) || node.contains( trans ) ) continue start;
		}

		// no match, we can drop it
		queue[i].detach();
		queue.splice( i, 1 );
	}
}

function collectAllOutros ( manager, _list ) {
	let list = _list;

	// if there's no list, we're starting at the root to build one
	if ( !list ) {
		list = [];
		let parent = manager;
		while ( parent.parent ) parent = parent.parent;
		return collectAllOutros( parent, list );
	} else {
		// grab all outros from child managers
		let i = manager.children.length;
		while ( i-- ) {
			list = collectAllOutros( manager.children[i], list );
		}

		// grab any from this manager if there are any
		if ( manager.outros.length ) list = list.concat( manager.outros );

		return list;
	}
}

let batch;

const runloop = {
	start () {
		let fulfilPromise;
		const promise = new Promise( f => ( fulfilPromise = f ) );

		batch = {
			previousBatch: batch,
			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
			fragments: [],
			tasks: [],
			immediateObservers: [],
			deferredObservers: [],
			promise
		};

		return promise;
	},

	end () {
		flushChanges();

		if ( !batch.previousBatch ) batch.transitionManager.start();

		batch = batch.previousBatch;
	},

	addFragment ( fragment ) {
		addToArray( batch.fragments, fragment );
	},

	// TODO: come up with a better way to handle fragments that trigger their own update
	addFragmentToRoot ( fragment ) {
		if ( !batch ) return;

		let b = batch;
		while ( b.previousBatch ) {
			b = b.previousBatch;
		}

		addToArray( b.fragments, fragment );
	},

	addObserver ( observer, defer ) {
		if ( !batch ) {
			observer.dispatch();
		} else {
			addToArray( defer ? batch.deferredObservers : batch.immediateObservers, observer );
		}
	},

	registerTransition ( transition ) {
		transition._manager = batch.transitionManager;
		batch.transitionManager.add( transition );
	},

	// synchronise node detachments with transition ends
	detachWhenReady ( thing ) {
		batch.transitionManager.detachQueue.push( thing );
	},

	scheduleTask ( task, postRender ) {
		let _batch;

		if ( !batch ) {
			task();
		} else {
			_batch = batch;
			while ( postRender && _batch.previousBatch ) {
				// this can't happen until the DOM has been fully updated
				// otherwise in some situations (with components inside elements)
				// transitions and decorators will initialise prematurely
				_batch = _batch.previousBatch;
			}

			_batch.tasks.push( task );
		}
	},

	promise () {
		if ( !batch ) return Promise.resolve();

		let target = batch;
		while ( target.previousBatch ) {
			target = target.previousBatch;
		}

		return target.promise || Promise.resolve();
	}
};

function dispatch ( observer ) {
	observer.dispatch();
}

function flushChanges () {
	let which = batch.immediateObservers;
	batch.immediateObservers = [];
	which.forEach( dispatch );

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	let i = batch.fragments.length;
	let fragment;

	which = batch.fragments;
	batch.fragments = [];

	while ( i-- ) {
		fragment = which[i];
		fragment.update();
	}

	batch.transitionManager.ready();

	which = batch.deferredObservers;
	batch.deferredObservers = [];
	which.forEach( dispatch );

	const tasks = batch.tasks;
	batch.tasks = [];

	for ( i = 0; i < tasks.length; i += 1 ) {
		tasks[i]();
	}

	// If updating the view caused some model blowback - e.g. a triple
	// containing <option> elements caused the binding on the <select>
	// to update - then we start over
	if ( batch.fragments.length || batch.immediateObservers.length || batch.deferredObservers.length || batch.tasks.length ) return flushChanges();
}

// TODO what happens if a transition is aborted?

const tickers = [];
let running = false;

function tick () {
	runloop.start();

	const now = performance.now();

	let i;
	let ticker;

	for ( i = 0; i < tickers.length; i += 1 ) {
		ticker = tickers[i];

		if ( !ticker.tick( now ) ) {
			// ticker is complete, remove it from the stack, and decrement i so we don't miss one
			tickers.splice( i--, 1 );
		}
	}

	runloop.end();

	if ( tickers.length ) {
		requestAnimationFrame( tick );
	} else {
		running = false;
	}
}

class Ticker {
	constructor ( options ) {
		this.duration = options.duration;
		this.step = options.step;
		this.complete = options.complete;
		this.easing = options.easing;

		this.start = performance.now();
		this.end = this.start + this.duration;

		this.running = true;

		tickers.push( this );
		if ( !running ) requestAnimationFrame( tick );
	}

	tick ( now ) {
		if ( !this.running ) return false;

		if ( now > this.end ) {
			if ( this.step ) this.step( 1 );
			if ( this.complete ) this.complete( 1 );

			return false;
		}

		const elapsed = now - this.start;
		const eased = this.easing( elapsed / this.duration );

		if ( this.step ) this.step( eased );

		return true;
	}

	stop () {
		if ( this.abort ) this.abort();
		this.running = false;
	}
}

const prefixers = {};

// TODO this is legacy. sooner we can replace the old adaptor API the better
/* istanbul ignore next */
function prefixKeypath ( obj, prefix ) {
	const prefixed = {};

	if ( !prefix ) {
		return obj;
	}

	prefix += '.';

	for ( const key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			prefixed[ prefix + key ] = obj[ key ];
		}
	}

	return prefixed;
}

function getPrefixer ( rootKeypath ) {
	let rootDot;

	if ( !prefixers[ rootKeypath ] ) {
		rootDot = rootKeypath ? rootKeypath + '.' : '';

		/* istanbul ignore next */
		prefixers[ rootKeypath ] = function ( relativeKeypath, value ) {
			let obj;

			if ( typeof relativeKeypath === 'string' ) {
				obj = {};
				obj[ rootDot + relativeKeypath ] = value;
				return obj;
			}

			if ( typeof relativeKeypath === 'object' ) {
				// 'relativeKeypath' is in fact a hash, not a keypath
				return rootDot ? prefixKeypath( relativeKeypath, rootKeypath ) : relativeKeypath;
			}
		};
	}

	return prefixers[ rootKeypath ];
}

class Model extends ModelBase {
	constructor ( parent, key ) {
		super( parent );

		this.ticker = null;

		if ( parent ) {
			this.key = unescapeKey( key );
			this.isReadonly = parent.isReadonly;

			if ( parent.value ) {
				this.value = parent.value[ this.key ];
				if ( Array.isArray( this.value ) ) this.length = this.value.length;
				this.adapt();
			}
		}
	}

	adapt () {
		const adaptors = this.root.adaptors;
		const len = adaptors.length;

		this.rewrap = false;

		// Exit early if no adaptors
		if ( len === 0 ) return;

		const value = this.wrapper ? ( 'newWrapperValue' in this ? this.newWrapperValue : this.wrapperValue ) : this.value;

		// TODO remove this legacy nonsense
		const ractive = this.root.ractive;
		const keypath = this.getKeypath();

		// tear previous adaptor down if present
		if ( this.wrapper ) {
			const shouldTeardown = this.wrapperValue === value ? false : !this.wrapper.reset || this.wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				this.wrapper.teardown();
				this.wrapper = null;

				// don't branch for undefined values
				if ( this.value !== undefined ) {
					const parentValue = this.parent.value || this.parent.createBranch( this.key );
					if ( parentValue[ this.key ] !== value ) parentValue[ this.key ] = value;
				}
			} else {
				delete this.newWrapperValue;
				this.wrapperValue = value;
				this.value = this.wrapper.get();
				return;
			}
		}

		let i;

		for ( i = 0; i < len; i += 1 ) {
			const adaptor = adaptors[i];
			if ( adaptor.filter( value, keypath, ractive ) ) {
				this.wrapper = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
				this.wrapperValue = value;
				this.wrapper.__model = this; // massive temporary hack to enable array adaptor

				this.value = this.wrapper.get();

				break;
			}
		}
	}

	animate ( from, to, options, interpolator ) {
		if ( this.ticker ) this.ticker.stop();

		let fulfilPromise;
		const promise = new Promise( fulfil => fulfilPromise = fulfil );

		this.ticker = new Ticker({
			duration: options.duration,
			easing: options.easing,
			step: t => {
				const value = interpolator( t );
				this.applyValue( value );
				if ( options.step ) options.step( t, value );
			},
			complete: () => {
				this.applyValue( to );
				if ( options.complete ) options.complete( to );

				this.ticker = null;
				fulfilPromise( to );
			}
		});

		promise.stop = this.ticker.stop;
		return promise;
	}

	applyValue ( value, notify = true ) {
		if ( isEqual( value, this.value ) ) return;
		if ( this.boundValue ) this.boundValue = null;

		if ( this.parent.wrapper && this.parent.wrapper.set ) {
			this.parent.wrapper.set( this.key, value );
			this.parent.value = this.parent.wrapper.get();

			this.value = this.parent.value[ this.key ];
			if ( this.wrapper ) this.newWrapperValue = this.value;
			this.adapt();
		} else if ( this.wrapper ) {
			this.newWrapperValue = value;
			this.adapt();
		} else {
			const parentValue = this.parent.value || this.parent.createBranch( this.key );
			if ( isObjectLike( parentValue ) ) {
				parentValue[ this.key ] = value;
			} else {
				warnIfDebug( `Attempted to set a property of a non-object '${this.getKeypath()}'` );
				return;
			}

			this.value = value;
			this.adapt();
		}

		// keep track of array stuff
		if ( Array.isArray( value ) ) {
			this.length = value.length;
			this.isArray = true;
		} else {
			this.isArray = false;
		}

		// notify dependants
		this.links.forEach( handleChange );
		this.children.forEach( mark );
		this.deps.forEach( handleChange );

		if ( notify ) this.notifyUpstream();

		if ( this.parent.isArray ) {
			if ( this.key === 'length' ) this.parent.length = value;
			else this.parent.joinKey( 'length' ).mark();
		}
	}

	createBranch ( key ) {
		const branch = isNumeric( key ) ? [] : {};
		this.applyValue( branch, false );

		return branch;
	}

	get ( shouldCapture, opts ) {
		if ( this._link ) return this._link.get( shouldCapture, opts );
		if ( shouldCapture ) capture( this );
		// if capturing, this value needs to be unwrapped because it's for external use
		if ( opts && opts.virtual ) return this.getVirtual( false );
		return maybeBind( this, ( ( opts && 'unwrap' in opts ) ? opts.unwrap !== false : shouldCapture ) && this.wrapper ? this.wrapperValue : this.value, !opts || opts.shouldBind !== false );
	}

	getKeypathModel () {
		if ( !this.keypathModel ) this.keypathModel = new KeypathModel( this );
		return this.keypathModel;
	}

	joinKey ( key, opts ) {
		if ( this._link ) {
			if ( opts && opts.lastLink !== false && ( key === undefined || key === '' ) ) return this;
			return this._link.joinKey( key );
		}

		if ( key === undefined || key === '' ) return this;


		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new Model( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		if ( this.childByKey[ key ]._link && ( !opts || opts.lastLink !== false ) ) return this.childByKey[ key ]._link;
		return this.childByKey[ key ];
	}

	mark ( force ) {
		if ( this._link ) return this._link.mark( force );

		const old = this.value;
		const value = this.retrieve();

		if ( force || !isEqual( value, old ) ) {
			this.value = value;
			if ( this.boundValue ) this.boundValue = null;

			// make sure the wrapper stays in sync
			if ( old !== value || this.rewrap ) {
				if ( this.wrapper ) this.newWrapperValue = value;
				this.adapt();
			}

			// keep track of array stuff
			if ( Array.isArray( value ) ) {
				this.length = value.length;
				this.isArray = true;
			} else {
				this.isArray = false;
			}

			this.children.forEach( force ? markForce : mark );
			this.links.forEach( marked );

			this.deps.forEach( handleChange );
		}
	}

	merge ( array, comparator ) {
		let oldArray = this.value;
		let newArray = array;
		if ( oldArray === newArray ) oldArray = recreateArray( this );
		if ( comparator ) {
			oldArray = oldArray.map( comparator );
			newArray = newArray.map( comparator );
		}

		const oldLength = oldArray.length;

		const usedIndices = {};
		let firstUnusedIndex = 0;

		const newIndices = oldArray.map( item => {
			let index;
			let start = firstUnusedIndex;

			do {
				index = newArray.indexOf( item, start );

				if ( index === -1 ) {
					return -1;
				}

				start = index + 1;
			} while ( ( usedIndices[ index ] === true ) && start < oldLength );

			// keep track of the first unused index, so we don't search
			// the whole of newArray for each item in oldArray unnecessarily
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}
			// allow next instance of next "equal" to be found item
			usedIndices[ index ] = true;
			return index;
		});

		this.parent.value[ this.key ] = array;
		this.shuffle( newIndices, true );
	}

	retrieve () {
		return this.parent.value ? this.parent.value[ this.key ] : undefined;
	}

	set ( value ) {
		if ( this.ticker ) this.ticker.stop();
		this.applyValue( value );
	}

	shuffle ( newIndices, unsafe ) {
		shuffle( this, newIndices, false, unsafe );
	}

	source () { return this; }

	teardown () {
		if ( this._link ) this._link.teardown();
		this.children.forEach( teardown );
		if ( this.wrapper ) this.wrapper.teardown();
		if ( this.keypathModel ) this.keypathModel.teardown();
	}
}

function recreateArray( model ) {
	const array = [];

	for ( let i = 0; i < model.length; i++ ) {
		array[ i ] = (model.childByKey[i] || {}).value;
	}

	return array;
}

/* global global */
const data = {};

class SharedModel extends Model {
	constructor ( value, name ) {
		super( null, `@${name}` );
		this.key = `@${name}`;
		this.value = value;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
	}

	getKeypath() {
		return this.key;
	}

	retrieve () { return this.value; }
}

var SharedModel$1 = new SharedModel( data, 'shared' );

const GlobalModel = new SharedModel( typeof global !== 'undefined' ? global : window, 'global' );

function resolveReference ( fragment, ref ) {
	const initialFragment = fragment;
	// current context ref
	if ( ref === '.' ) return fragment.findContext();

	// ancestor references
	if ( ref[0] === '~' ) return fragment.ractive.viewmodel.joinAll( splitKeypath( ref.slice( 2 ) ) );

	// scoped references
	if ( ref[0] === '.' || ref[0] === '^' ) {
		let frag = fragment;
		const parts = ref.split( '/' );
		const explicitContext = parts[0] === '^^';
		let context = explicitContext ? null : fragment.findContext();

		// account for the first context hop
		if ( explicitContext ) parts.unshift( '^^' );

		// walk up the context chain
		while ( parts[0] === '^^' ) {
			parts.shift();
			context = null;
			while ( frag && !context ) {
				context = frag.context;
				frag = frag.parent.component ? frag.parent.component.parentFragment : frag.parent;
			}
		}

		if ( !context && explicitContext ) {
			throw new Error( `Invalid context parent reference ('${ref}'). There is not context at that level.` );
		}

		// walk up the context path
		while ( parts[0] === '.' || parts[0] === '..' ) {
			const part = parts.shift();

			if ( part === '..' ) {
				context = context.parent;
			}
		}

		ref = parts.join( '/' );

		// special case - `{{.foo}}` means the same as `{{./foo}}`
		if ( ref[0] === '.' ) ref = ref.slice( 1 );
		return context.joinAll( splitKeypath( ref ) );
	}

	const keys = splitKeypath( ref );
	if ( !keys.length ) return;
	const base = keys.shift();

	// special refs
	if ( base[0] === '@' ) {
		// shorthand from outside the template
		// @this referring to local ractive instance
		if ( base === '@this' || base === '@' ) {
			return fragment.ractive.viewmodel.getRactiveModel().joinAll( keys );
		}

		// @index or @key referring to the nearest repeating index or key
		else if ( base === '@index' || base === '@key' ) {
			if ( keys.length ) badReference( base );
			const repeater = fragment.findRepeatingFragment();
			// make sure the found fragment is actually an iteration
			if ( !repeater.isIteration ) return;
			return repeater.context && repeater.context.getKeyModel( repeater[ ref[1] === 'i' ? 'index' : 'key' ] );
		}

		// @global referring to window or global
		else if ( base === '@global' ) {
			return GlobalModel.joinAll( keys );
		}

		// @global referring to window or global
		else if ( base === '@shared' ) {
			return SharedModel$1.joinAll( keys );
		}

		// @keypath or @rootpath, the current keypath string
		else if ( base === '@keypath' || base === '@rootpath' ) {
			const root = ref[1] === 'r' ? fragment.ractive.root : null;
			let context = fragment.findContext();

			// skip over component roots, which provide no context
			while ( root && context.isRoot && context.ractive.component ) {
				context = context.ractive.component.parentFragment.findContext();
			}

			return context.getKeypathModel( root );
		}

		else if ( base === '@context' ) {
			return new ContextModel( fragment.getContext() );
		}

		// @context-local data
		else if ( base === '@local' ) {
			return fragment.getContext()._data.joinAll( keys );
		}

		// @style shared model
		else if ( base === '@style' ) {
			return fragment.ractive.constructor._cssModel.joinAll( keys );
		}

		// nope
		else {
			throw new Error( `Invalid special reference '${base}'` );
		}
	}

	const context = fragment.findContext();

	// check immediate context for a match
	if ( context.has( base ) ) {
		return context.joinKey( base ).joinAll( keys );
	}

	// walk up the fragment hierarchy looking for a matching ref, alias, or key in a context
	let createMapping = false;
	const shouldWarn = fragment.ractive.warnAboutAmbiguity;

	while ( fragment ) {
		// repeated fragments
		if ( fragment.isIteration ) {
			if ( base === fragment.parent.keyRef ) {
				if ( keys.length ) badReference( base );
				return fragment.context.getKeyModel( fragment.key );
			}

			if ( base === fragment.parent.indexRef ) {
				if ( keys.length ) badReference( base );
				return fragment.context.getKeyModel( fragment.index );
			}
		}

		// alias node or iteration
		if ( fragment.aliases  && fragment.aliases.hasOwnProperty( base ) ) {
			const model = fragment.aliases[ base ];

			if ( keys.length === 0 ) return model;
			else if ( typeof model.joinAll === 'function' ) {
				return model.joinAll( keys );
			}
		}

		// check fragment context to see if it has the key we need
		if ( fragment.context && fragment.context.has( base ) ) {
			// this is an implicit mapping
			if ( createMapping ) {
				if ( shouldWarn ) warnIfDebug( `'${ref}' resolved but is ambiguous and will create a mapping to a parent component.` );
				return context.root.createLink( base, fragment.context.joinKey( base ), base, { implicit: true }).joinAll( keys );
			}

			if ( shouldWarn ) warnIfDebug( `'${ref}' resolved but is ambiguous.` );
			return fragment.context.joinKey( base ).joinAll( keys );
		}

		if ( ( fragment.componentParent || ( !fragment.parent && fragment.ractive.component ) ) && !fragment.ractive.isolated ) {
			// ascend through component boundary
			fragment = fragment.componentParent || fragment.ractive.component.parentFragment;
			createMapping = true;
		} else {
			fragment = fragment.parent;
		}
	}

	// if enabled, check the instance for a match
	const instance = initialFragment.ractive;
	if ( instance.resolveInstanceMembers && base !== 'data' && base in instance ) {
		return instance.viewmodel.getRactiveModel().joinKey( base ).joinAll( keys );
	}

	if ( shouldWarn ) {
		warnIfDebug( `'${ref}' is ambiguous and did not resolve.` );
	}

	// didn't find anything, so go ahead and create the key on the local model
	return context.joinKey( base ).joinAll( keys );
}

function badReference ( key ) {
	throw new Error( `An index or key reference (${key}) cannot have child properties` );
}

class ContextModel {
	constructor ( context ) {
		this.context = context;
	}

	get () { return this.context; }
}

const extern = {};

function getRactiveContext ( ractive, ...assigns ) {
	const fragment = ractive.fragment || ractive._fakeFragment || ( ractive._fakeFragment = new FakeFragment( ractive ) );
	return fragment.getContext.apply( fragment, assigns );
}

function getContext ( ...assigns ) {
	if ( !this.ctx ) this.ctx = new extern.Context( this );
	assigns.unshift( Object.create( this.ctx ) );
	return Object.assign.apply( null, assigns );
}

class FakeFragment {
	constructor ( ractive ) {
		this.ractive = ractive;
	}

	findContext () { return this.ractive.viewmodel; }
}
const proto$1 = FakeFragment.prototype;
proto$1.getContext = getContext;
proto$1.find = proto$1.findComponent = proto$1.findAll = proto$1.findAllComponents = noop;

function findParentWithContext ( fragment ) {
	let frag = fragment;
	while ( frag && !frag.context ) frag = frag.parent;
	if ( !frag ) return fragment && fragment.ractive.fragment;
	else return frag;
}

let keep = false;

function set ( pairs, options ) {
	const k = keep;

	const deep = options && options.deep;
	const shuffle = options && options.shuffle;
	const promise = runloop.start();
	if ( options && 'keep' in options ) keep = options.keep;

	let i = pairs.length;
	while ( i-- ) {
		const model = pairs[i][0];
		const value = pairs[i][1];
		const keypath = pairs[i][2];

		if ( !model ) {
			runloop.end();
			throw new Error( `Failed to set invalid keypath '${ keypath }'` );
		}

		if ( deep ) deepSet( model, value );
		else if ( shuffle ) {
			let array = value;
			const target = model.get();
			// shuffle target array with itself
			if ( !array ) array = target;

			// if there's not an array there yet, go ahead and set
			if ( target === undefined ) {
				model.set( array );
			} else {
				if ( !Array.isArray( target ) || !Array.isArray( array ) ) {
					runloop.end();
					throw new Error( 'You cannot merge an array with a non-array' );
				}

				const comparator = getComparator( shuffle );
				model.merge( array, comparator );
			}
		} else model.set( value );
	}

	runloop.end();

	keep = k;

	return promise;
}

const star = /\*/;
function gather ( ractive, keypath, base, isolated ) {
	if ( !base && ( keypath[0] === '.' || keypath[1] === '^' ) ) {
		warnIfDebug( `Attempted to set a relative keypath from a non-relative context. You can use a context object to set relative keypaths.` );
		return [];
	}

	const keys = splitKeypath( keypath );
	const model = base || ractive.viewmodel;

	if ( star.test( keypath ) ) {
		return model.findMatches( keys );
	} else {
		if ( model === ractive.viewmodel ) {
			// allow implicit mappings
			if ( ractive.component && !ractive.isolated && !model.has( keys[0] ) && keypath[0] !== '@' && keypath[0] && !isolated ) {
				return [ resolveReference( ractive.fragment || new FakeFragment( ractive ), keypath ) ];
			} else {
				return [ model.joinAll( keys ) ];
			}
		} else {
			return [ model.joinAll( keys ) ];
		}
	}
}

function build ( ractive, keypath, value, isolated ) {
	const sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( const k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push.apply( sets, gather( ractive, k, null, isolated ).map( m => [ m, keypath[k], k ] ) );
			}
		}

	}
	// set a single keypath
	else {
		sets.push.apply( sets, gather( ractive, keypath, null, isolated ).map( m => [ m, value, keypath ] ) );
	}

	return sets;
}

const deepOpts = { virtual: false };
function deepSet( model, value ) {
	const dest = model.get( false, deepOpts );

	// if dest doesn't exist, just set it
	if ( dest == null || typeof value !== 'object' ) return model.set( value );
	if ( typeof dest !== 'object' ) return model.set( value );

	for ( const k in value ) {
		if ( value.hasOwnProperty( k ) ) {
			deepSet( model.joinKey( k ), value[k] );
		}
	}
}

const comparators = {};
function getComparator ( option ) {
	if ( option === true ) return null; // use existing arrays
	if ( typeof option === 'function' ) return option;

	if ( typeof option === 'string' ) {
		return comparators[ option ] || ( comparators[ option ] = thing => thing[ option ] );
	}

	throw new Error( 'If supplied, options.compare must be a string, function, or true' ); // TODO link to docs
}

const errorMessage = 'Cannot add to a non-numeric value';

function add ( ractive, keypath, d, options ) {
	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	const sets = build( ractive, keypath, d, options && options.isolated );

	return set( sets.map( pair => {
		const [ model, add ] = pair;
		const value = model.get();
		if ( !isNumeric( add ) || !isNumeric( value ) ) throw new Error( errorMessage );
		return [ model, value + add ];
	}));
}

function Ractive$add ( keypath, d, options ) {
	const num = typeof d === 'number' ? d : 1;
	const opts = typeof d === 'object' ? d : options;
	return add( this, keypath, num, opts );
}

function immediate ( value ) {
	const promise = Promise.resolve( value );
	Object.defineProperty( promise, 'stop', { value: noop });
	return promise;
}

const linear = easing.linear;

function getOptions ( options, instance ) {
	options = options || {};

	let easing$$1;
	if ( options.easing ) {
		easing$$1 = typeof options.easing === 'function' ?
			options.easing :
			instance.easing[ options.easing ];
	}

	return {
		easing: easing$$1 || linear,
		duration: 'duration' in options ? options.duration : 400,
		complete: options.complete || noop,
		step: options.step || noop,
		interpolator: options.interpolator
	};
}

function animate ( ractive, model, to, options ) {
	options = getOptions( options, ractive );
	const from = model.get();

	// don't bother animating values that stay the same
	if ( isEqual( from, to ) ) {
		options.complete( options.to );
		return immediate( to );
	}

	const interpolator = interpolate( from, to, ractive, options.interpolator );

	// if we can't interpolate the value, set it immediately
	if ( !interpolator ) {
		runloop.start();
		model.set( to );
		runloop.end();

		return immediate( to );
	}

	return model.animate( from, to, options, interpolator );
}

function Ractive$animate ( keypath, to, options ) {
	if ( typeof keypath === 'object' ) {
		const keys = Object.keys( keypath );

		throw new Error( `ractive.animate(...) no longer supports objects. Instead of ractive.animate({
  ${keys.map( key => `'${key}': ${keypath[ key ]}` ).join( '\n  ' )}
}, {...}), do

${keys.map( key => `ractive.animate('${key}', ${keypath[ key ]}, {...});` ).join( '\n' )}
` );
	}

	return animate( this, this.viewmodel.joinAll( splitKeypath( keypath ) ), to, options );
}

function enqueue ( ractive, event ) {
	if ( ractive.event ) {
		ractive._eventQueue.push( ractive.event );
	}

	ractive.event = event;
}

function dequeue ( ractive ) {
	if ( ractive._eventQueue.length ) {
		ractive.event = ractive._eventQueue.pop();
	} else {
		ractive.event = null;
	}
}

const initStars = {};
const bubbleStars = {};

// cartesian product of name parts and stars
// adjusted appropriately for special cases
function variants ( name, initial ) {
	const map = initial ? initStars : bubbleStars;
	if ( map[ name ] ) return map[ name ];

	const parts = name.split( '.' );
	const result = [];
	let base = false;

	// initial events the implicit namespace of 'this'
	if ( initial ) {
		parts.unshift( 'this' );
		base = true;
	}

	// use max - 1 bits as a bitmap to pick a part or a *
	// need to skip the full star case if the namespace is synthetic
	const max = Math.pow( 2, parts.length ) - ( initial ? 1 : 0 );
	for ( let i = 0; i < max; i++ ) {
		const join = [];
		for ( let j = 0; j < parts.length; j++ ) {
			join.push( 1 & ( i >> j ) ? '*' : parts[j] );
		}
		result.unshift( join.join( '.' ) );
	}

	if ( base ) {
		// include non-this-namespaced versions
		if ( parts.length > 2 ) {
			result.push.apply( result, variants( name, false ) );
		} else {
			result.push( '*' );
			result.push( name );
		}
	}

	map[ name ] = result;
	return result;
}

function fireEvent ( ractive, eventName, context, args = [] ) {
	if ( !eventName ) { return; }

	context.name = eventName;
	args.unshift( context );

	const eventNames = ractive._nsSubs ? variants( eventName, true ) : [ '*', eventName ];

	return fireEventAs( ractive, eventNames, context, args, true );
}

function fireEventAs  ( ractive, eventNames, context, args, initialFire = false ) {
	let bubble = true;

	if ( initialFire || ractive._nsSubs ) {
		enqueue( ractive, context );

		let i = eventNames.length;
		while ( i-- ) {
			if ( eventNames[ i ] in ractive._subs ) {
				bubble = notifySubscribers( ractive, ractive._subs[ eventNames[ i ] ], context, args ) && bubble;
			}
		}

		dequeue( ractive );
	}

	if ( ractive.parent && bubble ) {
		if ( initialFire && ractive.component ) {
			const fullName = ractive.component.name + '.' + eventNames[ eventNames.length - 1 ];
			eventNames = variants( fullName, false );

			if ( context && !context.component ) {
				context.component = ractive;
			}
		}

		bubble = fireEventAs( ractive.parent, eventNames, context, args );
	}

	return bubble;
}

function notifySubscribers ( ractive, subscribers, context, args ) {
	let originalEvent = null;
	let stopEvent = false;

	// subscribers can be modified inflight, e.g. "once" functionality
	// so we need to copy to make sure everyone gets called
	subscribers = subscribers.slice();

	for ( let i = 0, len = subscribers.length; i < len; i += 1 ) {
		if ( !subscribers[ i ].off && subscribers[ i ].handler.apply( ractive, args ) === false ) {
			stopEvent = true;
		}
	}

	if ( context && stopEvent && ( originalEvent = context.event ) ) {
		originalEvent.preventDefault && originalEvent.preventDefault();
		originalEvent.stopPropagation && originalEvent.stopPropagation();
	}

	return !stopEvent;
}

class Hook {
	constructor ( event ) {
		this.event = event;
		this.method = 'on' + event;
	}

	fire ( ractive, arg ) {
		const context = getRactiveContext( ractive );

		if ( ractive[ this.method ] ) {
			arg ? ractive[ this.method ]( context, arg ) : ractive[ this.method ]( context );
		}

		fireEvent( ractive, this.event, context, arg ? [ arg, ractive ] : [ ractive ] );
	}
}

function findAnchors ( fragment, name = null ) {
	const res = [];

	findAnchorsIn( fragment, name, res );

	return res;
}

function findAnchorsIn ( item, name, result ) {
	if ( item.isAnchor ) {
		if ( !name || item.name === name ) {
			result.push( item );
		}
	} else if ( item.items ) {
		item.items.forEach( i => findAnchorsIn( i, name, result ) );
	} else if ( item.iterations ) {
		item.iterations.forEach( i => findAnchorsIn( i, name, result ) );
	} else if ( item.fragment && !item.component ) {
		findAnchorsIn( item.fragment, name, result );
	}
}

function updateAnchors ( instance, name = null ) {
	const anchors = findAnchors( instance.fragment, name );
	const idxs = {};
	const children = instance._children.byName;

	anchors.forEach( a => {
		const name = a.name;
		if ( !( name in idxs ) ) idxs[name] = 0;
		const idx = idxs[name];
		const child = ( children[name] || [] )[idx];

		if ( child && child.lastBound !== a ) {
			if ( child.lastBound ) child.lastBound.removeChild( child );
			a.addChild( child );
		}

		idxs[name]++;
	});
}

function unrenderChild ( meta ) {
	if ( meta.instance.fragment.rendered ) {
		meta.shouldDestroy = true;
		meta.instance.unrender();
	}
	meta.instance.el = null;
}

const attachHook = new Hook( 'attachchild' );

function attachChild ( child, options = {} ) {
	const children = this._children;
	let idx;

	if ( child.parent && child.parent !== this ) throw new Error( `Instance ${child._guid} is already attached to a different instance ${child.parent._guid}. Please detach it from the other instance using detachChild first.` );
	else if ( child.parent ) throw new Error( `Instance ${child._guid} is already attached to this instance.` );

	const meta = {
		instance: child,
		ractive: this,
		name: options.name || child.constructor.name || 'Ractive',
		target: options.target || false,
		bubble,
		findNextNode
	};
	meta.nameOption = options.name;

	// child is managing itself
	if ( !meta.target ) {
		meta.parentFragment = this.fragment;
		meta.external = true;
	} else {
		let list;
		if ( !( list = children.byName[ meta.target ] ) ) {
			list = [];
			this.set( `@this.children.byName.${meta.target}`, list );
		}
		idx = options.prepend ? 0 : options.insertAt !== undefined ? options.insertAt : list.length;
	}

	child.set({
		'@this.parent': this,
		'@this.root': this.root
	});
	child.component = meta;
	children.push( meta );

	attachHook.fire( child );

	const promise = runloop.start();

	if ( meta.target ) {
		unrenderChild( meta );
		this.splice( `@this.children.byName.${meta.target}`, idx, 0, meta );
		updateAnchors( this, meta.target );
	} else {
		if ( !child.isolated ) child.viewmodel.attached( this.fragment );
	}

	runloop.end();

	promise.ractive = child;
	return promise.then( () => child );
}

function bubble () { runloop.addFragment( this.instance.fragment ); }

function findNextNode () {
	if ( this.anchor ) return this.anchor.findNextNode();
}

const detachHook = new Hook( 'detach' );

function Ractive$detach () {
	if ( this.isDetached ) {
		return this.el;
	}

	if ( this.el ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.el = this.fragment.detach();
	this.isDetached = true;

	detachHook.fire( this );
	return this.el;
}

const detachHook$1 = new Hook( 'detachchild' );

function detachChild ( child ) {
	const children = this._children;
	let meta, index;

	let i = children.length;
	while ( i-- ) {
		if ( children[i].instance === child ) {
			index = i;
			meta = children[i];
			break;
		}
	}

	if ( !meta || child.parent !== this ) throw new Error( `Instance ${child._guid} is not attached to this instance.` );

	const promise = runloop.start();

	if ( meta.anchor ) meta.anchor.removeChild( meta );
	if ( !child.isolated ) child.viewmodel.detached();

	runloop.end();

	children.splice( index, 1 );
	if ( meta.target ) {
		this.splice( `@this.children.byName.${meta.target}`, children.byName[ meta.target ].indexOf(meta), 1 );
		updateAnchors( this, meta.target );
	}
	child.set({
		'@this.parent': undefined,
		'@this.root': child
	});
	child.component = null;

	detachHook$1.fire( child );

	promise.ractive = child;
	return promise.then( () => child );
}

function Ractive$find ( selector, options = {} ) {
	if ( !this.el ) throw new Error( `Cannot call ractive.find('${selector}') unless instance is rendered to the DOM` );

	let node = this.fragment.find( selector, options );
	if ( node ) return node;

	if ( options.remote ) {
		for ( let i = 0; i < this._children.length; i++ ) {
			if ( !this._children[i].instance.fragment.rendered ) continue;
			node = this._children[i].instance.find( selector, options );
			if ( node ) return node;
		}
	}
}

function Ractive$findAll ( selector, options = {} ) {
	if ( !this.el ) throw new Error( `Cannot call ractive.findAll('${selector}', ...) unless instance is rendered to the DOM` );

	if ( !Array.isArray( options.result ) ) options.result = [];

	this.fragment.findAll( selector, options );

	if ( options.remote ) {
		// seach non-fragment children
		this._children.forEach( c => {
			if ( !c.target && c.instance.fragment && c.instance.fragment.rendered ) {
				c.instance.findAll( selector, options );
			}
		});
	}

	return options.result;
}

function Ractive$findAllComponents ( selector, options ) {
	if ( !options && typeof selector === 'object' ) {
		options = selector;
		selector = '';
	}

	options = options || {};

	if ( !Array.isArray( options.result ) ) options.result = [];

	this.fragment.findAllComponents( selector, options );

	if ( options.remote ) {
		// search non-fragment children
		this._children.forEach( c => {
			if ( !c.target && c.instance.fragment && c.instance.fragment.rendered ) {
				if ( !selector || c.name === selector ) {
					options.result.push( c.instance );
				}

				c.instance.findAllComponents( selector, options );
			}
		});
	}

	return options.result;
}

function Ractive$findComponent ( selector, options = {} ) {
	if ( typeof selector === 'object' ) {
		options = selector;
		selector = '';
	}

	let child = this.fragment.findComponent( selector, options );
	if ( child ) return child;

	if ( options.remote ) {
		if ( !selector && this._children.length ) return this._children[0].instance;
		for ( let i = 0; i < this._children.length; i++ ) {
			// skip children that are or should be in an anchor
			if ( this._children[i].target ) continue;
			if ( this._children[i].name === selector ) return this._children[i].instance;
			child = this._children[i].instance.findComponent( selector, options );
			if ( child ) return child;
		}
	}
}

function Ractive$findContainer ( selector ) {
	if ( this.container ) {
		if ( this.container.component && this.container.component.name === selector ) {
			return this.container;
		} else {
			return this.container.findContainer( selector );
		}
	}

	return null;
}

function Ractive$findParent ( selector ) {

	if ( this.parent ) {
		if ( this.parent.component && this.parent.component.name === selector ) {
			return this.parent;
		} else {
			return this.parent.findParent ( selector );
		}
	}

	return null;
}

const TEXT              = 1;
const INTERPOLATOR      = 2;
const TRIPLE            = 3;
const SECTION           = 4;
const INVERTED          = 5;
const CLOSING           = 6;
const ELEMENT           = 7;
const PARTIAL           = 8;
const COMMENT           = 9;
const DELIMCHANGE       = 10;
const ANCHOR            = 11;
const ATTRIBUTE         = 13;
const CLOSING_TAG       = 14;
const COMPONENT         = 15;
const YIELDER           = 16;
const INLINE_PARTIAL    = 17;
const DOCTYPE           = 18;
const ALIAS             = 19;

const NUMBER_LITERAL    = 20;
const STRING_LITERAL    = 21;
const ARRAY_LITERAL     = 22;
const OBJECT_LITERAL    = 23;
const BOOLEAN_LITERAL   = 24;
const REGEXP_LITERAL    = 25;

const GLOBAL            = 26;
const KEY_VALUE_PAIR    = 27;


const REFERENCE         = 30;
const REFINEMENT        = 31;
const MEMBER            = 32;
const PREFIX_OPERATOR   = 33;
const BRACKETED         = 34;
const CONDITIONAL       = 35;
const INFIX_OPERATOR    = 36;

const INVOCATION        = 40;

const SECTION_IF        = 50;
const SECTION_UNLESS    = 51;
const SECTION_EACH      = 52;
const SECTION_WITH      = 53;
const SECTION_IF_WITH   = 54;

const ELSE              = 60;
const ELSEIF            = 61;

const EVENT             = 70;
const DECORATOR         = 71;
const TRANSITION        = 72;
const BINDING_FLAG      = 73;
const DELEGATE_FLAG     = 74;

function findElement( start, orComponent = true, name ) {
	while ( start && ( start.type !== ELEMENT || ( name && start.name !== name ) ) && ( !orComponent || ( start.type !== COMPONENT && start.type !== ANCHOR ) ) ) {
		// start is a fragment - look at the owner
		if ( start.owner ) start = start.owner;
		// start is a component or yielder - look at the container
		else if ( start.component ) start = start.containerFragment || start.component.parentFragment;
		// start is an item - look at the parent
		else if ( start.parent ) start = start.parent;
		// start is an item without a parent - look at the parent fragment
		else if ( start.parentFragment ) start = start.parentFragment;

		else start = undefined;
	}

	return start;
}

// This function takes an array, the name of a mutator method, and the
// arguments to call that mutator method with, and returns an array that
// maps the old indices to their new indices.

// So if you had something like this...
//
//     array = [ 'a', 'b', 'c', 'd' ];
//     array.push( 'e' );
//
// ...you'd get `[ 0, 1, 2, 3 ]` - in other words, none of the old indices
// have changed. If you then did this...
//
//     array.unshift( 'z' );
//
// ...the indices would be `[ 1, 2, 3, 4, 5 ]` - every item has been moved
// one higher to make room for the 'z'. If you removed an item, the new index
// would be -1...
//
//     array.splice( 2, 2 );
//
// ...this would result in [ 0, 1, -1, -1, 2, 3 ].
//
// This information is used to enable fast, non-destructive shuffling of list
// sections when you do e.g. `ractive.splice( 'items', 2, 2 );

function getNewIndices ( length, methodName, args ) {
	const newIndices = [];

	const spliceArguments = getSpliceEquivalent( length, methodName, args );

	if ( !spliceArguments ) {
		return null; // TODO support reverse and sort?
	}

	const balance = ( spliceArguments.length - 2 ) - spliceArguments[1];

	const removeStart = Math.min( length, spliceArguments[0] );
	const removeEnd = removeStart + spliceArguments[1];
	newIndices.startIndex = removeStart;

	let i;
	for ( i = 0; i < removeStart; i += 1 ) {
		newIndices.push( i );
	}

	for ( ; i < removeEnd; i += 1 ) {
		newIndices.push( -1 );
	}

	for ( ; i < length; i += 1 ) {
		newIndices.push( i + balance );
	}

	// there is a net shift for the rest of the array starting with index + balance
	if ( balance !== 0 ) {
		newIndices.touchedFrom = spliceArguments[0];
	} else {
		newIndices.touchedFrom = length;
	}

	return newIndices;
}


// The pop, push, shift an unshift methods can all be represented
// as an equivalent splice
function getSpliceEquivalent ( length, methodName, args ) {
	switch ( methodName ) {
		case 'splice':
			if ( args[0] !== undefined && args[0] < 0 ) {
				args[0] = length + Math.max( args[0], -length );
			}

			if ( args[0] === undefined ) args[0] = 0;

			while ( args.length < 2 ) {
				args.push( length - args[0] );
			}

			if ( typeof args[1] !== 'number' ) {
				args[1] = length - args[0];
			}

			// ensure we only remove elements that exist
			args[1] = Math.min( args[1], length - args[0] );

			return args;

		case 'sort':
		case 'reverse':
			return null;

		case 'pop':
			if ( length ) {
				return [ length - 1, 1 ];
			}
			return [ 0, 0 ];

		case 'push':
			return [ length, 0 ].concat( args );

		case 'shift':
			return [ 0, length ? 1 : 0 ];

		case 'unshift':
			return [ 0, 0 ].concat( args );
	}
}

const arrayProto = Array.prototype;

var makeArrayMethod = function ( methodName ) {
	function path ( keypath, ...args ) {
		return model( this.viewmodel.joinAll( splitKeypath( keypath ) ), args );
	}

	function model ( mdl, args ) {
		let array = mdl.get();

		if ( !Array.isArray( array ) ) {
			if ( array === undefined ) {
				array = [];
				const result = arrayProto[ methodName ].apply( array, args );
				const promise = runloop.start().then( () => result );
				mdl.set( array );
				runloop.end();
				return promise;
			} else {
				throw new Error( `shuffle array method ${methodName} called on non-array at ${mdl.getKeypath()}` );
			}
		}

		const newIndices = getNewIndices( array.length, methodName, args );
		const result = arrayProto[ methodName ].apply( array, args );

		const promise = runloop.start().then( () => result );
		promise.result = result;

		if ( newIndices ) {
			mdl.shuffle( newIndices );
		} else {
			mdl.set( result );
		}

		runloop.end();

		return promise;
	}

	return { path, model };
};

const updateHook = new Hook( 'update' );

function update$1 ( ractive, model, options ) {
	// if the parent is wrapped, the adaptor will need to be updated before
	// updating on this keypath
	if ( model.parent && model.parent.wrapper ) {
		model.parent.adapt();
	}

	const promise = runloop.start();

	model.mark( options && options.force );

	// notify upstream of changes
	model.notifyUpstream();

	runloop.end();

	updateHook.fire( ractive, model );

	return promise;
}

function Ractive$update ( keypath, options ) {
	let opts, path;

	if ( typeof keypath === 'string' ) {
		path = splitKeypath( keypath );
		opts = options;
	} else {
		opts = keypath;
	}

	return update$1( this, path ? this.viewmodel.joinAll( path ) : this.viewmodel, opts );
}

const modelPush = makeArrayMethod( 'push' ).model;
const modelPop = makeArrayMethod( 'pop' ).model;
const modelShift = makeArrayMethod( 'shift' ).model;
const modelUnshift = makeArrayMethod( 'unshift' ).model;
const modelSort = makeArrayMethod( 'sort' ).model;
const modelSplice = makeArrayMethod( 'splice' ).model;
const modelReverse = makeArrayMethod( 'reverse' ).model;

class ContextData extends Model {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.root = this;
		this.value = {};
		this.ractive = options.ractive;
		this.adaptors = [];
		this.context = options.context;
	}

	getKeypath () {
		return '@context.data';
	}
}

class Context {
	constructor ( fragment, element ) {
		this.fragment = fragment;
		this.element = element || findElement( fragment );
		this.node = this.element && this.element.node;
		this.ractive = fragment.ractive;
		this.root = this;
	}

	get decorators () {
		const items = {};
		if ( !this.element ) return items;
		this.element.decorators.forEach( d => items[ d.name ] = d.handle );
		return items;
	}

	get _data () {
		return this.model || ( this.root.model = new ContextData({ ractive: this.ractive, context: this.root }) );
	}

	// the usual mutation suspects
	add ( keypath, d, options ) {
		const num = typeof d === 'number' ? +d : 1;
		const opts = typeof d === 'object' ? d : options;
		return set( build$1( this, keypath, num ).map( pair => {
			const [ model, val ] = pair;
			const value = model.get();
			if ( !isNumeric( val ) || !isNumeric( value ) ) throw new Error( 'Cannot add non-numeric value' );
			return [ model, value + val ];
		}), opts );
	}

	animate ( keypath, value, options ) {
		const model = findModel( this, keypath ).model;
		return animate( this.ractive, model, value, options );
	}

	// get relative keypaths and values
	get ( keypath ) {
		if ( !keypath ) return this.fragment.findContext().get( true );

		const { model } = findModel( this, keypath );

		return model ? model.get( true ) : undefined;
	}

	getParent ( component ) {
		let fragment = this.fragment;

		if ( fragment.context ) fragment = findParentWithContext( fragment.parent || ( component && fragment.componentParent ) );
		else {
			fragment = findParentWithContext( fragment.parent || ( component && fragment.componentParent ) );
			if ( fragment ) fragment = findParentWithContext( fragment.parent || ( component && fragment.componentParent ) );
		}

		if ( !fragment || fragment === this.fragment ) return;
		else return fragment.getContext();
	}

	link ( source, dest ) {
		const there = findModel( this, source ).model;
		const here = findModel( this, dest ).model;
		const promise = runloop.start();
		here.link( there, source );
		runloop.end();
		return promise;
	}

	listen ( event, handler ) {
		const el = this.element;
		el.on( event, handler );
		return {
			cancel () { el.off( event, handler ); }
		};
	}

	observe ( keypath, callback, options = {} ) {
		if ( isObject( keypath ) ) options = callback || {};
		options.fragment = this.fragment;
		return this.ractive.observe( keypath, callback, options );
	}

	observeOnce ( keypath, callback, options = {} ) {
		if ( isObject( keypath ) ) options = callback || {};
		options.fragment = this.fragment;
		return this.ractive.observeOnce( keypath, callback, options );
	}

	pop ( keypath ) {
		return modelPop( findModel( this, keypath ).model, [] );
	}

	push ( keypath, ...values ) {
		return modelPush( findModel( this, keypath ).model, values );
	}

	raise ( name, event, ...args ) {
		let element = this.element;
		let events, len, i;

		while ( element ) {
			events = element.events;
			len = events && events.length;
			for ( i = 0; i < len; i++ ) {
				const ev = events[i];
				if ( ~ev.template.n.indexOf( name ) ) {
					const ctx = !event || !( 'original' in event ) ?
						ev.element.getContext( event || {}, { original: {} } ) :
						ev.element.getContext( event || {} );
					return ev.fire( ctx, args );
				}
			}

			element = element.parent;
		}
	}

	readLink ( keypath, options ) {
		return this.ractive.readLink( this.resolve( keypath ), options );
	}

	resolve ( path, ractive ) {
		const { model, instance } = findModel( this, path );
		return model ? model.getKeypath( ractive || instance ) : path;
	}

	reverse ( keypath ) {
		return modelReverse( findModel( this, keypath ).model, [] );
	}

	set ( keypath, value, options ) {
		return set( build$1( this, keypath, value ), options );
	}

	shift ( keypath ) {
		return modelShift( findModel( this, keypath ).model, [] );
	}

	splice ( keypath, index, drop, ...add ) {
		add.unshift( index, drop );
		return modelSplice( findModel( this, keypath ).model, add );
	}

	sort ( keypath ) {
		return modelSort( findModel( this, keypath ).model, [] );
	}

	subtract ( keypath, d, options ) {
		const num = typeof d === 'number' ? d : 1;
		const opts = typeof d === 'object' ? d : options;
		return set( build$1( this, keypath, num ).map( pair => {
			const [ model, val ] = pair;
			const value = model.get();
			if ( !isNumeric( val ) || !isNumeric( value ) ) throw new Error( 'Cannot add non-numeric value' );
			return [ model, value - val ];
		}), opts );
	}

	toggle ( keypath, options ) {
		const { model } = findModel( this, keypath );
		return set( [ [ model, !model.get() ] ], options );
	}

	unlink ( dest ) {
		const here = findModel( this, dest ).model;
		const promise = runloop.start();
		if ( here.owner && here.owner._link ) here.owner.unlink();
		runloop.end();
		return promise;
	}

	unlisten ( event, handler ) {
		this.element.off( event, handler );
	}

	unshift ( keypath, ...add ) {
		return modelUnshift( findModel( this, keypath ).model, add );
	}

	update ( keypath, options ) {
		return update$1( this.ractive, findModel( this, keypath ).model, options );
	}

	updateModel ( keypath, cascade ) {
		const { model } = findModel( this, keypath );
		const promise = runloop.start();
		model.updateFromBindings( cascade );
		runloop.end();
		return promise;
	}

	// two-way binding related helpers
	isBound () {
		const { model } = this.getBindingModel( this );
		return !!model;
	}

	getBindingPath ( ractive ) {
		const { model, instance } = this.getBindingModel( this );
		if ( model ) return model.getKeypath( ractive || instance );
	}

	getBinding () {
		const { model } = this.getBindingModel( this );
		if ( model ) return model.get( true );
	}

	getBindingModel ( ctx ) {
		const el = ctx.element;
		return { model: el.binding && el.binding.model, instance: el.parentFragment.ractive };
	}

	setBinding ( value ) {
		const { model } = this.getBindingModel( this );
		return set( [ [ model, value ] ] );
	}
}

Context.forRactive = getRactiveContext;
// circular deps are fun
extern.Context = Context;

// TODO: at some point perhaps this could support relative * keypaths?
function build$1 ( ctx, keypath, value ) {
	const sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( const k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push( [ findModel( ctx, k ).model, keypath[k] ] );
			}
		}

	}
	// set a single keypath
	else {
		sets.push( [ findModel( ctx, keypath ).model, value ] );
	}

	return sets;
}

function findModel ( ctx, path ) {
	const frag = ctx.fragment;

	if ( typeof path !== 'string' ) {
		return { model: frag.findContext(), instance: path };
	}

	return { model: resolveReference( frag, path ), instance: frag.ractive };
}

function Ractive$fire ( eventName, ...args ) {
	let ctx;

	// watch for reproxy
	if ( args[0] instanceof Context  ) {
		const proto = args.shift();
		ctx = Object.create( proto );
		Object.assign( ctx, proto );
	} else if ( typeof args[0] === 'object' && ( args[0] === null || args[0].constructor === Object ) ) {
		ctx = Context.forRactive( this, args.shift() );
	} else {
		ctx = Context.forRactive( this );
	}


	return fireEvent( this, eventName, ctx, args );
}

function Ractive$get ( keypath, opts ) {
	if ( typeof keypath !== 'string' ) return this.viewmodel.get( true, keypath );

	const keys = splitKeypath( keypath );
	const key = keys[0];

	let model;

	if ( !this.viewmodel.has( key ) ) {
		// if this is an inline component, we may need to create
		// an implicit mapping
		if ( this.component && !this.isolated ) {
			model = resolveReference( this.fragment || new FakeFragment( this ), key );
		}
	}

	model = this.viewmodel.joinAll( keys );
	return model.get( true, opts );
}

const query = doc && doc.querySelector;

function getContext$2 ( node ) {
	if ( typeof node === 'string' && query ) {
		node = query.call( document, node );
	}

	let instances;
	if ( node ) {
		if ( node._ractive ) {
			return node._ractive.proxy.getContext();
		} else if ( ( instances = node.__ractive_instances__ ) && instances.length === 1 ) {
			return getRactiveContext( instances[0] );
		}
	}
}

function getNodeInfo$1 ( node ) {
	warnOnceIfDebug( `getNodeInfo has been renamed to getContext, and the getNodeInfo alias will be removed in a future release.` );
	return getContext$2 ( node );
}

function getContext$1 ( node, options ) {
	if ( typeof node === 'string' ) {
		node = this.find( node, options );
	}

	return getContext$2( node );
}

function getNodeInfo$$1 ( node, options ) {
	if ( typeof node === 'string' ) {
		node = this.find( node, options );
	}

	return getNodeInfo$1( node );
}

const html   = 'http://www.w3.org/1999/xhtml';
const mathml = 'http://www.w3.org/1998/Math/MathML';
const svg$1    = 'http://www.w3.org/2000/svg';
const xlink  = 'http://www.w3.org/1999/xlink';
const xml    = 'http://www.w3.org/XML/1998/namespace';
const xmlns  = 'http://www.w3.org/2000/xmlns';

var namespaces = { html, mathml, svg: svg$1, xlink, xml, xmlns };

let createElement;
let matches;
let div;
let methodNames;
let unprefixed;
let prefixed;
let i;
let j;
let makeFunction;

// Test for SVG support
if ( !svg ) {
	/* istanbul ignore next */
	createElement = ( type, ns, extend ) => {
		if ( ns && ns !== html ) {
			throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information';
		}

		return extend ?
			doc.createElement( type, extend ) :
			doc.createElement( type );
	};
} else {
	createElement = ( type, ns, extend ) => {
		if ( !ns || ns === html ) {
			return extend ?
				doc.createElement( type, extend ) :
				doc.createElement( type );
		}

		return extend ?
			doc.createElementNS( ns, type, extend ) :
			doc.createElementNS( ns, type );
	};
}

function createDocumentFragment () {
	return doc.createDocumentFragment();
}

function getElement ( input ) {
	let output;

	if ( !input || typeof input === 'boolean' ) { return; }

	/* istanbul ignore next */
	if ( !win || !doc || !input ) {
		return null;
	}

	// We already have a DOM node - no work to do. (Duck typing alert!)
	if ( input.nodeType ) {
		return input;
	}

	// Get node from string
	if ( typeof input === 'string' ) {
		// try ID first
		output = doc.getElementById( input );

		// then as selector, if possible
		if ( !output && doc.querySelector ) {
			try {
				output = doc.querySelector( input );
			} catch (e) { /* this space intentionally left blank */ }
		}

		// did it work?
		if ( output && output.nodeType ) {
			return output;
		}
	}

	// If we've been given a collection (jQuery, Zepto etc), extract the first item
	if ( input[0] && input[0].nodeType ) {
		return input[0];
	}

	return null;
}

if ( !isClient ) {
	matches = null;
} else {
	div = createElement( 'div' );
	methodNames = [ 'matches', 'matchesSelector' ];

	makeFunction = function ( methodName ) {
		return function ( node, selector ) {
			return node[ methodName ]( selector );
		};
	};

	i = methodNames.length;

	while ( i-- && !matches ) {
		unprefixed = methodNames[i];

		if ( div[ unprefixed ] ) {
			matches = makeFunction( unprefixed );
		} else {
			j = vendors.length;
			while ( j-- ) {
				prefixed = vendors[i] + unprefixed.substr( 0, 1 ).toUpperCase() + unprefixed.substring( 1 );

				if ( div[ prefixed ] ) {
					matches = makeFunction( prefixed );
					break;
				}
			}
		}
	}

	// IE8... and apparently phantom some?
	/* istanbul ignore next */
	if ( !matches ) {
		matches = function ( node, selector ) {
			let parentNode, i;

			parentNode = node.parentNode;

			if ( !parentNode ) {
				// empty dummy <div>
				div.innerHTML = '';

				parentNode = div;
				node = node.cloneNode();

				div.appendChild( node );
			}

			const nodes = parentNode.querySelectorAll( selector );

			i = nodes.length;
			while ( i-- ) {
				if ( nodes[i] === node ) {
					return true;
				}
			}

			return false;
		};
	}
}

function detachNode ( node ) {
	// stupid ie
	if ( node && typeof node.parentNode !== 'unknown' && node.parentNode ) { // eslint-disable-line valid-typeof
		node.parentNode.removeChild( node );
	}

	return node;
}

function safeToStringValue ( value ) {
	return ( value == null || ( typeof value === 'number' && isNaN( value ) ) || !value.toString ) ? '' : '' + value;
}

function safeAttributeString ( string ) {
	return safeToStringValue( string )
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

const insertHook = new Hook( 'insert' );

function Ractive$insert ( target, anchor ) {
	if ( !this.fragment.rendered ) {
		// TODO create, and link to, documentation explaining this
		throw new Error( 'The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.' );
	}

	target = getElement( target );
	anchor = getElement( anchor ) || null;

	if ( !target ) {
		throw new Error( 'You must specify a valid target to insert into' );
	}

	target.insertBefore( this.detach(), anchor );
	this.el = target;

	( target.__ractive_instances__ || ( target.__ractive_instances__ = [] ) ).push( this );
	this.isDetached = false;

	fireInsertHook( this );
}

function fireInsertHook( ractive ) {
	insertHook.fire( ractive );

	ractive.findAllComponents('*').forEach( child => {
		fireInsertHook( child.instance );
	});
}

function link ( there, here, options ) {
	let model;
	const target = ( options && ( options.ractive || options.instance ) ) || this;

	// may need to allow a mapping to resolve implicitly
	const sourcePath = splitKeypath( there );
	if ( !target.viewmodel.has( sourcePath[0] ) && target.component ) {
		model = resolveReference( target.component.parentFragment, sourcePath[0] );
		model = model.joinAll( sourcePath.slice( 1 ) );
	}

	const src = model || target.viewmodel.joinAll( sourcePath );
	const dest = this.viewmodel.joinAll( splitKeypath( here ), { lastLink: false });

	if ( isUpstream( src, dest ) || isUpstream( dest, src ) ) {
		throw new Error( 'A keypath cannot be linked to itself.' );
	}

	const promise = runloop.start();

	dest.link( src, ( options && options.keypath ) || there );

	runloop.end();

	return promise;
}

function isUpstream ( check, start ) {
	let model = start;
	while ( model ) {
		if ( model === check ) return true;
		model = model.target || model.parent;
	}
}

class Observer {
	constructor ( ractive, model, callback, options ) {
		this.context = options.context || ractive;
		this.callback = callback;
		this.ractive = ractive;
		this.keypath = options.keypath;
		this.options = options;

		if ( model ) this.resolved( model );

		if ( typeof options.old === 'function' ) {
			this.oldContext = Object.create( ractive );
			this.old = options.old;
		} else {
			this.old = old;
		}

		if ( options.init !== false ) {
			this.dirty = true;
			this.dispatch();
		} else {
			this.oldValue = this.old.call( this.oldContext, undefined, this.newValue );
		}

		this.dirty = false;
	}

	cancel () {
		this.cancelled = true;
		if ( this.model ) {
			this.model.unregister( this );
		} else {
			this.resolver.unbind();
		}
		removeFromArray( this.ractive._observers, this );
	}

	dispatch () {
		if ( !this.cancelled ) {
			this.callback.call( this.context, this.newValue, this.oldValue, this.keypath );
			this.oldValue = this.old.call( this.oldContext, this.oldValue, this.model ? this.model.get() : this.newValue );
			this.dirty = false;
		}
	}

	handleChange () {
		if ( !this.dirty ) {
			const newValue = this.model.get();
			if ( isEqual( newValue, this.oldValue ) ) return;

			this.newValue = newValue;

			if ( this.options.strict && this.newValue === this.oldValue ) return;

			runloop.addObserver( this, this.options.defer );
			this.dirty = true;

			if ( this.options.once ) runloop.scheduleTask( () => this.cancel() );
		}
	}

	rebind ( next, previous ) {
		next = rebindMatch( this.keypath, next, previous );
		// TODO: set up a resolver if next is undefined?
		if ( next === this.model ) return false;

		if ( this.model ) this.model.unregister( this );
		if ( next ) next.addShuffleTask( () => this.resolved( next ) );
	}

	resolved ( model ) {
		this.model = model;

		this.oldValue = undefined;
		this.newValue = model.get();

		model.register( this );
	}
}

function old ( previous, next ) {
	return next;
}

const star$1 = /\*+/g;

class PatternObserver {
	constructor ( ractive, baseModel, keys, callback, options ) {
		this.context = options.context || ractive;
		this.ractive = ractive;
		this.baseModel = baseModel;
		this.keys = keys;
		this.callback = callback;

		const pattern = keys.join( '\\.' ).replace( star$1, '(.+)' );
		const baseKeypath = this.baseKeypath = baseModel.getKeypath( ractive );
		this.pattern = new RegExp( `^${baseKeypath ? baseKeypath + '\\.' : ''}${pattern}$` );
		this.recursive = keys.length === 1 && keys[0] === '**';
		if ( this.recursive ) this.keys = [ '*' ];

		this.oldValues = {};
		this.newValues = {};

		this.defer = options.defer;
		this.once = options.once;
		this.strict = options.strict;

		this.dirty = false;
		this.changed = [];
		this.partial = false;
		this.links = options.links;

		const models = baseModel.findMatches( this.keys );

		models.forEach( model => {
			this.newValues[ model.getKeypath( this.ractive ) ] = model.get();
		});

		if ( options.init !== false ) {
			this.dispatch();
		} else {
			this.oldValues = this.newValues;
		}

		baseModel.registerPatternObserver( this );
	}

	cancel () {
		this.baseModel.unregisterPatternObserver( this );
		removeFromArray( this.ractive._observers, this );
	}

	dispatch () {
		const newValues = this.newValues;
		this.newValues = {};
		Object.keys( newValues ).forEach( keypath => {
			const newValue = newValues[ keypath ];
			const oldValue = this.oldValues[ keypath ];

			if ( this.strict && newValue === oldValue ) return;
			if ( isEqual( newValue, oldValue ) ) return;

			let args = [ newValue, oldValue, keypath ];
			if ( keypath ) {
				const wildcards = this.pattern.exec( keypath );
				if ( wildcards ) {
					args = args.concat( wildcards.slice( 1 ) );
				}
			}

			this.callback.apply( this.context, args );
		});

		if ( this.partial ) {
			for ( const k in newValues ) {
				this.oldValues[k] = newValues[k];
			}
		} else {
			this.oldValues = newValues;
		}

		this.dirty = false;
	}

	notify ( key ) {
		this.changed.push( key );
	}

	shuffle ( newIndices ) {
		if ( !Array.isArray( this.baseModel.value ) ) return;

		const max = this.baseModel.value.length;

		for ( let i = 0; i < newIndices.length; i++ ) {
			if ( newIndices[ i ] === -1 || newIndices[ i ] === i ) continue;
			this.changed.push([ i ]);
		}

		for ( let i = newIndices.touchedFrom; i < max; i++ ) {
			this.changed.push([ i ]);
		}
	}

	handleChange () {
		if ( !this.dirty || this.changed.length ) {
			if ( !this.dirty ) this.newValues = {};

			if ( !this.changed.length ) {
				this.baseModel.findMatches( this.keys ).forEach( model => {
					const keypath = model.getKeypath( this.ractive );
					this.newValues[ keypath ] = model.get();
				});
				this.partial = false;
			} else {
				let count = 0;

				if ( this.recursive ) {
					this.changed.forEach( keys => {
						const model = this.baseModel.joinAll( keys );
						if ( model.isLink && !this.links ) return;
						count++;
						this.newValues[ model.getKeypath( this.ractive ) ] = model.get();
					});
				} else {
					const ok = this.baseModel.isRoot ?
						this.changed.map( keys => keys.map( escapeKey ).join( '.' ) ) :
						this.changed.map( keys => this.baseKeypath + '.' + keys.map( escapeKey ).join( '.' ) );

					this.baseModel.findMatches( this.keys ).forEach( model => {
						const keypath = model.getKeypath( this.ractive );
						const check = k => {
							return ( k.indexOf( keypath ) === 0 && ( k.length === keypath.length || k[ keypath.length ] === '.' ) ) ||
								( keypath.indexOf( k ) === 0 && ( k.length === keypath.length || keypath[ k.length ] === '.' ) );
						};

						// is this model on a changed keypath?
						if ( ok.filter( check ).length ) {
							count++;
							this.newValues[ keypath ] = model.get();
						}
					});
				}

				// no valid change triggered, so bail to avoid breakage
				if ( !count ) return;

				this.partial = true;
			}

			runloop.addObserver( this, this.defer );
			this.dirty = true;
			this.changed.length = 0;

			if ( this.once ) this.cancel();
		}
	}
}

function negativeOne () {
	return -1;
}

class ArrayObserver {
	constructor ( ractive, model, callback, options ) {
		this.ractive = ractive;
		this.model = model;
		this.keypath = model.getKeypath();
		this.callback = callback;
		this.options = options;

		this.pending = null;

		model.register( this );

		if ( options.init !== false ) {
			this.sliced = [];
			this.shuffle([]);
			this.dispatch();
		} else {
			this.sliced = this.slice();
		}
	}

	cancel () {
		this.model.unregister( this );
		removeFromArray( this.ractive._observers, this );
	}

	dispatch () {
		this.callback( this.pending );
		this.pending = null;
		if ( this.options.once ) this.cancel();
	}

	handleChange ( path ) {
		if ( this.pending ) {
			// post-shuffle
			runloop.addObserver( this, this.options.defer );
		} else if ( !path ) {
			// entire array changed
			this.shuffle( this.sliced.map( negativeOne ) );
			this.handleChange();
		}
	}

	shuffle ( newIndices ) {
		const newValue = this.slice();

		const inserted = [];
		const deleted = [];
		let start;

		const hadIndex = {};

		newIndices.forEach( ( newIndex, oldIndex ) => {
			hadIndex[ newIndex ] = true;

			if ( newIndex !== oldIndex && start === undefined ) {
				start = oldIndex;
			}

			if ( newIndex === -1 ) {
				deleted.push( this.sliced[ oldIndex ] );
			}
		});

		if ( start === undefined ) start = newIndices.length;

		const len = newValue.length;
		for ( let i = 0; i < len; i += 1 ) {
			if ( !hadIndex[i] ) inserted.push( newValue[i] );
		}

		this.pending = { inserted, deleted, start };
		this.sliced = newValue;
	}

	slice () {
		const value = this.model.get();
		return Array.isArray( value ) ? value.slice() : [];
	}
}

function observe ( keypath, callback, options ) {
	const observers = [];
	let map;
	let opts;

	if ( isObject( keypath ) ) {
		map = keypath;
		opts = callback || {};
	} else {
		if ( typeof keypath === 'function' ) {
			map = { '': keypath };
			opts = callback || {};
		} else {
			map = {};
			map[ keypath ] = callback;
			opts = options || {};
		}
	}

	let silent = false;
	Object.keys( map ).forEach( keypath => {
		const callback = map[ keypath ];
		const caller = function ( ...args ) {
			if ( silent ) return;
			return callback.apply( this, args );
		};

		let keypaths = keypath.split( ' ' );
		if ( keypaths.length > 1 ) keypaths = keypaths.filter( k => k );

		keypaths.forEach( keypath => {
			opts.keypath = keypath;
			const observer = createObserver( this, keypath, caller, opts );
			if ( observer ) observers.push( observer );
		});
	});

	// add observers to the Ractive instance, so they can be
	// cancelled on ractive.teardown()
	this._observers.push.apply( this._observers, observers );

	return {
		cancel: () => observers.forEach( o => o.cancel() ),
		isSilenced: () => silent,
		silence: () => silent = true,
		resume: () => silent = false
	};
}

function createObserver ( ractive, keypath, callback, options ) {
	const keys = splitKeypath( keypath );
	let wildcardIndex = keys.indexOf( '*' );
	if ( !~wildcardIndex ) wildcardIndex = keys.indexOf( '**' );

	options.fragment = options.fragment || ractive.fragment;

	let model;
	if ( !options.fragment ) {
		model = ractive.viewmodel.joinKey( keys[0] );
	} else {
		// .*.whatever relative wildcard is a special case because splitkeypath doesn't handle the leading .
		if ( ~keys[0].indexOf( '.*' ) ) {
			model = options.fragment.findContext();
			wildcardIndex = 0;
			keys[0] = keys[0].slice( 1 );
		} else {
			model = wildcardIndex === 0 ? options.fragment.findContext() : resolveReference( options.fragment, keys[0] );
		}
	}

	// the model may not exist key
	if ( !model ) model = ractive.viewmodel.joinKey( keys[0] );

	if ( !~wildcardIndex ) {
		model = model.joinAll( keys.slice( 1 ) );
		if ( options.array ) {
			return new ArrayObserver( ractive, model, callback, options );
		} else {
			return new Observer( ractive, model, callback, options );
		}
	} else {
		const double = keys.indexOf( '**' );
		if ( ~double ) {
			if ( double + 1 !== keys.length || ~keys.indexOf( '*' ) ) {
				warnOnceIfDebug( `Recursive observers may only specify a single '**' at the end of the path.` );
				return;
			}
		}

		model = model.joinAll( keys.slice( 1, wildcardIndex ) );

		return new PatternObserver( ractive, model, keys.slice( wildcardIndex ), callback, options );
	}
}

const onceOptions = { init: false, once: true };

function observeOnce ( keypath, callback, options ) {
	if ( isObject( keypath ) || typeof keypath === 'function' ) {
		options = Object.assign( callback || {}, onceOptions );
		return this.observe( keypath, options );
	}

	options = Object.assign( options || {}, onceOptions );
	return this.observe( keypath, callback, options );
}

var trim = str => str.trim();

var notEmptyString = str => str !== '';

function Ractive$off ( eventName, callback ) {
	// if no event is specified, remove _all_ event listeners
	if ( !eventName ) {
		this._subs = {};
	} else {
		// Handle multiple space-separated event names
		const eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

		eventNames.forEach( event => {
			const subs = this._subs[ event ];
			// if given a specific callback to remove, remove only it
			if ( subs && callback ) {
				const entry = subs.find( s => s.callback === callback );
				if ( entry ) {
					removeFromArray( subs, entry );
					entry.off = true;

					if ( event.indexOf( '.' ) ) this._nsSubs--;
				}
			}

			// otherwise, remove all listeners for this event
			else if ( subs ) {
				if ( event.indexOf( '.' ) ) this._nsSubs -= subs.length;
				subs.length = 0;
			}
		});
	}

	return this;
}

function Ractive$on ( eventName, callback ) {
	// eventName may already be a map
	const map = typeof eventName === 'object' ? eventName : {};
	// or it may be a string along with a callback
	if ( typeof eventName === 'string' ) map[ eventName ] = callback;

	let silent = false;
	const events = [];

	for ( const k in map ) {
		const callback = map[k];
		const caller = function ( ...args ) {
			if ( !silent ) return callback.apply( this, args );
		};
		const entry = {
			callback,
			handler: caller
		};

		if ( map.hasOwnProperty( k ) ) {
			const names = k.split( ' ' ).map( trim ).filter( notEmptyString );
			names.forEach( n => {
				( this._subs[ n ] || ( this._subs[ n ] = [] ) ).push( entry );
				if ( n.indexOf( '.' ) ) this._nsSubs++;
				events.push( [ n, entry ] );
			});
		}
	}

	return {
		cancel: () => events.forEach( e => this.off( e[0], e[1].callback ) ),
		isSilenced: () => silent,
		silence: () => silent = true,
		resume: () => silent = false
	};
}

function Ractive$once ( eventName, handler ) {
	const listener = this.on( eventName, function () {
		handler.apply( this, arguments );
		listener.cancel();
	});

	// so we can still do listener.cancel() manually
	return listener;
}

var pop = makeArrayMethod( 'pop' ).path;

var push = makeArrayMethod( 'push' ).path;

function readLink ( keypath, options = {} ) {
	const path = splitKeypath( keypath );

	if ( this.viewmodel.has( path[0] ) ) {
		let model = this.viewmodel.joinAll( path );

		if ( !model.isLink ) return;

		while ( ( model = model.target ) && options.canonical !== false ) {
			if ( !model.isLink ) break;
		}

		if ( model ) return { ractive: model.root.ractive, keypath: model.getKeypath() };
	}
}

const PREFIX = '/* Ractive.js component styles */';

// Holds current definitions of styles.
const styleDefinitions = [];

// Flag to tell if we need to update the CSS
let isDirty = false;

// These only make sense on the browser. See additional setup below.
let styleElement = null;
let useCssText = null;

function addCSS ( styleDefinition ) {
	styleDefinitions.push( styleDefinition );
	isDirty = true;
}

function applyCSS ( force ) {
	const styleElement = style();

	// Apply only seems to make sense when we're in the DOM. Server-side renders
	// can call toCSS to get the updated CSS.
	if ( !styleElement || ( !force && !isDirty ) ) return;

	if ( useCssText ) {
		styleElement.styleSheet.cssText = getCSS( null );
	} else {
		styleElement.innerHTML = getCSS( null );
	}

	isDirty = false;
}

function getCSS ( cssIds ) {
	const filteredStyleDefinitions = cssIds ? styleDefinitions.filter( style => ~cssIds.indexOf( style.id ) ) : styleDefinitions;

	filteredStyleDefinitions.forEach( d => d.applied = true );

	return filteredStyleDefinitions.reduce( ( styles, style ) => `${ styles ? `${styles}\n\n/* {${style.id}} */\n${style.styles}` : '' }`, PREFIX );
}

function style () {
	// If we're on the browser, additional setup needed.
	if ( doc && !styleElement ) {
		styleElement = doc.createElement( 'style' );
		styleElement.type = 'text/css';

		doc.getElementsByTagName( 'head' )[0].appendChild( styleElement );

		useCssText = !!styleElement.styleSheet;
	}

	return styleElement;
}

var adaptConfigurator = {
	extend: ( Parent, proto, options ) => {
		proto.adapt = combine( proto.adapt, ensureArray( options.adapt ) );
	},

	init () {}
};

const remove = /\/\*(?:[\s\S]*?)\*\//g;
const escape = /url\(\s*(['"])(?:\\[\s\S]|(?!\1).)*\1\s*\)|url\((?:\\[\s\S]|[^)])*\)|(['"])(?:\\[\s\S]|(?!\2).)*\2/gi;
const value = /\0(\d+)/g;

// Removes comments and strings from the given CSS to make it easier to parse.
// Callback receives the cleaned CSS and a function which can be used to put
// the removed strings back in place after parsing is done.
var cleanCss = function ( css, callback, additionalReplaceRules = [] ) {
	const values = [];
	const reconstruct = css => css.replace( value, ( match, n ) => values[ n ] );
	css = css.replace( escape, match => `\0${values.push( match ) - 1}`).replace( remove, '' );

	additionalReplaceRules.forEach( ( pattern ) => {
		css = css.replace( pattern, match => `\0${values.push( match ) - 1}` );
	});

	return callback( css, reconstruct );
};

const selectorsPattern = /(?:^|\}|\{)\s*([^\{\}\0]+)\s*(?=\{)/g;
const keyframesDeclarationPattern = /@keyframes\s+[^\{\}]+\s*\{(?:[^{}]+|\{[^{}]+})*}/gi;
const selectorUnitPattern = /((?:(?:\[[^\]]+\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
const excludePattern = /^(?:@|\d+%)/;
const dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;

function trim$1 ( str ) {
	return str.trim();
}

function extractString ( unit ) {
	return unit.str;
}

function transformSelector ( selector, parent ) {
	const selectorUnits = [];
	let match;

	while ( match = selectorUnitPattern.exec( selector ) ) {
		selectorUnits.push({
			str: match[0],
			base: match[1],
			modifiers: match[2]
		});
	}

	// For each simple selector within the selector, we need to create a version
	// that a) combines with the id, and b) is inside the id
	const base = selectorUnits.map( extractString );

	const transformed = [];
	let i = selectorUnits.length;

	while ( i-- ) {
		const appended = base.slice();

		// Pseudo-selectors should go after the attribute selector
		const unit = selectorUnits[i];
		appended[i] = unit.base + parent + unit.modifiers || '';

		const prepended = base.slice();
		prepended[i] = parent + ' ' + prepended[i];

		transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
	}

	return transformed.join( ', ' );
}

function transformCss ( css, id ) {
	const dataAttr = `[data-ractive-css~="{${id}}"]`;

	let transformed;

	if ( dataRvcGuidPattern.test( css ) ) {
		transformed = css.replace( dataRvcGuidPattern, dataAttr );
	} else {
		transformed = cleanCss( css, ( css, reconstruct ) => {
			css = css.replace( selectorsPattern, ( match, $1 ) => {
				// don't transform at-rules and keyframe declarations
				if ( excludePattern.test( $1 ) ) return match;

				const selectors = $1.split( ',' ).map( trim$1 );
				const transformed = selectors
					.map( selector => transformSelector( selector, dataAttr ) )
					.join( ', ' ) + ' ';

				return match.replace( $1, transformed );
			});

			return reconstruct( css );
		}, [ keyframesDeclarationPattern ]);
	}

	return transformed;
}

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function uuid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function setCSSData ( keypath, value, options ) {
	const opts = typeof keypath === 'object' ? value : options;
	const model = this._cssModel;

	model.locked = true;
	const promise = set( build( { viewmodel: model }, keypath, value, true ), opts );
	model.locked = false;

	const cascade = runloop.start();
	this.extensions.forEach( e => {
		const model = e._cssModel;
		model.mark();
		model.downstreamChanged( '', 1 );
	});
	runloop.end();

	applyChanges( this, !opts || opts.apply !== false );

	return promise.then( () => cascade );
}

function applyChanges ( component, apply ) {
	const local = recomputeCSS( component );
	const child = component.extensions.map( e => applyChanges( e, false ) ).
	  reduce( ( a, c ) => c || a, false );

	if ( apply && ( local || child ) ) {
		const def = component._cssDef;
		if ( !def || ( def && def.applied ) ) applyCSS( true );
	}

	return local || child;
}

function recomputeCSS ( component ) {
	const css = component._css;

	if ( typeof css !== 'function' ) return;

	const def = component._cssDef;
	const result = evalCSS( component, css );
	const styles = def.transform ? transformCss( result, def.id ) : result;

	if ( def.styles === styles ) return;

	def.styles = styles;

	return true;
}

class CSSModel extends SharedModel {
	constructor ( component ) {
		super( component.cssData, '@style' );
		this.component = component;
	}

	downstreamChanged ( path, depth ) {
		if ( this.locked ) return;

		const component = this.component;

		component.extensions.forEach( e => {
			const model = e._cssModel;
			model.mark();
			model.downstreamChanged( path, depth || 1 );
		});

		if ( !depth ) {
			applyChanges( component, true );
		}
	}
}

const hasCurly = /\{/;
var cssConfigurator = {
	name: 'css',

	// Called when creating a new component definition
	extend: ( Parent, proto, options, Child ) => {
		Child._cssIds = gatherIds( Parent );

		Object.defineProperty( Child, 'cssData', {
			configurable: true,
			value: Object.assign( Object.create( Parent.cssData ), options.cssData || {} )
		});

		Object.defineProperty( Child, '_cssModel', {
			configurable: true,
			value: new CSSModel( Child )
		});

		if ( !options.css ) return;

		let css = typeof options.css === 'string' && !hasCurly.test( options.css ) ?
			( getElement( options.css ) || options.css ) :
			options.css;

		const id = options.cssId || uuid();

		if ( typeof css === 'object' ) {
			css = 'textContent' in css ? css.textContent : css.innerHTML;
		} else if ( typeof css === 'function' ) {
			Child._css = options.css;
			css = evalCSS( Child, css );
		}

		const def = Child._cssDef = { transform: !options.noCssTransform };

		def.styles = def.transform ? transformCss( css, id ) : css;
		def.id = proto.cssId = id;
		Child._cssIds.push( id );

		addCSS( Child._cssDef );
	},

	// Called when creating a new component instance
	init: ( Parent, target, options ) => {
		if ( !options.css ) return;

		warnIfDebug( `
The css option is currently not supported on a per-instance basis and will be discarded. Instead, we recommend instantiating from a component definition with a css option.

const Component = Ractive.extend({
	...
	css: '/* your css */',
	...
});

const componentInstance = new Component({ ... })
		` );
	}
};

function gatherIds ( start ) {
	let cmp = start;
	const ids = [];

	while ( cmp ) {
		if ( cmp.prototype.cssId ) ids.push( cmp.prototype.cssId );
		cmp = cmp.Parent;
	}

	return ids;
}

function evalCSS ( component, css ) {
	const cssData = component.cssData;
	const model = component._cssModel;
	const data = function data ( path ) {
		return model.joinAll( splitKeypath( path ) ).get();
	};
	data.__proto__ = cssData;

	const result = css.call( component, data );
	return typeof result === 'string' ? result : '';
}

function validate ( data ) {
	// Warn if userOptions.data is a non-POJO
	if ( data && data.constructor !== Object ) {
		if ( typeof data === 'function' ) {
			// TODO do we need to support this in the new Ractive() case?
		} else if ( typeof data !== 'object' ) {
			fatal( `data option must be an object or a function, \`${data}\` is not valid` );
		} else {
			warnIfDebug( 'If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged' );
		}
	}
}

var dataConfigurator = {
	name: 'data',

	extend: ( Parent, proto, options ) => {
		let key;
		let value;

		// check for non-primitives, which could cause mutation-related bugs
		if ( options.data && isObject( options.data ) ) {
			for ( key in options.data ) {
				value = options.data[ key ];

				if ( value && typeof value === 'object' ) {
					if ( isObject( value ) || Array.isArray( value ) ) {
						warnIfDebug( `Passing a \`data\` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:

  // this...
  data: function () {
    return {
      myObject: {}
    };
  })

  // instead of this:
  data: {
    myObject: {}
  }` );
					}
				}
			}
		}

		proto.data = combine$1( proto.data, options.data );
	},

	init: ( Parent, ractive, options ) => {
		let result = combine$1( Parent.prototype.data, options.data );

		if ( typeof result === 'function' ) result = result.call( ractive );

		// bind functions to the ractive instance at the top level,
		// unless it's a non-POJO (in which case alarm bells should ring)
		if ( result && result.constructor === Object ) {
			for ( const prop in result ) {
				if ( typeof result[ prop ] === 'function' ) {
					const value = result[ prop ];
					result[ prop ] = bind$1( value, ractive );
					result[ prop ]._r_unbound = value;
				}
			}
		}

		return result || {};
	},

	reset ( ractive ) {
		const result = this.init( ractive.constructor, ractive, ractive.viewmodel );
		ractive.viewmodel.root.set( result );
		return true;
	}
};

function combine$1 ( parentValue, childValue ) {
	validate( childValue );

	const parentIsFn = typeof parentValue === 'function';
	const childIsFn = typeof childValue === 'function';

	// Very important, otherwise child instance can become
	// the default data object on Ractive or a component.
	// then ractive.set() ends up setting on the prototype!
	if ( !childValue && !parentIsFn ) {
		childValue = {};
	}

	// Fast path, where we just need to copy properties from
	// parent to child
	if ( !parentIsFn && !childIsFn ) {
		return fromProperties( childValue, parentValue );
	}

	return function () {
		const child = childIsFn ? callDataFunction( childValue, this ) : childValue;
		const parent = parentIsFn ? callDataFunction( parentValue, this ) : parentValue;

		return fromProperties( child, parent );
	};
}

function callDataFunction ( fn, context ) {
	const data = fn.call( context );

	if ( !data ) return;

	if ( typeof data !== 'object' ) {
		fatal( 'Data function must return an object' );
	}

	if ( data.constructor !== Object ) {
		warnOnceIfDebug( 'Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged' );
	}

	return data;
}

function fromProperties ( primary, secondary ) {
	if ( primary && secondary ) {
		for ( const key in secondary ) {
			if ( !( key in primary ) ) {
				primary[ key ] = secondary[ key ];
			}
		}

		return primary;
	}

	return primary || secondary;
}

const TEMPLATE_VERSION = 4;

const pattern = /\$\{([^\}]+)\}/g;

function fromExpression ( body, length = 0 ) {
	const args = new Array( length );

	while ( length-- ) {
		args[length] = `_${length}`;
	}

	// Functions created directly with new Function() look like this:
	//     function anonymous (_0 /**/) { return _0*2 }
	//
	// With this workaround, we get a little more compact:
	//     function (_0){return _0*2}
	return new Function( [], `return function (${args.join(',')}){return(${body});};` )();
}

function fromComputationString ( str, bindTo ) {
	let hasThis;

	let functionBody = 'return (' + str.replace( pattern, ( match, keypath ) => {
		hasThis = true;
		return `__ractive.get("${keypath}")`;
	}) + ');';

	if ( hasThis ) functionBody = `var __ractive = this; ${functionBody}`;
	const fn = new Function( functionBody );
	return hasThis ? fn.bind( bindTo ) : fn;
}

const leadingWhitespace = /^\s+/;

const ParseError = function ( message ) {
	this.name = 'ParseError';
	this.message = message;
	try {
		throw new Error(message);
	} catch (e) {
		this.stack = e.stack;
	}
};

ParseError.prototype = Error.prototype;

const Parser = function ( str, options ) {
	let item;
	let lineStart = 0;

	this.str = str;
	this.options = options || {};
	this.pos = 0;

	this.lines = this.str.split( '\n' );
	this.lineEnds = this.lines.map( line => {
		const lineEnd = lineStart + line.length + 1; // +1 for the newline

		lineStart = lineEnd;
		return lineEnd;
	}, 0 );

	// Custom init logic
	if ( this.init ) this.init( str, options );

	const items = [];

	while ( ( this.pos < this.str.length ) && ( item = this.read() ) ) {
		items.push( item );
	}

	this.leftover = this.remaining();
	this.result = this.postProcess ? this.postProcess( items, options ) : items;
};

Parser.prototype = {
	read ( converters ) {
		let i, item;

		if ( !converters ) converters = this.converters;

		const pos = this.pos;

		const len = converters.length;
		for ( i = 0; i < len; i += 1 ) {
			this.pos = pos; // reset for each attempt

			if ( item = converters[i]( this ) ) {
				return item;
			}
		}

		return null;
	},

	getContextMessage ( pos, message ) {
		const [ lineNum, columnNum ] = this.getLinePos( pos );
		if ( this.options.contextLines === -1 ) {
			return [ lineNum, columnNum, `${message} at line ${lineNum} character ${columnNum}` ];
		}

		const line = this.lines[ lineNum - 1 ];

		let contextUp = '';
		let contextDown = '';
		if ( this.options.contextLines ) {
			const start = lineNum - 1 - this.options.contextLines < 0 ? 0 : lineNum - 1 - this.options.contextLines;
			contextUp = this.lines.slice( start, lineNum - 1 - start ).join( '\n' ).replace( /\t/g, '  ' );
			contextDown = this.lines.slice( lineNum, lineNum + this.options.contextLines ).join( '\n' ).replace( /\t/g, '  ' );
			if ( contextUp ) {
				contextUp += '\n';
			}
			if ( contextDown ) {
				contextDown = '\n' + contextDown;
			}
		}

		let numTabs = 0;
		const annotation = contextUp + line.replace( /\t/g, ( match, char ) => {
			if ( char < columnNum ) {
				numTabs += 1;
			}

			return '  ';
		}) + '\n' + new Array( columnNum + numTabs ).join( ' ' ) + '^----' + contextDown;

		return [ lineNum, columnNum, `${message} at line ${lineNum} character ${columnNum}:\n${annotation}` ];
	},

	getLinePos ( char ) {
		let lineNum = 0;
		let lineStart = 0;

		while ( char >= this.lineEnds[ lineNum ] ) {
			lineStart = this.lineEnds[ lineNum ];
			lineNum += 1;
		}

		const columnNum = char - lineStart;
		return [ lineNum + 1, columnNum + 1, char ]; // line/col should be one-based, not zero-based!
	},

	error ( message ) {
		const [ lineNum, columnNum, msg ] = this.getContextMessage( this.pos, message );

		const error = new ParseError( msg );

		error.line = lineNum;
		error.character = columnNum;
		error.shortMessage = message;

		throw error;
	},

	matchString ( string ) {
		if ( this.str.substr( this.pos, string.length ) === string ) {
			this.pos += string.length;
			return string;
		}
	},

	matchPattern ( pattern ) {
		let match;

		if ( match = pattern.exec( this.remaining() ) ) {
			this.pos += match[0].length;
			return match[1] || match[0];
		}
	},

	allowWhitespace () {
		this.matchPattern( leadingWhitespace );
	},

	remaining () {
		return this.str.substring( this.pos );
	},

	nextChar () {
		return this.str.charAt( this.pos );
	},

	warn ( message ) {
		const msg = this.getContextMessage( this.pos, message )[2];

		warnIfDebug( msg );
	}
};

Parser.extend = function ( proto ) {
	const Parent = this;
	const Child = function ( str, options ) {
		Parser.call( this, str, options );
	};

	Child.prototype = Object.create( Parent.prototype );

	for ( const key in proto ) {
		if ( proto.hasOwnProperty( key ) ) {
			Child.prototype[ key ] = proto[ key ];
		}
	}

	Child.extend = Parser.extend;
	return Child;
};

const delimiterChangePattern = /^[^\s=]+/;
const whitespacePattern = /^\s+/;

function readDelimiterChange ( parser ) {
	if ( !parser.matchString( '=' ) ) {
		return null;
	}

	const start = parser.pos;

	// allow whitespace before new opening delimiter
	parser.allowWhitespace();

	const opening = parser.matchPattern( delimiterChangePattern );
	if ( !opening ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace (in fact, it's necessary...)
	if ( !parser.matchPattern( whitespacePattern ) ) {
		return null;
	}

	const closing = parser.matchPattern( delimiterChangePattern );
	if ( !closing ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace before closing '='
	parser.allowWhitespace();

	if ( !parser.matchString( '=' ) ) {
		parser.pos = start;
		return null;
	}

	return [ opening, closing ];
}

const regexpPattern = /^(\/(?:[^\n\r\u2028\u2029/\\[]|\\.|\[(?:[^\n\r\u2028\u2029\]\\]|\\.)*])+\/(?:([gimuy])(?![a-z]*\2))*(?![a-zA-Z_$0-9]))/;

function readNumberLiteral ( parser ) {
	let result;

	if ( result = parser.matchPattern( regexpPattern ) ) {
		return {
			t: REGEXP_LITERAL,
			v: result
		};
	}

	return null;
}

const pattern$1 = /[-/\\^$*+?.()|[\]{}]/g;

function escapeRegExp ( str ) {
	return str.replace( pattern$1, '\\$&' );
}

const regExpCache = {};

var getLowestIndex = function ( haystack, needles ) {
	return haystack.search( regExpCache[needles.join()] || ( regExpCache[needles.join()] = new RegExp( needles.map( escapeRegExp ).join( '|' ) ) ) );
};

// https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
const booleanAttributes = /^(allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|translate|trueSpeed|typeMustMatch|visible)$/i;
const voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

const htmlEntities = { quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetasym: 977, upsih: 978, piv: 982, ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660, forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715, prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736, and: 8743, or: 8744, cap: 8745, cup: 8746, int: 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776, ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839, oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, lang: 9001, rang: 9002, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830	};
const controlCharacters = [ 8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376 ];
const entityPattern = new RegExp( '&(#?(?:x[\\w\\d]+|\\d+|' + Object.keys( htmlEntities ).join( '|' ) + '));?', 'g' );
const codePointSupport = typeof String.fromCodePoint === 'function';
const codeToChar = codePointSupport ? String.fromCodePoint : String.fromCharCode;

function decodeCharacterReferences ( html ) {
	return html.replace( entityPattern, ( match, entity ) => {
		let code;

		// Handle named entities
		if ( entity[0] !== '#' ) {
			code = htmlEntities[ entity ];
		} else if ( entity[1] === 'x' ) {
			code = parseInt( entity.substring( 2 ), 16 );
		} else {
			code = parseInt( entity.substring( 1 ), 10 );
		}

		if ( !code ) {
			return match;
		}

		return codeToChar( validateCode( code ) );
	});
}

const lessThan = /</g;
const greaterThan = />/g;
const amp = /&/g;
const invalid = 65533;

function escapeHtml ( str ) {
	return str
		.replace( amp, '&amp;' )
		.replace( lessThan, '&lt;' )
		.replace( greaterThan, '&gt;' );
}

// some code points are verboten. If we were inserting HTML, the browser would replace the illegal
// code points with alternatives in some cases - since we're bypassing that mechanism, we need
// to replace them ourselves
//
// Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters
/* istanbul ignore next */
function validateCode ( code ) {
	if ( !code ) {
		return invalid;
	}

	// line feed becomes generic whitespace
	if ( code === 10 ) {
		return 32;
	}

	// ASCII range. (Why someone would use HTML entities for ASCII characters I don't know, but...)
	if ( code < 128 ) {
		return code;
	}

	// code points 128-159 are dealt with leniently by browsers, but they're incorrect. We need
	// to correct the mistake or we'll end up with missing € signs and so on
	if ( code <= 159 ) {
		return controlCharacters[ code - 128 ];
	}

	// basic multilingual plane
	if ( code < 55296 ) {
		return code;
	}

	// UTF-16 surrogate halves
	if ( code <= 57343 ) {
		return invalid;
	}

	// rest of the basic multilingual plane
	if ( code <= 65535 ) {
		return code;
	} else if ( !codePointSupport ) {
		return invalid;
	}

	// supplementary multilingual plane 0x10000 - 0x1ffff
	if ( code >= 65536 && code <= 131071 ) {
		return code;
	}

	// supplementary ideographic plane 0x20000 - 0x2ffff
	if ( code >= 131072 && code <= 196607 ) {
		return code;
	}

	return invalid;
}

const expectedExpression = 'Expected a JavaScript expression';
const expectedParen = 'Expected closing paren';

// bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
const numberPattern = /^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;

function readNumberLiteral$1 ( parser ) {
	let result;

	if ( result = parser.matchPattern( numberPattern ) ) {
		return {
			t: NUMBER_LITERAL,
			v: result
		};
	}

	return null;
}

function readBooleanLiteral ( parser ) {
	const remaining = parser.remaining();

	if ( remaining.substr( 0, 4 ) === 'true' ) {
		parser.pos += 4;
		return {
			t: BOOLEAN_LITERAL,
			v: 'true'
		};
	}

	if ( remaining.substr( 0, 5 ) === 'false' ) {
		parser.pos += 5;
		return {
			t: BOOLEAN_LITERAL,
			v: 'false'
		};
	}

	return null;
}

// Match one or more characters until: ", ', \, or EOL/EOF.
// EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
const stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;

// Match one escape sequence, including the backslash.
const escapeSequencePattern = /^\\(?:[`'"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;

// Match one ES5 line continuation (backslash + line terminator).
const lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;

// Helper for defining getDoubleQuotedString and getSingleQuotedString.
var makeQuotedStringMatcher = function ( okQuote ) {
	return function ( parser ) {
		let literal = '"';
		let done = false;
		let next;

		while ( !done ) {
			next = ( parser.matchPattern( stringMiddlePattern ) || parser.matchPattern( escapeSequencePattern ) ||
				parser.matchString( okQuote ) );
			if ( next ) {
				if ( next === `"` ) {
					literal += `\\"`;
				} else if ( next === `\\'` ) {
					literal += `'`;
				} else {
					literal += next;
				}
			} else {
				next = parser.matchPattern( lineContinuationPattern );
				if ( next ) {
					// convert \(newline-like) into a \u escape, which is allowed in JSON
					literal += '\\u' + ( '000' + next.charCodeAt(1).toString(16) ).slice( -4 );
				} else {
					done = true;
				}
			}
		}

		literal += '"';

		// use JSON.parse to interpret escapes
		return JSON.parse( literal );
	};
};

const singleMatcher = makeQuotedStringMatcher( `"` );
const doubleMatcher = makeQuotedStringMatcher( `'` );

var readStringLiteral = function ( parser ) {
	const start = parser.pos;
	const quote = parser.matchString( `'` ) || parser.matchString( `"` );

	if ( quote ) {
		const string = ( quote === `'` ? singleMatcher : doubleMatcher )( parser );

		if ( !parser.matchString( quote ) ) {
			parser.pos = start;
			return null;
		}

		return {
			t: STRING_LITERAL,
			v: string
		};
	}

	return null;
};

// Match one or more characters until: ", ', or \
const stringMiddlePattern$1 = /^[^`"\\\$]+?(?:(?=[`"\\\$]))/;

const escapes = /[\r\n\t\b\f]/g;
function getString ( literal ) {
	return JSON.parse( `"${literal.replace( escapes, escapeChar )}"` );
}

function escapeChar ( c ) {
	switch ( c ) {
		case '\n': return '\\n';
		case '\r': return '\\r';
		case '\t': return '\\t';
		case '\b': return '\\b';
		case '\f': return '\\f';
	}
}

function readTemplateStringLiteral ( parser ) {
	if ( !parser.matchString( '`' ) ) return null;

	let literal = '';
	let done = false;
	let next;
	const parts = [];

	while ( !done ) {
		next = parser.matchPattern( stringMiddlePattern$1 ) || parser.matchPattern( escapeSequencePattern ) ||
			parser.matchString( '$' ) || parser.matchString( '"' );
		if ( next ) {
			if ( next === `"` ) {
				literal += `\\"`;
			} else if ( next === '\\`' ) {
				literal += '`';
			} else if ( next === '$' ) {
				if ( parser.matchString( '{' ) ) {
					parts.push({ t: STRING_LITERAL, v: getString( literal ) });
					literal = '';

					parser.allowWhitespace();
					const expr = readExpression( parser );

					if ( !expr ) parser.error( 'Expected valid expression' );

					parts.push({ t: BRACKETED, x: expr });

					parser.allowWhitespace();
					if ( !parser.matchString( '}' ) ) parser.error( `Expected closing '}' after interpolated expression` );
				} else {
					literal += '$';
				}
			} else {
				literal += next;
			}
		} else {
			next = parser.matchPattern( lineContinuationPattern );
			if ( next ) {
				// convert \(newline-like) into a \u escape, which is allowed in JSON
				literal += '\\u' + ( '000' + next.charCodeAt(1).toString(16) ).slice( -4 );
			} else {
				done = true;
			}
		}
	}

	if ( literal.length ) parts.push({ t: STRING_LITERAL, v: getString( literal ) });

	if ( !parser.matchString( '`' ) ) parser.error( "Expected closing '`'" );

	if ( parts.length === 1 ) {
		return parts[0];
	} else {
		let result = parts.pop();
		let part;

		while ( part = parts.pop() ) {
			result = {
				t: INFIX_OPERATOR,
				s: '+',
				o: [ part, result ]
			};
		}

		return {
			t: BRACKETED,
			x: result
		};
	}
}

const name = /^[a-zA-Z_$][a-zA-Z_$0-9]*/;
const spreadPattern = /^\s*\.{3}/;
const legalReference = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:\.(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
const relaxedName = /^[a-zA-Z_$][-\/a-zA-Z_$0-9]*(?:\.(?:[a-zA-Z_$][-\/a-zA-Z_$0-9]*))*/;

const identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

// http://mathiasbynens.be/notes/javascript-properties
// can be any name, string literal, or number literal
function readKey ( parser ) {
	let token;

	if ( token = readStringLiteral( parser ) ) {
		return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
	}

	if ( token = readNumberLiteral$1( parser ) ) {
		return token.v;
	}

	if ( token = parser.matchPattern( name ) ) {
		return token;
	}

	return null;
}

function readKeyValuePair ( parser ) {
	let spread;
	const start = parser.pos;

	// allow whitespace between '{' and key
	parser.allowWhitespace();

	const refKey = parser.nextChar() !== '\'' && parser.nextChar() !== '"';
	if ( refKey ) spread = parser.matchPattern( spreadPattern );

	const key = spread ? readExpression( parser ) : readKey( parser );
	if ( key === null ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between key and ':'
	parser.allowWhitespace();

	// es2015 shorthand property
	if ( refKey && ( parser.nextChar() === ',' || parser.nextChar() === '}' ) ) {
		if ( !spread && !name.test( key ) ) {
			parser.error( `Expected a valid reference, but found '${key}' instead.` );
		}

		const pair = {
			t: KEY_VALUE_PAIR,
			k: key,
			v: {
				t: REFERENCE,
				n: key
			}
		};

		if ( spread ) {
			pair.p = true;
		}

		return pair;
	}


	// next character must be ':'
	if ( !parser.matchString( ':' ) ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between ':' and value
	parser.allowWhitespace();

	// next expression must be a, well... expression
	const value = readExpression( parser );
	if ( value === null ) {
		parser.pos = start;
		return null;
	}

	return {
		t: KEY_VALUE_PAIR,
		k: key,
		v: value
	};
}

function readKeyValuePairs ( parser ) {
	const start = parser.pos;

	const pair = readKeyValuePair( parser );
	if ( pair === null ) {
		return null;
	}

	const pairs = [ pair ];

	if ( parser.matchString( ',' ) ) {
		const keyValuePairs = readKeyValuePairs( parser );

		if ( !keyValuePairs ) {
			parser.pos = start;
			return null;
		}

		return pairs.concat( keyValuePairs );
	}

	return pairs;
}

var readObjectLiteral = function ( parser ) {
	const start = parser.pos;

	// allow whitespace
	parser.allowWhitespace();

	if ( !parser.matchString( '{' ) ) {
		parser.pos = start;
		return null;
	}

	const keyValuePairs = readKeyValuePairs( parser );

	// allow whitespace between final value and '}'
	parser.allowWhitespace();

	if ( !parser.matchString( '}' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: OBJECT_LITERAL,
		m: keyValuePairs
	};
};

var readArrayLiteral = function ( parser ) {
	const start = parser.pos;

	// allow whitespace before '['
	parser.allowWhitespace();

	if ( !parser.matchString( '[' ) ) {
		parser.pos = start;
		return null;
	}

	const expressionList = readExpressionList( parser, true );

	if ( !parser.matchString( ']' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: ARRAY_LITERAL,
		m: expressionList
	};
};

function readLiteral ( parser ) {
	return readNumberLiteral$1( parser )         ||
	       readBooleanLiteral( parser )        ||
	       readStringLiteral( parser )         ||
	       readTemplateStringLiteral( parser ) ||
	       readObjectLiteral( parser )         ||
	       readArrayLiteral( parser )          ||
	       readNumberLiteral( parser );
}

// if a reference is a browser global, we don't deference it later, so it needs special treatment
const globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null|Object|Number|String|Boolean)\b/;

// keywords are not valid references, with the exception of `this`
const keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

const prefixPattern = /^(?:\@\.|\@|~\/|(?:\^\^\/(?:\^\^\/)*(?:\.\.\/)*)|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/;
const specials = /^(key|index|keypath|rootpath|this|global|shared|context|event|node|local|style)/;

function readReference ( parser ) {
	let prefix, name$$1, global, reference, lastDotIndex;

	const startPos = parser.pos;

	prefix = parser.matchPattern( prefixPattern ) || '';
	name$$1 = ( !prefix && parser.relaxedNames && parser.matchPattern( relaxedName ) ) ||
			parser.matchPattern( legalReference );
	const actual = prefix.length + ( ( name$$1 && name$$1.length ) || 0 );

	if ( prefix === '@.' ) {
		prefix = '@';
		if ( name$$1 ) name$$1 = 'this.' + name$$1;
		else name$$1 = 'this';
	}

	if ( !name$$1 && prefix ) {
		name$$1 = prefix;
		prefix = '';
	}

	if ( !name$$1 ) {
		return null;
	}

	if ( prefix === '@' ) {
		if ( !specials.test( name$$1 ) ) {
			parser.error( `Unrecognized special reference @${name$$1}` );
		} else if ( ( ~name$$1.indexOf( 'event' ) || ~name$$1.indexOf( 'node' ) ) && !parser.inEvent ) {
			parser.error( `@event and @node are only valid references within an event directive` );
		} else if ( ~name$$1.indexOf( 'context' ) ) {
			parser.pos = parser.pos - ( name$$1.length - 7 );
			return {
				t: BRACKETED,
				x: {
					t: REFERENCE,
					n: '@context'
				}
			};
		}
	}

	// bug out if it's a keyword (exception for ancestor/restricted refs - see https://github.com/ractivejs/ractive/issues/1497)
	if ( !prefix && !parser.relaxedNames && keywords.test( name$$1 ) ) {
		parser.pos = startPos;
		return null;
	}

	// if this is a browser global, stop here
	if ( !prefix && globals.test( name$$1 ) ) {
		global = globals.exec( name$$1 )[0];
		parser.pos = startPos + global.length;

		return {
			t: GLOBAL,
			v: global
		};
	}

	reference = ( prefix || '' ) + normalise( name$$1 );

	if ( parser.matchString( '(' ) ) {
		// if this is a method invocation (as opposed to a function) we need
		// to strip the method name from the reference combo, else the context
		// will be wrong
		// but only if the reference was actually a member and not a refinement
		lastDotIndex = reference.lastIndexOf( '.' );
		if ( lastDotIndex !== -1 && name$$1[ name$$1.length - 1 ] !== ']' ) {
			if ( lastDotIndex === 0 ) {
				reference = '.';
				parser.pos = startPos;
			} else {
				const refLength = reference.length;
				reference = reference.substr( 0, lastDotIndex );
				parser.pos = startPos + ( actual - ( refLength - lastDotIndex ) );
			}
		} else {
			parser.pos -= 1;
		}
	}

	return {
		t: REFERENCE,
		n: reference.replace( /^this\./, './' ).replace( /^this$/, '.' )
	};
}

function readBracketedExpression ( parser ) {
	if ( !parser.matchString( '(' ) ) return null;

	parser.allowWhitespace();

	const expr = readExpression( parser );

	if ( !expr ) parser.error( expectedExpression );

	parser.allowWhitespace();

	if ( !parser.matchString( ')' ) ) parser.error( expectedParen );

	return {
		t: BRACKETED,
		x: expr
	};
}

var readPrimary = function ( parser ) {
	return readLiteral( parser )
		|| readReference( parser )
		|| readBracketedExpression( parser );
};

function readRefinement ( parser ) {
	// some things call for strict refinement (partial names), meaning no space between reference and refinement
	if ( !parser.strictRefinement ) {
		parser.allowWhitespace();
	}

	// "." name
	if ( parser.matchString( '.' ) ) {
		parser.allowWhitespace();

		const name$$1 = parser.matchPattern( name );
		if ( name$$1 ) {
			return {
				t: REFINEMENT,
				n: name$$1
			};
		}

		parser.error( 'Expected a property name' );
	}

	// "[" expression "]"
	if ( parser.matchString( '[' ) ) {
		parser.allowWhitespace();

		const expr = readExpression( parser );
		if ( !expr ) parser.error( expectedExpression );

		parser.allowWhitespace();

		if ( !parser.matchString( ']' ) ) parser.error( `Expected ']'` );

		return {
			t: REFINEMENT,
			x: expr
		};
	}

	return null;
}

var readMemberOrInvocation = function ( parser ) {
	let expression = readPrimary( parser );

	if ( !expression ) return null;

	while ( expression ) {
		const refinement = readRefinement( parser );
		if ( refinement ) {
			expression = {
				t: MEMBER,
				x: expression,
				r: refinement
			};
		}

		else if ( parser.matchString( '(' ) ) {
			parser.allowWhitespace();
			const expressionList = readExpressionList( parser, true );

			parser.allowWhitespace();

			if ( !parser.matchString( ')' ) ) {
				parser.error( expectedParen );
			}

			expression = {
				t: INVOCATION,
				x: expression
			};

			if ( expressionList ) expression.o = expressionList;
		}

		else {
			break;
		}
	}

	return expression;
};

let readTypeOf;

const makePrefixSequenceMatcher = function ( symbol, fallthrough ) {
	return function ( parser ) {
		let expression;

		if ( expression = fallthrough( parser ) ) {
			return expression;
		}

		if ( !parser.matchString( symbol ) ) {
			return null;
		}

		parser.allowWhitespace();

		expression = readExpression( parser );
		if ( !expression ) {
			parser.error( expectedExpression );
		}

		return {
			s: symbol,
			o: expression,
			t: PREFIX_OPERATOR
		};
	};
};

// create all prefix sequence matchers, return readTypeOf
(function() {
	let i, len, matcher, fallthrough;

	const prefixOperators = '! ~ + - typeof'.split( ' ' );

	fallthrough = readMemberOrInvocation;
	for ( i = 0, len = prefixOperators.length; i < len; i += 1 ) {
		matcher = makePrefixSequenceMatcher( prefixOperators[i], fallthrough );
		fallthrough = matcher;
	}

	// typeof operator is higher precedence than multiplication, so provides the
	// fallthrough for the multiplication sequence matcher we're about to create
	// (we're skipping void and delete)
	readTypeOf = fallthrough;
}());

var readTypeof = readTypeOf;

let readLogicalOr;

const makeInfixSequenceMatcher = function ( symbol, fallthrough ) {
	return function ( parser ) {
		// > and / have to be quoted
		if ( parser.inUnquotedAttribute && ( symbol === '>' || symbol === '/' ) ) return fallthrough( parser );

		let start, left, right;

		left = fallthrough( parser );
		if ( !left ) {
			return null;
		}

		// Loop to handle left-recursion in a case like `a * b * c` and produce
		// left association, i.e. `(a * b) * c`.  The matcher can't call itself
		// to parse `left` because that would be infinite regress.
		while ( true ) {
			start = parser.pos;

			parser.allowWhitespace();

			if ( !parser.matchString( symbol ) ) {
				parser.pos = start;
				return left;
			}

			// special case - in operator must not be followed by [a-zA-Z_$0-9]
			if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( parser.remaining().charAt( 0 ) ) ) {
				parser.pos = start;
				return left;
			}

			parser.allowWhitespace();

			// right operand must also consist of only higher-precedence operators
			right = fallthrough( parser );
			if ( !right ) {
				parser.pos = start;
				return left;
			}

			left = {
				t: INFIX_OPERATOR,
				s: symbol,
				o: [ left, right ]
			};

			// Loop back around.  If we don't see another occurrence of the symbol,
			// we'll return left.
		}
	};
};

// create all infix sequence matchers, and return readLogicalOr
(function() {
	let i, len, matcher, fallthrough;

	// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
	// Each sequence matcher will initially fall through to its higher precedence
	// neighbour, and only attempt to match if one of the higher precedence operators
	// (or, ultimately, a literal, reference, or bracketed expression) already matched
	const infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );

	// A typeof operator is higher precedence than multiplication
	fallthrough = readTypeof;
	for ( i = 0, len = infixOperators.length; i < len; i += 1 ) {
		matcher = makeInfixSequenceMatcher( infixOperators[i], fallthrough );
		fallthrough = matcher;
	}

	// Logical OR is the fallthrough for the conditional matcher
	readLogicalOr = fallthrough;
}());

var readLogicalOr$1 = readLogicalOr;

// The conditional operator is the lowest precedence operator, so we start here
function getConditional ( parser ) {
	const expression = readLogicalOr$1( parser );
	if ( !expression ) {
		return null;
	}

	const start = parser.pos;

	parser.allowWhitespace();

	if ( !parser.matchString( '?' ) ) {
		parser.pos = start;
		return expression;
	}

	parser.allowWhitespace();

	const ifTrue = readExpression( parser );
	if ( !ifTrue ) {
		parser.error( expectedExpression );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( ':' ) ) {
		parser.error( 'Expected ":"' );
	}

	parser.allowWhitespace();

	const ifFalse = readExpression( parser );
	if ( !ifFalse ) {
		parser.error( expectedExpression );
	}

	return {
		t: CONDITIONAL,
		o: [ expression, ifTrue, ifFalse ]
	};
}

function readExpression ( parser ) {
	// The conditional operator is the lowest precedence operator (except yield,
	// assignment operators, and commas, none of which are supported), so we
	// start there. If it doesn't match, it 'falls through' to progressively
	// higher precedence operators, until it eventually matches (or fails to
	// match) a 'primary' - a literal or a reference. This way, the abstract syntax
	// tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
	return getConditional( parser );
}

function readExpressionList ( parser, spread ) {
	let isSpread;
	const expressions = [];

	const pos = parser.pos;

	do {
		parser.allowWhitespace();

		if ( spread ) {
			isSpread = parser.matchPattern( spreadPattern );
		}

		const expr = readExpression( parser );

		if ( expr === null && expressions.length ) {
			parser.error( expectedExpression );
		} else if ( expr === null ) {
			parser.pos = pos;
			return null;
		}

		if ( isSpread ) {
			expr.p = true;
		}

		expressions.push( expr );

		parser.allowWhitespace();
	} while ( parser.matchString( ',' ) );

	return expressions;
}

function readExpressionOrReference ( parser, expectedFollowers ) {
	const start = parser.pos;
	const expression = readExpression( parser );

	if ( !expression ) {
		// valid reference but invalid expression e.g. `{{new}}`?
		const ref = parser.matchPattern( /^(\w+)/ );
		if ( ref ) {
			return {
				t: REFERENCE,
				n: ref
			};
		}

		return null;
	}

	for ( let i = 0; i < expectedFollowers.length; i += 1 ) {
		if ( parser.remaining().substr( 0, expectedFollowers[i].length ) === expectedFollowers[i] ) {
			return expression;
		}
	}

	parser.pos = start;
	return readReference( parser );
}

function flattenExpression ( expression ) {
	let refs;
	let count = 0;

	extractRefs( expression, refs = [] );
	const stringified = stringify( expression );

	return {
		r: refs,
		s: getVars(stringified)
	};

	function getVars(expr) {
		const vars = [];
		for ( let i = count - 1; i >= 0; i-- ) {
			vars.push( `x$${i}` );
		}
		return vars.length ? `(function(){var ${vars.join(',')};return(${expr});})()` : expr;
	}

	function stringify ( node ) {
		if ( typeof node === 'string' ) {
			return node;
		}

		switch ( node.t ) {
			case BOOLEAN_LITERAL:
			case GLOBAL:
			case NUMBER_LITERAL:
			case REGEXP_LITERAL:
				return node.v;

			case STRING_LITERAL:
				return JSON.stringify( String( node.v ) );

			case ARRAY_LITERAL:
				if ( node.m && hasSpread( node.m )) {
					return `[].concat(${ makeSpread( node.m, '[', ']', stringify ) })`;
				} else {
					return '[' + ( node.m ? node.m.map( stringify ).join( ',' ) : '' ) + ']';
				}

			case OBJECT_LITERAL:
				if ( node.m && hasSpread( node.m ) ) {
					return `Object.assign({},${ makeSpread( node.m, '{', '}', stringifyPair) })`;
				} else {
					return '{' + ( node.m ? node.m.map( n => `${ n.k }:${ stringify( n.v ) }` ).join( ',' ) : '' ) + '}';
				}

			case PREFIX_OPERATOR:
				return ( node.s === 'typeof' ? 'typeof ' : node.s ) + stringify( node.o );

			case INFIX_OPERATOR:
				return stringify( node.o[0] ) + ( node.s.substr( 0, 2 ) === 'in' ? ' ' + node.s + ' ' : node.s ) + stringify( node.o[1] );

			case INVOCATION:
				if ( node.o && hasSpread( node.o ) ) {
					const id = count++;
					return `(x$${ id }=${ stringify(node.x) }).apply(x$${ id },${ stringify({ t: ARRAY_LITERAL, m: node.o }) })`;
				} else {
					return stringify( node.x ) + '(' + ( node.o ? node.o.map( stringify ).join( ',' ) : '' ) + ')';
				}

			case BRACKETED:
				return '(' + stringify( node.x ) + ')';

			case MEMBER:
				return stringify( node.x ) + stringify( node.r );

			case REFINEMENT:
				return ( node.n ? '.' + node.n : '[' + stringify( node.x ) + ']' );

			case CONDITIONAL:
				return stringify( node.o[0] ) + '?' + stringify( node.o[1] ) + ':' + stringify( node.o[2] );

			case REFERENCE:
				return '_' + refs.indexOf( node.n );

			default:
				throw new Error( 'Expected legal JavaScript' );
		}
	}

	function stringifyPair ( node ) { return node.p ? stringify( node.k ) : `${ node.k }:${ stringify( node.v ) }`; }

	function makeSpread ( list, open, close, fn ) {
		const out = list.reduce( ( a, c ) => {
			if ( c.p ) {
				a.str += `${ a.open ? close + ',' : a.str.length ? ',' : '' }${ fn( c ) }`;
			} else {
				a.str += `${ !a.str.length ? open : !a.open ? ',' + open : ',' }${ fn( c ) }`;
			}
			a.open = !c.p;
			return a;
		}, { open: false, str: '' } );
		if ( out.open ) out.str += close;
		return out.str;
	}
}

function hasSpread ( list ) {
	for ( let i = 0; i < list.length; i++ ) {
		if ( list[i].p ) return true;
	}

	return false;
}

// TODO maybe refactor this?
function extractRefs ( node, refs ) {
	if ( node.t === REFERENCE && typeof node.n === 'string' ) {
		if ( !~refs.indexOf( node.n ) ) {
			refs.unshift( node.n );
		}
	}

	const list = node.o || node.m;
	if ( list ) {
		if ( isObject( list ) ) {
			extractRefs( list, refs );
		} else {
			let i = list.length;
			while ( i-- ) {
				extractRefs( list[i], refs );
			}
		}
	}

	if ( node.k && node.t === KEY_VALUE_PAIR && typeof node.k !== 'string' ) {
		extractRefs( node.k, refs );
	}

	if ( node.x ) {
		extractRefs( node.x, refs );
	}

	if ( node.r ) {
		extractRefs( node.r, refs );
	}

	if ( node.v ) {
		extractRefs( node.v, refs );
	}
}

function refineExpression ( expression, mustache ) {
	let referenceExpression;

	if ( expression ) {
		while ( expression.t === BRACKETED && expression.x ) {
			expression = expression.x;
		}

		if ( expression.t === REFERENCE ) {
			const n = expression.n;
			if ( !~n.indexOf( '@context' ) ) {
				mustache.r = expression.n;
			} else {
				mustache.x = flattenExpression( expression );
			}
		} else {
			if ( referenceExpression = getReferenceExpression( expression ) ) {
				mustache.rx = referenceExpression;
			} else {
				mustache.x = flattenExpression( expression );
			}
		}

		return mustache;
	}
}

// TODO refactor this! it's bewildering
function getReferenceExpression ( expression ) {
	const members = [];
	let refinement;

	while ( expression.t === MEMBER && expression.r.t === REFINEMENT ) {
		refinement = expression.r;

		if ( refinement.x ) {
			if ( refinement.x.t === REFERENCE ) {
				members.unshift( refinement.x );
			} else {
				members.unshift( flattenExpression( refinement.x ) );
			}
		} else {
			members.unshift( refinement.n );
		}

		expression = expression.x;
	}

	if ( expression.t !== REFERENCE ) {
		return null;
	}

	return {
		r: expression.n,
		m: members
	};
}

const attributeNamePattern = /^[^\s"'>\/=]+/;
const onPattern = /^on/;
const eventPattern = /^on-([a-zA-Z\*\.$_]((?:[a-zA-Z\*\.$_0-9\-]|\\-)+))$/;
const reservedEventNames = /^(?:change|reset|teardown|update|construct|config|init|render|complete|unrender|detach|insert|destruct|attachchild|detachchild)$/;
const decoratorPattern = /^as-([a-z-A-Z][-a-zA-Z_0-9]*)$/;
const transitionPattern = /^([a-zA-Z](?:(?!-in-out)[-a-zA-Z_0-9])*)-(in|out|in-out)$/;
const boundPattern = /^((bind|class)-(([-a-zA-Z0-9_])+))$/;
const directives = {
	lazy: { t: BINDING_FLAG, v: 'l' },
	twoway: { t: BINDING_FLAG, v: 't' },
	'no-delegation': { t: DELEGATE_FLAG }
};
const unquotedAttributeValueTextPattern = /^[^\s"'=<>\/`]+/;
const proxyEvent = /^[^\s"'=<>@\[\]()]*/;
const whitespace = /^\s+/;

const slashes = /\\/g;
function splitEvent ( str ) {
	const result = [];
	let s = 0;

	for ( let i = 0; i < str.length; i++ ) {
		if ( str[i] === '-' && str[ i - 1 ] !== '\\' ) {
			result.push( str.substring( s, i ).replace( slashes, '' ) );
			s = i + 1;
		}
	}

	result.push( str.substring( s ).replace( slashes, '' ) );

	return result;
}

function readAttribute ( parser ) {
	let name, i, nearest, idx;

	parser.allowWhitespace();

	name = parser.matchPattern( attributeNamePattern );
	if ( !name ) {
		return null;
	}

	// check for accidental delimiter consumption e.g. <tag bool{{>attrs}} />
	nearest = name.length;
	for ( i = 0; i < parser.tags.length; i++ ) {
		if ( ~( idx = name.indexOf( parser.tags[ i ].open ) ) ) {
			if ( idx < nearest ) nearest = idx;
		}
	}
	if ( nearest < name.length ) {
		parser.pos -= name.length - nearest;
		name = name.substr( 0, nearest );
		if ( !name ) return null;
	}

	return { n: name };
}

function readAttributeValue ( parser ) {
	const start = parser.pos;

	// next character must be `=`, `/`, `>` or whitespace
	if ( !/[=\/>\s]/.test( parser.nextChar() ) ) {
		parser.error( 'Expected `=`, `/`, `>` or whitespace' );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '=' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	const valueStart = parser.pos;
	const startDepth = parser.sectionDepth;

	const value = readQuotedAttributeValue( parser, `'` ) ||
			readQuotedAttributeValue( parser, `"` ) ||
			readUnquotedAttributeValue( parser );

	if ( value === null ) {
		parser.error( 'Expected valid attribute value' );
	}

	if ( parser.sectionDepth !== startDepth ) {
		parser.pos = valueStart;
		parser.error( 'An attribute value must contain as many opening section tags as closing section tags' );
	}

	if ( !value.length ) {
		return '';
	}

	if ( value.length === 1 && typeof value[0] === 'string' ) {
		return decodeCharacterReferences( value[0] );
	}

	return value;
}

function readUnquotedAttributeValueToken ( parser ) {
	let text, index;

	const start = parser.pos;

	text = parser.matchPattern( unquotedAttributeValueTextPattern );

	if ( !text ) {
		return null;
	}

	const haystack = text;
	const needles = parser.tags.map( t => t.open ); // TODO refactor... we do this in readText.js as well

	if ( ( index = getLowestIndex( haystack, needles ) ) !== -1 ) {
		text = text.substr( 0, index );
		parser.pos = start + text.length;
	}

	return text;
}

function readUnquotedAttributeValue ( parser ) {
	parser.inAttribute = true;

	const tokens = [];

	let token = readMustache( parser ) || readUnquotedAttributeValueToken( parser );
	while ( token ) {
		tokens.push( token );
		token = readMustache( parser ) || readUnquotedAttributeValueToken( parser );
	}

	if ( !tokens.length ) {
		return null;
	}

	parser.inAttribute = false;
	return tokens;
}

function readQuotedAttributeValue ( parser, quoteMark ) {
	const start = parser.pos;

	if ( !parser.matchString( quoteMark ) ) {
		return null;
	}

	parser.inAttribute = quoteMark;

	const tokens = [];

	let token = readMustache( parser ) || readQuotedStringToken( parser, quoteMark );
	while ( token !== null ) {
		tokens.push( token );
		token = readMustache( parser ) || readQuotedStringToken( parser, quoteMark );
	}

	if ( !parser.matchString( quoteMark ) ) {
		parser.pos = start;
		return null;
	}

	parser.inAttribute = false;

	return tokens;
}

function readQuotedStringToken ( parser, quoteMark ) {
	const haystack = parser.remaining();

	const needles = parser.tags.map( t => t.open ); // TODO refactor... we do this in readText.js as well
	needles.push( quoteMark );

	const index = getLowestIndex( haystack, needles );

	if ( index === -1 ) {
		parser.error( 'Quoted attribute value must have a closing quote' );
	}

	if ( !index ) {
		return null;
	}

	parser.pos += index;
	return haystack.substr( 0, index );
}

function readAttributeOrDirective ( parser ) {
	let match, directive;

	const attribute = readAttribute( parser, false );

	if ( !attribute ) return null;

		// lazy, twoway
	if ( directive = directives[ attribute.n ] ) {
		attribute.t = directive.t;
		if ( directive.v ) attribute.v = directive.v;
		delete attribute.n; // no name necessary
		parser.allowWhitespace();
		if ( parser.nextChar() === '=' ) attribute.f = readAttributeValue( parser );
	}

		// decorators
	else if ( match = decoratorPattern.exec( attribute.n ) ) {
		attribute.n = match[1];
		attribute.t = DECORATOR;
		readArguments( parser, attribute );
	}

		// transitions
	else if ( match = transitionPattern.exec( attribute.n ) ) {
		attribute.n = match[1];
		attribute.t = TRANSITION;
		readArguments( parser, attribute );
		attribute.v = match[2] === 'in-out' ? 't0' : match[2] === 'in' ? 't1' : 't2';
	}

		// on-click etc
	else if ( match = eventPattern.exec( attribute.n ) ) {
		attribute.n = splitEvent( match[1] );
		attribute.t = EVENT;

		parser.inEvent = true;

			// check for a proxy event
		if ( !readProxyEvent( parser, attribute ) ) {
				// otherwise, it's an expression
			readArguments( parser, attribute, true );
		} else if ( reservedEventNames.test( attribute.f ) ) {
			parser.pos -= attribute.f.length;
			parser.error( 'Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, complete, detach, insert, destruct, attachchild, detachchild)' );
		}

		parser.inEvent = false;
	}

		// bound directives
	else if ( match = boundPattern.exec( attribute.n ) ){
		const bind = match[2] === 'bind';
		attribute.n = bind ? match[3] : match[1];
		attribute.t = ATTRIBUTE;
		readArguments( parser, attribute, false, true );

		if ( !attribute.f && bind ) {
			attribute.f = [{ t: INTERPOLATOR, r: match[3] }];
		}
	}

	else {
		parser.allowWhitespace();
		const value = parser.nextChar() === '=' ? readAttributeValue( parser ) : null;
		attribute.f = value != null ? value : attribute.f;

		if ( parser.sanitizeEventAttributes && onPattern.test( attribute.n ) ) {
			return { exclude: true };
		} else {
			attribute.f = attribute.f || ( attribute.f === '' ? '' : 0 );
			attribute.t = ATTRIBUTE;
		}
	}

	return attribute;
}

function readProxyEvent ( parser, attribute ) {
	const start = parser.pos;
	if ( !parser.matchString( '=' ) ) parser.error( `Missing required directive arguments` );

	const quote = parser.matchString( `'` ) || parser.matchString( `"` );
	parser.allowWhitespace();
	const proxy = parser.matchPattern( proxyEvent );

	if ( proxy !== undefined ) {
		if ( quote ) {
			parser.allowWhitespace();
			if ( !parser.matchString( quote ) ) parser.pos = start;
			else return ( attribute.f = proxy ) || true;
		} else if ( !parser.matchPattern( whitespace ) ) {
			parser.pos = start;
		} else {
			return ( attribute.f = proxy ) || true;
		}
	} else {
		parser.pos = start;
	}
}

function readArguments ( parser, attribute, required = false, single = false ) {
	parser.allowWhitespace();
	if ( !parser.matchString( '=' ) ) {
		if ( required ) parser.error( `Missing required directive arguments` );
		return;
	}
	parser.allowWhitespace();

	const quote = parser.matchString( '"' ) || parser.matchString( "'" );
	const spread = parser.spreadArgs;
	parser.spreadArgs = true;
	parser.inUnquotedAttribute = !quote;
	const expr = single ? readExpressionOrReference( parser, [ quote || ' ', '/', '>' ] ) : { m: readExpressionList( parser ), t: ARRAY_LITERAL };
	parser.inUnquotedAttribute = false;
	parser.spreadArgs = spread;

	if ( quote ) {
		parser.allowWhitespace();
		if ( parser.matchString( quote ) !== quote ) parser.error( `Expected matching quote '${quote}'` );
	}

	if ( single ) {
		const interpolator = { t: INTERPOLATOR };
		refineExpression( expr, interpolator );
		attribute.f = [interpolator];
	} else {
		attribute.f = flattenExpression( expr );
	}
}

const delimiterChangeToken = { t: DELIMCHANGE, exclude: true };

function readMustache ( parser ) {
	let mustache, i;

	// If we're inside a <script> or <style> tag, and we're not
	// interpolating, bug out
	if ( parser.interpolate[ parser.inside ] === false ) {
		return null;
	}

	for ( i = 0; i < parser.tags.length; i += 1 ) {
		if ( mustache = readMustacheOfType( parser, parser.tags[i] ) ) {
			return mustache;
		}
	}

	if ( parser.inTag && !parser.inAttribute ) {
		mustache = readAttributeOrDirective( parser );
		if ( mustache ) {
			parser.allowWhitespace();
			return mustache;
		}
	}
}

function readMustacheOfType ( parser, tag ) {
	let mustache, reader, i;

	const start = parser.pos;

	if ( parser.matchString( '\\' + tag.open ) ) {
		if ( start === 0 || parser.str[ start - 1 ] !== '\\' ) {
			return tag.open;
		}
	} else if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	// delimiter change?
	if ( mustache = readDelimiterChange( parser ) ) {
		// find closing delimiter or abort...
		if ( !parser.matchString( tag.close ) ) {
			return null;
		}

		// ...then make the switch
		tag.open = mustache[0];
		tag.close = mustache[1];
		parser.sortMustacheTags();

		return delimiterChangeToken;
	}

	parser.allowWhitespace();

	// illegal section closer
	if ( parser.matchString( '/' ) ) {
		parser.pos -= 1;
		const rewind = parser.pos;
		if ( !readNumberLiteral( parser ) ) {
			parser.pos = rewind - ( tag.close.length );
			if ( parser.inAttribute ) {
				parser.pos = start;
				return null;
			} else {
				parser.error( 'Attempted to close a section that wasn\'t open' );
			}
		} else {
			parser.pos = rewind;
		}
	}

	for ( i = 0; i < tag.readers.length; i += 1 ) {
		reader = tag.readers[i];

		if ( mustache = reader( parser, tag ) ) {
			if ( tag.isStatic ) {
				mustache.s = 1;
			}

			if ( parser.includeLinePositions ) {
				mustache.p = parser.getLinePos( start );
			}

			return mustache;
		}
	}

	parser.pos = start;
	return null;
}

function readTriple ( parser, tag ) {
	const expression = readExpression( parser );

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	const triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}

function readUnescaped ( parser, tag ) {
	if ( !parser.matchString( '&' ) ) {
		return null;
	}

	parser.allowWhitespace();

	const expression = readExpression( parser );

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	const triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}

const legalAlias = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
const asRE = /^as/i;

function readAliases( parser ) {
	const aliases = [];
	let alias;
	const start = parser.pos;

	parser.allowWhitespace();

	alias = readAlias( parser );

	if ( alias ) {
		alias.x = refineExpression( alias.x, {} );
		aliases.push( alias );

		parser.allowWhitespace();

		while ( parser.matchString(',') ) {
			alias = readAlias( parser );

			if ( !alias ) {
				parser.error( 'Expected another alias.' );
			}

			alias.x = refineExpression( alias.x, {} );
			aliases.push( alias );

			parser.allowWhitespace();
		}

		return aliases;
	}

	parser.pos = start;
	return null;
}

function readAlias( parser ) {
	const start = parser.pos;

	parser.allowWhitespace();

	const expr = readExpression( parser, [] );

	if ( !expr ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchPattern( asRE ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	const alias = parser.matchPattern( legalAlias );

	if ( !alias ) {
		parser.error( 'Expected a legal alias name.' );
	}

	return { n: alias, x: expr };
}

function readPartial ( parser, tag ) {
	const type = parser.matchString( '>' ) || parser.matchString( 'yield' );
	const partial = { t: type === '>' ? PARTIAL : YIELDER };
	let aliases;

	if ( !type ) return null;

	parser.allowWhitespace();

	if ( type === '>' || !( aliases = parser.matchString( 'with' ) ) ) {
		// Partial names can include hyphens, so we can't use readExpression
		// blindly. Instead, we use the `relaxedNames` flag to indicate that
		// `foo-bar` should be read as a single name, rather than 'subtract
		// bar from foo'
		parser.relaxedNames = parser.strictRefinement = true;
		const expression = readExpression( parser );
		parser.relaxedNames = parser.strictRefinement = false;

		if ( !expression && type === '>' ) return null;

		if ( expression ) {
			refineExpression( expression, partial ); // TODO...
			parser.allowWhitespace();
			if ( type !== '>' ) aliases = parser.matchString( 'with' );
		}
	}

	parser.allowWhitespace();

	// check for alias context e.g. `{{>foo bar as bat, bip as bop}}`
	if ( aliases || type === '>' ) {
		aliases = readAliases( parser );
		if ( aliases && aliases.length ) {
			partial.z = aliases;
		}

		// otherwise check for literal context e.g. `{{>foo bar}}` then
		// turn it into `{{#with bar}}{{>foo}}{{/with}}`
		else if ( type === '>' ) {
			const context = readExpression( parser );
			if ( context) {
				partial.c = {};
				refineExpression( context, partial.c );
			}
		}

		else {
			// {{yield with}} requires some aliases
			parser.error( `Expected one or more aliases` );
		}
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return partial;
}

function readComment ( parser, tag ) {
	if ( !parser.matchString( '!' ) ) {
		return null;
	}

	const index = parser.remaining().indexOf( tag.close );

	if ( index !== -1 ) {
		parser.pos += index + tag.close.length;
		return { t: COMMENT };
	}
}

function readInterpolator ( parser, tag ) {
	let expression, err;

	const start = parser.pos;

	// TODO would be good for perf if we could do away with the try-catch
	try {
		expression = readExpressionOrReference( parser, [ tag.close ] );
	} catch ( e ) {
		err = e;
	}

	if ( !expression ) {
		if ( parser.str.charAt( start ) === '!' ) {
			// special case - comment
			parser.pos = start;
			return null;
		}

		if ( err ) {
			throw err;
		}
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}' after reference` );

		if ( !expression ) {
			// special case - comment
			if ( parser.nextChar() === '!' ) {
				return null;
			}

			parser.error( `Expected expression or legal reference` );
		}
	}

	const interpolator = { t: INTERPOLATOR };
	refineExpression( expression, interpolator ); // TODO handle this differently - it's mysterious

	return interpolator;
}

function readClosing ( parser, tag ) {
	const start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '/' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	const remaining = parser.remaining();
	const index = remaining.indexOf( tag.close );

	if ( index !== -1 ) {
		const closing = {
			t: CLOSING,
			r: remaining.substr( 0, index ).split( ' ' )[0]
		};

		parser.pos += index;

		if ( !parser.matchString( tag.close ) ) {
			parser.error( `Expected closing delimiter '${tag.close}'` );
		}

		return closing;
	}

	parser.pos = start;
	return null;
}

const elsePattern = /^\s*else\s*/;

function readElse ( parser, tag ) {
	const start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	if ( !parser.matchPattern( elsePattern ) ) {
		parser.pos = start;
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return {
		t: ELSE
	};
}

const elsePattern$1 = /^\s*elseif\s+/;

function readElseIf ( parser, tag ) {
	const start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	if ( !parser.matchPattern( elsePattern$1 ) ) {
		parser.pos = start;
		return null;
	}

	const expression = readExpression( parser );

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return {
		t: ELSEIF,
		x: expression
	};
}

var handlebarsBlockCodes = {
	each:    SECTION_EACH,
	if:      SECTION_IF,
	with:    SECTION_IF_WITH,
	unless:  SECTION_UNLESS
};

const indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
const keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
const handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' );

function readSection ( parser, tag ) {
	let expression, section, child, children, hasElse, block, unlessBlock, closed, i, expectedClose;
	let aliasOnly = false;

	const start = parser.pos;

	if ( parser.matchString( '^' ) ) {
		// watch out for parent context refs - {{^^/^^/foo}}
		if ( parser.matchString( '^/' ) ){
			parser.pos = start;
			return null;
		}
		section = { t: SECTION, f: [], n: SECTION_UNLESS };
	} else if ( parser.matchString( '#' ) ) {
		section = { t: SECTION, f: [] };

		if ( parser.matchString( 'partial' ) ) {
			parser.pos = start - parser.standardDelimiters[0].length;
			parser.error( 'Partial definitions can only be at the top level of the template, or immediately inside components' );
		}

		if ( block = parser.matchPattern( handlebarsBlockPattern ) ) {
			expectedClose = block;
			section.n = handlebarsBlockCodes[ block ];
		}
	} else {
		return null;
	}

	parser.allowWhitespace();

	if ( block === 'with' ) {
		const aliases = readAliases( parser );
		if ( aliases ) {
			aliasOnly = true;
			section.z = aliases;
			section.t = ALIAS;
		}
	} else if ( block === 'each' ) {
		const alias = readAlias( parser );
		if ( alias ) {
			section.z = [ { n: alias.n, x: { r: '.' } } ];
			expression = alias.x;
		}
	}

	if ( !aliasOnly ) {
		if ( !expression ) expression = readExpression( parser );

		if ( !expression ) {
			parser.error( 'Expected expression' );
		}

		// optional index and key references
		if ( i = parser.matchPattern( indexRefPattern ) ) {
			let extra;

			if ( extra = parser.matchPattern( keyIndexRefPattern ) ) {
				section.i = i + ',' + extra;
			} else {
				section.i = i;
			}
		}

		if ( !block && expression.n ) {
			expectedClose = expression.n;
		}
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	parser.sectionDepth += 1;
	children = section.f;

	let pos;
	do {
		pos = parser.pos;
		if ( child = readClosing( parser, tag ) ) {
			if ( expectedClose && child.r !== expectedClose ) {
				if ( !block ) {
					if ( child.r ) parser.warn( `Expected ${tag.open}/${expectedClose}${tag.close} but found ${tag.open}/${child.r}${tag.close}` );
				} else {
					parser.pos = pos;
					parser.error( `Expected ${tag.open}/${expectedClose}${tag.close}` );
				}
			}

			parser.sectionDepth -= 1;
			closed = true;
		}

		else if ( !aliasOnly && ( child = readElseIf( parser, tag ) ) ) {
			if ( section.n === SECTION_UNLESS ) {
				parser.error( '{{else}} not allowed in {{#unless}}' );
			}

			if ( hasElse ) {
				parser.error( 'illegal {{elseif...}} after {{else}}' );
			}

			if ( !unlessBlock ) {
				unlessBlock = [];
			}

			const mustache = {
				t: SECTION,
				n: SECTION_IF,
				f: children = []
			};
			refineExpression( child.x, mustache );

			unlessBlock.push( mustache );
		}

		else if ( !aliasOnly && ( child = readElse( parser, tag ) ) ) {
			if ( section.n === SECTION_UNLESS ) {
				parser.error( '{{else}} not allowed in {{#unless}}' );
			}

			if ( hasElse ) {
				parser.error( 'there can only be one {{else}} block, at the end of a section' );
			}

			hasElse = true;

			// use an unless block if there's no elseif
			if ( !unlessBlock ) {
				unlessBlock = [];
			}

			unlessBlock.push({
				t: SECTION,
				n: SECTION_UNLESS,
				f: children = []
			});
		}

		else {
			child = parser.read( READERS );

			if ( !child ) {
				break;
			}

			children.push( child );
		}
	} while ( !closed );

	if ( unlessBlock ) {
		section.l = unlessBlock;
	}

	if ( !aliasOnly ) {
		refineExpression( expression, section );
	}

	// TODO if a section is empty it should be discarded. Don't do
	// that here though - we need to clean everything up first, as
	// it may contain removeable whitespace. As a temporary measure,
	// to pass the existing tests, remove empty `f` arrays
	if ( !section.f.length ) {
		delete section.f;
	}

	return section;
}

const OPEN_COMMENT = '<!--';
const CLOSE_COMMENT = '-->';

function readHtmlComment ( parser ) {
	const start = parser.pos;

	if ( parser.textOnlyMode || !parser.matchString( OPEN_COMMENT ) ) {
		return null;
	}

	const remaining = parser.remaining();
	const endIndex = remaining.indexOf( CLOSE_COMMENT );

	if ( endIndex === -1 ) {
		parser.error( 'Illegal HTML - expected closing comment sequence (\'-->\')' );
	}

	const content = remaining.substr( 0, endIndex );
	parser.pos += endIndex + 3;

	const comment = {
		t: COMMENT,
		c: content
	};

	if ( parser.includeLinePositions ) {
		comment.p = parser.getLinePos( start );
	}

	return comment;
}

const leadingLinebreak = /^[ \t\f\r\n]*\r?\n/;
const trailingLinebreak = /\r?\n[ \t\f\r\n]*$/;

var stripStandalones = function ( items ) {
	let i, current, backOne, backTwo, lastSectionItem;

	for ( i=1; i<items.length; i+=1 ) {
		current = items[i];
		backOne = items[i-1];
		backTwo = items[i-2];

		// if we're at the end of a [text][comment][text] sequence...
		if ( isString( current ) && isComment( backOne ) && isString( backTwo ) ) {

			// ... and the comment is a standalone (i.e. line breaks either side)...
			if ( trailingLinebreak.test( backTwo ) && leadingLinebreak.test( current ) ) {

				// ... then we want to remove the whitespace after the first line break
				items[i-2] = backTwo.replace( trailingLinebreak, '\n' );

				// and the leading line break of the second text token
				items[i] = current.replace( leadingLinebreak, '' );
			}
		}

		// if the current item is a section, and it is preceded by a linebreak, and
		// its first item is a linebreak...
		if ( isSection( current ) && isString( backOne ) ) {
			if ( trailingLinebreak.test( backOne ) && isString( current.f[0] ) && leadingLinebreak.test( current.f[0] ) ) {
				items[i-1] = backOne.replace( trailingLinebreak, '\n' );
				current.f[0] = current.f[0].replace( leadingLinebreak, '' );
			}
		}

		// if the last item was a section, and it is followed by a linebreak, and
		// its last item is a linebreak...
		if ( isString( current ) && isSection( backOne ) ) {
			lastSectionItem = lastItem( backOne.f );

			if ( isString( lastSectionItem ) && trailingLinebreak.test( lastSectionItem ) && leadingLinebreak.test( current ) ) {
				backOne.f[ backOne.f.length - 1 ] = lastSectionItem.replace( trailingLinebreak, '\n' );
				items[i] = current.replace( leadingLinebreak, '' );
			}
		}
	}

	return items;
};

function isString ( item ) {
	return typeof item === 'string';
}

function isComment ( item ) {
	return item.t === COMMENT || item.t === DELIMCHANGE;
}

function isSection ( item ) {
	return ( item.t === SECTION || item.t === INVERTED ) && item.f;
}

var trimWhitespace = function ( items, leadingPattern, trailingPattern ) {
	let item;

	if ( leadingPattern ) {
		item = items[0];
		if ( typeof item === 'string' ) {
			item = item.replace( leadingPattern, '' );

			if ( !item ) {
				items.shift();
			} else {
				items[0] = item;
			}
		}
	}

	if ( trailingPattern ) {
		item = lastItem( items );
		if ( typeof item === 'string' ) {
			item = item.replace( trailingPattern, '' );

			if ( !item ) {
				items.pop();
			} else {
				items[ items.length - 1 ] = item;
			}
		}
	}
};

const contiguousWhitespace = /[ \t\f\r\n]+/g;
const preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i;
const leadingWhitespace$1 = /^[ \t\f\r\n]+/;
const trailingWhitespace = /[ \t\f\r\n]+$/;
const leadingNewLine = /^(?:\r\n|\r|\n)/;
const trailingNewLine = /(?:\r\n|\r|\n)$/;

function cleanup ( items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace ) {
	if ( typeof items === 'string' ) return;

	let i,
		item,
		previousItem,
		nextItem,
		preserveWhitespaceInsideFragment,
		removeLeadingWhitespaceInsideFragment,
		removeTrailingWhitespaceInsideFragment;

	// First pass - remove standalones and comments etc
	stripStandalones( items );

	i = items.length;
	while ( i-- ) {
		item = items[i];

		// Remove delimiter changes, unsafe elements etc
		if ( item.exclude ) {
			items.splice( i, 1 );
		}

		// Remove comments, unless we want to keep them
		else if ( stripComments && item.t === COMMENT ) {
			items.splice( i, 1 );
		}
	}

	// If necessary, remove leading and trailing whitespace
	trimWhitespace( items, removeLeadingWhitespace ? leadingWhitespace$1 : null, removeTrailingWhitespace ? trailingWhitespace : null );

	i = items.length;
	while ( i-- ) {
		item = items[i];

		// Recurse
		if ( item.f ) {
			const isPreserveWhitespaceElement = item.t === ELEMENT && preserveWhitespaceElements.test( item.e );
			preserveWhitespaceInsideFragment = preserveWhitespace || isPreserveWhitespaceElement;

			if ( !preserveWhitespace && isPreserveWhitespaceElement ) {
				trimWhitespace( item.f, leadingNewLine, trailingNewLine );
			}

			if ( !preserveWhitespaceInsideFragment ) {
				previousItem = items[ i - 1 ];
				nextItem = items[ i + 1 ];

				// if the previous item was a text item with trailing whitespace,
				// remove leading whitespace inside the fragment
				if ( !previousItem || ( typeof previousItem === 'string' && trailingWhitespace.test( previousItem ) ) ) {
					removeLeadingWhitespaceInsideFragment = true;
				}

				// and vice versa
				if ( !nextItem || ( typeof nextItem === 'string' && leadingWhitespace$1.test( nextItem ) ) ) {
					removeTrailingWhitespaceInsideFragment = true;
				}
			}

			cleanup( item.f, stripComments, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
		}

		// Split if-else blocks into two (an if, and an unless)
		if ( item.l ) {
			cleanup( item.l, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );

			item.l.forEach( s => s.l = 1 );
			item.l.unshift( i + 1, 0 );
			items.splice.apply( items, item.l );
			delete item.l; // TODO would be nice if there was a way around this
		}

		// Clean up conditional attributes
		if ( item.m ) {
			cleanup( item.m, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
			if ( item.m.length < 1 ) delete item.m;
		}
	}

	// final pass - fuse text nodes together
	i = items.length;
	while ( i-- ) {
		if ( typeof items[i] === 'string' ) {
			if ( typeof items[i+1] === 'string' ) {
				items[i] = items[i] + items[i+1];
				items.splice( i + 1, 1 );
			}

			if ( !preserveWhitespace ) {
				items[i] = items[i].replace( contiguousWhitespace, ' ' );
			}

			if ( items[i] === '' ) {
				items.splice( i, 1 );
			}
		}
	}
}

const closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;

function readClosingTag ( parser ) {
	let tag;

	const start = parser.pos;

	// are we looking at a closing tag?
	if ( !parser.matchString( '</' ) ) {
		return null;
	}

	if ( tag = parser.matchPattern( closingTagPattern ) ) {
		if ( parser.inside && tag !== parser.inside ) {
			parser.pos = start;
			return null;
		}

		return {
			t: CLOSING_TAG,
			e: tag
		};
	}

	// We have an illegal closing tag, report it
	parser.pos -= 2;
	parser.error( 'Illegal closing tag' );
}

const tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const anchorPattern = /^[a-zA-Z_$][-a-zA-Z0-9_$]*/;
const validTagNameFollower = /^[\s\n\/>]/;
const exclude = { exclude: true };

// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
const disallowedContents = {
	li: [ 'li' ],
	dt: [ 'dt', 'dd' ],
	dd: [ 'dt', 'dd' ],
	p: 'address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul'.split( ' ' ),
	rt: [ 'rt', 'rp' ],
	rp: [ 'rt', 'rp' ],
	optgroup: [ 'optgroup' ],
	option: [ 'option', 'optgroup' ],
	thead: [ 'tbody', 'tfoot' ],
	tbody: [ 'tbody', 'tfoot' ],
	tfoot: [ 'tbody' ],
	tr: [ 'tr', 'tbody' ],
	td: [ 'td', 'th', 'tr' ],
	th: [ 'td', 'th', 'tr' ]
};

function readElement$1 ( parser ) {
	let attribute, selfClosing, children, partials, hasPartials, child, closed, pos, remaining, closingTag, anchor;

	const start = parser.pos;

	if ( parser.inside || parser.inAttribute || parser.textOnlyMode ) {
		return null;
	}

	if ( !parser.matchString( '<' ) ) {
		return null;
	}

	// if this is a closing tag, abort straight away
	if ( parser.nextChar() === '/' ) {
		return null;
	}

	const element = {};
	if ( parser.includeLinePositions ) {
		element.p = parser.getLinePos( start );
	}

	// check for doctype decl
	if ( parser.matchString( '!' ) ) {
		element.t = DOCTYPE;
		if ( !parser.matchPattern( /^doctype/i ) ) {
			parser.error( 'Expected DOCTYPE declaration' );
		}

		element.a = parser.matchPattern( /^(.+?)>/ );
		return element;
	}
	// check for anchor
	else if ( anchor = parser.matchString( '#' ) ) {
		parser.allowWhitespace();
		element.t = ANCHOR;
		element.n = parser.matchPattern( anchorPattern );
	}
	// otherwise, it's an element/component
	else {
		element.t = ELEMENT;

		// element name
		element.e = parser.matchPattern( tagNamePattern );
		if ( !element.e ) {
			return null;
		}
	}

	// next character must be whitespace, closing solidus or '>'
	if ( !validTagNameFollower.test( parser.nextChar() ) ) {
		parser.error( 'Illegal tag name' );
	}

	parser.allowWhitespace();

	parser.inTag = true;

	// directives and attributes
	while ( attribute = readMustache( parser ) ) {
		if ( attribute !== false ) {
			if ( !element.m ) element.m = [];
			element.m.push( attribute );
		}

		parser.allowWhitespace();
	}

	parser.inTag = false;

	// allow whitespace before closing solidus
	parser.allowWhitespace();

	// self-closing solidus?
	if ( parser.matchString( '/' ) ) {
		selfClosing = true;
	}

	// closing angle bracket
	if ( !parser.matchString( '>' ) ) {
		return null;
	}

	const lowerCaseName = ( element.e || element.n ).toLowerCase();
	const preserveWhitespace = parser.preserveWhitespace;

	if ( !selfClosing && ( anchor || !voidElementNames.test( element.e ) ) ) {
		if ( !anchor ) {
			parser.elementStack.push( lowerCaseName );

			// Special case - if we open a script element, further tags should
			// be ignored unless they're a closing script element
			if ( lowerCaseName in parser.interpolate ) {
				parser.inside = lowerCaseName;
			}
		}

		children = [];
		partials = Object.create( null );

		do {
			pos = parser.pos;
			remaining = parser.remaining();

			if ( !remaining ) {
				parser.error( `Missing end ${
					parser.elementStack.length > 1 ? 'tags' : 'tag'
				} (${
					parser.elementStack.reverse().map( x => `</${x}>` ).join( '' )
				})` );
			}

			// if for example we're in an <li> element, and we see another
			// <li> tag, close the first so they become siblings
			if ( !anchor && !canContain( lowerCaseName, remaining ) ) {
				closed = true;
			}

			// closing tag
			else if ( !anchor && ( closingTag = readClosingTag( parser ) ) ) {
				closed = true;

				const closingTagName = closingTag.e.toLowerCase();

				// if this *isn't* the closing tag for the current element...
				if ( closingTagName !== lowerCaseName ) {
					// rewind parser
					parser.pos = pos;

					// if it doesn't close a parent tag, error
					if ( !~parser.elementStack.indexOf( closingTagName ) ) {
						let errorMessage = 'Unexpected closing tag';

						// add additional help for void elements, since component names
						// might clash with them
						if ( voidElementNames.test( closingTagName ) ) {
							errorMessage += ` (<${closingTagName}> is a void element - it cannot contain children)`;
						}

						parser.error( errorMessage );
					}
				}
			}

			else if ( anchor && readAnchorClose( parser, element.n ) ) {
				closed = true;
			}

			else {
				// implicit close by closing section tag. TODO clean this up
				const tag = { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] };
				const implicitCloseCase = [ readClosing, readElseIf, readElse ];
				if (  implicitCloseCase.some( r => r( parser, tag ) ) ) {
					closed = true;
					parser.pos = pos;
				}

				else if ( child = parser.read( PARTIAL_READERS ) ) {
					if ( partials[ child.n ] ) {
						parser.pos = pos;
						parser.error( 'Duplicate partial definition' );
					}

					cleanup( child.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace );

					partials[ child.n ] = child.f;
					hasPartials = true;
				}

				else {
					if ( child = parser.read( READERS ) ) {
						children.push( child );
					} else {
						closed = true;
					}
				}
			}
		} while ( !closed );

		if ( children.length ) {
			element.f = children;
		}

		if ( hasPartials ) {
			element.p = partials;
		}

		parser.elementStack.pop();
	}

	parser.inside = null;

	if ( parser.sanitizeElements && parser.sanitizeElements.indexOf( lowerCaseName ) !== -1 ) {
		return exclude;
	}

	return element;
}

function canContain ( name, remaining ) {
	const match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec( remaining );
	const disallowed = disallowedContents[ name ];

	if ( !match || !disallowed ) {
		return true;
	}

	return !~disallowed.indexOf( match[1].toLowerCase() );
}

function readAnchorClose ( parser, name ) {
	const pos = parser.pos;
	if ( !parser.matchString( '</' ) ) {
		return null;
	}

	parser.matchString( '#' );
	parser.allowWhitespace();

	if ( !parser.matchString( name ) ) {
		parser.pos = pos;
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '>' ) ) {
		parser.pos = pos;
		return null;
	}

	return true;
}

function readText ( parser ) {
	let index, disallowed, barrier;

	const remaining = parser.remaining();

	if ( parser.textOnlyMode ) {
		disallowed = parser.tags.map( t => t.open );
		disallowed = disallowed.concat( parser.tags.map( t => '\\' + t.open ) );

		index = getLowestIndex( remaining, disallowed );
	} else {
		barrier = parser.inside ? '</' + parser.inside : '<';

		if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
			index = remaining.indexOf( barrier );
		} else {
			disallowed = parser.tags.map( t => t.open );
			disallowed = disallowed.concat( parser.tags.map( t => '\\' + t.open ) );

			// http://developers.whatwg.org/syntax.html#syntax-attributes
			if ( parser.inAttribute === true ) {
				// we're inside an unquoted attribute value
				disallowed.push( `"`, `'`, `=`, `<`, `>`, '`' );
			} else if ( parser.inAttribute ) {
				// quoted attribute value
				disallowed.push( parser.inAttribute );
			} else {
				disallowed.push( barrier );
			}

			index = getLowestIndex( remaining, disallowed );
		}
	}

	if ( !index ) {
		return null;
	}

	if ( index === -1 ) {
		index = remaining.length;
	}

	parser.pos += index;

	if ( ( parser.inside && parser.inside !== 'textarea' ) || parser.textOnlyMode ) {
		return remaining.substr( 0, index );
	} else {
		return decodeCharacterReferences( remaining.substr( 0, index ) );
	}
}

const partialDefinitionSectionPattern = /^\s*#\s*partial\s+/;

function readPartialDefinitionSection ( parser ) {
	let child, closed;

	const start = parser.pos;

	const delimiters = parser.standardDelimiters;

	if ( !parser.matchString( delimiters[0] ) ) {
		return null;
	}

	if ( !parser.matchPattern( partialDefinitionSectionPattern ) ) {
		parser.pos = start;
		return null;
	}

	const name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-\/]*/ );

	if ( !name ) {
		parser.error( 'expected legal partial name' );
	}

	parser.allowWhitespace();
	if ( !parser.matchString( delimiters[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters[1]}'` );
	}

	const content = [];

	const [ open, close ] = delimiters;

	do {
		if ( child = readClosing( parser, { open, close }) ) {
			if ( child.r !== 'partial' ) {
				parser.error( `Expected ${open}/partial${close}` );
			}

			closed = true;
		}

		else {
			child = parser.read( READERS );

			if ( !child ) {
				parser.error( `Expected ${open}/partial${close}` );
			}

			content.push( child );
		}
	} while ( !closed );

	return {
		t: INLINE_PARTIAL,
		n: name,
		f: content
	};
}

function readTemplate ( parser ) {
	const fragment = [];
	const partials = Object.create( null );
	let hasPartials = false;

	const preserveWhitespace = parser.preserveWhitespace;

	while ( parser.pos < parser.str.length ) {
		const pos = parser.pos;
		let item, partial;

		if ( partial = parser.read( PARTIAL_READERS ) ) {
			if ( partials[ partial.n ] ) {
				parser.pos = pos;
				parser.error( 'Duplicated partial definition' );
			}

			cleanup( partial.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace );

			partials[ partial.n ] = partial.f;
			hasPartials = true;
		} else if ( item = parser.read( READERS ) ) {
			fragment.push( item );
		} else  {
			parser.error( 'Unexpected template content' );
		}
	}

	const result = {
		v: TEMPLATE_VERSION,
		t: fragment
	};

	if ( hasPartials ) {
		result.p = partials;
	}

	return result;
}

function insertExpressions ( obj, expr ) {

	Object.keys( obj ).forEach( key => {
		if  ( isExpression( key, obj ) ) return addTo( obj, expr );

		const ref = obj[ key ];
		if ( hasChildren( ref ) ) insertExpressions( ref, expr );
	});
}

function isExpression( key, obj ) {
	return key === 's' && Array.isArray( obj.r );
}

function addTo( obj, expr ) {
	const { s, r } = obj;
	if ( !expr[ s ] ) expr[ s ] = fromExpression( s, r.length );
}

function hasChildren( ref ) {
	return Array.isArray( ref ) || isObject( ref );
}

var shared = {};

// See https://github.com/ractivejs/template-spec for information
// about the Ractive template specification

const STANDARD_READERS = [ readPartial, readUnescaped, readSection, readInterpolator, readComment ];
const TRIPLE_READERS = [ readTriple ];
const STATIC_READERS = [ readUnescaped, readSection, readInterpolator ]; // TODO does it make sense to have a static section?

const READERS = [ readMustache, readHtmlComment, readElement$1, readText ];
const PARTIAL_READERS = [ readPartialDefinitionSection ];

const defaultInterpolate = [ 'script', 'style', 'template' ];

const StandardParser = Parser.extend({
	init ( str, options ) {
		const tripleDelimiters = options.tripleDelimiters || shared.defaults.tripleDelimiters;
		const staticDelimiters = options.staticDelimiters || shared.defaults.staticDelimiters;
		const staticTripleDelimiters = options.staticTripleDelimiters || shared.defaults.staticTripleDelimiters;

		this.standardDelimiters = options.delimiters || shared.defaults.delimiters;

		this.tags = [
			{ isStatic: false, isTriple: false, open: this.standardDelimiters[0], close: this.standardDelimiters[1], readers: STANDARD_READERS },
			{ isStatic: false, isTriple: true,  open: tripleDelimiters[0],        close: tripleDelimiters[1],        readers: TRIPLE_READERS },
			{ isStatic: true,  isTriple: false, open: staticDelimiters[0],        close: staticDelimiters[1],        readers: STATIC_READERS },
			{ isStatic: true,  isTriple: true,  open: staticTripleDelimiters[0],  close: staticTripleDelimiters[1],  readers: TRIPLE_READERS }
		];

		this.contextLines = options.contextLines || shared.defaults.contextLines;

		this.sortMustacheTags();

		this.sectionDepth = 0;
		this.elementStack = [];

		this.interpolate = Object.create( options.interpolate || shared.defaults.interpolate || {} );
		this.interpolate.textarea = true;
		defaultInterpolate.forEach( t => this.interpolate[ t ] = !options.interpolate || options.interpolate[ t ] !== false );

		if ( options.sanitize === true ) {
			options.sanitize = {
				// blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
				elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
				eventAttributes: true
			};
		}

		this.stripComments = options.stripComments !== false;
		this.preserveWhitespace = options.preserveWhitespace;
		this.sanitizeElements = options.sanitize && options.sanitize.elements;
		this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
		this.includeLinePositions = options.includeLinePositions;
		this.textOnlyMode = options.textOnlyMode;
		this.csp = options.csp;

		if ( options.attributes ) this.inTag = true;

		this.transforms = options.transforms || options.parserTransforms;
		if ( this.transforms ) {
			this.transforms = this.transforms.concat( shared.defaults.parserTransforms );
		} else {
			this.transforms = shared.defaults.parserTransforms;
		}
	},

	postProcess ( result ) {
		// special case - empty string
		if ( !result.length ) {
			return { t: [], v: TEMPLATE_VERSION };
		}

		if ( this.sectionDepth > 0 ) {
			this.error( 'A section was left open' );
		}

		cleanup( result[0].t, this.stripComments, this.preserveWhitespace, !this.preserveWhitespace, !this.preserveWhitespace );

		const transforms = this.transforms;
		if ( transforms.length ) {
			const tlen = transforms.length;
			const walk = function ( fragment ) {
				let len = fragment.length;

				for ( let i = 0; i < len; i++ ) {
					let node = fragment[i];

					if ( node.t === ELEMENT ) {
						for ( let j = 0; j < tlen; j++ ) {
							const res = transforms[j].call( shared.Ractive, node );
							if ( !res ) {
								continue;
							} else if ( res.remove ) {
								fragment.splice( i--, 1 );
								len--;
								break;
							} else if ( res.replace ) {
								if ( Array.isArray( res.replace ) ) {
									fragment.splice( i--, 1, ...res.replace );
									len += res.replace.length - 1;
								} else {
									fragment[i--] = node = res.replace;
								}

								break;
							}
						}

						// watch for partials
						if ( node.p && !Array.isArray( node.p ) ) {
							for ( const k in node.p ) walk( node.p[k] );
						}
					}

					if ( node.f ) walk( node.f );
				}
			};

			// process the root fragment
			walk( result[0].t );

			// watch for root partials
			if ( result[0].p && !Array.isArray( result[0].p ) ) {
				for ( const k in result[0].p ) walk( result[0].p[k] );
			}
		}

		if ( this.csp !== false ) {
			const expr = {};
			insertExpressions( result[0].t, expr );
			if ( Object.keys( expr ).length ) result[0].e = expr;
		}

		return result[0];
	},

	converters: [
		readTemplate
	],

	sortMustacheTags () {
		// Sort in order of descending opening delimiter length (longer first),
		// to protect against opening delimiters being substrings of each other
		this.tags.sort( ( a, b ) => {
			return b.open.length - a.open.length;
		});
	}
});

function parse ( template, options ) {
	return new StandardParser( template, options || {} ).result;
}

const parseOptions = [
	'delimiters',
	'tripleDelimiters',
	'staticDelimiters',
	'staticTripleDelimiters',
	'csp',
	'interpolate',
	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'contextLines',
	'parserTransforms',
	'allowExpressions',
	'attributes'
];

const TEMPLATE_INSTRUCTIONS = `Either preparse or use a ractive runtime source that includes the parser. `;

const COMPUTATION_INSTRUCTIONS = `Either include a version of Ractive that can parse or convert your computation strings to functions.`;


function throwNoParse ( method, error, instructions ) {
	if ( !method ) {
		fatal( `Missing Ractive.parse - cannot parse ${error}. ${instructions}` );
	}
}

function createFunction ( body, length ) {
	throwNoParse( fromExpression, 'new expression function', TEMPLATE_INSTRUCTIONS );
	return fromExpression( body, length );
}

function createFunctionFromString ( str, bindTo ) {
	throwNoParse( fromComputationString, 'compution string "${str}"', COMPUTATION_INSTRUCTIONS );
	return fromComputationString( str, bindTo );
}

const parser = {

	fromId ( id, options ) {
		if ( !doc ) {
			if ( options && options.noThrow ) { return; }
			throw new Error( `Cannot retrieve template #${id} as Ractive is not running in a browser.` );
		}

		if ( id ) id = id.replace( /^#/, '' );

		let template;

		if ( !( template = doc.getElementById( id ) )) {
			if ( options && options.noThrow ) { return; }
			throw new Error( `Could not find template element with id #${id}` );
		}

		if ( template.tagName.toUpperCase() !== 'SCRIPT' ) {
			if ( options && options.noThrow ) { return; }
			throw new Error( `Template element with id #${id}, must be a <script> element` );
		}

		return ( 'textContent' in template ? template.textContent : template.innerHTML );

	},

	isParsed ( template) {
		return !( typeof template === 'string' );
	},

	getParseOptions ( ractive ) {
		// Could be Ractive or a Component
		if ( ractive.defaults ) { ractive = ractive.defaults; }

		return parseOptions.reduce( ( val, key ) => {
			val[ key ] = ractive[ key ];
			return val;
		}, {});
	},

	parse ( template, options ) {
		throwNoParse( parse, 'template', TEMPLATE_INSTRUCTIONS );
		const parsed = parse( template, options );
		addFunctions( parsed );
		return parsed;
	},

	parseFor( template, ractive ) {
		return this.parse( template, this.getParseOptions( ractive ) );
	}
};

const functions = Object.create( null );

function getFunction ( str, i ) {
	if ( functions[ str ] ) return functions[ str ];
	return functions[ str ] = createFunction( str, i );
}

function addFunctions( template ) {
	if ( !template ) return;

	const exp = template.e;

	if ( !exp ) return;

	Object.keys( exp ).forEach( ( str ) => {
		if ( functions[ str ] ) return;
		functions[ str ] = exp[ str ];
	});
}

var templateConfigurator = {
	name: 'template',

	extend ( Parent, proto, options ) {
		// only assign if exists
		if ( 'template' in options ) {
			const template = options.template;

			if ( typeof template === 'function' ) {
				proto.template = template;
			} else {
				proto.template = parseTemplate( template, proto );
			}
		}
	},

	init ( Parent, ractive, options ) {
		// TODO because of prototypal inheritance, we might just be able to use
		// ractive.template, and not bother passing through the Parent object.
		// At present that breaks the test mocks' expectations
		let template = 'template' in options ? options.template : Parent.prototype.template;
		template = template || { v: TEMPLATE_VERSION, t: [] };

		if ( typeof template === 'function' ) {
			const fn = template;
			template = getDynamicTemplate( ractive, fn );

			ractive._config.template = {
				fn,
				result: template
			};
		}

		template = parseTemplate( template, ractive );

		// TODO the naming of this is confusing - ractive.template refers to [...],
		// but Component.prototype.template refers to {v:1,t:[],p:[]}...
		// it's unnecessary, because the developer never needs to access
		// ractive.template
		ractive.template = template.t;

		if ( template.p ) {
			extendPartials( ractive.partials, template.p );
		}
	},

	reset ( ractive ) {
		const result = resetValue( ractive );

		if ( result ) {
			const parsed = parseTemplate( result, ractive );

			ractive.template = parsed.t;
			extendPartials( ractive.partials, parsed.p, true );

			return true;
		}
	}
};

function resetValue ( ractive ) {
	const initial = ractive._config.template;

	// If this isn't a dynamic template, there's nothing to do
	if ( !initial || !initial.fn ) {
		return;
	}

	const result = getDynamicTemplate( ractive, initial.fn );

	// TODO deep equality check to prevent unnecessary re-rendering
	// in the case of already-parsed templates
	if ( result !== initial.result ) {
		initial.result = result;
		return result;
	}
}

function getDynamicTemplate ( ractive, fn ) {
	return fn.call( ractive, {
		fromId: parser.fromId,
		isParsed: parser.isParsed,
		parse ( template, options = parser.getParseOptions( ractive ) ) {
			return parser.parse( template, options );
		}
	});
}

function parseTemplate ( template, ractive ) {
	if ( typeof template === 'string' ) {
		// parse will validate and add expression functions
		template = parseAsString( template, ractive );
	}
	else {
		// need to validate and add exp for already parsed template
		validate$1( template );
		addFunctions( template );
	}

	return template;
}

function parseAsString ( template, ractive ) {
	// ID of an element containing the template?
	if ( template[0] === '#' ) {
		template = parser.fromId( template );
	}

	return parser.parseFor( template, ractive );
}

function validate$1( template ) {

	// Check that the template even exists
	if ( template == undefined ) {
		throw new Error( `The template cannot be ${template}.` );
	}

	// Check the parsed template has a version at all
	else if ( typeof template.v !== 'number' ) {
		throw new Error( 'The template parser was passed a non-string template, but the template doesn\'t have a version.  Make sure you\'re passing in the template you think you are.' );
	}

	// Check we're using the correct version
	else if ( template.v !== TEMPLATE_VERSION ) {
		throw new Error( `Mismatched template version (expected ${TEMPLATE_VERSION}, got ${template.v}) Please ensure you are using the latest version of Ractive.js in your build process as well as in your app` );
	}
}

function extendPartials ( existingPartials, newPartials, overwrite ) {
	if ( !newPartials ) return;

	// TODO there's an ambiguity here - we need to overwrite in the `reset()`
	// case, but not initially...

	for ( const key in newPartials ) {
		if ( overwrite || !existingPartials.hasOwnProperty( key ) ) {
			existingPartials[ key ] = newPartials[ key ];
		}
	}
}

const registryNames = [
	'adaptors',
	'components',
	'computed',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

const registriesOnDefaults = [
	'computed'
];

class Registry {
	constructor ( name, useDefaults ) {
		this.name = name;
		this.useDefaults = useDefaults;
	}

	extend ( Parent, proto, options ) {
		const parent = this.useDefaults ? Parent.defaults : Parent;
		const target = this.useDefaults ? proto : proto.constructor;
		this.configure( parent, target, options );
	}

	init () {
		// noop
	}

	configure ( Parent, target, options ) {
		const name = this.name;
		const option = options[ name ];

		const registry = Object.create( Parent[name] );

		for ( const key in option ) {
			registry[ key ] = option[ key ];
		}

		target[ name ] = registry;
	}

	reset ( ractive ) {
		const registry = ractive[ this.name ];
		let changed = false;

		Object.keys( registry ).forEach( key => {
			const item = registry[ key ];

			if ( item._fn ) {
				if ( item._fn.isOwner ) {
					registry[key] = item._fn;
				} else {
					delete registry[key];
				}
				changed = true;
			}
		});

		return changed;
	}
}

const registries = registryNames.map( name => {
	const putInDefaults = registriesOnDefaults.indexOf(name) > -1;
	return new Registry( name, putInDefaults );
});

function wrap ( parent, name, method ) {
	if ( !/_super/.test( method ) ) return method;

	function wrapper () {
		const superMethod = getSuperMethod( wrapper._parent, name );
		const hasSuper = '_super' in this;
		const oldSuper = this._super;

		this._super = superMethod;

		const result = method.apply( this, arguments );

		if ( hasSuper ) {
			this._super = oldSuper;
		} else {
			delete this._super;
		}

		return result;
	}

	wrapper._parent = parent;
	wrapper._method = method;

	return wrapper;
}

function getSuperMethod ( parent, name ) {
	if ( name in parent ) {
		const value = parent[ name ];

		return typeof value === 'function' ?
			value :
			() => value;
	}

	return noop;
}

function getMessage( deprecated, correct, isError ) {
	return `options.${deprecated} has been deprecated in favour of options.${correct}.`
		+ ( isError ? ` You cannot specify both options, please use options.${correct}.` : '' );
}

function deprecateOption ( options, deprecatedOption, correct ) {
	if ( deprecatedOption in options ) {
		if( !( correct in options ) ) {
			warnIfDebug( getMessage( deprecatedOption, correct ) );
			options[ correct ] = options[ deprecatedOption ];
		} else {
			throw new Error( getMessage( deprecatedOption, correct, true ) );
		}
	}
}

function deprecate ( options ) {
	deprecateOption( options, 'beforeInit', 'onconstruct' );
	deprecateOption( options, 'init', 'onrender' );
	deprecateOption( options, 'complete', 'oncomplete' );
	deprecateOption( options, 'eventDefinitions', 'events' );

	// Using extend with Component instead of options,
	// like Human.extend( Spider ) means adaptors as a registry
	// gets copied to options. So we have to check if actually an array
	if ( Array.isArray( options.adaptors ) ) {
		deprecateOption( options, 'adaptors', 'adapt' );
	}
}

const custom = {
	adapt: adaptConfigurator,
	css: cssConfigurator,
	data: dataConfigurator,
	template: templateConfigurator
};

const defaultKeys = Object.keys( defaults );

const isStandardKey = makeObj( defaultKeys.filter( key => !custom[ key ] ) );

// blacklisted keys that we don't double extend
const isBlacklisted = makeObj( defaultKeys.concat( registries.map( r => r.name ), [ 'on', 'observe', 'attributes', 'cssData' ] ) );

const order = [].concat(
	defaultKeys.filter( key => !registries[ key ] && !custom[ key ] ),
	registries,
	//custom.data,
	custom.template,
	custom.css
);

const config = {
	extend: ( Parent, proto$$1, options, Child ) => configure( 'extend', Parent, proto$$1, options, Child ),
	init: ( Parent, ractive, options ) => configure( 'init', Parent, ractive, options ),
	reset: ractive => order.filter( c => c.reset && c.reset( ractive ) ).map( c => c.name )
};

function configure ( method, Parent, target, options, Child ) {
	deprecate( options );

	for ( const key in options ) {
		if ( isStandardKey.hasOwnProperty( key ) ) {
			const value = options[ key ];

			// warn the developer if they passed a function and ignore its value

			// NOTE: we allow some functions on "el" because we duck type element lists
			// and some libraries or ef'ed-up virtual browsers (phantomJS) return a
			// function object as the result of querySelector methods
			if ( key !== 'el' && typeof value === 'function' ) {
				warnIfDebug( `${ key } is a Ractive option that does not expect a function and will be ignored`,
					method === 'init' ? target : null );
			}
			else {
				target[ key ] = value;
			}
		}
	}

	// disallow combination of `append` and `enhance`
	if ( options.append && options.enhance ) {
		throw new Error( 'Cannot use append and enhance at the same time' );
	}

	registries.forEach( registry => {
		registry[ method ]( Parent, target, options, Child );
	});

	adaptConfigurator[ method ]( Parent, target, options, Child );
	templateConfigurator[ method ]( Parent, target, options, Child );
	cssConfigurator[ method ]( Parent, target, options, Child );

	extendOtherMethods( Parent.prototype, target, options );
}

const _super = /\b_super\b/;
function extendOtherMethods ( parent, target, options ) {
	for ( const key in options ) {
		if ( !isBlacklisted[ key ] && options.hasOwnProperty( key ) ) {
			let member = options[ key ];

			// if this is a method that overwrites a method, wrap it:
			if ( typeof member === 'function' ) {
				if ( key in proto && !_super.test( member.toString() ) ) {
					warnIfDebug( `Overriding Ractive prototype function '${key}' without calling the '${_super}' method can be very dangerous.` );
				}
				member = wrap( parent, key, member );
			}

			target[ key ] = member;
		}
	}
}

function makeObj ( array ) {
	const obj = {};
	array.forEach( x => obj[x] = true );
	return obj;
}

class Item {
	constructor ( options ) {
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;

		this.template = options.template;
		this.index = options.index;
		this.type = options.template.t;

		this.dirty = false;
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	destroyed () {
		if ( this.fragment ) this.fragment.destroyed();
	}

	find () {
		return null;
	}

	findComponent () {
		return null;
	}

	findNextNode () {
		return this.parentFragment.findNextNode( this );
	}

	shuffled () {
		if ( this.fragment ) this.fragment.shuffled();
	}

	valueOf () {
		return this.toString();
	}
}

Item.prototype.findAll = noop;
Item.prototype.findAllComponents = noop;

class ContainerItem extends Item {
	constructor ( options ) {
		super( options );
	}

	detach () {
		return this.fragment ? this.fragment.detach() : createDocumentFragment();
	}

	find ( selector ) {
		if ( this.fragment ) {
			return this.fragment.find( selector );
		}
	}

	findAll ( selector, options ) {
		if ( this.fragment ) {
			this.fragment.findAll( selector, options );
		}
	}

	findComponent ( name ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, options ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( name, options );
		}
	}

	firstNode ( skipParent ) {
		return this.fragment && this.fragment.firstNode( skipParent );
	}

	toString ( escape ) {
		return this.fragment ? this.fragment.toString( escape ) : '';
	}
}

class ComputationChild extends Model {
	constructor ( parent, key ) {
		super( parent, key );

		this.isReadonly = !this.root.ractive.syncComputedChildren;
		this.dirty = true;
	}

	get setRoot () { return this.parent.setRoot; }

	applyValue ( value ) {
		super.applyValue( value );

		if ( !this.isReadonly ) {
			let source = this.parent;
			// computed models don't have a shuffle method
			while ( source && source.shuffle ) {
				source = source.parent;
			}

			if ( source ) {
				source.dependencies.forEach( mark );
			}
		}

		if ( this.setRoot ) {
			this.setRoot.set( this.setRoot.value );
		}
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		if ( this.dirty ) {
			this.dirty = false;
			const parentValue = this.parent.get();
			this.value = parentValue ? parentValue[ this.key ] : undefined;
		}

		return this.value;
	}

	handleChange () {
		this.dirty = true;

		if ( this.boundValue ) this.boundValue = null;

		this.links.forEach( marked );
		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ComputationChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}
}

/* global console */
/* eslint no-console:"off" */

class Computation extends Model {
	constructor ( viewmodel, signature, key ) {
		super( null, null );

		this.root = this.parent = viewmodel;
		this.signature = signature;

		this.key = key; // not actually used, but helps with debugging
		this.isExpression = key && key[0] === '@';

		this.isReadonly = !this.signature.setter;

		this.context = viewmodel.computationContext;

		this.dependencies = [];

		this.children = [];
		this.childByKey = {};

		this.deps = [];

		this.dirty = true;

		// TODO: is there a less hackish way to do this?
		this.shuffle = undefined;
	}

	get setRoot () {
		if ( this.signature.setter ) return this;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		if ( this.dirty ) {
			this.dirty = false;
			const old = this.value;
			this.value = this.getValue();
			if ( !isEqual( old, this.value ) ) this.notifyUpstream();
			if ( this.wrapper ) this.newWrapperValue = this.value;
			this.adapt();
		}

		// if capturing, this value needs to be unwrapped because it's for external use
		return maybeBind( this, shouldCapture && this.wrapper ? this.wrapperValue : this.value );
	}

	getValue () {
		startCapturing();
		let result;

		try {
			result = this.signature.getter.call( this.context );
		} catch ( err ) {
			warnIfDebug( `Failed to compute ${this.getKeypath()}: ${err.message || err}` );

			// TODO this is all well and good in Chrome, but...
			// ...also, should encapsulate this stuff better, and only
			// show it if Ractive.DEBUG
			if ( hasConsole ) {
				if ( console.groupCollapsed ) console.groupCollapsed( '%cshow details', 'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;' );
				const sig = this.signature;
				console.error( `${err.name}: ${err.message}\n\n${sig.getterString}${sig.getterUseStack ? '\n\n' + err.stack : ''}` );
				if ( console.groupCollapsed ) console.groupEnd();
			}
		}

		const dependencies = stopCapturing();
		this.setDependencies( dependencies );

		return result;
	}

	mark () {
		this.handleChange();
	}

	rebind ( next, previous ) {
		// computations will grab all of their deps again automagically
		if ( next !== previous ) this.handleChange();
	}

	set ( value ) {
		if ( this.isReadonly ) {
			throw new Error( `Cannot set read-only computed value '${this.key}'` );
		}

		this.signature.setter( value );
		this.mark();
	}

	setDependencies ( dependencies ) {
		// unregister any soft dependencies we no longer have
		let i = this.dependencies.length;
		while ( i-- ) {
			const model = this.dependencies[i];
			if ( !~dependencies.indexOf( model ) ) model.unregister( this );
		}

		// and add any new ones
		i = dependencies.length;
		while ( i-- ) {
			const model = dependencies[i];
			if ( !~this.dependencies.indexOf( model ) ) model.register( this );
		}

		this.dependencies = dependencies;
	}

	teardown () {
		let i = this.dependencies.length;
		while ( i-- ) {
			if ( this.dependencies[i] ) this.dependencies[i].unregister( this );
		}
		if ( this.root.computations[this.key] === this ) delete this.root.computations[this.key];
		super.teardown();
	}
}

const prototype$1 = Computation.prototype;
const child = ComputationChild.prototype;
prototype$1.handleChange = child.handleChange;
prototype$1.joinKey = child.joinKey;

class ExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.isReadonly = true;
		this.dirty = true;

		this.fn = getFunction( template.s, template.r.length );

		this.models = this.template.r.map( ref => {
			return resolveReference( this.fragment, ref );
		});
		this.dependencies = [];

		this.shuffle = undefined;

		this.bubble();
	}

	bubble ( actuallyChanged = true ) {
		// refresh the keypath
		this.keypath = undefined;

		if ( actuallyChanged ) {
			this.handleChange();
		}
	}

	getKeypath () {
		if ( !this.template ) return '@undefined';
		if ( !this.keypath ) {
			this.keypath = '@' + this.template.s.replace( /_(\d+)/g, ( match, i ) => {
				if ( i >= this.models.length ) return match;

				const model = this.models[i];
				return model ? model.getKeypath() : '@undefined';
			});
		}

		return this.keypath;
	}

	getValue () {
		startCapturing();
		let result;

		try {
			const params = this.models.map( m => m ? m.get( true ) : undefined );
			result = this.fn.apply( this.fragment.ractive, params );
		} catch ( err ) {
			warnIfDebug( `Failed to compute ${this.getKeypath()}: ${err.message || err}` );
		}

		const dependencies = stopCapturing();
		// remove missing deps
		this.dependencies.filter( d => !~dependencies.indexOf( d ) ).forEach( d => {
			d.unregister( this );
			removeFromArray( this.dependencies, d );
		});
		// register new deps
		dependencies.filter( d => !~this.dependencies.indexOf( d ) ).forEach( d => {
			d.register( this );
			this.dependencies.push( d );
		});

		return result;
	}

	notifyUpstream () {}

	rebind ( next, previous, safe ) {
		const idx = this.models.indexOf( previous );

		if ( ~idx ) {
			next = rebindMatch( this.template.r[idx], next, previous );
			if ( next !== previous ) {
				previous.unregister( this );
				this.models.splice( idx, 1, next );
				if ( next ) next.addShuffleRegister( this, 'mark' );
			}
		}
		this.bubble( !safe );
	}

	retrieve () {
		return this.get();
	}

	teardown () {
		this.unbind();
		this.fragment = undefined;
		if ( this.dependencies ) this.dependencies.forEach( d => d.unregister( this ) );
		super.teardown();
	}

	unreference () {
		super.unreference();
		if ( !this.deps.length && !this.refs ) this.teardown();
	}

	unregister( dep ) {
		super.unregister( dep );
		if ( !this.deps.length && !this.refs ) this.teardown();
	}
}

const prototype = ExpressionProxy.prototype;
const computation = Computation.prototype;
prototype.get = computation.get;
prototype.handleChange = computation.handleChange;
prototype.joinKey = computation.joinKey;
prototype.mark = computation.mark;
prototype.unbind = noop;

class ReferenceExpressionChild extends Model {
	constructor ( parent, key ) {
		super ( parent, key );
		this.dirty = true;
	}

	applyValue ( value ) {
		if ( isEqual( value, this.value ) ) return;

		let parent = this.parent;
		const keys = [ this.key ];
		while ( parent ) {
			if ( parent.base ) {
				const target = parent.model.joinAll( keys );
				target.applyValue( value );
				break;
			}

			keys.unshift( parent.key );

			parent = parent.parent;
		}
	}

	get ( shouldCapture, opts ) {
		this.retrieve();
		return super.get( shouldCapture, opts );
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ReferenceExpressionChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		this.dirty = true;
		super.mark();
	}

	retrieve () {
		if ( this.dirty ) {
			this.dirty = false;
			const parent = this.parent.get();
			this.value = parent && parent[ this.key ];
		}

		return this.value;
	}
}

const missing = { get() {} };

class ReferenceExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( null, null );
		this.dirty = true;
		this.root = fragment.ractive.viewmodel;
		this.template = template;

		this.base = resolve( fragment, template );

		const intermediary = this.intermediary = {
			handleChange: () => this.handleChange(),
			rebind: ( next, previous ) => {
				if ( previous === this.base ) {
					next = rebindMatch( template, next, previous );
					if ( next !== this.base ) {
						this.base.unregister( intermediary );
						this.base = next;
					}
				} else {
					const idx = this.members.indexOf( previous );
					if ( ~idx ) {
						// only direct references will rebind... expressions handle themselves
						next = rebindMatch( template.m[idx].n, next, previous );
						if ( next !== this.members[idx] ) {
							this.members.splice( idx, 1, next || missing );
						}
					}
				}

				if ( next !== previous ) previous.unregister( intermediary );
				if ( next ) next.addShuffleTask( () => next.register( intermediary ) );

				this.bubble();
			}
		};

		this.members = template.m.map( ( template ) => {
			if ( typeof template === 'string' ) {
				return { get: () => template };
			}

			let model;

			if ( template.t === REFERENCE ) {
				model = resolveReference( fragment, template.n );
				model.register( intermediary );

				return model;
			}

			model = new ExpressionProxy( fragment, template );
			model.register( intermediary );
			return model;
		});

		this.base.register( intermediary );

		this.bubble();
	}

	bubble () {
		if ( !this.base ) return;
		if ( !this.dirty ) this.handleChange();
	}

	get ( shouldCapture ) {
		if ( this.dirty ) {
			this.bubble();

			const keys = this.members.map( m => escapeKey( String( m.get() ) ) );
			const model = this.base.joinAll( keys );

			if ( model !== this.model ) {
				if ( this.model ) {
					this.model.unregister( this );
					this.model.unregisterTwowayBinding( this );
				}

				this.model = model;
				this.parent = model.parent;
				this.model.register( this );
				this.model.registerTwowayBinding( this );

				if ( this.keypathModel ) this.keypathModel.handleChange();
			}

			this.value = this.model.get( shouldCapture );
			this.dirty = false;
			this.mark();
			return this.value;
		} else {
			return this.model ? this.model.get( shouldCapture ) : undefined;
		}
	}

	// indirect two-way bindings
	getValue () {
		this.value = this.model ? this.model.get() : undefined;

		let i = this.bindings.length;
		while ( i-- ) {
			const value = this.bindings[i].getValue();
			if ( value !== this.value ) return value;
		}

		// check one-way bindings
		const oneway = findBoundValue( this.deps );
		if ( oneway ) return oneway.value;

		return this.value;
	}

	getKeypath () {
		return this.model ? this.model.getKeypath() : '@undefined';
	}

	handleChange () {
		this.dirty = true;
		this.mark();
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ReferenceExpressionChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		if ( this.dirty ) {
			this.deps.forEach( handleChange );
		}

		this.links.forEach( marked );
		this.children.forEach( mark );
	}

	rebind () { this.handleChange(); }

	retrieve () {
		return this.value;
	}

	set ( value ) {
		this.model.set( value );
	}

	teardown () {
		if ( this.model ) {
			this.model.unregister( this );
			this.model.unregisterTwowayBinding( this );
		}
		if ( this.members ) {
			this.members.forEach( m => m && m.unregister && m.unregister( this ) );
		}
	}

	unreference () {
		super.unreference();
		if ( !this.deps.length && !this.refs ) this.teardown();
	}

	unregister( dep ) {
		super.unregister( dep );
		if ( !this.deps.length && !this.refs ) this.teardown();
	}
}

function resolve ( fragment, template ) {
	if ( template.r ) {
		return resolveReference( fragment, template.r );
	}

	else if ( template.x ) {
		return new ExpressionProxy( fragment, template.x );
	}

	else if ( template.rx ) {
		return new ReferenceExpressionProxy( fragment, template.rx );
	}
}

function resolveAliases( aliases, fragment ) {
	const resolved = {};

	for ( let i = 0; i < aliases.length; i++ ) {
		resolved[ aliases[i].n ] = resolve( fragment, aliases[i].x );
	}

	for ( const k in resolved ) {
		resolved[k].reference();
	}

	return resolved;
}

class Alias extends ContainerItem {
	constructor ( options ) {
		super( options );

		this.fragment = null;
	}

	bind () {
		this.fragment = new Fragment({
			owner: this,
			template: this.template.f
		});

		this.fragment.aliases = resolveAliases( this.template.z, this.parentFragment );
		this.fragment.bind();
	}

	render ( target ) {
		this.rendered = true;
		if ( this.fragment ) this.fragment.render( target );
	}

	unbind () {
		for ( const k in this.fragment.aliases ) {
			this.fragment.aliases[k].unreference();
		}

		this.fragment.aliases = {};
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && this.fragment ) this.fragment.unrender( shouldDestroy );
		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			this.fragment.update();
		}
	}
}

var hyphenateCamel = function ( camelCaseStr ) {
	return camelCaseStr.replace( /([A-Z])/g, ( match, $1 ) => {
		return '-' + $1.toLowerCase();
	});
};

const space = /\s+/;

function readStyle ( css ) {
	if ( typeof css !== 'string' ) return {};

	return cleanCss( css, ( css, reconstruct ) => {
		return css.split( ';' )
			.filter( rule => !!rule.trim() )
			.map( reconstruct )
			.reduce(( rules, rule ) => {
				const i = rule.indexOf(':');
				const name = rule.substr( 0, i ).trim();
				rules[ name ] = rule.substr( i + 1 ).trim();
				return rules;
			}, {});
	});
}

function readClass ( str ) {
	const list = str.split( space );

  // remove any empty entries
	let i = list.length;
	while ( i-- ) {
		if ( !list[i] ) list.splice( i, 1 );
	}

	return list;
}

const textTypes = [ undefined, 'text', 'search', 'url', 'email', 'hidden', 'password', 'search', 'reset', 'submit' ];

function getUpdateDelegate ( attribute ) {
	const { element, name } = attribute;

	if ( name === 'value' ) {
		if ( attribute.interpolator ) attribute.interpolator.bound = true;

		// special case - selects
		if ( element.name === 'select' && name === 'value' ) {
			return element.getAttribute( 'multiple' ) ? updateMultipleSelectValue : updateSelectValue;
		}

		if ( element.name === 'textarea' ) return updateStringValue;

		// special case - contenteditable
		if ( element.getAttribute( 'contenteditable' ) != null ) return updateContentEditableValue;

		// special case - <input>
		if ( element.name === 'input' ) {
			const type = element.getAttribute( 'type' );

			// type='file' value='{{fileList}}'>
			if ( type === 'file' ) return noop; // read-only

			// type='radio' name='{{twoway}}'
			if ( type === 'radio' && element.binding && element.binding.attribute.name === 'name' ) return updateRadioValue;

			if ( ~textTypes.indexOf( type ) ) return updateStringValue;
		}

		return updateValue;
	}

	const node = element.node;

	// special case - <input type='radio' name='{{twoway}}' value='foo'>
	if ( attribute.isTwoway && name === 'name' ) {
		if ( node.type === 'radio' ) return updateRadioName;
		if ( node.type === 'checkbox' ) return updateCheckboxName;
	}

	if ( name === 'style' ) return updateStyleAttribute;

	if ( name.indexOf( 'style-' ) === 0 ) return updateInlineStyle;

	// special case - class names. IE fucks things up, again
	if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === html ) ) return updateClassName;

	if ( name.indexOf( 'class-' ) === 0 ) return updateInlineClass;

	if ( attribute.isBoolean ) {
		const type = element.getAttribute( 'type' );
		if ( attribute.interpolator && name === 'checked' && ( type === 'checkbox' || type === 'radio' ) ) attribute.interpolator.bound = true;
		return updateBoolean;
	}

	if ( attribute.namespace && attribute.namespace !== attribute.node.namespaceURI ) return updateNamespacedAttribute;

	return updateAttribute;
}

function updateMultipleSelectValue ( reset ) {
	let value = this.getValue();

	if ( !Array.isArray( value ) ) value = [ value ];

	const options = this.node.options;
	let i = options.length;

	if ( reset ) {
		while ( i-- ) options[i].selected = false;
	} else {
		while ( i-- ) {
			const option = options[i];
			const optionValue = option._ractive ?
				option._ractive.value :
				option.value; // options inserted via a triple don't have _ractive

			option.selected = arrayContains( value, optionValue );
		}
	}
}

function updateSelectValue ( reset ) {
	const value = this.getValue();

	if ( !this.locked ) { // TODO is locked still a thing?
		this.node._ractive.value = value;

		const options = this.node.options;
		let i = options.length;
		let wasSelected = false;

		if ( reset ) {
			while ( i-- ) options[i].selected = false;
		} else {
			while ( i-- ) {
				const option = options[i];
				const optionValue = option._ractive ?
					option._ractive.value :
					option.value; // options inserted via a triple don't have _ractive
				if ( option.disabled && option.selected ) wasSelected = true;

				if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
					option.selected = true;
					return;
				}
			}
		}

		if ( !wasSelected ) this.node.selectedIndex = -1;
	}
}


function updateContentEditableValue ( reset ) {
	const value = this.getValue();

	if ( !this.locked ) {
		if ( reset ) this.node.innerHTML = '';
		else this.node.innerHTML = value === undefined ? '' : value;
	}
}

function updateRadioValue ( reset ) {
	const node = this.node;
	const wasChecked = node.checked;

	const value = this.getValue();

	if ( reset ) return node.checked = false;

	//node.value = this.element.getAttribute( 'value' );
	node.value = this.node._ractive.value = value;
	node.checked = this.element.compare( value, this.element.getAttribute( 'name' ) );

	// This is a special case - if the input was checked, and the value
	// changed so that it's no longer checked, the twoway binding is
	// most likely out of date. To fix it we have to jump through some
	// hoops... this is a little kludgy but it works
	if ( wasChecked && !node.checked && this.element.binding && this.element.binding.rendered ) {
		this.element.binding.group.model.set( this.element.binding.group.getValue() );
	}
}

function updateValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node.removeAttribute( 'value' );
			this.node.value = this.node._ractive.value = null;
		} else {
			const value = this.getValue();

			this.node.value = this.node._ractive.value = value;
			this.node.setAttribute( 'value', safeToStringValue( value ) );
		}
	}
}

function updateStringValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node._ractive.value = '';
			this.node.removeAttribute( 'value' );
		} else {
			const value = this.getValue();

			this.node._ractive.value = value;

			this.node.value = safeToStringValue( value );
			this.node.setAttribute( 'value', safeToStringValue( value ) );
		}
	}
}

function updateRadioName ( reset ) {
	if ( reset ) this.node.checked = false;
	else this.node.checked = this.element.compare( this.getValue(), this.element.binding.getValue() );
}

function updateCheckboxName ( reset ) {
	const { element, node } = this;
	const binding = element.binding;

	const value = this.getValue();
	const valueAttribute = element.getAttribute( 'value' );

	if ( reset ) {
		// TODO: WAT?
	}

	if ( !Array.isArray( value ) ) {
		binding.isChecked = node.checked = element.compare( value, valueAttribute );
	} else {
		let i = value.length;
		while ( i-- ) {
			if ( element.compare ( valueAttribute, value[i] ) ) {
				binding.isChecked = node.checked = true;
				return;
			}
		}
		binding.isChecked = node.checked = false;
	}
}

function updateStyleAttribute ( reset ) {
	const props = reset ? {} : readStyle( this.getValue() || '' );
	const style = this.node.style;
	const keys = Object.keys( props );
	const prev = this.previous || [];

	let i = 0;
	while ( i < keys.length ) {
		if ( keys[i] in style ) {
			const safe = props[ keys[i] ].replace( '!important', '' );
			style.setProperty( keys[i], safe, safe.length !== props[ keys[i] ].length ? 'important' : '' );
		}
		i++;
	}

	// remove now-missing attrs
	i = prev.length;
	while ( i-- ) {
		if ( !~keys.indexOf( prev[i] ) && prev[i] in style ) style.setProperty( prev[i], '', '' );
	}

	this.previous = keys;
}

function updateInlineStyle ( reset ) {
	if ( !this.style ) {
		this.style = hyphenateCamel( this.name.substr( 6 ) );
	}

	if ( reset && this.node.style.getPropertyValue( this.style ) !== this.last ) return;

	const value = reset ? '' : safeToStringValue( this.getValue() );
	const safe = value.replace( '!important', '' );
	this.node.style.setProperty( this.style, safe, safe.length !== value.length ? 'important' : '' );
	this.last = safe;
}

function updateClassName ( reset ) {
	const value = reset ? [] : readClass( safeToStringValue( this.getValue() ) );

	// watch out for werdo svg elements
	let cls = this.node.className;
	cls = cls.baseVal !== undefined ? cls.baseVal : cls;

	const attr = readClass( cls );
	const prev = this.previous || attr.slice( 0 );

	const className = value.concat( attr.filter( c => !~prev.indexOf( c ) ) ).join( ' ' );

	if ( className !== cls ) {
		if ( typeof this.node.className !== 'string' ) {
			this.node.className.baseVal = className;
		} else {
			this.node.className = className;
		}
	}

	this.previous = value;
}

function updateInlineClass ( reset ) {
	const name = this.name.substr( 6 );

	// watch out for werdo svg elements
	let cls = this.node.className;
	cls = cls.baseVal !== undefined ? cls.baseVal : cls;

	const attr = readClass( cls );
	const value = reset ? false : this.getValue();

	if ( !this.inlineClass ) this.inlineClass = name;

	if ( value && !~attr.indexOf( name ) ) attr.push( name );
	else if ( !value && ~attr.indexOf( name ) ) attr.splice( attr.indexOf( name ), 1 );

	if ( typeof this.node.className !== 'string' ) {
		this.node.className.baseVal = attr.join( ' ' );
	} else {
		this.node.className = attr.join( ' ' );
	}
}

function updateBoolean ( reset ) {
	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		if ( reset ) {
			if ( this.useProperty ) this.node[ this.propertyName ] = false;
			this.node.removeAttribute( this.propertyName );
		} else {
			if ( this.useProperty ) {
				this.node[ this.propertyName ] = this.getValue();
			} else {
				const val = this.getValue();
				if ( val ) {
					this.node.setAttribute( this.propertyName, typeof val === 'string' ? val : '' );
				} else {
					this.node.removeAttribute( this.propertyName );
				}
			}
		}
	}
}

function updateAttribute ( reset ) {
	if ( reset ) {
		if ( this.node.getAttribute( this.name ) === this.value ) {
			this.node.removeAttribute( this.name );
		}
	} else {
		this.value = safeToStringValue( this.getString() );
		this.node.setAttribute( this.name, this.value );
	}
}

function updateNamespacedAttribute ( reset ) {
	if ( reset ) {
		if ( this.value === this.node.getAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ) ) ) {
			this.node.removeAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ) );
		}
	} else {
		this.value = safeToStringValue( this.getString() );
		this.node.setAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ), this.value );
	}
}

var propertyNames = {
	'accept-charset': 'acceptCharset',
	accesskey: 'accessKey',
	bgcolor: 'bgColor',
	class: 'className',
	codebase: 'codeBase',
	colspan: 'colSpan',
	contenteditable: 'contentEditable',
	datetime: 'dateTime',
	dirname: 'dirName',
	for: 'htmlFor',
	'http-equiv': 'httpEquiv',
	ismap: 'isMap',
	maxlength: 'maxLength',
	novalidate: 'noValidate',
	pubdate: 'pubDate',
	readonly: 'readOnly',
	rowspan: 'rowSpan',
	tabindex: 'tabIndex',
	usemap: 'useMap'
};

const div$1 = doc ? createElement( 'div' ) : null;

let attributes = false;
function inAttributes() { return attributes; }
function doInAttributes( fn ) {
	attributes = true;
	fn();
	attributes = false;
}

class ConditionalAttribute extends Item {
	constructor ( options ) {
		super( options );

		this.attributes = [];

		this.owner = options.owner;

		this.fragment = new Fragment({
			ractive: this.ractive,
			owner: this,
			template: this.template
		});
		// this fragment can't participate in node-y things
		this.fragment.findNextNode = noop;

		this.dirty = false;
	}

	bind () {
		this.fragment.bind();
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	destroyed () {
		this.unrender();
	}

	render () {
		this.node = this.owner.node;
		if ( this.node ) {
			this.isSvg = this.node.namespaceURI === svg$1;
		}

		attributes = true;
		if ( !this.rendered ) this.fragment.render();

		this.rendered = true;
		this.dirty = true; // TODO this seems hacky, but necessary for tests to pass in browser AND node.js
		this.update();
		attributes = false;
	}

	toString () {
		return this.fragment.toString();
	}

	unbind () {
		this.fragment.unbind();
	}

	unrender () {
		this.rendered = false;
		this.fragment.unrender();
	}

	update () {
		let str;
		let attrs;

		if ( this.dirty ) {
			this.dirty = false;

			const current = attributes;
			attributes = true;
			this.fragment.update();

			if ( this.rendered && this.node ) {
				str = this.fragment.toString();

				attrs = parseAttributes( str, this.isSvg );

				// any attributes that previously existed but no longer do
				// must be removed
				this.attributes.filter( a => notIn( attrs, a ) ).forEach( a => {
					this.node.removeAttribute( a.name );
				});

				attrs.forEach( a => {
					this.node.setAttribute( a.name, a.value );
				});

				this.attributes = attrs;
			}

			attributes = current || false;
		}
	}
}

const onlyWhitespace = /^\s*$/;
function parseAttributes ( str, isSvg ) {
	if ( onlyWhitespace.test( str ) ) return [];
	const tagName = isSvg ? 'svg' : 'div';
	return str
		? (div$1.innerHTML = `<${tagName} ${str}></${tagName}>`) &&
			toArray(div$1.childNodes[0].attributes)
		: [];
}

function notIn ( haystack, needle ) {
	let i = haystack.length;

	while ( i-- ) {
		if ( haystack[i].name === needle.name ) {
			return false;
		}
	}

	return true;
}

function lookupNamespace ( node, prefix ) {
	const qualified = `xmlns:${prefix}`;

	while ( node ) {
		if ( node.hasAttribute && node.hasAttribute( qualified ) ) return node.getAttribute( qualified );
		node = node.parentNode;
	}

	return namespaces[ prefix ];
}

let attribute = false;
function inAttribute () { return attribute; }

class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;
		this.namespace = null;

		this.owner = options.owner || options.parentFragment.owner || options.element || findElement( options.parentFragment );
		this.element = options.element || (this.owner.attributeByName ? this.owner : findElement( options.parentFragment ) );
		this.parentFragment = options.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.rendered = false;
		this.updateDelegate = null;
		this.fragment = null;

		this.element.attributeByName[ this.name ] = this;

		if ( !Array.isArray( options.template.f ) ) {
			this.value = options.template.f;
			if ( this.value === 0 ) {
				this.value = '';
			} else if ( this.value === undefined ) {
				this.value = true;
			}
		} else {
			this.fragment = new Fragment({
				owner: this,
				template: options.template.f
			});
		}

		this.interpolator = this.fragment &&
			this.fragment.items.length === 1 &&
			this.fragment.items[0].type === INTERPOLATOR &&
			this.fragment.items[0];

		if ( this.interpolator ) this.interpolator.owner = this;
	}

	bind () {
		if ( this.fragment ) {
			this.fragment.bind();
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.parentFragment.bubble();
			this.element.bubble();
			this.dirty = true;
		}
	}

	firstNode () {}

	getString () {
		attribute = true;
		const value = this.fragment ?
			this.fragment.toString() :
			this.value != null ? '' + this.value : '';
		attribute = false;
		return value;
	}

	// TODO could getValue ever be called for a static attribute,
	// or can we assume that this.fragment exists?
	getValue () {
		attribute = true;
		const value = this.fragment ? this.fragment.valueOf() : booleanAttributes.test( this.name ) ? true : this.value;
		attribute = false;
		return value;
	}

	render () {
		const node = this.element.node;
		this.node = node;

		// should we use direct property access, or setAttribute?
		if ( !node.namespaceURI || node.namespaceURI === namespaces.html ) {
			this.propertyName = propertyNames[ this.name ] || this.name;

			if ( node[ this.propertyName ] !== undefined ) {
				this.useProperty = true;
			}

			// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( booleanAttributes.test( this.name ) || this.isTwoway ) {
				this.isBoolean = true;
			}

			if ( this.propertyName === 'value' ) {
				node._ractive.value = this.value;
			}
		}

		if ( node.namespaceURI ) {
			const index = this.name.indexOf( ':' );
			if ( index !== -1 ) {
				this.namespace = lookupNamespace( node, this.name.slice( 0, index ) );
			} else {
				this.namespace = node.namespaceURI;
			}
		}

		this.rendered = true;
		this.updateDelegate = getUpdateDelegate( this );
		this.updateDelegate();
	}

	toString () {
		if ( inAttributes() ) return '';
		attribute = true;

		const value = this.getValue();

		// Special case - select and textarea values (should not be stringified)
		if ( this.name === 'value' && ( this.element.getAttribute( 'contenteditable' ) !== undefined || ( this.element.name === 'select' || this.element.name === 'textarea' ) ) ) {
			return;
		}

		// Special case – bound radio `name` attributes
		if ( this.name === 'name' && this.element.name === 'input' && this.interpolator && this.element.getAttribute( 'type' ) === 'radio' ) {
			return `name="{{${this.interpolator.model.getKeypath()}}}"`;
		}

		// Special case - style and class attributes and directives
		if ( this.owner === this.element && ( this.name === 'style' || this.name === 'class' || this.style || this.inlineClass ) ) {
			return;
		}

		if ( !this.rendered && this.owner === this.element && ( !this.name.indexOf( 'style-' ) || !this.name.indexOf( 'class-' ) ) ) {
			if ( !this.name.indexOf( 'style-' ) ) {
				this.style = hyphenateCamel( this.name.substr( 6 ) );
			} else {
				this.inlineClass = this.name.substr( 6 );
			}

			return;
		}

		if ( booleanAttributes.test( this.name ) ) return value ? ( typeof value === 'string' ? `${this.name}="${safeAttributeString(value)}"` : this.name ) : '';
		if ( value == null ) return '';

		const str = safeAttributeString( this.getString() );
		attribute = false;

		return str ?
			`${this.name}="${str}"` :
			this.name;
	}

	unbind () {
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender () {
		this.updateDelegate( true );

		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.fragment ) this.fragment.update();
			if ( this.rendered ) this.updateDelegate();
			if ( this.isTwoway && !this.locked ) {
				this.interpolator.twowayBinding.lastVal( true, this.interpolator.model.get() );
			}
		}
	}
}

class BindingFlag extends Item {
	constructor ( options ) {
		super( options );

		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.flag = options.template.v === 'l' ? 'lazy' : 'twoway';

		if ( this.element.type === ELEMENT ) {
			if ( Array.isArray( options.template.f ) ) {
				this.fragment = new Fragment({
					owner: this,
					template: options.template.f
				});
			}

			this.interpolator = this.fragment &&
								this.fragment.items.length === 1 &&
								this.fragment.items[0].type === INTERPOLATOR &&
								this.fragment.items[0];
		}
	}

	bind () {
		if ( this.fragment ) this.fragment.bind();
		set$1( this, this.getValue(), true );
	}

	bubble () {
		if ( !this.dirty ) {
			this.element.bubble();
			this.dirty = true;
		}
	}

	getValue () {
		if ( this.fragment ) return this.fragment.valueOf();
		else if ( 'value' in this ) return this.value;
		else if ( 'f' in this.template ) return this.template.f;
		else return true;
	}

	render () {
		set$1( this, this.getValue(), true );
	}

	toString () { return ''; }

	unbind () {
		if ( this.fragment ) this.fragment.unbind();

		delete this.element[ this.flag ];
	}

	unrender () {
		if ( this.element.rendered ) this.element.recreateTwowayBinding();
	}

	update () {
		if ( this.dirty ) {
			if ( this.fragment ) this.fragment.update();
			set$1( this, this.getValue(), true );
		}
	}
}

function set$1 ( flag, value, update ) {
	if ( value === 0 ) {
		flag.value = true;
	} else if ( value === 'true' ) {
		flag.value = true;
	} else if ( value === 'false' || value === '0' ) {
		flag.value = false;
	} else {
		flag.value = value;
	}

	const current = flag.element[ flag.flag ];
	flag.element[ flag.flag ] = flag.value;
	if ( update && !flag.element.attributes.binding && current !== flag.value ) {
		flag.element.recreateTwowayBinding();
	}

	return flag.value;
}

const teardownHook = new Hook( 'teardown' );
const destructHook = new Hook( 'destruct' );

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

function Ractive$teardown () {
	if ( this.torndown ) {
		warnIfDebug( 'ractive.teardown() was called on a Ractive instance that was already torn down' );
		return Promise.resolve();
	}

	this.shouldDestroy = true;
	return teardown$1( this, () => this.fragment.rendered ? this.unrender() : Promise.resolve() );
}

function teardown$1 ( instance, getPromise ) {
	instance.torndown = true;
	instance.viewmodel.teardown();
	instance.fragment.unbind();
	instance._observers.slice().forEach( cancel );

	if ( instance.el && instance.el.__ractive_instances__ ) {
		removeFromArray( instance.el.__ractive_instances__, instance );
	}

	const promise = getPromise();

	teardownHook.fire( instance );
	promise.then( () => destructHook.fire( instance ) );

	return promise;
}

class RactiveModel extends SharedModel {
	constructor ( ractive ) {
		super( ractive, '@this' );
		this.ractive = ractive;
	}

	joinKey ( key ) {
		const model = super.joinKey( key );

		if ( ( key === 'root' || key === 'parent' ) && !model.isLink ) return initLink( model, key );
		else if ( key === 'data' ) return this.ractive.viewmodel;
		else if ( key === 'cssData' ) return this.ractive.constructor._cssModel;

		return model;
	}
}

function initLink ( model, key ) {
	model.applyValue = function ( value ) {
		this.parent.value[ key ] = value;
		if ( value && value.viewmodel ) {
			this.link( value.viewmodel.getRactiveModel(), key );
			this._link.markedAll();
		} else {
			this.link( Object.create( Missing ), key );
			this._link.markedAll();
		}
	};

	model.applyValue( model.parent.ractive[ key ], key );
	model._link.set = v => model.applyValue( v );
	model._link.applyValue = v => model.applyValue( v );
	return model._link;
}

const hasProp$1 = Object.prototype.hasOwnProperty;

class RootModel extends Model {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();

		this.computationContext = options.ractive;
		this.computations = {};
	}

	attached ( fragment ) {
		attachImplicits( this, fragment );
	}

	compute ( key, signature ) {
		const computation = new Computation( this, signature, key );
		this.computations[ escapeKey( key ) ] = computation;

		return computation;
	}

	createLink ( keypath, target, targetPath, options ) {
		const keys = splitKeypath( keypath );

		let model = this;
		while ( keys.length ) {
			const key = keys.shift();
			model = model.childByKey[ key ] || model.joinKey( key );
		}

		return model.link( target, targetPath, options );
	}

	detached () {
		detachImplicits( this );
	}

	get ( shouldCapture, options ) {
		if ( shouldCapture ) capture( this );

		if ( !options || options.virtual !== false ) {
			const result = this.getVirtual();
			const keys = Object.keys( this.computations );
			let i = keys.length;
			while ( i-- ) {
				result[ keys[i] ] = this.computations[ keys[i] ].get();
			}

			return result;
		} else {
			return this.value;
		}
	}

	getKeypath () {
		return '';
	}

	getRactiveModel() {
		return this.ractiveModel || ( this.ractiveModel = new RactiveModel( this.ractive ) );
	}

	getValueChildren () {
		const children = super.getValueChildren( this.value );

		this.children.forEach( child => {
			if ( child._link ) {
				const idx = children.indexOf( child );
				if ( ~idx ) children.splice( idx, 1, child._link );
				else children.push( child._link );
			}
		});

		for ( const k in this.computations ) {
			children.push( this.computations[k] );
		}

		return children;
	}

	has ( key ) {
		const value = this.value;
		let unescapedKey = unescapeKey( key );

		if ( unescapedKey === '@this' || unescapedKey === '@global' || unescapedKey === '@shared' || unescapedKey === '@style' ) return true;
		if ( unescapedKey[0] === '~' && unescapedKey[1] === '/' ) unescapedKey = unescapedKey.slice( 2 );
		if ( key === '' || hasProp$1.call( value, unescapedKey ) ) return true;

		// mappings/links and computations
		if ( key in this.computations || this.childByKey[unescapedKey] && this.childByKey[unescapedKey]._link ) return true;

		// We climb up the constructor chain to find if one of them contains the unescapedKey
		let constructor = value.constructor;
		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
			if ( hasProp$1.call( constructor.prototype, unescapedKey ) ) return true;
			constructor = constructor.constructor;
		}

		return false;
	}

	joinKey ( key, opts ) {
		if ( key[0] === '@' ) {
			if ( key === '@this' || key === '@' ) return this.getRactiveModel();
			if ( key === '@global' ) return GlobalModel;
			if ( key === '@shared' ) return SharedModel$1;
			if ( key === '@style' ) return this.getRactiveModel().joinKey( 'cssData' );
			return;
		}

		if ( key[0] === '~' && key[1] === '/' ) key = key.slice( 2 );

		return this.computations.hasOwnProperty( key ) ? this.computations[ key ] :
		       super.joinKey( key, opts );
	}

	set ( value ) {
		// TODO wrapping root node is a baaaad idea. We should prevent this
		const wrapper = this.wrapper;
		if ( wrapper ) {
			const shouldTeardown = !wrapper.reset || wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				wrapper.teardown();
				this.wrapper = null;
				this.value = value;
				this.adapt();
			}
		} else {
			this.value = value;
			this.adapt();
		}

		this.deps.forEach( handleChange );
		this.children.forEach( mark );
	}

	retrieve () {
		return this.wrapper ? this.wrapper.get() : this.value;
	}

	teardown () {
		super.teardown();
		for ( const k in this.computations ) {
			this.computations[ k ].teardown();
		}
	}
}
RootModel.prototype.update = noop;

function attachImplicits ( model, fragment ) {
	if ( model._link && model._link.implicit && model._link.isDetached() ) {
		model.attach( fragment );
	}

	// look for virtual children to relink and cascade
	for ( const k in model.childByKey ) {
		if ( k in model.value ) {
			attachImplicits( model.childByKey[k], fragment );
		} else if ( !model.childByKey[k]._link || model.childByKey[k]._link.isDetached() ) {
			const mdl = resolveReference( fragment, k );
			if ( mdl ) {
				model.childByKey[k].link( mdl, k, { implicit: true } );
			}
		}
	}
}

function detachImplicits ( model ) {
	if ( model._link && model._link.implicit ) {
		model.unlink();
	}

	for ( const k in model.childByKey ) {
		detachImplicits( model.childByKey[k] );
	}
}

function getComputationSignature ( ractive, key, signature ) {
	let getter;
	let setter;

	// useful for debugging
	let getterString;
	let getterUseStack;
	let setterString;

	if ( typeof signature === 'function' ) {
		getter = bind$1( signature, ractive );
		getterString = signature.toString();
		getterUseStack = true;
	}

	if ( typeof signature === 'string' ) {
		getter = createFunctionFromString( signature, ractive );
		getterString = signature;
	}

	if ( typeof signature === 'object' ) {
		if ( typeof signature.get === 'string' ) {
			getter = createFunctionFromString( signature.get, ractive );
			getterString = signature.get;
		} else if ( typeof signature.get === 'function' ) {
			getter = bind$1( signature.get, ractive );
			getterString = signature.get.toString();
			getterUseStack = true;
		} else {
			fatal( '`%s` computation must have a `get()` method', key );
		}

		if ( typeof signature.set === 'function' ) {
			setter = bind$1( signature.set, ractive );
			setterString = signature.set.toString();
		}
	}

	return {
		getter,
		setter,
		getterString,
		setterString,
		getterUseStack
	};
}

function fillGaps ( target, ...sources ) {
	for (let i = 0; i < sources.length; i++){
		const source = sources[i];
		for ( const key in source ) {
			// Source can be a prototype-less object.
			if ( key in target || !Object.prototype.hasOwnProperty.call( source, key ) ) continue;
			target[ key ] = source[ key ];
		}
	}

	return target;
}

function toPairs ( obj = {} ) {
	const pairs = [];
	for ( const key in obj ) {
		// Source can be a prototype-less object.
		if ( !Object.prototype.hasOwnProperty.call( obj, key ) ) continue;
		pairs.push( [ key, obj[ key ] ] );
	}
	return pairs;
}

function subscribe ( instance, options, type ) {
	const subs = ( instance.constructor[ `_${type}` ] || [] ).concat( toPairs( options[ type ] || [] ) );
	const single = type === 'on' ? 'once' : `${type}Once`;

	subs.forEach( ([ target, config ]) => {
		if ( typeof config === 'function' ) {
			instance[type]( target, config );
		} else if ( typeof config === 'object' && typeof config.handler === 'function' ) {
			instance[ config.once ? single : type ]( target, config.handler, Object.create( config ) );
		}
	});
}

const constructHook = new Hook( 'construct' );

const registryNames$1 = [
	'adaptors',
	'components',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

let uid = 0;

function construct ( ractive, options ) {
	if ( Ractive.DEBUG ) welcome();

	initialiseProperties( ractive );
	handleAttributes( ractive );

	// set up event subscribers
	subscribe( ractive, options, 'on' );

	// if there's not a delegation setting, inherit from parent if it's not default
	if ( !options.hasOwnProperty( 'delegate' ) && ractive.parent && ractive.parent.delegate !== ractive.delegate ) {
		ractive.delegate = false;
	}

	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
	constructHook.fire( ractive, options );

	// Add registries
	let i = registryNames$1.length;
	while ( i-- ) {
		const name = registryNames$1[ i ];
		ractive[ name ] = Object.assign( Object.create( ractive.constructor[ name ] || null ), options[ name ] );
	}

	if ( ractive._attributePartial ) {
		ractive.partials['extra-attributes'] = ractive._attributePartial;
		delete ractive._attributePartial;
	}

	// Create a viewmodel
	const viewmodel = new RootModel({
		adapt: getAdaptors( ractive, ractive.adapt, options ),
		data: dataConfigurator.init( ractive.constructor, ractive, options ),
		ractive
	});

	ractive.viewmodel = viewmodel;

	// Add computed properties
	const computed = Object.assign( Object.create( ractive.constructor.prototype.computed ), options.computed );

	for ( const key in computed ) {
		if ( key === '__proto__' ) continue;
		const signature = getComputationSignature( ractive, key, computed[ key ] );
		viewmodel.compute( key, signature );
	}
}

function getAdaptors ( ractive, protoAdapt, options ) {
	protoAdapt = protoAdapt.map( lookup );
	const adapt = ensureArray( options.adapt ).map( lookup );

	const srcs = [ protoAdapt, adapt ];
	if ( ractive.parent && !ractive.isolated ) {
		srcs.push( ractive.parent.viewmodel.adaptors );
	}

	return combine.apply( null, srcs );

	function lookup ( adaptor ) {
		if ( typeof adaptor === 'string' ) {
			adaptor = findInViewHierarchy( 'adaptors', ractive, adaptor );

			if ( !adaptor ) {
				fatal( missingPlugin( adaptor, 'adaptor' ) );
			}
		}

		return adaptor;
	}
}

function initialiseProperties ( ractive ) {
	// Generate a unique identifier, for places where you'd use a weak map if it
	// existed
	ractive._guid = 'r-' + uid++;

	// events
	ractive._subs = Object.create( null );
	ractive._nsSubs = 0;

	// storage for item configuration from instantiation to reset,
	// like dynamic functions or original values
	ractive._config = {};

	// events
	ractive.event = null;
	ractive._eventQueue = [];

	// observers
	ractive._observers = [];

	// external children
	ractive._children = [];
	ractive._children.byName = {};
	ractive.children = ractive._children;

	if ( !ractive.component ) {
		ractive.root = ractive;
		ractive.parent = ractive.container = null; // TODO container still applicable?
	}
}

function handleAttributes ( ractive ) {
	const component = ractive.component;
	const attributes = ractive.constructor.attributes;

	if ( attributes && component ) {
		const tpl = component.template;
		const attrs = tpl.m ? tpl.m.slice() : [];

		// grab all of the passed attribute names
		const props = attrs.filter( a => a.t === ATTRIBUTE ).map( a => a.n );

		// warn about missing requireds
		attributes.required.forEach( p => {
			if ( !~props.indexOf( p ) ) {
				warnIfDebug( `Component '${component.name}' requires attribute '${p}' to be provided` );
			}
		});

		// set up a partial containing non-property attributes
		const all = attributes.optional.concat( attributes.required );
		const partial = [];
		let i = attrs.length;
		while ( i-- ) {
			const a = attrs[i];
			if ( a.t === ATTRIBUTE && !~all.indexOf( a.n ) ) {
				if ( attributes.mapAll ) {
					// map the attribute if requested and make the extra attribute in the partial refer to the mapping
					partial.unshift({ t: ATTRIBUTE, n: a.n, f: [{ t: INTERPOLATOR, r: `~/${a.n}` }] });
				} else {
					// transfer the attribute to the extra attributes partal
					partial.unshift( attrs.splice( i, 1 )[0] );
				}
			}
		}

		if ( partial.length ) component.template = { t: tpl.t, e: tpl.e, f: tpl.f, m: attrs, p: tpl.p };
		ractive._attributePartial = partial;
	}
}

class Component extends Item {
	constructor ( options, ComponentConstructor ) {
		super( options );
		let template = options.template;
		this.isAnchor = template.t === ANCHOR;
		this.type = this.isAnchor ? ANCHOR : COMPONENT; // override ELEMENT from super
		let attrs = template.m;

		const partials = template.p || {};
		if ( !( 'content' in partials ) ) partials.content = template.f || [];
		this._partials = partials; // TEMP

		if ( this.isAnchor ) {
			this.name = template.n;

			this.addChild = addChild;
			this.removeChild = removeChild;
		} else {
			const instance = Object.create( ComponentConstructor.prototype );

			this.instance = instance;
			this.name = template.e;

			if ( instance.el ) {
				warnIfDebug( `The <${this.name}> component has a default 'el' property; it has been disregarded` );
			}

			// find container
			let fragment = options.parentFragment;
			let container;
			while ( fragment ) {
				if ( fragment.owner.type === YIELDER ) {
					container = fragment.owner.container;
					break;
				}

				fragment = fragment.parent;
			}

			// add component-instance-specific properties
			instance.parent = this.parentFragment.ractive;
			instance.container = container || null;
			instance.root = instance.parent.root;
			instance.component = this;

			construct( this.instance, { partials });

			// these can be modified during construction
			template = this.template;
			attrs = template.m;

			// allow components that are so inclined to add programmatic mappings
			if ( Array.isArray( this.mappings ) ) {
				attrs = ( attrs || [] ).concat( this.mappings );
			} else if ( typeof this.mappings === 'string' ) {
				attrs = ( attrs || [] ).concat( parser.parse( this.mappings, { attributes: true } ).t );
			}

			// for hackability, this could be an open option
			// for any ractive instance, but for now, just
			// for components and just for ractive...
			instance._inlinePartials = partials;
		}

		this.attributeByName = {};
		this.attributes = [];

		if (attrs) {
			const leftovers = [];
			attrs.forEach( template => {
				switch ( template.t ) {
					case ATTRIBUTE:
					case EVENT:
						this.attributes.push( createItem({
							owner: this,
							parentFragment: this.parentFragment,
							template
						}) );
						break;

					case TRANSITION:
					case BINDING_FLAG:
					case DECORATOR:
						break;

					default:
						leftovers.push( template );
						break;
				}
			});

			if ( leftovers.length ) {
				this.attributes.push( new ConditionalAttribute({
					owner: this,
					parentFragment: this.parentFragment,
					template: leftovers
				}) );
			}
		}

		this.eventHandlers = [];
	}

	bind () {
		if ( !this.isAnchor ) {
			this.attributes.forEach( bind );

			initialise( this.instance, {
				partials: this._partials
			}, {
				cssIds: this.parentFragment.cssIds
			});

			this.eventHandlers.forEach( bind );

			this.bound = true;
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	destroyed () {
		if ( !this.isAnchor && this.instance.fragment ) this.instance.fragment.destroyed();
	}

	detach () {
		if ( this.isAnchor ) {
			if ( this.instance ) return this.instance.fragment.detach();
			return createDocumentFragment();
		}

		return this.instance.fragment.detach();
	}

	find ( selector, options ) {
		if ( this.instance ) return this.instance.fragment.find( selector, options );
	}

	findAll ( selector, options ) {
		if ( this.instance ) this.instance.fragment.findAll( selector, options );
	}

	findComponent ( name, options ) {
		if ( !name || this.name === name ) return this.instance;

		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( name, options );
		}
	}

	findAllComponents ( name, options ) {
		const { result } = options;

		if ( this.instance && ( !name || this.name === name ) ) {
			result.push( this.instance );
		}

		if ( this.instance ) this.instance.findAllComponents( name, options );
	}

	firstNode ( skipParent ) {
		if ( this.instance ) return this.instance.fragment.firstNode( skipParent );
	}

	getContext ( ...assigns ) {
		assigns.unshift( this.instance );
		return getRactiveContext.apply( null, assigns );
	}

	render ( target, occupants ) {
		if ( this.isAnchor ) {
			this.rendered = true;
			this.target = target;

			if ( !checking.length ) {
				checking.push( this.ractive );
				if ( occupants ) {
					this.occupants = occupants;
					checkAnchors();
					this.occupants = null;
				} else {
					runloop.scheduleTask( checkAnchors, true );
				}
			}
		} else {
			render$1( this.instance, target, null, occupants );

			this.attributes.forEach( render );
			this.eventHandlers.forEach( render );

			this.rendered = true;
		}
	}

	toString () {
		if ( this.instance ) return this.instance.toHTML();
	}

	unbind () {
		if ( !this.isAnchor ) {
			this.bound = false;

			this.attributes.forEach( unbind );

			teardown$1( this.instance, () => runloop.promise() );
		}
	}

	unrender ( shouldDestroy ) {
		this.shouldDestroy = shouldDestroy;

		if ( this.isAnchor ) {
			if ( this.item ) unrenderItem( this, this.item );
			this.target = null;
			if ( !checking.length ) {
				checking.push( this.ractive );
				runloop.scheduleTask( checkAnchors, true );
			}
		} else {
			this.instance.unrender();
			this.instance.el = this.instance.target = null;
			this.attributes.forEach( unrender );
			this.eventHandlers.forEach( unrender );
		}

		this.rendered = false;
	}

	update () {
		this.dirty = false;
		if ( this.instance ) {
			this.instance.fragment.update();
			this.attributes.forEach( update );
			this.eventHandlers.forEach( update );
		}
	}
}

function addChild ( meta ) {
	if ( this.item ) this.removeChild( this.item );

	const child = meta.instance;
	meta.anchor = this;

	meta.parentFragment = this.parentFragment;
	meta.name = meta.nameOption || this.name;
	this.name = meta.name;


	if ( !child.isolated ) child.viewmodel.attached( this.parentFragment );

	// render as necessary
	if ( this.rendered ) {
		renderItem( this, meta );
	}
}

function removeChild ( meta ) {
	// unrender as necessary
	if ( this.item === meta ) {
		unrenderItem( this, meta );
		this.name = this.template.n;
	}
}

function renderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	meta.shouldDestroy = false;
	meta.parentFragment = anchor.parentFragment;

	anchor.item = meta;
	anchor.instance = meta.instance;
	const nextNode = anchor.parentFragment.findNextNode( anchor );

	if ( meta.instance.fragment.rendered ) {
		meta.instance.unrender();
	}

	meta.partials = meta.instance.partials;
	meta.instance.partials = Object.assign( Object.create( meta.partials ), meta.partials, anchor._partials );

	meta.instance.fragment.unbind();
	meta.instance.fragment.componentParent = anchor.parentFragment;
	meta.instance.fragment.bind( meta.instance.viewmodel );

	anchor.attributes.forEach( bind );
	anchor.eventHandlers.forEach( bind );
	anchor.attributes.forEach( render );
	anchor.eventHandlers.forEach( render );

	const target = anchor.parentFragment.findParentNode();
	render$1( meta.instance, target, target.contains( nextNode ) ? nextNode : null, anchor.occupants );

	if ( meta.lastBound !== anchor ) {
		meta.lastBound = anchor;
	}
}

function unrenderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	meta.shouldDestroy = true;
	meta.instance.unrender();

	anchor.eventHandlers.forEach( unrender );
	anchor.attributes.forEach( unrender );
	anchor.eventHandlers.forEach( unbind );
	anchor.attributes.forEach( unbind );

	meta.instance.el = meta.instance.anchor = null;
	meta.instance.fragment.componentParent = null;
	meta.parentFragment = null;
	meta.anchor = null;
	anchor.item = null;
	anchor.instance = null;
}

let checking = [];
function checkAnchors () {
	const list = checking;
	checking = [];

	list.forEach( updateAnchors );
}

function setupArgsFn ( item, template, fragment, opts = {} ) {
	if ( template && template.f && template.f.s ) {
		item.fn = getFunction( template.f.s, template.f.r.length );
		if ( opts.register === true ) {
			item.models = resolveArgs( item, template, fragment, opts );
		}
	}
}

function resolveArgs ( item, template, fragment, opts = {} ) {
	return template.f.r.map( ( ref, i ) => {
		let model;

		if ( opts.specialRef && ( model = opts.specialRef( ref, i ) ) ) return model;

		model = resolveReference( fragment, ref );
		if ( opts.register === true ) {
			model.register( item );
		}

		return model;
	});
}

function teardownArgsFn ( item, template ) {
	if ( template && template.f && template.f.s ) {
		if ( item.models ) item.models.forEach( m => {
			if ( m && m.unregister ) m.unregister( item );
		});
		item.models = null;
	}
}

const missingDecorator = {
	update: noop,
	teardown: noop
};

class Decorator {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.parentFragment = this.owner.parentFragment;
		this.ractive = this.owner.ractive;
		const template = this.template = options.template;

		this.name = template.n;

		this.node = null;
		this.handle = null;

		this.element.decorators.push( this );
	}

	bind () {
		setupArgsFn( this, this.template, this.parentFragment, { register: true } );
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	destroyed () {
		if ( this.handle ) {
			this.handle.teardown();
			this.handle = null;
		}
		this.shouldDestroy = true;
	}

	handleChange () { this.bubble(); }

	rebind ( next, previous, safe ) {
		const idx = this.models.indexOf( previous );
		if ( !~idx ) return;

		next = rebindMatch( this.template.f.r[ idx ], next, previous );
		if ( next === previous ) return;

		previous.unregister( this );
		this.models.splice( idx, 1, next );
		if ( next ) next.addShuffleRegister( this, 'mark' );

		if ( !safe ) this.bubble();
	}

	render () {
		this.shouldDestroy = false;
		if ( this.handle ) this.unrender();
		runloop.scheduleTask( () => {
			const fn = findInViewHierarchy( 'decorators', this.ractive, this.name );

			if ( !fn ) {
				warnOnce( missingPlugin( this.name, 'decorator' ) );
				this.handle = missingDecorator;
				return;
			}

			this.node = this.element.node;

			let args;
			if ( this.fn ) {
				args = this.models.map( model => {
					if ( !model ) return undefined;

					return model.get();
				});
				args = this.fn.apply( this.ractive, args );
			}

			this.handle = fn.apply( this.ractive, [ this.node ].concat( args ) );

			if ( !this.handle || !this.handle.teardown ) {
				throw new Error( `The '${this.name}' decorator must return an object with a teardown method` );
			}

			// watch out for decorators that cause their host element to be unrendered
			if ( this.shouldDestroy ) this.destroyed();
		}, true );
	}

	toString () { return ''; }

	unbind () {
		teardownArgsFn( this, this.template );
	}

	unrender ( shouldDestroy ) {
		if ( ( !shouldDestroy || this.element.rendered ) && this.handle ) {
			this.handle.teardown();
			this.handle = null;
		}
	}

	update () {
		const instance = this.handle;

		if ( !this.dirty ) {
			if ( instance && instance.invalidate ) {
				runloop.scheduleTask( () => instance.invalidate(), true );
			}
			return;
		}

		this.dirty = false;

		if ( instance ) {
			if ( !instance.update ) {
				this.unrender();
				this.render();
			}
			else {
				const args = this.models.map( model => model && model.get() );
				instance.update.apply( this.ractive, this.fn.apply( this.ractive, args ) );
			}
		}
	}
}

class Doctype extends Item {
	toString () {
		return '<!DOCTYPE' + this.template.a + '>';
	}
}

const proto$2 = Doctype.prototype;
proto$2.bind = proto$2.render = proto$2.teardown = proto$2.unbind = proto$2.unrender = proto$2.update = noop;

class Binding {
	constructor ( element, name = 'value' ) {
		this.element = element;
		this.ractive = element.ractive;
		this.attribute = element.attributeByName[ name ];

		const interpolator = this.attribute.interpolator;
		interpolator.twowayBinding = this;

		const model = interpolator.model;

		if ( model.isReadonly && !model.setRoot ) {
			const keypath = model.getKeypath().replace( /^@/, '' );
			warnOnceIfDebug( `Cannot use two-way binding on <${element.name}> element: ${keypath} is read-only. To suppress this warning use <${element.name} twoway='false'...>`, { ractive: this.ractive });
			return false;
		}

		this.attribute.isTwoway = true;
		this.model = model;

		// initialise value, if it's undefined
		let value = model.get();
		this.wasUndefined = value === undefined;

		if ( value === undefined && this.getInitialValue ) {
			value = this.getInitialValue();
			model.set( value );
		}
		this.lastVal( true, value );

		const parentForm = findElement( this.element, false, 'form' );
		if ( parentForm ) {
			this.resetValue = value;
			parentForm.formBindings.push( this );
		}
	}

	bind () {
		this.model.registerTwowayBinding( this );
	}

	handleChange () {
		const value = this.getValue();
		if ( this.lastVal() === value ) return;

		runloop.start();
		this.attribute.locked = true;
		this.model.set( value );
		this.lastVal( true, value );

		// if the value changes before observers fire, unlock to be updatable cause something weird and potentially freezy is up
		if ( this.model.get() !== value ) this.attribute.locked = false;
		else runloop.scheduleTask( () => this.attribute.locked = false );

		runloop.end();
	}

	lastVal ( setting, value ) {
		if ( setting ) this.lastValue = value;
		else return this.lastValue;
	}

	rebind ( next, previous ) {
		if ( this.model && this.model === previous ) previous.unregisterTwowayBinding( this );
		if ( next ) {
			this.model = next;
			runloop.scheduleTask( () => next.registerTwowayBinding( this ) );
		}
	}

	render () {
		this.node = this.element.node;
		this.node._ractive.binding = this;
		this.rendered = true; // TODO is this used anywhere?
	}

	setFromNode ( node ) {
		this.model.set( node.value );
	}

	unbind () {
		this.model.unregisterTwowayBinding( this );
	}
}

Binding.prototype.unrender = noop;

// This is the handler for DOM events that would lead to a change in the model
// (i.e. change, sometimes, input, and occasionally click and keyup)
function handleDomEvent () {
	this._ractive.binding.handleChange();
}

class CheckboxBinding extends Binding {
	constructor ( element ) {
		super( element, 'checked' );
	}

	render () {
		super.render();

		this.element.on( 'change', handleDomEvent );

		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
		this.element.off( 'click', handleDomEvent );
	}

	getInitialValue () {
		return !!this.element.getAttribute( 'checked' );
	}

	getValue () {
		return this.node.checked;
	}

	setFromNode ( node ) {
		this.model.set( node.checked );
	}
}

function getBindingGroup ( group, model, getValue ) {
	const hash = `${group}-bindingGroup`;
	return model[hash] || ( model[ hash ] = new BindingGroup( hash, model, getValue ) );
}

class BindingGroup {
	constructor ( hash, model, getValue ) {
		this.model = model;
		this.hash = hash;
		this.getValue = () => {
			this.value = getValue.call(this);
			return this.value;
		};

		this.bindings = [];
	}

	add ( binding ) {
		this.bindings.push( binding );
	}

	bind () {
		this.value = this.model.get();
		this.model.registerTwowayBinding( this );
		this.bound = true;
	}

	remove ( binding ) {
		removeFromArray( this.bindings, binding );
		if ( !this.bindings.length ) {
			this.unbind();
		}
	}

	unbind () {
		this.model.unregisterTwowayBinding( this );
		this.bound = false;
		delete this.model[this.hash];
	}
}

BindingGroup.prototype.rebind = Binding.prototype.rebind;

const push$1 = [].push;

function getValue() {
	const all = this.bindings.filter(b => b.node && b.node.checked).map(b => b.element.getAttribute( 'value' ));
	const res = [];
	all.forEach(v => { if ( !this.bindings[0].arrayContains( res, v ) ) res.push( v ); });
	return res;
}

class CheckboxNameBinding extends Binding {
	constructor ( element ) {
		super( element, 'name' );

		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this

		// Each input has a reference to an array containing it and its
		// group, as two-way binding depends on being able to ascertain
		// the status of all inputs within the group
		this.group = getBindingGroup( 'checkboxes', this.model, getValue );
		this.group.add( this );

		if ( this.noInitialValue ) {
			this.group.noInitialValue = true;
		}

		// If no initial value was set, and this input is checked, we
		// update the model
		if ( this.group.noInitialValue && this.element.getAttribute( 'checked' ) ) {
			const existingValue = this.model.get();
			const bindingValue = this.element.getAttribute( 'value' );

			if ( !this.arrayContains( existingValue, bindingValue ) ) {
				push$1.call( existingValue, bindingValue ); // to avoid triggering runloop with array adaptor
			}
		}
	}

	bind () {
		if ( !this.group.bound ) {
			this.group.bind();
		}
	}

	getInitialValue () {
		// This only gets called once per group (of inputs that
		// share a name), because it only gets called if there
		// isn't an initial value. By the same token, we can make
		// a note of that fact that there was no initial value,
		// and populate it using any `checked` attributes that
		// exist (which users should avoid, but which we should
		// support anyway to avoid breaking expectations)
		this.noInitialValue = true; // TODO are noInitialValue and wasUndefined the same thing?
		return [];
	}

	getValue () {
		return this.group.value;
	}

	handleChange () {
		this.isChecked = this.element.node.checked;
		this.group.value = this.model.get();
		const value = this.element.getAttribute( 'value' );
		if ( this.isChecked && !this.arrayContains( this.group.value, value ) ) {
			this.group.value.push( value );
		} else if ( !this.isChecked && this.arrayContains( this.group.value, value ) ) {
			this.removeFromArray( this.group.value, value );
		}
		// make sure super knows there's a change
		this.lastValue = null;
		super.handleChange();
	}

	render () {
		super.render();

		const node = this.node;

		const existingValue = this.model.get();
		const bindingValue = this.element.getAttribute( 'value' );

		if ( Array.isArray( existingValue ) ) {
			this.isChecked = this.arrayContains( existingValue, bindingValue );
		} else {
			this.isChecked = this.element.compare( existingValue, bindingValue );
		}
		node.name = '{{' + this.model.getKeypath() + '}}';
		node.checked = this.isChecked;

		this.element.on( 'change', handleDomEvent );

		// in case of IE emergency, bind to click event as well
		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	}

	setFromNode ( node ) {
		this.group.bindings.forEach( binding => binding.wasUndefined = true );

		if ( node.checked ) {
			const valueSoFar = this.group.getValue();
			valueSoFar.push( this.element.getAttribute( 'value' ) );

			this.group.model.set( valueSoFar );
		}
	}

	unbind () {
		this.group.remove( this );
	}

	unrender () {
		const el = this.element;

		el.off( 'change', handleDomEvent );
		el.off( 'click', handleDomEvent );
	}

	arrayContains ( selectValue, optionValue ) {
		let i = selectValue.length;
		while ( i-- ) {
			if ( this.element.compare( optionValue, selectValue[i] ) ) return true;
		}
		return false;
	}

	removeFromArray ( array, item ) {
		if (!array) return;
		let i = array.length;
		while( i-- ) {
			if ( this.element.compare( item, array[i] ) ) {
				array.splice( i, 1 );
			}
		}
	}
}

class ContentEditableBinding extends Binding {
	getInitialValue () {
		return this.element.fragment ? this.element.fragment.toString() : '';
	}

	getValue () {
		return this.element.node.innerHTML;
	}

	render () {
		super.render();

		const el = this.element;

		el.on( 'change', handleDomEvent );
		el.on( 'blur', handleDomEvent );

		if ( !this.ractive.lazy ) {
			el.on( 'input', handleDomEvent );

			if ( this.node.attachEvent ) {
				el.on( 'keyup', handleDomEvent );
			}
		}
	}

	setFromNode ( node ) {
		this.model.set( node.innerHTML );
	}

	unrender () {
		const el = this.element;

		el.off( 'blur', handleDomEvent );
		el.off( 'change', handleDomEvent );
		el.off( 'input', handleDomEvent );
		el.off( 'keyup', handleDomEvent );
	}
}

function handleBlur () {
	handleDomEvent.call( this );

	const value = this._ractive.binding.model.get();
	this.value = value == undefined ? '' : value;
}

function handleDelay ( delay ) {
	let timeout;

	return function () {
		if ( timeout ) clearTimeout( timeout );

		timeout = setTimeout( () => {
			const binding = this._ractive.binding;
			if ( binding.rendered ) handleDomEvent.call( this );
			timeout = null;
		}, delay );
	};
}

class GenericBinding extends Binding {
	getInitialValue () {
		return '';
	}

	getValue () {
		return this.node.value;
	}

	render () {
		super.render();

		// any lazy setting for this element overrides the root
		// if the value is a number, it's a timeout
		let lazy = this.ractive.lazy;
		let timeout = false;
		const el = this.element;

		if ( 'lazy' in this.element ) {
			lazy = this.element.lazy;
		}

		if ( isNumeric( lazy ) ) {
			timeout = +lazy;
			lazy = false;
		}

		this.handler = timeout ? handleDelay( timeout ) : handleDomEvent;

		const node = this.node;

		el.on( 'change', handleDomEvent );

		if ( node.type !== 'file' ) {
			if ( !lazy ) {
				el.on( 'input', this.handler );

				// IE is a special snowflake
				if ( node.attachEvent ) {
					el.on( 'keyup', this.handler );
				}
			}

			el.on( 'blur', handleBlur );
		}
	}

	unrender () {
		const el = this.element;
		this.rendered = false;

		el.off( 'change', handleDomEvent );
		el.off( 'input', this.handler );
		el.off( 'keyup', this.handler );
		el.off( 'blur', handleBlur );
	}
}

class FileBinding extends GenericBinding {
	getInitialValue () {
		/* istanbul ignore next */
		return undefined;
	}

	getValue () {
		/* istanbul ignore next */
		return this.node.files;
	}

	render () {
		/* istanbul ignore next */
		this.element.lazy = false;
		/* istanbul ignore next */
		super.render();
	}

	setFromNode( node ) {
		/* istanbul ignore next */
		this.model.set( node.files );
	}
}

function getSelectedOptions ( select ) {
	/* istanbul ignore next */
	return select.selectedOptions
		? toArray( select.selectedOptions )
		: select.options
			? toArray( select.options ).filter( option => option.selected )
			: [];
}

class MultipleSelectBinding extends Binding {
	getInitialValue () {
		return this.element.options
			.filter( option => option.getAttribute( 'selected' ) )
			.map( option => option.getAttribute( 'value' ) );
	}

	getValue () {
		const options = this.element.node.options;
		const len = options.length;

		const selectedValues = [];

		for ( let i = 0; i < len; i += 1 ) {
			const option = options[i];

			if ( option.selected ) {
				const optionValue = option._ractive ? option._ractive.value : option.value;
				selectedValues.push( optionValue );
			}
		}

		return selectedValues;
	}

	handleChange () {
		const attribute = this.attribute;
		const previousValue = attribute.getValue();

		const value = this.getValue();

		if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
			super.handleChange();
		}

		return this;
	}

	render () {
		super.render();

		this.element.on( 'change', handleDomEvent );

		if ( this.model.get() === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}
	}

	setFromNode ( node ) {
		const selectedOptions = getSelectedOptions( node );
		let i = selectedOptions.length;
		const result = new Array( i );

		while ( i-- ) {
			const option = selectedOptions[i];
			result[i] = option._ractive ? option._ractive.value : option.value;
		}

		this.model.set( result );
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
	}
}

class NumericBinding extends GenericBinding {
	getInitialValue () {
		return undefined;
	}

	getValue () {
		const value = parseFloat( this.node.value );
		return isNaN( value ) ? undefined : value;
	}

	setFromNode( node ) {
		const value = parseFloat( node.value );
		if ( !isNaN( value ) ) this.model.set( value );
	}
}

const siblings = {};

function getSiblings ( hash ) {
	return siblings[ hash ] || ( siblings[ hash ] = [] );
}

class RadioBinding extends Binding {
	constructor ( element ) {
		super( element, 'checked' );

		this.siblings = getSiblings( this.ractive._guid + this.element.getAttribute( 'name' ) );
		this.siblings.push( this );
	}

	getValue () {
		return this.node.checked;
	}

	handleChange () {
		runloop.start();

		this.siblings.forEach( binding => {
			binding.model.set( binding.getValue() );
		});

		runloop.end();
	}

	render () {
		super.render();

		this.element.on( 'change', handleDomEvent );

		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	}

	setFromNode ( node ) {
		this.model.set( node.checked );
	}

	unbind () {
		removeFromArray( this.siblings, this );
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
		this.element.off( 'click', handleDomEvent );
	}
}

function getValue$1() {
	const checked = this.bindings.filter( b => b.node.checked );
	if ( checked.length > 0 ) {
		return checked[0].element.getAttribute( 'value' );
	}
}

class RadioNameBinding extends Binding {
	constructor ( element ) {
		super( element, 'name' );

		this.group = getBindingGroup( 'radioname', this.model, getValue$1 );
		this.group.add( this );

		if ( element.checked ) {
			this.group.value = this.getValue();
		}
	}

	bind () {
		if ( !this.group.bound ) {
			this.group.bind();
		}

		// update name keypath when necessary
		this.nameAttributeBinding = {
			handleChange: () => this.node.name = `{{${this.model.getKeypath()}}}`,
			rebind: noop
		};

		this.model.getKeypathModel().register( this.nameAttributeBinding );
	}

	getInitialValue () {
		if ( this.element.getAttribute( 'checked' ) ) {
			return this.element.getAttribute( 'value' );
		}
	}

	getValue () {
		return this.element.getAttribute( 'value' );
	}

	handleChange () {
		// If this <input> is the one that's checked, then the value of its
		// `name` model gets set to its value
		if ( this.node.checked ) {
			this.group.value = this.getValue();
			super.handleChange();
		}
	}

	lastVal ( setting, value ) {
		if ( !this.group ) return;
		if ( setting ) this.group.lastValue = value;
		else return this.group.lastValue;
	}

	render () {
		super.render();

		const node = this.node;

		node.name = `{{${this.model.getKeypath()}}}`;
		node.checked = this.element.compare ( this.model.get(), this.element.getAttribute( 'value' ) );

		this.element.on( 'change', handleDomEvent );

		if ( node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	}

	setFromNode ( node ) {
		if ( node.checked ) {
			this.group.model.set( this.element.getAttribute( 'value' ) );
		}
	}

	unbind () {
		this.group.remove( this );

		this.model.getKeypathModel().unregister( this.nameAttributeBinding );
	}

	unrender () {
		const el = this.element;

		el.off( 'change', handleDomEvent );
		el.off( 'click', handleDomEvent );
	}
}

class SingleSelectBinding extends Binding {
	forceUpdate () {
		const value = this.getValue();

		if ( value !== undefined ) {
			this.attribute.locked = true;
			runloop.scheduleTask( () => this.attribute.locked = false );
			this.model.set( value );
		}
	}

	getInitialValue () {
		if ( this.element.getAttribute( 'value' ) !== undefined ) {
			return;
		}

		const options = this.element.options;
		const len = options.length;

		if ( !len ) return;

		let value;
		let optionWasSelected;
		let i = len;

		// take the final selected option...
		while ( i-- ) {
			const option = options[i];

			if ( option.getAttribute( 'selected' ) ) {
				if ( !option.getAttribute( 'disabled' ) ) {
					value = option.getAttribute( 'value' );
				}

				optionWasSelected = true;
				break;
			}
		}

		// or the first non-disabled option, if none are selected
		if ( !optionWasSelected ) {
			while ( ++i < len ) {
				if ( !options[i].getAttribute( 'disabled' ) ) {
					value = options[i].getAttribute( 'value' );
					break;
				}
			}
		}

		// This is an optimisation (aka hack) that allows us to forgo some
		// other more expensive work
		// TODO does it still work? seems at odds with new architecture
		if ( value !== undefined ) {
			this.element.attributeByName.value.value = value;
		}

		return value;
	}

	getValue () {
		const options = this.node.options;
		const len = options.length;

		let i;
		for ( i = 0; i < len; i += 1 ) {
			const option = options[i];

			if ( options[i].selected && !options[i].disabled ) {
				return option._ractive ? option._ractive.value : option.value;
			}
		}
	}

	render () {
		super.render();
		this.element.on( 'change', handleDomEvent );
	}

	setFromNode ( node ) {
		const option = getSelectedOptions( node )[0];
		this.model.set( option._ractive ? option._ractive.value : option.value );
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
	}
}

function isBindable ( attribute ) {

	// The fragment must be a single non-string fragment
	if ( !attribute || !attribute.template.f || attribute.template.f.length !== 1 || attribute.template.f[0].s ) return false;

	// A binding is an interpolator `{{ }}`, yey.
	if ( attribute.template.f[0].t === INTERPOLATOR ) return true;

	// The above is probably the only true case. For the rest, show an appropriate
	// warning before returning false.

	// You can't bind a triple curly. HTML values on an attribute makes no sense.
	if ( attribute.template.f[0].t === TRIPLE ) warnIfDebug( 'It is not possible create a binding using a triple mustache.' );

	return false;
}

function selectBinding ( element ) {
	const name = element.name;
	const attributes = element.attributeByName;
	const isBindableByValue = isBindable( attributes.value );
	const isBindableByContentEditable = isBindable( attributes.contenteditable );
	const isContentEditable =  element.getAttribute( 'contenteditable' );

	// contenteditable
	// Bind if the contenteditable is true or a binding that may become true.
	if ( ( isContentEditable || isBindableByContentEditable ) && isBindableByValue ) return ContentEditableBinding;

	// <input>
	if ( name === 'input' ) {
		const type = element.getAttribute( 'type' );

		if ( type === 'radio' ) {
			const isBindableByName = isBindable( attributes.name );
			const isBindableByChecked = isBindable( attributes.checked );

			// For radios we can either bind the name or checked, but not both.
			// Name binding is handed instead.
			if ( isBindableByName && isBindableByChecked ) {
				warnIfDebug( 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both', { ractive: element.root });
				return RadioNameBinding;
			}

			if ( isBindableByName ) return RadioNameBinding;

			if ( isBindableByChecked ) return RadioBinding;

			// Dead end. Unknown binding on radio input.
			return null;
		}

		if ( type === 'checkbox' ) {
			const isBindableByName = isBindable( attributes.name );
			const isBindableByChecked = isBindable( attributes.checked );

			// A checkbox with bindings for both name and checked. Checked treated as
			// the checkbox value, name is treated as a regular binding.
			//
			// See https://github.com/ractivejs/ractive/issues/1749
			if ( isBindableByName && isBindableByChecked ) return CheckboxBinding;

			if ( isBindableByName ) return CheckboxNameBinding;

			if ( isBindableByChecked ) return CheckboxBinding;

			// Dead end. Unknown binding on checkbox input.
			return null;
		}

		if ( type === 'file' && isBindableByValue ) return FileBinding;

		if ( type === 'number' && isBindableByValue ) return NumericBinding;

		if ( type === 'range' && isBindableByValue ) return NumericBinding;

		// Some input of unknown type (browser usually falls back to text).
		if ( isBindableByValue ) return GenericBinding;

		// Dead end. Some unknown input and an unbindable.
		return null;
	}

	// <select>
	if ( name === 'select' && isBindableByValue ){
		return element.getAttribute( 'multiple' ) ? MultipleSelectBinding : SingleSelectBinding;
	}

	// <textarea>
	if ( name === 'textarea' && isBindableByValue ) return GenericBinding;

	// Dead end. Some unbindable element.
	return null;
}

const endsWithSemi = /;\s*$/;

class Element extends ContainerItem {
	constructor ( options ) {
		super( options );

		this.name = options.template.e.toLowerCase();

		// find parent element
		this.parent = findElement( this.parentFragment, false );

		if ( this.parent && this.parent.name === 'option' ) {
			throw new Error( `An <option> element cannot contain other elements (encountered <${this.name}>)` );
		}

		this.decorators = [];

		// create attributes
		this.attributeByName = {};

		let attrs;
		let n, attr, val, cls, name, template, leftovers;

		const m = this.template.m;
		const len = ( m && m.length ) || 0;

		for ( let i = 0; i < len; i++ ) {
			template = m[i];
			switch ( template.t ) {
				case ATTRIBUTE:
				case BINDING_FLAG:
				case DECORATOR:
				case EVENT:
				case TRANSITION:
					attr = createItem({
						owner: this,
						parentFragment: this.parentFragment,
						template
					});

					n = template.n;

					attrs = attrs || ( attrs = this.attributes = [] );

					if ( n === 'value' ) val = attr;
					else if ( n === 'name' ) name = attr;
					else if ( n === 'class' ) cls = attr;
					else attrs.push( attr );

					break;

				case DELEGATE_FLAG:
					this.delegate = false;
					break;

				default:
					( leftovers || ( leftovers = [] ) ).push( template );
					break;
			}
		}

		if ( name ) attrs.push( name );
		if ( val ) attrs.push( val );
		if ( cls ) attrs.unshift( cls );

		if ( leftovers ) {
			( attrs || ( this.attributes = [] ) ).push( new ConditionalAttribute({
				owner: this,
				parentFragment: this.parentFragment,
				template: leftovers
			}) );

			// empty leftovers array
			leftovers = [];
		}

		// create children
		if ( options.template.f && !options.deferContent ) {
			this.fragment = new Fragment({
				template: options.template.f,
				owner: this,
				cssIds: null
			});
		}

		this.binding = null; // filled in later
	}

	bind () {
		const attrs = this.attributes;
		if ( attrs ) {
			attrs.binding = true;
			attrs.forEach( bind );
			attrs.binding = false;
		}

		if ( this.fragment ) this.fragment.bind();

		// create two-way binding if necessary
		if ( !this.binding ) this.recreateTwowayBinding();
		else this.binding.bind();
	}

	createTwowayBinding () {
		if ( 'twoway' in this ? this.twoway : this.ractive.twoway ) {
			const Binding = selectBinding( this );
			if ( Binding ) {
				const binding = new Binding( this );
				if ( binding && binding.model ) return binding;
			}
		}
	}

	destroyed () {
		if ( this.attributes ) this.attributes.forEach( destroyed );

		if ( !this.parentFragment.delegate && this.listeners ) {
			const ls = this.listeners;
			for ( const k in ls ) {
				if ( ls[k] && ls[k].length ) this.node.removeEventListener( k, handler );
			}
		}

		if ( this.fragment ) this.fragment.destroyed();
	}

	detach () {
		// if this element is no longer rendered, the transitions are complete and the attributes can be torn down
		if ( !this.rendered ) this.destroyed();

		return detachNode( this.node );
	}

	find ( selector, options ) {
		if ( this.node && matches( this.node, selector ) ) return this.node;
		if ( this.fragment ) {
			return this.fragment.find( selector, options );
		}
	}

	findAll ( selector, options ) {
		const { result } = options;

		if ( matches( this.node, selector ) ) {
			result.push( this.node );
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, options );
		}
	}

	findNextNode () {
		return null;
	}

	firstNode () {
		return this.node;
	}

	getAttribute ( name ) {
		const attribute = this.attributeByName[ name ];
		return attribute ? attribute.getValue() : undefined;
	}

	getContext ( ...assigns ) {
		if ( this.fragment ) return this.fragment.getContext( ...assigns );

		if ( !this.ctx ) this.ctx = new Context( this.parentFragment, this );
		assigns.unshift( Object.create( this.ctx ) );
		return Object.assign.apply( null, assigns );
	}

	off ( event, callback, capture = false ) {
		const delegate = this.parentFragment.delegate;
		const ref = this.listeners && this.listeners[event];

		if ( !ref ) return;
		removeFromArray( ref, callback );

		if ( delegate ) {
			const listeners = ( delegate.listeners || ( delegate.listeners = [] ) ) && ( delegate.listeners[event] || ( delegate.listeners[event] = [] ) );
			if ( listeners.refs && !--listeners.refs ) delegate.off( event, delegateHandler, true );
		} else if ( this.rendered ) {
			const n = this.node;
			const add = n.addEventListener;
			const rem = n.removeEventListener;

			if ( !ref.length ) {
				rem.call( n, event, handler, capture );
			} else if ( ref.length && !ref.refs && capture ) {
				rem.call( n, event, handler, true );
				add.call( n, event, handler, false );
			}
		}
	}

	on ( event, callback, capture = false ) {
		const delegate = this.parentFragment.delegate;
		const ref = ( this.listeners || ( this.listeners = {} ) )[event] || ( this.listeners[event] = [] );

		if ( delegate ) {
			const listeners = ( delegate.listeners || ( delegate.listeners = [] ) ) && delegate.listeners[event] || ( delegate.listeners[event] = [] );
			if ( !listeners.refs ) {
				listeners.refs = 0;
				delegate.on( event, delegateHandler, true );
				listeners.refs++;
			} else {
				listeners.refs++;
			}
		} else if ( this.rendered ) {
			const n = this.node;
			const add = n.addEventListener;
			const rem = n.removeEventListener;

			if ( !ref.length ) {
				add.call( n, event, handler, capture );
			} else if ( ref.length && !ref.refs && capture ) {
				rem.call( n, event, handler, false );
				add.call( n, event, handler, true );
			}
		}

		addToArray( this.listeners[event], callback );
	}

	recreateTwowayBinding () {
		if ( this.binding ) {
			this.binding.unbind();
			this.binding.unrender();
		}

		if ( this.binding = this.createTwowayBinding() ) {
			this.binding.bind();
			if ( this.rendered ) this.binding.render();
		}
	}

	render ( target, occupants ) {
		// TODO determine correct namespace
		this.namespace = getNamespace( this );

		let node;
		let existing = false;

		if ( occupants ) {
			let n;
			while ( ( n = occupants.shift() ) ) {
				if ( n.nodeName.toUpperCase() === this.template.e.toUpperCase() && n.namespaceURI === this.namespace ) {
					this.node = node = n;
					existing = true;
					break;
				} else {
					detachNode( n );
				}
			}
		}

		if ( !existing && this.node ) {
			node = this.node;
			target.appendChild( node );
			existing = true;
		}

		if ( !node ) {
			const name = this.template.e;
			node = createElement( this.namespace === html ? name.toLowerCase() : name, this.namespace, this.getAttribute( 'is' ) );
			this.node = node;
		}

		// tie the node to this vdom element
		Object.defineProperty( node, '_ractive', {
			value: {
				proxy: this
			},
			configurable: true
		});

		if ( existing && this.foundNode ) this.foundNode( node );

		// register intro before rendering content so children can find the intro
		const intro = this.intro;
		if ( intro && intro.shouldFire( 'intro' ) ) {
			intro.isIntro = true;
			intro.isOutro = false;
			runloop.registerTransition( intro );
		}

		if ( this.fragment ) {
			const children = existing ? toArray( node.childNodes ) : undefined;

			this.fragment.render( node, children );

			// clean up leftover children
			if ( children ) {
				children.forEach( detachNode );
			}
		}

		if ( existing ) {
			// store initial values for two-way binding
			if ( this.binding && this.binding.wasUndefined ) this.binding.setFromNode( node );
			// remove unused attributes
			let i = node.attributes.length;
			while ( i-- ) {
				const name = node.attributes[i].name;
				if ( !( name in this.attributeByName ) )node.removeAttribute( name );
			}
		}

		// Is this a top-level node of a component? If so, we may need to add
		// a data-ractive-css attribute, for CSS encapsulation
		if ( this.parentFragment.cssIds ) {
			node.setAttribute( 'data-ractive-css', this.parentFragment.cssIds.map( x => `{${x}}` ).join( ' ' ) );
		}

		if ( this.attributes ) this.attributes.forEach( render );
		if ( this.binding ) this.binding.render();

		if ( !this.parentFragment.delegate && this.listeners ) {
			const ls = this.listeners;
			for ( const k in ls ) {
				if ( ls[k] && ls[k].length ) this.node.addEventListener( k, handler, !!ls[k].refs );
			}
		}

		if ( !existing ) {
			target.appendChild( node );
		}

		this.rendered = true;
	}

	toString () {
		const tagName = this.template.e;

		let attrs = ( this.attributes && this.attributes.map( stringifyAttribute ).join( '' ) ) || '';

		// Special case - selected options
		if ( this.name === 'option' && this.isSelected() ) {
			attrs += ' selected';
		}

		// Special case - two-way radio name bindings
		if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
			attrs += ' checked';
		}

		// Special case style and class attributes and directives
		let style, cls;
		this.attributes && this.attributes.forEach( attr => {
			if ( attr.name === 'class' ) {
				cls = ( cls || '' ) + ( cls ? ' ' : '' ) + safeAttributeString( attr.getString() );
			} else if ( attr.name === 'style' ) {
				style = ( style || '' ) + ( style ? ' ' : '' ) + safeAttributeString( attr.getString() );
				if ( style && !endsWithSemi.test( style ) ) style += ';';
			} else if ( attr.style ) {
				style = ( style || '' ) + ( style ? ' ' : '' ) +  `${attr.style}: ${safeAttributeString( attr.getString() )};`;
			} else if ( attr.inlineClass && attr.getValue() ) {
				cls = ( cls || '' ) + ( cls ? ' ' : '' ) + attr.inlineClass;
			}
		});
		// put classes first, then inline style
		if ( style !== undefined ) attrs = ' style' + ( style ? `="${style}"` : '' ) + attrs;
		if ( cls !== undefined ) attrs = ' class' + (cls ? `="${cls}"` : '') + attrs;

		if ( this.parentFragment.cssIds ) {
			attrs += ` data-ractive-css="${this.parentFragment.cssIds.map( x => `{${x}}` ).join( ' ' )}"`;
		}

		let str = `<${tagName}${attrs}>`;

		if ( voidElementNames.test( this.name ) ) return str;

		// Special case - textarea
		if ( this.name === 'textarea' && this.getAttribute( 'value' ) !== undefined ) {
			str += escapeHtml( this.getAttribute( 'value' ) );
		}

		// Special case - contenteditable
		else if ( this.getAttribute( 'contenteditable' ) !== undefined ) {
			str += ( this.getAttribute( 'value' ) || '' );
		}

		if ( this.fragment ) {
			str += this.fragment.toString( !/^(?:script|style)$/i.test( this.template.e ) ); // escape text unless script/style
		}

		str += `</${tagName}>`;
		return str;
	}

	unbind () {
		const attrs = this.attributes;
		if ( attrs ) {
			attrs.unbinding = true;
			attrs.forEach( unbind );
			attrs.unbinding = false;
		}

		if ( this.binding ) this.binding.unbind();
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( !this.rendered ) return;
		this.rendered = false;

		// unrendering before intro completed? complete it now
		// TODO should be an API for aborting transitions
		const transition = this.intro;
		if ( transition && transition.complete ) transition.complete();

		// Detach as soon as we can
		if ( this.name === 'option' ) {
			// <option> elements detach immediately, so that
			// their parent <select> element syncs correctly, and
			// since option elements can't have transitions anyway
			this.detach();
		} else if ( shouldDestroy ) {
			runloop.detachWhenReady( this );
		}

		// outro transition
		const outro = this.outro;
		if ( outro && outro.shouldFire( 'outro' ) ) {
			outro.isIntro = false;
			outro.isOutro = true;
			runloop.registerTransition( outro );
		}

		if ( this.fragment ) this.fragment.unrender();

		if ( this.binding ) this.binding.unrender();
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;

			this.attributes && this.attributes.forEach( update );

			if ( this.fragment ) this.fragment.update();
		}
	}
}

function inputIsCheckedRadio ( element ) {
	const nameAttr = element.attributeByName.name;
	return element.getAttribute( 'type' ) === 'radio' &&
		( nameAttr || {} ).interpolator &&
		element.getAttribute( 'value' ) === nameAttr.interpolator.model.get();
}

function stringifyAttribute ( attribute ) {
	const str = attribute.toString();
	return str ? ' ' + str : '';
}

function getNamespace ( element ) {
	// Use specified namespace...
	const xmlns$$1 = element.getAttribute( 'xmlns' );
	if ( xmlns$$1 ) return xmlns$$1;

	// ...or SVG namespace, if this is an <svg> element
	if ( element.name === 'svg' ) return svg$1;

	const parent = element.parent;

	if ( parent ) {
		// ...or HTML, if the parent is a <foreignObject>
		if ( parent.name === 'foreignobject' ) return html;

		// ...or inherit from the parent node
		return parent.node.namespaceURI;
	}

	return element.ractive.el.namespaceURI;
}

function delegateHandler ( ev ) {
	const name = ev.type;
	const end = ev.currentTarget;
	const endEl = end._ractive && end._ractive.proxy;
	let node = ev.target;
	let bubble = true;
	let listeners;

	// starting with the origin node, walk up the DOM looking for ractive nodes with a matching event listener
	while ( bubble && node && node !== end ) {
		const proxy = node._ractive && node._ractive.proxy;
		if ( proxy && proxy.parentFragment.delegate === endEl && shouldFire( ev, node, end ) ) {
			listeners = proxy.listeners && proxy.listeners[name];

			if ( listeners ) {
				listeners.forEach( l => {
					bubble = l.call( node, ev ) !== false && bubble;
				});
			}
		}

		node = node.parentNode;
	}

	return bubble;
}

const UIEvent = win !== null ? win.UIEvent : null;
function shouldFire ( event, start, end ) {
	if ( UIEvent && event instanceof UIEvent ) {
		let node = start;
		while ( node && node !== end ) {
			if ( node.disabled ) return false;
			node = node.parentNode;
		}
	}

	return true;
}

function handler ( ev ) {
	const el = this._ractive.proxy;
	if ( !el.listeners || !el.listeners[ ev.type ] ) return;
	el.listeners[ ev.type ].forEach( l => l.call( this, ev ) );
}

class Form extends Element {
	constructor ( options ) {
		super( options );
		this.formBindings = [];
	}

	render ( target, occupants ) {
		super.render( target, occupants );
		this.on( 'reset', handleReset );
	}

	unrender ( shouldDestroy ) {
		this.off( 'reset', handleReset );
		super.unrender( shouldDestroy );
	}
}

function handleReset () {
	const element = this._ractive.proxy;

	runloop.start();
	element.formBindings.forEach( updateModel );
	runloop.end();
}

function updateModel ( binding ) {
	binding.model.set( binding.resetValue );
}

class DOMEvent {
	constructor ( name, owner ) {
		if ( name.indexOf( '*' ) !== -1 ) {
			fatal( `Only component proxy-events may contain "*" wildcards, <${owner.name} on-${name}="..."/> is not valid` );
		}

		this.name = name;
		this.owner = owner;
		this.handler = null;
	}

	listen ( directive ) {
		const node = this.owner.node;
		const name = this.name;

		// this is probably a custom event fired from a decorator or manually
		if ( !( `on${name}` in node ) ) return;

		this.owner.on( name, this.handler = ( event ) => {
			return directive.fire({
				node,
				original: event,
				event,
				name
			});
		});
	}

	unlisten () {
		if ( this.handler ) this.owner.off( this.name, this.handler );
	}
}

class CustomEvent {
	constructor ( eventPlugin, owner, name ) {
		this.eventPlugin = eventPlugin;
		this.owner = owner;
		this.name = name;
		this.handler = null;
	}

	listen ( directive ) {
		const node = this.owner.node;

		this.handler = this.eventPlugin( node, ( event = {} ) => {
			if ( event.original ) event.event = event.original;
			else event.original = event.event;

			event.name = this.name;
			event.node = event.node || node;
			return directive.fire( event );
		});
	}

	unlisten () {
		this.handler.teardown();
	}
}

class RactiveEvent {
	constructor ( component, name ) {
		this.component = component;
		this.name = name;
		this.handler = null;
	}

	listen ( directive ) {
		const ractive = this.component.instance;

		this.handler = ractive.on( this.name, ( ...args ) => {
			// watch for reproxy
			if ( args[0] instanceof Context ) {
				const ctx = args.shift();
				ctx.component = ractive;
				directive.fire( ctx, args );
			} else {
				directive.fire( {}, args );
			}

			// cancel bubbling
			return false;
		});
	}

	unlisten () {
		this.handler.cancel();
	}
}

const specialPattern = /^(event|arguments|@node|@event|@context)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

class EventDirective {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment, true );
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;
		//const delegate = this.delegate = this.ractive.delegate && options.parentFragment.delegate;
		this.events = [];

		if ( this.element.type === COMPONENT || this.element.type === ANCHOR ) {
			this.template.n.forEach( n => {
				this.events.push( new RactiveEvent( this.element, n ) );
			});
		} else {
			// make sure the delegate element has a storag object
			//if ( delegate && !delegate.delegates ) delegate.delegates = {};

			this.template.n.forEach( n => {
				const fn = findInViewHierarchy( 'events', this.ractive, n );
				if ( fn ) {
					this.events.push( new CustomEvent( fn, this.element, n ) );
				} else {
					this.events.push( new DOMEvent( n, this.element ) );
				}
			});
		}

		// method calls
		this.models = null;
	}

	bind () {
		addToArray( ( this.element.events || ( this.element.events = [] ) ), this );

		setupArgsFn( this, this.template );
		if ( !this.fn ) this.action = this.template.f;
	}

	destroyed () {
		this.events.forEach( e => e.unlisten() );
	}

	fire ( event, args = [] ) {
		const context = event instanceof Context && event.refire ? event : this.element.getContext( event );

		if ( this.fn ) {
			const values = [];

			const models = resolveArgs( this, this.template, this.parentFragment, {
				specialRef ( ref ) {
					const specialMatch = specialPattern.exec( ref );
					if ( specialMatch ) {
						// on-click="foo(event.node)"
						return {
							special: specialMatch[1],
							keys: specialMatch[2] ? splitKeypath( specialMatch[2].substr(1) ) : []
						};
					}

					const dollarMatch = dollarArgsPattern.exec( ref );
					if ( dollarMatch ) {
						// on-click="foo($1)"
						return {
							special: 'arguments',
							keys: [ dollarMatch[1] - 1 ].concat( dollarMatch[2] ? splitKeypath( dollarMatch[2].substr( 1 ) ) : [] )
						};
					}
				}
			});

			if ( models ) {
				models.forEach( model => {
					if ( !model ) return values.push( undefined );

					if ( model.special ) {
						const which = model.special;
						let obj;

						if ( which === '@node' ) {
							obj = this.element.node;
						} else if ( which === '@event' ) {
							obj = event && event.event;
						} else if ( which === 'event' ) {
							warnOnceIfDebug( `The event reference available to event directives is deprecated and should be replaced with @context and @event` );
							obj = context;
						} else if ( which === '@context' ) {
							obj = context;
						} else {
							obj = args;
						}

						const keys = model.keys.slice();

						while ( obj && keys.length ) obj = obj[ keys.shift() ];
						return values.push( obj );
					}

					if ( model.wrapper ) {
						return values.push( model.wrapperValue );
					}

					values.push( model.get() );
				});
			}

			// make event available as `this.event`
			const ractive = this.ractive;
			const oldEvent = ractive.event;

			ractive.event = context;
			const returned = this.fn.apply( ractive, values );
			let result = returned.pop();

			// Auto prevent and stop if return is explicitly false
			if ( result === false ) {
				const original = event ? event.original : undefined;
				if ( original ) {
					original.preventDefault && original.preventDefault();
					original.stopPropagation && original.stopPropagation();
				} else {
					warnOnceIfDebug( `handler '${this.template.n.join( ' ' )}' returned false, but there is no event available to cancel` );
				}
			}

			// watch for proxy events
			else if ( !returned.length && Array.isArray( result ) && typeof result[0] === 'string' ) {
				result = fireEvent( this.ractive, result.shift(), context, result );
			}

			ractive.event = oldEvent;

			return result;
		}

		else {
			return fireEvent( this.ractive, this.action, context, args);
		}
	}

	handleChange () {}

	render () {
		// render events after everything else, so they fire after bindings
		runloop.scheduleTask( () => this.events.forEach( e => e.listen( this ) ), true );
	}

	toString() { return ''; }

	unbind () {
		removeFromArray( this.element.events, this );
	}

	unrender () {
		this.events.forEach( e => e.unlisten() );
	}
}

EventDirective.prototype.update = noop;

function progressiveText ( item, target, occupants, text ) {
	if ( occupants ) {
		let n = occupants[0];
		if ( n && n.nodeType === 3 ) {
			const idx = n.nodeValue.indexOf( text );
			occupants.shift();

			if ( idx === 0 ) {
				if ( n.nodeValue.length !== text.length ) {
					occupants.unshift( n.splitText( text.length ) );
				}
			} else {
				n.nodeValue = text;
			}
		} else {
			n = item.node = doc.createTextNode( text );
			if ( occupants[0] ) {
				target.insertBefore( n, occupants[0] );
			} else {
				target.appendChild( n );
			}
		}

		item.node = n;
	} else {
		if ( !item.node ) item.node = doc.createTextNode( text );
		target.appendChild( item.node );
	}
}

class Mustache extends Item {
	constructor ( options ) {
		super( options );

		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;
		if ( options.owner ) this.parent = options.owner;

		this.isStatic = !!options.template.s;

		this.model = null;
		this.dirty = false;
	}

	bind () {
		// yield mustaches should resolve in container context
		const start = this.containerFragment || this.parentFragment;
		// try to find a model for this view
		const model = resolve( start, this.template );

		if ( model ) {
			const value = model.get();

			if ( this.isStatic ) {
				this.model = { get: () => value };
				return;
			}

			model.register( this );
			this.model = model;
		}
	}

	handleChange () {
		this.bubble();
	}

	rebind ( next, previous, safe ) {
		next = rebindMatch( this.template, next, previous, this.parentFragment );
		if ( next === this.model ) return false;

		if ( this.model ) {
			this.model.unregister( this );
		}
		if ( next ) next.addShuffleRegister( this, 'mark' );
		this.model = next;
		if ( !safe ) this.handleChange();
		return true;
	}

	unbind () {
		if ( !this.isStatic ) {
			this.model && this.model.unregister( this );
			this.model = undefined;
		}
	}
}

class MustacheContainer extends ContainerItem {
	constructor ( options ) {
		super( options );
	}
}
const proto$3 = MustacheContainer.prototype;
const mustache = Mustache.prototype;
proto$3.bind = mustache.bind;
proto$3.handleChange = mustache.handleChange;
proto$3.rebind = mustache.rebind;
proto$3.unbind = mustache.unbind;

class Interpolator extends Mustache {
	bubble () {
		if ( this.owner ) this.owner.bubble();
		super.bubble();
	}

	detach () {
		return detachNode( this.node );
	}

	firstNode () {
		return this.node;
	}

	getString () {
		return this.model ? safeToStringValue( this.model.get() ) : '';
	}

	render ( target, occupants ) {
		if ( inAttributes() ) return;
		const value = this.getString();

		this.rendered = true;

		progressiveText( this, target, occupants, value );
	}

	toString ( escape ) {
		const string = this.getString();
		return escape ? escapeHtml( string ) : string;
	}

	unrender ( shouldDestroy ) {
		if ( shouldDestroy ) this.detach();
		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.rendered ) {
				this.node.data = this.getString();
			}
		}
	}

	valueOf () {
		return this.model ? this.model.get() : undefined;
	}
}

class Input extends Element {
	render ( target, occupants ) {
		super.render( target, occupants );
		this.node.defaultValue = this.node.value;
	}
	compare ( value, attrValue ) {
		const comparator = this.getAttribute( 'value-comparator' );
		if ( comparator ) {
			if ( typeof comparator === 'function' ) {
				return comparator( value, attrValue );
			}
			if (value && attrValue) {
				return value[comparator] == attrValue[comparator];
			}
		}
		return value == attrValue;
	}
}

// simple JSON parser, without the restrictions of JSON parse
// (i.e. having to double-quote keys).
//
// If passed a hash of values as the second argument, ${placeholders}
// will be replaced with those values

const specials$1 = {
	true: true,
	false: false,
	null: null,
	undefined
};

const specialsPattern = new RegExp( '^(?:' + Object.keys( specials$1 ).join( '|' ) + ')' );
const numberPattern$1 = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
const placeholderPattern = /\$\{([^\}]+)\}/g;
const placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
const onlyWhitespace$1 = /^\s*$/;

const JsonParser = Parser.extend({
	init ( str, options ) {
		this.values = options.values;
		this.allowWhitespace();
	},

	postProcess ( result ) {
		if ( result.length !== 1 || !onlyWhitespace$1.test( this.leftover ) ) {
			return null;
		}

		return { value: result[0].v };
	},

	converters: [
		function getPlaceholder ( parser ) {
			if ( !parser.values ) return null;

			const placeholder = parser.matchPattern( placeholderAtStartPattern );

			if ( placeholder && ( parser.values.hasOwnProperty( placeholder ) ) ) {
				return { v: parser.values[ placeholder ] };
			}
		},

		function getSpecial ( parser ) {
			const special = parser.matchPattern( specialsPattern );
			if ( special ) return { v: specials$1[ special ] };
		},

		function getNumber ( parser ) {
			const number = parser.matchPattern( numberPattern$1 );
			if ( number ) return { v: +number };
		},

		function getString ( parser ) {
			const stringLiteral = readStringLiteral( parser );
			const values = parser.values;

			if ( stringLiteral && values ) {
				return {
					v: stringLiteral.v.replace( placeholderPattern, ( match, $1 ) => ( $1 in values ? values[ $1 ] : $1 ) )
				};
			}

			return stringLiteral;
		},

		function getObject ( parser ) {
			if ( !parser.matchString( '{' ) ) return null;

			const result = {};

			parser.allowWhitespace();

			if ( parser.matchString( '}' ) ) {
				return { v: result };
			}

			let pair;
			while ( pair = getKeyValuePair( parser ) ) {
				result[ pair.key ] = pair.value;

				parser.allowWhitespace();

				if ( parser.matchString( '}' ) ) {
					return { v: result };
				}

				if ( !parser.matchString( ',' ) ) {
					return null;
				}
			}

			return null;
		},

		function getArray ( parser ) {
			if ( !parser.matchString( '[' ) ) return null;

			const result = [];

			parser.allowWhitespace();

			if ( parser.matchString( ']' ) ) {
				return { v: result };
			}

			let valueToken;
			while ( valueToken = parser.read() ) {
				result.push( valueToken.v );

				parser.allowWhitespace();

				if ( parser.matchString( ']' ) ) {
					return { v: result };
				}

				if ( !parser.matchString( ',' ) ) {
					return null;
				}

				parser.allowWhitespace();
			}

			return null;
		}
	]
});

function getKeyValuePair ( parser ) {
	parser.allowWhitespace();

	const key = readKey( parser );

	if ( !key ) return null;

	const pair = { key };

	parser.allowWhitespace();
	if ( !parser.matchString( ':' ) ) {
		return null;
	}
	parser.allowWhitespace();

	const valueToken = parser.read();

	if ( !valueToken ) return null;

	pair.value = valueToken.v;
	return pair;
}

var parseJSON = function ( str, values ) {
	const parser = new JsonParser( str, { values });
	return parser.result;
};

class Mapping extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;

		this.owner = options.owner || options.parentFragment.owner || options.element || findElement( options.parentFragment );
		this.element = options.element || (this.owner.attributeByName ? this.owner : findElement( options.parentFragment ) );
		this.parentFragment = this.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.element.attributeByName[ this.name ] = this;

		this.value = options.template.f;
	}

	bind () {
		const template = this.template.f;
		const viewmodel = this.element.instance.viewmodel;

		if ( template === 0 ) {
			// empty attributes are `true`
			viewmodel.joinKey( this.name ).set( true );
		}

		else if ( typeof template === 'string' ) {
			const parsed = parseJSON( template );
			viewmodel.joinKey( this.name ).set( parsed ? parsed.value : template );
		}

		else if ( Array.isArray( template ) ) {
			createMapping( this, true );
		}
	}

	render () {}

	unbind () {
		if ( this.model ) this.model.unregister( this );
		if ( this.boundFragment ) this.boundFragment.unbind();

		if ( this.element.bound ) {
			if ( this.link.target === this.model ) this.link.owner.unlink();
		}
	}

	unrender () {}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.boundFragment ) this.boundFragment.update();
		}
	}
}

function createMapping ( item ) {
	const template = item.template.f;
	const viewmodel = item.element.instance.viewmodel;
	const childData = viewmodel.value;

	if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
		const model = resolve( item.parentFragment, template[0] );
		const val = model.get( false );

		// if the interpolator is not static
		if ( !template[0].s ) {
			item.model = model;
			item.link = viewmodel.createLink( item.name, model, template[0].r, { mapping: true } );

			// initialize parent side of the mapping from child data
			if ( val === undefined && !model.isReadonly && item.name in childData ) {
				model.set( childData[ item.name ] );
			}
		}

		// copy non-object, non-computed vals through
		else if ( typeof val !== 'object' || template[0].x ) {
			viewmodel.joinKey( splitKeypath( item.name ) ).set( val );
		}

		// warn about trying to copy an object
		else {
			warnIfDebug( `Cannot copy non-computed object value from static mapping '${item.name}'` );
		}
	}

	else {
		item.boundFragment = new Fragment({
			owner: item,
			template
		}).bind();

		item.model = viewmodel.joinKey( splitKeypath( item.name ) );
		item.model.set( item.boundFragment.valueOf() );

		// item is a *bit* of a hack
		item.boundFragment.bubble = () => {
			Fragment.prototype.bubble.call( item.boundFragment );
			// defer this to avoid mucking around model deps if there happens to be an expression involved
			runloop.scheduleTask(() => {
				item.boundFragment.update();
				item.model.set( item.boundFragment.valueOf() );
			});
		};
	}
}

class Option extends Element {
	constructor ( options ) {
		const template = options.template;
		if ( !template.a ) template.a = {};

		// If the value attribute is missing, use the element's content,
		// as long as it isn't disabled
		if ( template.a.value === undefined && !( 'disabled' in template.a ) ) {
			template.a.value = template.f || '';
		}

		super( options );

		this.select = findElement( this.parent || this.parentFragment, false, 'select' );
	}

	bind () {
		if ( !this.select ) {
			super.bind();
			return;
		}

		// If the select has a value, it overrides the `selected` attribute on
		// this option - so we delete the attribute
		const selectedAttribute = this.attributeByName.selected;
		if ( selectedAttribute && this.select.getAttribute( 'value' ) !== undefined ) {
			const index = this.attributes.indexOf( selectedAttribute );
			this.attributes.splice( index, 1 );
			delete this.attributeByName.selected;
		}

		super.bind();
		this.select.options.push( this );
	}

	bubble () {
		// if we're using content as value, may need to update here
		const value = this.getAttribute( 'value' );
		if ( this.node && this.node.value !== value ) {
			this.node._ractive.value = value;
		}
		super.bubble();
	}

	getAttribute ( name ) {
		const attribute = this.attributeByName[ name ];
		return attribute ? attribute.getValue() : name === 'value' && this.fragment ? this.fragment.valueOf() : undefined;
	}

	isSelected () {
		const optionValue = this.getAttribute( 'value' );

		if ( optionValue === undefined || !this.select ) {
			return false;
		}

		const selectValue = this.select.getAttribute( 'value' );

		if ( this.select.compare( selectValue, optionValue ) ) {
			return true;
		}

		if ( this.select.getAttribute( 'multiple' ) && Array.isArray( selectValue ) ) {
			let i = selectValue.length;
			while ( i-- ) {
				if ( this.select.compare( selectValue[i], optionValue ) ) {
					return true;
				}
			}
		}
	}

	render ( target, occupants ) {
		super.render( target, occupants );

		if ( !this.attributeByName.value ) {
			this.node._ractive.value = this.getAttribute( 'value' );
		}
	}

	unbind () {
		super.unbind();

		if ( this.select ) {
			removeFromArray( this.select.options, this );
		}
	}
}

const hasOwn = Object.prototype.hasOwnProperty;

function getPartialTemplate ( ractive, name, parentFragment ) {
	// If the partial in instance or view heirarchy instances, great
	let partial = getPartialFromRegistry( ractive, name, parentFragment || {} );
	if ( partial ) return partial;

	// Does it exist on the page as a script tag?
	partial = parser.fromId( name, { noThrow: true } );
	if ( partial ) {
		// parse and register to this ractive instance
		const parsed = parser.parseFor( partial, ractive );

		// register extra partials on the ractive instance if they don't already exist
		if ( parsed.p ) fillGaps( ractive.partials, parsed.p );

		// register (and return main partial if there are others in the template)
		return ractive.partials[ name ] = parsed.t;
	}
}

function getPartialFromRegistry ( ractive, name, parentFragment ) {
	// if there was an instance up-hierarchy, cool
	let partial = findParentPartial( name, parentFragment.owner );
	if ( partial ) return partial;

	// find first instance in the ractive or view hierarchy that has this partial
	const instance = findInstance( 'partials', ractive, name );

	if ( !instance ) { return; }

	partial = instance.partials[ name ];

	// partial is a function?
	let fn;
	if ( typeof partial === 'function' ) {
		fn = partial.bind( instance );
		fn.isOwner = instance.partials.hasOwnProperty(name);
		partial = fn.call( ractive, parser );
	}

	if ( !partial && partial !== '' ) {
		warnIfDebug( noRegistryFunctionReturn, name, 'partial', 'partial', { ractive });
		return;
	}

	// If this was added manually to the registry,
	// but hasn't been parsed, parse it now
	if ( !parser.isParsed( partial ) ) {
		// use the parseOptions of the ractive instance on which it was found
		const parsed = parser.parseFor( partial, instance );

		// Partials cannot contain nested partials!
		// TODO add a test for this
		if ( parsed.p ) {
			warnIfDebug( 'Partials ({{>%s}}) cannot contain nested inline partials', name, { ractive });
		}

		// if fn, use instance to store result, otherwise needs to go
		// in the correct point in prototype chain on instance or constructor
		const target = fn ? instance : findOwner( instance, name );

		// may be a template with partials, which need to be registered and main template extracted
		target.partials[ name ] = partial = parsed.t;
	}

	// store for reset
	if ( fn ) partial._fn = fn;

	return partial.v ? partial.t : partial;
}

function findOwner ( ractive, key ) {
	return ractive.partials.hasOwnProperty( key )
		? ractive
		: findConstructor( ractive.constructor, key);
}

function findConstructor ( constructor, key ) {
	if ( !constructor ) { return; }
	return constructor.partials.hasOwnProperty( key )
		? constructor
		: findConstructor( constructor.Parent, key );
}

function findParentPartial( name, parent ) {
	if ( parent ) {
		if ( parent.template && parent.template.p && !Array.isArray( parent.template.p ) && hasOwn.call( parent.template.p, name ) ) {
			return parent.template.p[name];
		} else if ( parent.parentFragment && parent.parentFragment.owner ) {
			return findParentPartial( name, parent.parentFragment.owner );
		}
	}
}

class Partial extends MustacheContainer {
	constructor ( options ) {
		super( options );

		this.options = options;

		this.yielder = options.template.t === YIELDER;
	}

	bind () {
		let options = this.options;

		if ( this.yielder ) {
			this.container = options.parentFragment.ractive;
			this.component = this.container.component;

			if ( this.component ) {
				this.containerFragment = options.parentFragment;
				this.parentFragment = this.component.parentFragment;

				// {{yield}} is equivalent to {{yield content}}
				if ( !options.template.r && !options.template.rx && !options.template.x ) options.template.r = 'content';
			} else { // this is a plain-ish instance that may be anchored at a later date
				this.fragment = new Fragment({
					template: [],
					owner: this,
					parentFragment: options.parentFragment,
					ractive: options.parentFragment.ractive
				});
				this.containerFragment = options.parentFragment;
				this.parentFragment = options.parentFragment;
				this.fragment.bind();
				return;
			}
		}

		// keep track of the reference name for future resets
		this.refName = this.template.r;

		// name matches take priority over expressions
		const template = this.refName ? getPartialTemplate( this.ractive, this.refName, this.parentFragment ) || null : null;
		let templateObj;

		if ( template ) {
			this.named = true;
			this.setTemplate( this.template.r, template );
		}

		if ( !template ) {
			super.bind();
			if ( ( templateObj = this.model.get() ) && typeof templateObj === 'object' && ( typeof templateObj.template === 'string' || Array.isArray( templateObj.t ) ) ) {
				if ( templateObj.template ) {
					this.source = templateObj.template;
					templateObj = parsePartial( this.template.r, templateObj.template, this.ractive );
				} else {
					this.source = templateObj.t;
				}
				this.setTemplate( this.template.r, templateObj.t );
			} else if ( typeof this.model.get() !== 'string' && this.refName ) {
				this.setTemplate( this.refName, template );
			} else {
				this.setTemplate( this.model.get() );
			}
		}

		options = {
			owner: this,
			template: this.partialTemplate
		};

		if ( this.template.c ) {
			options.template = [{ t: SECTION, n: SECTION_WITH, f: options.template }];
			for ( const k in this.template.c ) {
				options.template[0][k] = this.template.c[k];
			}
		}

		if ( this.yielder ) {
			options.ractive = this.container.parent;
		}

		this.fragment = new Fragment(options);
		if ( this.template.z ) {
			this.fragment.aliases = resolveAliases( this.template.z, this.yielder ? this.containerFragment : this.parentFragment );
		}
		this.fragment.bind();
	}

	bubble () {
		if ( this.yielder && !this.dirty ) {
			this.containerFragment.bubble();
			this.dirty = true;
		} else {
			super.bubble();
		}
	}

	findNextNode() {
		return this.yielder ? this.containerFragment.findNextNode( this ) : super.findNextNode();
	}

	forceResetTemplate () {
		this.partialTemplate = undefined;

		// on reset, check for the reference name first
		if ( this.refName ) {
			this.partialTemplate = getPartialTemplate( this.ractive, this.refName, this.parentFragment );
		}

		// then look for the resolved name
		if ( !this.partialTemplate ) {
			this.partialTemplate = getPartialTemplate( this.ractive, this.name, this.parentFragment );
		}

		if ( !this.partialTemplate ) {
			warnOnceIfDebug( `Could not find template for partial '${this.name}'` );
			this.partialTemplate = [];
		}

		if ( this.inAttribute ) {
			doInAttributes( () => this.fragment.resetTemplate( this.partialTemplate ) );
		} else {
			this.fragment.resetTemplate( this.partialTemplate );
		}

		this.bubble();
	}

	render ( target, occupants ) {
		return this.fragment.render( target, occupants );
	}

	setTemplate ( name, template ) {
		this.name = name;

		if ( !template && template !== null ) template = getPartialTemplate( this.ractive, name, this.parentFragment );

		if ( !template ) {
			warnOnceIfDebug( `Could not find template for partial '${name}'` );
		}

		this.partialTemplate = template || [];
	}

	unbind () {
		super.unbind();
		this.fragment.aliases = {};
		this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	}

	update () {
		let template;

		if ( this.dirty ) {
			this.dirty = false;

			if ( !this.named ) {
				if ( this.model ) {
					template = this.model.get();
				}

				if ( template && typeof template === 'string' && template !== this.name ) {
					this.setTemplate( template );
					this.fragment.resetTemplate( this.partialTemplate );
				} else if ( template && typeof template === 'object' && ( typeof template.template === 'string' || Array.isArray( template.t ) ) ) {
					if ( template.t !== this.source && template.template !== this.source ) {
						if ( template.template ) {
							this.source = template.template;
							template = parsePartial( this.name, template.template, this.ractive );
						} else {
							this.source = template.t;
						}
						this.setTemplate( this.name, template.t );
						this.fragment.resetTemplate( this.partialTemplate );
					}
				}
			}

			this.fragment.update();
		}
	}
}

function parsePartial( name, partial, ractive ) {
	let parsed;

	try {
		parsed = parser.parse( partial, parser.getParseOptions( ractive ) );
	} catch (e) {
		warnIfDebug( `Could not parse partial from expression '${name}'\n${e.message}` );
	}

	return parsed || { t: [] };
}

class RepeatedFragment {
	constructor ( options ) {
		this.parent = options.owner.parentFragment;

		// bit of a hack, so reference resolution works without another
		// layer of indirection
		this.parentFragment = this;
		this.owner = options.owner;
		this.ractive = this.parent.ractive;
		this.delegate = this.ractive.delegate !== false && ( this.parent.delegate || findDelegate( findElement( options.owner ) ) );
		// delegation disabled by directive
		if ( this.delegate && this.delegate.delegate === false ) this.delegate = false;
		// let the element know it's a delegate handler
		if ( this.delegate ) this.delegate.delegate = this.delegate;

		// encapsulated styles should be inherited until they get applied by an element
		this.cssIds = 'cssIds' in options ? options.cssIds : ( this.parent ? this.parent.cssIds : null );

		this.context = null;
		this.rendered = false;
		this.iterations = [];

		this.template = options.template;

		this.indexRef = options.indexRef;
		this.keyRef = options.keyRef;

		this.pendingNewIndices = null;
		this.previousIterations = null;

		// track array versus object so updates of type rest
		this.isArray = false;
	}

	bind ( context ) {
		this.context = context;
		this.bound = true;
		const value = context.get();

		// {{#each array}}...
		if ( this.isArray = Array.isArray( value ) ) {
			// we can't use map, because of sparse arrays
			this.iterations = [];
			const max = value.length;
			for ( let i = 0; i < max; i += 1 ) {
				this.iterations[i] = this.createIteration( i, i );
			}
		}

		// {{#each object}}...
		else if ( isObject( value ) ) {
			this.isArray = false;

			// TODO this is a dreadful hack. There must be a neater way
			if ( this.indexRef ) {
				const refs = this.indexRef.split( ',' );
				this.keyRef = refs[0];
				this.indexRef = refs[1];
			}

			this.iterations = Object.keys( value ).map( ( key, index ) => {
				return this.createIteration( key, index );
			});
		}

		return this;
	}

	bubble ( index ) {
		if  ( !this.bubbled ) this.bubbled = [];
		this.bubbled.push( index );

		this.owner.bubble();
	}

	createIteration ( key, index ) {
		const fragment = new Fragment({
			owner: this,
			template: this.template
		});

		fragment.key = key;
		fragment.index = index;
		fragment.isIteration = true;
		fragment.delegate = this.delegate;

		const model = this.context.joinKey( key );

		// set up an iteration alias if there is one
		if ( this.owner.template.z ) {
			fragment.aliases = {};
			fragment.aliases[ this.owner.template.z[0].n ] = model;
		}

		return fragment.bind( model );
	}

	destroyed () {
		this.iterations.forEach( destroyed );
	}

	detach () {
		const docFrag = createDocumentFragment();
		this.iterations.forEach( fragment => docFrag.appendChild( fragment.detach() ) );
		return docFrag;
	}

	find ( selector, options ) {
		return findMap( this.iterations, i => i.find( selector, options ) );
	}

	findAll ( selector, options ) {
		return this.iterations.forEach( i => i.findAll( selector, options ) );
	}

	findAllComponents ( name, options ) {
		return this.iterations.forEach( i => i.findAllComponents( name, options ) );
	}

	findComponent ( name, options ) {
		return findMap( this.iterations, i => i.findComponent( name, options ) );
	}

	findContext () {
		return this.context;
	}

	findNextNode ( iteration ) {
		if ( iteration.index < this.iterations.length - 1 ) {
			for ( let i = iteration.index + 1; i < this.iterations.length; i++ ) {
				const node = this.iterations[ i ].firstNode( true );
				if ( node ) return node;
			}
		}

		return this.owner.findNextNode();
	}

	firstNode ( skipParent ) {
		return this.iterations[0] ? this.iterations[0].firstNode( skipParent ) : null;
	}

	rebind ( next ) {
		this.context = next;
		this.iterations.forEach( fragment => {
			const model = next ? next.joinKey( fragment.key ) : undefined;
			fragment.context = model;
			if ( this.owner.template.z ) {
				fragment.aliases = {};
				fragment.aliases[ this.owner.template.z[0].n ] = model;
			}
		});
	}

	render ( target, occupants ) {
		// TODO use docFrag.cloneNode...

		const xs = this.iterations;
		if ( xs ) {
			const len = xs.length;
			for ( let i = 0; i < len; i++ ) {
				xs[i].render( target, occupants );
			}
		}

		this.rendered = true;
	}

	shuffle ( newIndices ) {
		if ( !this.pendingNewIndices ) this.previousIterations = this.iterations.slice();

		if ( !this.pendingNewIndices ) this.pendingNewIndices = [];

		this.pendingNewIndices.push( newIndices );

		const iterations = [];

		newIndices.forEach( ( newIndex, oldIndex ) => {
			if ( newIndex === -1 ) return;

			const fragment = this.iterations[ oldIndex ];
			iterations[ newIndex ] = fragment;

			if ( newIndex !== oldIndex && fragment ) fragment.dirty = true;
		});

		this.iterations = iterations;

		this.bubble();
	}

	shuffled () {
		this.iterations.forEach( shuffled );
	}

	toString ( escape ) {
		return this.iterations ?
			this.iterations.map( escape ? toEscapedString : toString$1 ).join( '' ) :
			'';
	}

	unbind () {
		this.bound = false;
		this.iterations.forEach( unbind );
		return this;
	}

	unrender ( shouldDestroy ) {
		this.iterations.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
		if ( this.pendingNewIndices && this.previousIterations ) {
			this.previousIterations.forEach( fragment => {
				if ( fragment.rendered ) shouldDestroy ? unrenderAndDestroy( fragment ) : unrender( fragment );
			});
		}
		this.rendered = false;
	}

	// TODO smart update
	update () {
		// skip dirty check, since this is basically just a facade

		if ( this.pendingNewIndices ) {
			this.bubbled.length = 0;
			this.updatePostShuffle();
			return;
		}

		if ( this.updating ) return;
		this.updating = true;

		const value = this.context.get();
		const wasArray = this.isArray;

		let toRemove;
		let oldKeys;
		let reset = true;
		let i;

		if ( this.isArray = Array.isArray( value ) ) {
			if ( wasArray ) {
				reset = false;
				if ( this.iterations.length > value.length ) {
					toRemove = this.iterations.splice( value.length );
				}
			}
		} else if ( isObject( value ) && !wasArray ) {
			reset = false;
			toRemove = [];
			oldKeys = {};
			i = this.iterations.length;

			while ( i-- ) {
				const fragment = this.iterations[i];
				if ( fragment.key in value ) {
					oldKeys[ fragment.key ] = true;
				} else {
					this.iterations.splice( i, 1 );
					toRemove.push( fragment );
				}
			}
		}

		if ( reset ) {
			toRemove = this.iterations;
			this.iterations = [];
		}

		if ( toRemove ) {
			toRemove.forEach( fragment => {
				fragment.unbind();
				fragment.unrender( true );
			});
		}

		// update the remaining ones
		if ( !reset && this.isArray && this.bubbled && this.bubbled.length ) {
			const bubbled = this.bubbled;
			this.bubbled = [];
			bubbled.forEach( i => this.iterations[i] && this.iterations[i].update() );
		} else {
			this.iterations.forEach( update );
		}

		// add new iterations
		const newLength = Array.isArray( value ) ?
			value.length :
			isObject( value ) ?
				Object.keys( value ).length :
				0;

		let docFrag;
		let fragment;

		if ( newLength > this.iterations.length ) {
			docFrag = this.rendered ? createDocumentFragment() : null;
			i = this.iterations.length;

			if ( Array.isArray( value ) ) {
				while ( i < value.length ) {
					fragment = this.createIteration( i, i );

					this.iterations.push( fragment );
					if ( this.rendered ) fragment.render( docFrag );

					i += 1;
				}
			}

			else if ( isObject( value ) ) {
				// TODO this is a dreadful hack. There must be a neater way
				if ( this.indexRef && !this.keyRef ) {
					const refs = this.indexRef.split( ',' );
					this.keyRef = refs[0];
					this.indexRef = refs[1];
				}

				Object.keys( value ).forEach( key => {
					if ( !oldKeys || !( key in oldKeys ) ) {
						fragment = this.createIteration( key, i );

						this.iterations.push( fragment );
						if ( this.rendered ) fragment.render( docFrag );

						i += 1;
					}
				});
			}

			if ( this.rendered ) {
				const parentNode = this.parent.findParentNode();
				const anchor = this.parent.findNextNode( this.owner );

				parentNode.insertBefore( docFrag, anchor );
			}
		}

		this.updating = false;
	}

	updatePostShuffle () {
		const newIndices = this.pendingNewIndices[ 0 ];

		// map first shuffle through
		this.pendingNewIndices.slice( 1 ).forEach( indices => {
			newIndices.forEach( ( newIndex, oldIndex ) => {
				newIndices[ oldIndex ] = indices[ newIndex ];
			});
		});

		// This algorithm (for detaching incorrectly-ordered fragments from the DOM and
		// storing them in a document fragment for later reinsertion) seems a bit hokey,
		// but it seems to work for now
		const len = this.context.get().length;
		const oldLen = this.previousIterations.length;
		const removed = {};
		let i;

		newIndices.forEach( ( newIndex, oldIndex ) => {
			const fragment = this.previousIterations[ oldIndex ];
			this.previousIterations[ oldIndex ] = null;

			if ( newIndex === -1 ) {
				removed[ oldIndex ] = fragment;
			} else if ( fragment.index !== newIndex ) {
				const model = this.context.joinKey( newIndex );
				fragment.index = fragment.key = newIndex;
				fragment.context = model;
				if ( this.owner.template.z ) {
					fragment.aliases = {};
					fragment.aliases[ this.owner.template.z[0].n ] = model;
				}
			}
		});

		// if the array was spliced outside of ractive, sometimes there are leftover fragments not in the newIndices
		this.previousIterations.forEach( ( frag, i ) => {
			if ( frag ) removed[ i ] = frag;
		});

		// create new/move existing iterations
		const docFrag = this.rendered ? createDocumentFragment() : null;
		const parentNode = this.rendered ? this.parent.findParentNode() : null;

		const contiguous = 'startIndex' in newIndices;
		i = contiguous ? newIndices.startIndex : 0;

		for ( i; i < len; i++ ) {
			const frag = this.iterations[i];

			if ( frag && contiguous ) {
				// attach any built-up iterations
				if ( this.rendered ) {
					if ( removed[i] ) docFrag.appendChild( removed[i].detach() );
					if ( docFrag.childNodes.length  ) parentNode.insertBefore( docFrag, frag.firstNode() );
				}
				continue;
			}

			if ( !frag ) this.iterations[i] = this.createIteration( i, i );

			if ( this.rendered ) {
				if ( removed[i] ) docFrag.appendChild( removed[i].detach() );

				if ( frag ) docFrag.appendChild( frag.detach() );
				else {
					this.iterations[i].render( docFrag );
				}
			}
		}

		// append any leftovers
		if ( this.rendered ) {
			for ( i = len; i < oldLen; i++ ) {
				if ( removed[i] ) docFrag.appendChild( removed[i].detach() );
			}

			if ( docFrag.childNodes.length ) {
				parentNode.insertBefore( docFrag, this.owner.findNextNode() );
			}
		}

		// trigger removal on old nodes
		Object.keys( removed ).forEach( k => removed[k].unbind().unrender( true ) );

		this.iterations.forEach( update );

		this.pendingNewIndices = null;

		this.shuffled();
	}
}

RepeatedFragment.prototype.getContext = getContext;

// find the topmost delegate
function findDelegate ( start ) {
	let el = start;
	let delegate = start;

	while ( el ) {
		if ( el.delegate ) delegate = el;
		el = el.parent;
	}

	return delegate;
}

function isEmpty ( value ) {
	return !value ||
	       ( Array.isArray( value ) && value.length === 0 ) ||
		   ( isObject( value ) && Object.keys( value ).length === 0 );
}

function getType ( value, hasIndexRef ) {
	if ( hasIndexRef || Array.isArray( value ) ) return SECTION_EACH;
	if ( isObject( value ) || typeof value === 'function' ) return SECTION_IF_WITH;
	if ( value === undefined ) return null;
	return SECTION_IF;
}

class Section extends MustacheContainer {
	constructor ( options ) {
		super( options );

		this.sectionType = options.template.n || null;
		this.templateSectionType = this.sectionType;
		this.subordinate = options.template.l === 1;
		this.fragment = null;
	}

	bind () {
		super.bind();

		if ( this.subordinate ) {
			this.sibling = this.parentFragment.items[ this.parentFragment.items.indexOf( this ) - 1 ];
			this.sibling.nextSibling = this;
		}

		// if we managed to bind, we need to create children
		if ( this.model ) {
			this.dirty = true;
			this.update();
		} else if ( this.sectionType && this.sectionType === SECTION_UNLESS && ( !this.sibling || !this.sibling.isTruthy() ) ) {
			this.fragment = new Fragment({
				owner: this,
				template: this.template.f
			}).bind();
		}
	}

	detach () {
		const frag = this.fragment || this.detached;
		return frag ? frag.detach() : super.detach();
	}

	isTruthy () {
		if ( this.subordinate && this.sibling.isTruthy() ) return true;
		const value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
		return !!value && ( this.templateSectionType === SECTION_IF_WITH || !isEmpty( value ) );
	}

	rebind ( next, previous, safe ) {
		if ( super.rebind( next, previous, safe ) ) {
			if ( this.fragment && this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS ) {
				this.fragment.rebind( next );
			}
		}
	}

	render ( target, occupants ) {
		this.rendered = true;
		if ( this.fragment ) this.fragment.render( target, occupants );
	}

	shuffle ( newIndices ) {
		if ( this.fragment && this.sectionType === SECTION_EACH ) {
			this.fragment.shuffle( newIndices );
		}
	}

	unbind () {
		super.unbind();
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && this.fragment ) this.fragment.unrender( shouldDestroy );
		this.rendered = false;
	}

	update () {
		if ( !this.dirty ) return;

		if ( this.fragment && this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS ) {
			this.fragment.context = this.model;
		}

		if ( !this.model && this.sectionType !== SECTION_UNLESS ) return;

		this.dirty = false;

		const value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
		const siblingFalsey = !this.subordinate || !this.sibling.isTruthy();
		const lastType = this.sectionType;

		// watch for switching section types
		if ( this.sectionType === null || this.templateSectionType === null ) this.sectionType = getType( value, this.template.i );
		if ( lastType && lastType !== this.sectionType && this.fragment ) {
			if ( this.rendered ) {
				this.fragment.unbind().unrender( true );
			}

			this.fragment = null;
		}

		let newFragment;

		const fragmentShouldExist = this.sectionType === SECTION_EACH || // each always gets a fragment, which may have no iterations
		                            this.sectionType === SECTION_WITH || // with (partial context) always gets a fragment
		                            ( siblingFalsey && ( this.sectionType === SECTION_UNLESS ? !this.isTruthy() : this.isTruthy() ) ); // if, unless, and if-with depend on siblings and the condition

		if ( fragmentShouldExist ) {
			if ( !this.fragment ) this.fragment = this.detached;

			if ( this.fragment ) {
				// check for detached fragment
				if ( this.detached ) {
					attach( this, this.fragment );
					this.detached = false;
					this.rendered = true;
				}

				if ( !this.fragment.bound ) this.fragment.bind( this.model );
				this.fragment.update();
			} else {
				if ( this.sectionType === SECTION_EACH ) {
					newFragment = new RepeatedFragment({
						owner: this,
						template: this.template.f,
						indexRef: this.template.i
					}).bind( this.model );
				} else {
					// only with and if-with provide context - if and unless do not
					const context = this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS ? this.model : null;
					newFragment = new Fragment({
						owner: this,
						template: this.template.f
					}).bind( context );
				}
			}
		} else {
			if ( this.fragment && this.rendered ) {
				if ( keep !== true ) {
					this.fragment.unbind().unrender( true );
				} else {
					this.unrender( false );
					this.detached = this.fragment;
					runloop.promise().then( () => {
						if ( this.detached ) this.detach();
					});
				}
			} else if ( this.fragment ) {
				this.fragment.unbind();
			}

			this.fragment = null;
		}

		if ( newFragment ) {
			if ( this.rendered ) {
				attach( this, newFragment );
			}

			this.fragment = newFragment;
		}

		if ( this.nextSibling ) {
			this.nextSibling.dirty = true;
			this.nextSibling.update();
		}
	}
}

function attach ( section, fragment ) {
	const anchor = section.parentFragment.findNextNode( section );

	if ( anchor ) {
		const docFrag = createDocumentFragment();
		fragment.render( docFrag );

		anchor.parentNode.insertBefore( docFrag, anchor );
	} else {
		fragment.render( section.parentFragment.findParentNode() );
	}
}

class Select extends Element {
	constructor ( options ) {
		super( options );
		this.options = [];
	}

	foundNode ( node ) {
		if ( this.binding ) {
			const selectedOptions = getSelectedOptions( node );

			if ( selectedOptions.length > 0 ) {
				this.selectedOptions = selectedOptions;
			}
		}
	}

	render ( target, occupants ) {
		super.render( target, occupants );
		this.sync();

		const node = this.node;

		let i = node.options.length;
		while ( i-- ) {
			node.options[i].defaultSelected = node.options[i].selected;
		}

		this.rendered = true;
	}

	sync () {
		const selectNode = this.node;

		if ( !selectNode ) return;

		const options = toArray( selectNode.options );

		if ( this.selectedOptions ) {
			options.forEach( o => {
				if ( this.selectedOptions.indexOf( o ) >= 0 ) o.selected = true;
				else o.selected = false;
			});
			this.binding.setFromNode( selectNode );
			delete this.selectedOptions;
			return;
		}

		const selectValue = this.getAttribute( 'value' );
		const isMultiple = this.getAttribute( 'multiple' );
		const array = isMultiple && Array.isArray( selectValue );

		// If the <select> has a specified value, that should override
		// these options
		if ( selectValue !== undefined ) {
			let optionWasSelected;

			options.forEach( o => {
				const optionValue = o._ractive ? o._ractive.value : o.value;
				const shouldSelect = isMultiple ?
					array && this.valueContains( selectValue, optionValue ) :
					this.compare( selectValue, optionValue );

				if ( shouldSelect ) {
					optionWasSelected = true;
				}

				o.selected = shouldSelect;
			});

			if ( !optionWasSelected && !isMultiple ) {
				if ( this.binding ) {
					this.binding.forceUpdate();
				}
			}
		}

		// Otherwise the value should be initialised according to which
		// <option> element is selected, if twoway binding is in effect
		else if ( this.binding ) {
			this.binding.forceUpdate();
		}
	}
	valueContains ( selectValue, optionValue ) {
		let i = selectValue.length;
		while ( i-- ) {
			if ( this.compare( optionValue, selectValue[i] ) ) return true;
		}
	}
	compare (optionValue, selectValue) {
		const comparator = this.getAttribute( 'value-comparator' );
		if ( comparator ) {
			if (typeof comparator === 'function') {
				return comparator( selectValue, optionValue );
			}
			if ( selectValue && optionValue ) {
				return selectValue[comparator] == optionValue[comparator];
			}
		}
		return selectValue == optionValue;
	}
	update () {
		const dirty = this.dirty;
		super.update();
		if ( dirty ) {
			this.sync();
		}
	}
}

class Textarea extends Input {
	constructor( options ) {
		const template = options.template;

		options.deferContent = true;

		super( options );

		// check for single interpolator binding
		if ( !this.attributeByName.value ) {
			if ( template.f && isBindable( { template } ) ) {
				( this.attributes || ( this.attributes = [] ) ).push( createItem( {
					owner: this,
					template: { t: ATTRIBUTE, f: template.f, n: 'value' },
					parentFragment: this.parentFragment
				} ) );
			} else {
				this.fragment = new Fragment({ owner: this, cssIds: null, template: template.f });
			}
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;

			if ( this.rendered && !this.binding && this.fragment ) {
				runloop.scheduleTask( () => {
					this.dirty = false;
					this.node.value = this.fragment.toString();
				});
			}

			this.parentFragment.bubble(); // default behaviour
		}
	}
}

class Text extends Item {
	constructor ( options ) {
		super( options );
		this.type = TEXT;
	}

	detach () {
		return detachNode( this.node );
	}

	firstNode () {
		return this.node;
	}

	render ( target, occupants ) {
		if ( inAttributes() ) return;
		this.rendered = true;

		progressiveText( this, target, occupants, this.template );
	}

	toString ( escape ) {
		return escape ? escapeHtml( this.template ) : this.template;
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && shouldDestroy ) this.detach();
		this.rendered = false;
	}

	valueOf () {
		return this.template;
	}
}

const proto$4 = Text.prototype;
proto$4.bind = proto$4.unbind = proto$4.update = noop;

let visible;
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

let prefix;

/* istanbul ignore next */
if ( !isClient ) {
	prefix = null;
} else {
	const prefixCache = {};
	const testStyle = createElement( 'div' ).style;

	// technically this also normalizes on hyphenated styles as well
	prefix = function ( prop ) {
		if ( !prefixCache[ prop ] ) {
			const name = hyphenateCamel( prop );

			if ( testStyle[ prop ] !== undefined ) {
				prefixCache[ prop ] = name;
			}

			/* istanbul ignore next */
			else {
				// test vendors...
				let i = vendors.length;
				while ( i-- ) {
					const vendor = `-${vendors[i]}-${name}`;
					if ( testStyle[ vendor ] !== undefined ) {
						prefixCache[ prop ] = vendor;
						break;
					}
				}
			}
		}

		return prefixCache[ prop ];
	};
}

var prefix$1 = prefix;

const vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );

var hyphenate = function ( str ) {
	/* istanbul ignore next */
	if ( !str ) return ''; // edge case

	/* istanbul ignore next */
	if ( vendorPattern.test( str ) ) str = '-' + str;

	return str.replace( /[A-Z]/g, match => '-' + match.toLowerCase() );
};

let createTransitions;

if ( !isClient ) {
	createTransitions = null;
} else {
	const testStyle = createElement( 'div' ).style;
	const linear = x => x;

	const canUseCssTransitions = {};
	const cannotUseCssTransitions = {};

	// determine some facts about our environment
	let TRANSITION;
	let TRANSITIONEND;
	let CSS_TRANSITIONS_ENABLED;
	let TRANSITION_DURATION;
	let TRANSITION_PROPERTY;
	let TRANSITION_TIMING_FUNCTION;

	if ( testStyle.transition !== undefined ) {
		TRANSITION = 'transition';
		TRANSITIONEND = 'transitionend';
		CSS_TRANSITIONS_ENABLED = true;
	} else if ( testStyle.webkitTransition !== undefined ) {
		TRANSITION = 'webkitTransition';
		TRANSITIONEND = 'webkitTransitionEnd';
		CSS_TRANSITIONS_ENABLED = true;
	} else {
		CSS_TRANSITIONS_ENABLED = false;
	}

	if ( TRANSITION ) {
		TRANSITION_DURATION = TRANSITION + 'Duration';
		TRANSITION_PROPERTY = TRANSITION + 'Property';
		TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
	}

	createTransitions = function ( t, to, options, changedProperties, resolve ) {

		// Wait a beat (otherwise the target styles will be applied immediately)
		// TODO use a fastdom-style mechanism?
		setTimeout( () => {
			let jsTransitionsComplete;
			let cssTransitionsComplete;
			let cssTimeout; // eslint-disable-line prefer-const

			function transitionDone () { clearTimeout( cssTimeout ); }

			function checkComplete () {
				if ( jsTransitionsComplete && cssTransitionsComplete ) {
					t.unregisterCompleteHandler( transitionDone );
					// will changes to events and fire have an unexpected consequence here?
					t.ractive.fire( t.name + ':end', t.node, t.isIntro );
					resolve();
				}
			}

			// this is used to keep track of which elements can use CSS to animate
			// which properties
			const hashPrefix = ( t.node.namespaceURI || '' ) + t.node.tagName;

			// need to reset transition properties
			const style = t.node.style;
			const previous = {
				property: style[ TRANSITION_PROPERTY ],
				timing: style[ TRANSITION_TIMING_FUNCTION ],
				duration: style[ TRANSITION_DURATION ]
			};

			function transitionEndHandler ( event ) {
				const index = changedProperties.indexOf( event.propertyName );

				if ( index !== -1 ) {
					changedProperties.splice( index, 1 );
				}

				if ( changedProperties.length ) {
					// still transitioning...
					return;
				}

				clearTimeout( cssTimeout );
				cssTransitionsDone();
			}

			function cssTransitionsDone () {
				style[ TRANSITION_PROPERTY ] = previous.property;
				style[ TRANSITION_TIMING_FUNCTION ] = previous.duration;
				style[ TRANSITION_DURATION ] = previous.timing;

				t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );

				cssTransitionsComplete = true;
				checkComplete();
			}

			t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );

			// safety net in case transitionend never fires
			cssTimeout = setTimeout( () => {
				changedProperties = [];
				cssTransitionsDone();
			}, options.duration + ( options.delay || 0 ) + 50 );
			t.registerCompleteHandler( transitionDone );

			style[ TRANSITION_PROPERTY ] = changedProperties.join( ',' );
			const easingName = hyphenate( options.easing || 'linear' );
			style[ TRANSITION_TIMING_FUNCTION ] = easingName;
			const cssTiming = style[ TRANSITION_TIMING_FUNCTION ] === easingName;
			style[ TRANSITION_DURATION ] = ( options.duration / 1000 ) + 's';

			setTimeout( () => {
				let i = changedProperties.length;
				let hash;
				let originalValue = null;
				let index;
				const propertiesToTransitionInJs = [];
				let prop;
				let suffix;
				let interpolator;

				while ( i-- ) {
					prop = changedProperties[i];
					hash = hashPrefix + prop;

					if ( cssTiming && CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[ hash ] ) {
						const initial = style[ prop ];
						style[ prop ] = to[ prop ];

						// If we're not sure if CSS transitions are supported for
						// this tag/property combo, find out now
						if ( !( hash in canUseCssTransitions ) ) {
							originalValue = t.getStyle( prop );

							// if this property is transitionable in this browser,
							// the current style will be different from the target style
							canUseCssTransitions[ hash ] = ( t.getStyle( prop ) != to[ prop ] );
							cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];

							// Reset, if we're going to use timers after all
							if ( cannotUseCssTransitions[ hash ] ) {
								style[ prop ] = initial;
							}
						}
					}

					if ( !cssTiming || !CSS_TRANSITIONS_ENABLED || cannotUseCssTransitions[ hash ] ) {
						// we need to fall back to timer-based stuff
						if ( originalValue === null ) originalValue = t.getStyle( prop );

						// need to remove this from changedProperties, otherwise transitionEndHandler
						// will get confused
						index = changedProperties.indexOf( prop );
						if ( index === -1 ) {
							warnIfDebug( 'Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!', { node: t.node });
						} else {
							changedProperties.splice( index, 1 );
						}

						// TODO Determine whether this property is animatable at all

						suffix = /[^\d]*$/.exec( originalValue )[0];
						interpolator = interpolate( parseFloat( originalValue ), parseFloat( to[ prop ] ) );

						// ...then kick off a timer-based transition
						if ( interpolator ) {
							propertiesToTransitionInJs.push({
								name: prop,
								interpolator,
								suffix
							});
						} else {
							style[ prop ] = to[ prop ];
						}

						originalValue = null;
					}
				}

				// javascript transitions
				if ( propertiesToTransitionInJs.length ) {
					let easing;

					if ( typeof options.easing === 'string' ) {
						easing = t.ractive.easing[ options.easing ];

						if ( !easing ) {
							warnOnceIfDebug( missingPlugin( options.easing, 'easing' ) );
							easing = linear;
						}
					} else if ( typeof options.easing === 'function' ) {
						easing = options.easing;
					} else {
						easing = linear;
					}

					new Ticker({
						duration: options.duration,
						easing,
						step ( pos ) {
							let i = propertiesToTransitionInJs.length;
							while ( i-- ) {
								const prop = propertiesToTransitionInJs[i];
								style[ prop.name ] = prop.interpolator( pos ) + prop.suffix;
							}
						},
						complete () {
							jsTransitionsComplete = true;
							checkComplete();
						}
					});
				} else {
					jsTransitionsComplete = true;
				}

				if ( changedProperties.length ) {
					style[ TRANSITION_PROPERTY ] = changedProperties.join( ',' );
				} else {
					style[ TRANSITION_PROPERTY ] = 'none';

					// We need to cancel the transitionEndHandler, and deal with
					// the fact that it will never fire
					t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
					cssTransitionsComplete = true;
					checkComplete();
				}
			}, 0 );
		}, options.delay || 0 );
	};
}

var createTransitions$1 = createTransitions;

const getComputedStyle = win && win.getComputedStyle;
const resolved = Promise.resolve();

const names = {
	t0: 'intro-outro',
	t1: 'intro',
	t2: 'outro'
};

class Transition {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.ractive = this.owner.ractive;
		this.template = options.template;
		this.parentFragment = options.parentFragment;
		this.options = options;
		this.onComplete = [];
	}

	animateStyle ( style, value, options ) {
		if ( arguments.length === 4 ) {
			throw new Error( 't.animateStyle() returns a promise - use .then() instead of passing a callback' );
		}

		// Special case - page isn't visible. Don't animate anything, because
		// that way you'll never get CSS transitionend events
		if ( !visible ) {
			this.setStyle( style, value );
			return resolved;
		}

		let to;

		if ( typeof style === 'string' ) {
			to = {};
			to[ style ] = value;
		} else {
			to = style;

			// shuffle arguments
			options = value;
		}

		return new Promise( fulfil => {
			// Edge case - if duration is zero, set style synchronously and complete
			if ( !options.duration ) {
				this.setStyle( to );
				fulfil();
				return;
			}

			// Get a list of the properties we're animating
			const propertyNames = Object.keys( to );
			const changedProperties = [];

			// Store the current styles
			const computedStyle = getComputedStyle( this.node );

			let i = propertyNames.length;
			while ( i-- ) {
				const prop = propertyNames[i];
				const name = prefix$1( prop );

				const current = computedStyle[ prefix$1( prop ) ];

				// record the starting points
				const init = this.node.style[name];
				if ( !( name in this.originals ) ) this.originals[ name ] = this.node.style[ name ];
				this.node.style[ name ] = to[ prop ];
				this.targets[ name ] = this.node.style[ name ];
				this.node.style[ name ] = init;

				// we need to know if we're actually changing anything
				if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
					changedProperties.push( name );

					// if we happened to prefix, make sure there is a properly prefixed value
					to[ name ] = to[ prop ];

					// make the computed style explicit, so we can animate where
					// e.g. height='auto'
					this.node.style[ name ] = current;
				}
			}

			// If we're not actually changing anything, the transitionend event
			// will never fire! So we complete early
			if ( !changedProperties.length ) {
				fulfil();
				return;
			}

			createTransitions$1( this, to, options, changedProperties, fulfil );
		});
	}

	bind () {
		const options = this.options;
		const type = options.template && options.template.v;
		if ( type ) {
			if ( type === 't0' || type === 't1' ) this.element.intro = this;
			if ( type === 't0' || type === 't2' ) this.element.outro = this;
			this.eventName = names[ type ];
		}

		const ractive = this.owner.ractive;

		this.name = options.name || options.template.n;

		if ( options.params ) {
			this.params = options.params;
		}

		if ( typeof this.name === 'function' ) {
			this._fn = this.name;
			this.name = this._fn.name;
		} else {
			this._fn = findInViewHierarchy( 'transitions', ractive, this.name );
		}

		if ( !this._fn ) {
			warnOnceIfDebug( missingPlugin( this.name, 'transition' ), { ractive });
		}

		setupArgsFn( this, options.template );
	}

	getParams () {
		if ( this.params ) return this.params;

		// get expression args if supplied
		if ( this.fn ) {
			const values = resolveArgs( this, this.template, this.parentFragment ).map( model => {
				if ( !model ) return undefined;

				return model.get();
			});
			return this.fn.apply( this.ractive, values );
		}
	}

	getStyle ( props ) {
		const computedStyle = getComputedStyle( this.node );

		if ( typeof props === 'string' ) {
			return computedStyle[ prefix$1( props ) ];
		}

		if ( !Array.isArray( props ) ) {
			throw new Error( 'Transition$getStyle must be passed a string, or an array of strings representing CSS properties' );
		}

		const styles = {};

		let i = props.length;
		while ( i-- ) {
			const prop = props[i];
			let value = computedStyle[ prefix$1( prop ) ];

			if ( value === '0px' ) value = 0;
			styles[ prop ] = value;
		}

		return styles;
	}

	processParams ( params, defaults ) {
		if ( typeof params === 'number' ) {
			params = { duration: params };
		}

		else if ( typeof params === 'string' ) {
			if ( params === 'slow' ) {
				params = { duration: 600 };
			} else if ( params === 'fast' ) {
				params = { duration: 200 };
			} else {
				params = { duration: 400 };
			}
		} else if ( !params ) {
			params = {};
		}

		return Object.assign( {}, defaults, params );
	}

	registerCompleteHandler ( fn ) {
		addToArray( this.onComplete, fn );
	}

	setStyle ( style, value ) {
		if ( typeof style === 'string' ) {
			const name = prefix$1(  style );
			if ( !this.originals.hasOwnProperty( name ) ) this.originals[ name ] = this.node.style[ name ];
			this.node.style[ name ] = value;
			this.targets[ name ] = this.node.style[ name ];
		}

		else {
			let prop;
			for ( prop in style ) {
				if ( style.hasOwnProperty( prop ) ) {
					this.setStyle( prop, style[ prop ] );
				}
			}
		}

		return this;
	}

	shouldFire ( type ) {
		if ( !this.ractive.transitionsEnabled ) return false;

		// check for noIntro and noOutro cases, which only apply when the owner ractive is rendering and unrendering, respectively
		if ( type === 'intro' && this.ractive.rendering && nearestProp( 'noIntro', this.ractive, true ) ) return false;
		if ( type === 'outro' && this.ractive.unrendering && nearestProp( 'noOutro', this.ractive, false ) ) return false;

		const params = this.getParams(); // this is an array, the params object should be the first member
		// if there's not a parent element, this can't be nested, so roll on
		if ( !this.element.parent ) return true;

		// if there is a local param, it takes precedent
		if ( params && params[0] && isObject(params[0]) && 'nested' in params[0] ) {
			if ( params[0].nested !== false ) return true;
		} else { // use the nearest instance setting
			// find the nearest instance that actually has a nested setting
			if ( nearestProp( 'nestedTransitions', this.ractive ) !== false ) return true;
		}

		// check to see if this is actually a nested transition
		let el = this.element.parent;
		while ( el ) {
			if ( el[type] && el[type].starting ) return false;
			el = el.parent;
		}

		return true;
	}

	start () {
		const node = this.node = this.element.node;
		const originals = this.originals = {};  //= node.getAttribute( 'style' );
		const targets = this.targets = {};

		let completed;
		const args = this.getParams();

		// create t.complete() - we don't want this on the prototype,
		// because we don't want `this` silliness when passing it as
		// an argument
		this.complete = noReset => {
			this.starting = false;
			if ( completed ) {
				return;
			}

			this.onComplete.forEach( fn => fn() );
			if ( !noReset && this.isIntro ) {
				for ( const k in targets ) {
					if ( node.style[ k ] === targets[ k ] ) node.style[ k ] = originals[ k ];
				}
			}

			this._manager.remove( this );

			completed = true;
		};

		// If the transition function doesn't exist, abort
		if ( !this._fn ) {
			this.complete();
			return;
		}

		const promise = this._fn.apply( this.ractive, [ this ].concat( args ) );
		if ( promise ) promise.then( this.complete );
	}

	toString () { return ''; }

	unbind () {
		if ( !this.element.attributes.unbinding ) {
			const type = this.options && this.options.template && this.options.template.v;
			if ( type === 't0' || type === 't1' ) this.element.intro = null;
			if ( type === 't0' || type === 't2' ) this.element.outro = null;
		}
	}

	unregisterCompleteHandler ( fn ) {
		removeFromArray( this.onComplete, fn );
	}
}

const proto$5 = Transition.prototype;
proto$5.destroyed = proto$5.render = proto$5.unrender = proto$5.update = noop;

function nearestProp ( prop, ractive, rendering ) {
	let instance = ractive;
	while ( instance ) {
		if ( instance.hasOwnProperty( prop ) && ( rendering === undefined || rendering ? instance.rendering : instance.unrendering ) ) return instance[ prop ];
		instance = instance.component && instance.component.ractive;
	}

	return ractive[ prop ];
}

const elementCache = {};

let ieBug;
let ieBlacklist;

try {
	createElement( 'table' ).innerHTML = 'foo';
} catch /* istanbul ignore next */ ( err ) {
	ieBug = true;

	ieBlacklist = {
		TABLE:  [ '<table class="x">', '</table>' ],
		THEAD:  [ '<table><thead class="x">', '</thead></table>' ],
		TBODY:  [ '<table><tbody class="x">', '</tbody></table>' ],
		TR:     [ '<table><tr class="x">', '</tr></table>' ],
		SELECT: [ '<select class="x">', '</select>' ]
	};
}

var insertHtml = function ( html$$1, node ) {
	const nodes = [];

	// render 0 and false
	if ( html$$1 == null || html$$1 === '' ) return nodes;

	let container;
	let wrapper;
	let selectedOption;

	/* istanbul ignore if */
	if ( ieBug && ( wrapper = ieBlacklist[ node.tagName ] ) ) {
		container = element( 'DIV' );
		container.innerHTML = wrapper[0] + html$$1 + wrapper[1];
		container = container.querySelector( '.x' );

		if ( container.tagName === 'SELECT' ) {
			selectedOption = container.options[ container.selectedIndex ];
		}
	}

	else if ( node.namespaceURI === svg$1 ) {
		container = element( 'DIV' );
		container.innerHTML = '<svg class="x">' + html$$1 + '</svg>';
		container = container.querySelector( '.x' );
	}

	else if ( node.tagName === 'TEXTAREA' ) {
		container = createElement( 'div' );

		if ( typeof container.textContent !== 'undefined' ) {
			container.textContent = html$$1;
		} else {
			container.innerHTML = html$$1;
		}
	}

	else {
		container = element( node.tagName );
		container.innerHTML = html$$1;

		if ( container.tagName === 'SELECT' ) {
			selectedOption = container.options[ container.selectedIndex ];
		}
	}

	let child;
	while ( child = container.firstChild ) {
		nodes.push( child );
		container.removeChild( child );
	}

	// This is really annoying. Extracting <option> nodes from the
	// temporary container <select> causes the remaining ones to
	// become selected. So now we have to deselect them. IE8, you
	// amaze me. You really do
	// ...and now Chrome too
	let i;
	if ( node.tagName === 'SELECT' ) {
		i = nodes.length;
		while ( i-- ) {
			if ( nodes[i] !== selectedOption ) {
				nodes[i].selected = false;
			}
		}
	}

	return nodes;
};

function element ( tagName ) {
	return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
}

class Triple extends Mustache {
	constructor ( options ) {
		super( options );
	}

	detach () {
		const docFrag = createDocumentFragment();
		if ( this.nodes ) this.nodes.forEach( node => docFrag.appendChild( node ) );
		return docFrag;
	}

	find ( selector ) {
		const len = this.nodes.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const node = this.nodes[i];

			if ( node.nodeType !== 1 ) continue;

			if ( matches( node, selector ) ) return node;

			const queryResult = node.querySelector( selector );
			if ( queryResult ) return queryResult;
		}

		return null;
	}

	findAll ( selector, options ) {
		const { result } = options;
		const len = this.nodes.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const node = this.nodes[i];

			if ( node.nodeType !== 1 ) continue;

			if ( matches( node, selector ) ) result.push( node );

			const queryAllResult = node.querySelectorAll( selector );
			if ( queryAllResult ) {
				result.push.apply( result, queryAllResult );
			}
		}
	}

	findComponent () {
		return null;
	}

	firstNode () {
		return this.rendered && this.nodes[0];
	}

	render ( target, occupants ) {
		const parentNode = this.parentFragment.findParentNode();

		if ( !this.nodes ) {
			const html = this.model ? this.model.get() : '';
			this.nodes = insertHtml( html, this.parentFragment.findParentNode(), target );
		}

		let nodes = this.nodes;
		let anchor = this.parentFragment.findNextNode( this );

		// progressive enhancement
		if ( occupants ) {
			let i = -1;
			let next;

			// start with the first node that should be rendered
			while ( occupants.length && ( next = this.nodes[ i + 1 ] ) ) {
				let n;
				// look through the occupants until a matching node is found
				while ( n = occupants.shift() ) {
					const t = n.nodeType;

					if ( t === next.nodeType && ( ( t === 1 && n.outerHTML === next.outerHTML ) || ( ( t === 3 || t === 8 ) && n.nodeValue === next.nodeValue ) ) ) {
						this.nodes.splice( ++i, 1, n ); // replace the generated node with the existing one
						break;
					} else {
						target.removeChild( n ); // remove the non-matching existing node
					}
				}
			}

			if ( i >= 0 ) {
				// update the list of remaining nodes to attach, excluding any that were replaced by existing nodes
				nodes = this.nodes.slice( i );
			}

			// update the anchor to be the next occupant
			if ( occupants.length ) anchor = occupants[0];
		}

		// attach any remainging nodes to the parent
		if ( nodes.length ) {
			const frag = createDocumentFragment();
			nodes.forEach( n => frag.appendChild( n ) );

			if ( anchor ) {
				anchor.parentNode.insertBefore( frag, anchor );
			} else {
				parentNode.appendChild( frag );
			}
		}

		this.rendered = true;
	}

	toString () {
		let value = this.model && this.model.get();
		value = value != null ? '' + value : '';

		return inAttribute() ? decodeCharacterReferences( value ) : value;
	}

	unrender () {
		if ( this.nodes ) this.nodes.forEach( node => {
			// defer detachment until all relevant outros are done
			runloop.detachWhenReady( { node, detach() { detachNode( node ); } } );
		});
		this.rendered = false;
		this.nodes = null;
	}

	update () {
		if ( this.rendered && this.dirty ) {
			this.dirty = false;

			this.unrender();
			this.render();
		} else {
			// make sure to reset the dirty flag even if not rendered
			this.dirty = false;
		}
	}
}

// finds the component constructor in the registry or view hierarchy registries
function getComponentConstructor ( ractive, name ) {
	const instance = findInstance( 'components', ractive, name );
	let Component;

	if ( instance ) {
		Component = instance.components[ name ];

		// best test we have for not Ractive.extend
		if ( Component && !Component.Parent ) {
			// function option, execute and store for reset
			const fn = Component.bind( instance );
			fn.isOwner = instance.components.hasOwnProperty( name );
			Component = fn();

			if ( !Component ) {
				warnIfDebug( noRegistryFunctionReturn, name, 'component', 'component', { ractive });
				return;
			}

			if ( typeof Component === 'string' ) {
				// allow string lookup
				Component = getComponentConstructor( ractive, Component );
			}

			Component._fn = fn;
			instance.components[ name ] = Component;
		}
	}

	return Component;
}

//import Yielder from './Yielder';
const constructors = {};
constructors[ ALIAS ] = Alias;
constructors[ ANCHOR ] = Component;
constructors[ DOCTYPE ] = Doctype;
constructors[ INTERPOLATOR ] = Interpolator;
constructors[ PARTIAL ] = Partial;
constructors[ SECTION ] = Section;
constructors[ TRIPLE ] = Triple;
constructors[ YIELDER ] = Partial;

constructors[ ATTRIBUTE ] = Attribute;
constructors[ BINDING_FLAG ] = BindingFlag;
constructors[ DECORATOR ] = Decorator;
constructors[ EVENT ] = EventDirective;
constructors[ TRANSITION ] = Transition;

const specialElements = {
	doctype: Doctype,
	form: Form,
	input: Input,
	option: Option,
	select: Select,
	textarea: Textarea
};

function createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options );
	}

	if ( options.template.t === ELEMENT ) {
		// could be component or element
		const ComponentConstructor = getComponentConstructor( options.parentFragment.ractive, options.template.e );
		if ( ComponentConstructor ) {
			return new Component( options, ComponentConstructor );
		}

		const tagName = options.template.e.toLowerCase();

		const ElementConstructor = specialElements[ tagName ] || Element;
		return new ElementConstructor( options );
	}

	let Item;

	// component mappings are a special case of attribute
	if ( options.template.t === ATTRIBUTE ) {
		let el = options.owner;
		if ( !el || ( el.type !== ANCHOR && el.type !== COMPONENT && el.type !== ELEMENT ) ) {
			el = findElement( options.parentFragment );
		}
		options.element = el;

		Item = el.type === COMPONENT || el.type === ANCHOR ? Mapping : Attribute;
	} else {
		Item = constructors[ options.template.t ];
	}

	if ( !Item ) throw new Error( `Unrecognised item type ${options.template.t}` );

	return new Item( options );
}

// TODO all this code needs to die
function processItems ( items, values, guid, counter = 0 ) {
	return items.map( item => {
		if ( item.type === TEXT ) {
			return item.template;
		}

		if ( item.fragment ) {
			if ( item.fragment.iterations ) {
				return item.fragment.iterations.map( fragment => {
					return processItems( fragment.items, values, guid, counter );
				}).join( '' );
			} else {
				return processItems( item.fragment.items, values, guid, counter );
			}
		}

		const placeholderId = `${guid}-${counter++}`;
		const model = item.model || item.newModel;

		values[ placeholderId ] = model ?
			model.wrapper ?
				model.wrapperValue :
				model.get() :
			undefined;

		return '${' + placeholderId + '}';
	}).join( '' );
}

function unrenderAndDestroy$1 ( item ) {
	item.unrender( true );
}

class Fragment {
	constructor ( options ) {
		this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute

		this.isRoot = !options.owner.parentFragment;
		this.parent = this.isRoot ? null : this.owner.parentFragment;
		this.ractive = options.ractive || ( this.isRoot ? options.owner : this.parent.ractive );

		this.componentParent = ( this.isRoot && this.ractive.component ) ? this.ractive.component.parentFragment : null;
		this.delegate = ( this.parent ? this.parent.delegate : ( this.componentParent && this.componentParent.delegate ) ) ||
			( this.owner.containerFragment && this.owner.containerFragment.delegate );

		this.context = null;
		this.rendered = false;

		// encapsulated styles should be inherited until they get applied by an element
		if ( 'cssIds' in options ) {
			this.cssIds = options.cssIds && options.cssIds.length && options.cssIds;
		} else {
			this.cssIds = this.parent ? this.parent.cssIds : null;
		}

		this.dirty = false;
		this.dirtyValue = true; // used for attribute values

		this.template = options.template || [];
		this.createItems();
	}

	bind ( context ) {
		this.context = context;
		this.items.forEach( bind );
		this.bound = true;

		// in rare cases, a forced resolution (or similar) will cause the
		// fragment to be dirty before it's even finished binding. In those
		// cases we update immediately
		if ( this.dirty ) this.update();

		return this;
	}

	bubble () {
		this.dirtyValue = true;

		if ( !this.dirty ) {
			this.dirty = true;

			if ( this.isRoot ) { // TODO encapsulate 'is component root, but not overall root' check?
				if ( this.ractive.component ) {
					this.ractive.component.bubble();
				} else if ( this.bound ) {
					runloop.addFragment( this );
				}
			} else {
				this.owner.bubble( this.index );
			}
		}
	}

	createItems () {
		// this is a hot code path
		const max = this.template.length;
		this.items = [];
		for ( let i = 0; i < max; i++ ) {
			this.items[i] = createItem({ parentFragment: this, template: this.template[i], index: i });
		}
	}

	destroyed () {
		this.items.forEach( destroyed );
	}

	detach () {
		const docFrag = createDocumentFragment();
		const xs = this.items;
		const len = xs.length;
		for ( let i = 0; i < len; i++ ) {
			docFrag.appendChild( xs[i].detach() );
		}
		return docFrag;
	}

	find ( selector, options ) {
		return findMap( this.items, i => i.find( selector, options ) );
	}

	findAll ( selector, options ) {
		if ( this.items ) {
			this.items.forEach( i => i.findAll && i.findAll( selector, options ) );
		}
	}

	findComponent ( name, options ) {
		return findMap( this.items, i => i.findComponent( name, options ) );
	}

	findAllComponents ( name, options ) {
		if ( this.items ) {
			this.items.forEach( i => i.findAllComponents && i.findAllComponents( name, options ) );
		}
	}

	findContext () {
		const base = findParentWithContext( this );
		if ( !base || !base.context ) return this.ractive.viewmodel;
		else return base.context;
	}

	findNextNode ( item ) {
		// search for the next node going forward
		if ( item ) {
			let it;
			for ( let i = item.index + 1; i < this.items.length; i++ ) {
				it = this.items[i];
				if ( !it || !it.firstNode ) continue;

				const node = it.firstNode( true );
				if ( node ) return node;
			}
		}

		// if this is the root fragment, and there are no more items,
		// it means we're at the end...
		if ( this.isRoot ) {
			if ( this.ractive.component ) {
				return this.ractive.component.parentFragment.findNextNode( this.ractive.component );
			}

			// TODO possible edge case with other content
			// appended to this.ractive.el?
			return null;
		}

		if ( this.parent ) return this.owner.findNextNode( this ); // the argument is in case the parent is a RepeatedFragment
	}

	findParentNode () {
		let fragment = this;

		do {
			if ( fragment.owner.type === ELEMENT ) {
				return fragment.owner.node;
			}

			if ( fragment.isRoot && !fragment.ractive.component ) { // TODO encapsulate check
				return fragment.ractive.el;
			}

			if ( fragment.owner.type === YIELDER ) {
				fragment = fragment.owner.containerFragment;
			} else {
				fragment = fragment.componentParent || fragment.parent; // TODO ugh
			}
		} while ( fragment );

		throw new Error( 'Could not find parent node' ); // TODO link to issue tracker
	}

	findRepeatingFragment () {
		let fragment = this;
		// TODO better check than fragment.parent.iterations
		while ( ( fragment.parent || fragment.componentParent ) && !fragment.isIteration ) {
			fragment = fragment.parent || fragment.componentParent;
		}

		return fragment;
	}

	firstNode ( skipParent ) {
		const node = findMap( this.items, i => i.firstNode( true ) );
		if ( node ) return node;
		if ( skipParent ) return null;

		return this.parent.findNextNode( this.owner );
	}

	rebind ( next ) {
		this.context = next;
	}

	render ( target, occupants ) {
		if ( this.rendered ) throw new Error( 'Fragment is already rendered!' );
		this.rendered = true;

		const xs = this.items;
		const len = xs.length;
		for ( let i = 0; i < len; i++ ) {
			xs[i].render( target, occupants );
		}
	}

	resetTemplate ( template ) {
		const wasBound = this.bound;
		const wasRendered = this.rendered;

		// TODO ensure transitions are disabled globally during reset

		if ( wasBound ) {
			if ( wasRendered ) this.unrender( true );
			this.unbind();
		}

		this.template = template;
		this.createItems();

		if ( wasBound ) {
			this.bind( this.context );

			if ( wasRendered ) {
				const parentNode = this.findParentNode();
				const anchor = this.findNextNode();

				if ( anchor ) {
					const docFrag = createDocumentFragment();
					this.render( docFrag );
					parentNode.insertBefore( docFrag, anchor );
				} else {
					this.render( parentNode );
				}
			}
		}
	}

	shuffled () {
		this.items.forEach( shuffled );
	}

	toString ( escape ) {
		return this.items.map( escape ? toEscapedString : toString$1 ).join( '' );
	}

	unbind () {
		this.context = null;
		this.items.forEach( unbind );
		this.bound = false;

		return this;
	}

	unrender ( shouldDestroy ) {
		this.items.forEach( shouldDestroy ? unrenderAndDestroy$1 : unrender );
		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			if ( !this.updating ) {
				this.dirty = false;
				this.updating = true;
				this.items.forEach( update );
				this.updating = false;
			} else if ( this.isRoot ) {
				runloop.addFragmentToRoot( this );
			}
		}
	}

	valueOf () {
		if ( this.items.length === 1 ) {
			return this.items[0].valueOf();
		}

		if ( this.dirtyValue ) {
			const values = {};
			const source = processItems( this.items, values, this.ractive._guid );
			const parsed = parseJSON( source, values );

			this.value = parsed ?
				parsed.value :
				this.toString();

			this.dirtyValue = false;
		}

		return this.value;
	}
}
Fragment.prototype.getContext = getContext;

function getChildQueue ( queue, ractive ) {
	return queue[ ractive._guid ] || ( queue[ ractive._guid ] = [] );
}

function fire ( hookQueue, ractive ) {
	const childQueue = getChildQueue( hookQueue.queue, ractive );

	hookQueue.hook.fire( ractive );

	// queue is "live" because components can end up being
	// added while hooks fire on parents that modify data values.
	while ( childQueue.length ) {
		fire( hookQueue, childQueue.shift() );
	}

	delete hookQueue.queue[ ractive._guid ];
}

class HookQueue {
	constructor ( event ) {
		this.hook = new Hook( event );
		this.inProcess = {};
		this.queue = {};
	}

	begin ( ractive ) {
		this.inProcess[ ractive._guid ] = true;
	}

	end ( ractive ) {
		const parent = ractive.parent;

		// If this is *isn't* a child of a component that's in process,
		// it should call methods or fire at this point
		if ( !parent || !this.inProcess[ parent._guid ] ) {
			fire( this, ractive );
		}
		// elsewise, handoff to parent to fire when ready
		else {
			getChildQueue( this.queue, parent ).push( ractive );
		}

		delete this.inProcess[ ractive._guid ];
	}
}

const configHook = new Hook( 'config' );
const initHook = new HookQueue( 'init' );

function initialise ( ractive, userOptions, options ) {
	Object.keys( ractive.viewmodel.computations ).forEach( key => {
		const computation = ractive.viewmodel.computations[ key ];

		if ( ractive.viewmodel.value.hasOwnProperty( key ) ) {
			computation.set( ractive.viewmodel.value[ key ] );
		}
	});

	// init config from Parent and options
	config.init( ractive.constructor, ractive, userOptions );

	configHook.fire( ractive );

	initHook.begin( ractive );

	const fragment = ractive.fragment = createFragment( ractive, options );
	if ( fragment ) fragment.bind( ractive.viewmodel );

	initHook.end( ractive );

	// general config done, set up observers
	subscribe( ractive, userOptions, 'observe' );

	if ( fragment ) {
		// render automatically ( if `el` is specified )
		const el = getElement( ractive.el || ractive.target );
		if ( el ) {
			const promise = ractive.render( el, ractive.append );

			if ( Ractive.DEBUG_PROMISES ) {
				promise.catch( err => {
					warnOnceIfDebug( 'Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;' );
					warnIfDebug( 'An error happened during rendering', { ractive });
					logIfDebug( err );

					throw err;
				});
			}
		}
	}
}

function createFragment ( ractive, options = {} ) {
	if ( ractive.template ) {
		const cssIds = [].concat( ractive.constructor._cssIds || [], options.cssIds || [] );

		return new Fragment({
			owner: ractive,
			template: ractive.template,
			cssIds
		});
	}
}

const renderHook = new Hook( 'render' );
const completeHook = new Hook( 'complete' );

function render$1 ( ractive, target, anchor, occupants ) {
	// set a flag to let any transitions know that this instance is currently rendering
	ractive.rendering = true;

	const promise = runloop.start();
	runloop.scheduleTask( () => renderHook.fire( ractive ), true );

	if ( ractive.fragment.rendered ) {
		throw new Error( 'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first' );
	}

	if ( ractive.destroyed ) {
		ractive.destroyed = false;
		ractive.fragment = createFragment( ractive ).bind( ractive.viewmodel );
	}

	anchor = getElement( anchor ) || ractive.anchor;

	ractive.el = ractive.target = target;
	ractive.anchor = anchor;

	// ensure encapsulated CSS is up-to-date
	if ( ractive.cssId ) applyCSS();

	if ( target ) {
		( target.__ractive_instances__ || ( target.__ractive_instances__ = [] ) ).push( ractive );

		if ( anchor ) {
			const docFrag = doc.createDocumentFragment();
			ractive.fragment.render( docFrag );
			target.insertBefore( docFrag, anchor );
		} else {
			ractive.fragment.render( target, occupants );
		}
	}

	runloop.end();
	ractive.rendering = false;

	return promise.then( () => {
		if (ractive.torndown) return;

		completeHook.fire( ractive );
	});
}

function Ractive$render ( target, anchor ) {
	if ( this.torndown ) {
		warnIfDebug( 'ractive.render() was called on a Ractive instance that was already torn down' );
		return Promise.resolve();
	}

	target = getElement( target ) || this.el;

	if ( !this.append && target ) {
		// Teardown any existing instances *before* trying to set up the new one -
		// avoids certain weird bugs
		const others = target.__ractive_instances__;
		if ( others ) others.forEach( teardown );

		// make sure we are the only occupants
		if ( !this.enhance ) {
			target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
		}
	}

	const occupants = this.enhance ? toArray( target.childNodes ) : null;
	const promise = render$1( this, target, anchor, occupants );

	if ( occupants ) {
		while ( occupants.length ) target.removeChild( occupants.pop() );
	}

	return promise;
}

const shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ];

const completeHook$1 = new Hook( 'complete' );
const resetHook = new Hook( 'reset' );
const renderHook$1 = new Hook( 'render' );
const unrenderHook = new Hook( 'unrender' );

function Ractive$reset ( data ) {
	data = data || {};

	if ( typeof data !== 'object' ) {
		throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
	}

	// TEMP need to tidy this up
	data = dataConfigurator.init( this.constructor, this, { data });

	const promise = runloop.start();

	// If the root object is wrapped, try and use the wrapper's reset value
	const wrapper = this.viewmodel.wrapper;
	if ( wrapper && wrapper.reset ) {
		if ( wrapper.reset( data ) === false ) {
			// reset was rejected, we need to replace the object
			this.viewmodel.set( data );
		}
	} else {
		this.viewmodel.set( data );
	}

	// reset config items and track if need to rerender
	const changes = config.reset( this );
	let rerender;

	let i = changes.length;
	while ( i-- ) {
		if ( shouldRerender.indexOf( changes[i] ) > -1 ) {
			rerender = true;
			break;
		}
	}

	if ( rerender ) {
		unrenderHook.fire( this );
		this.fragment.resetTemplate( this.template );
		renderHook$1.fire( this );
		completeHook$1.fire( this );
	}

	runloop.end();

	resetHook.fire( this, data );

	return promise;
}

function collect( source, name, attr, dest ) {
	source.forEach( item => {
		// queue to rerender if the item is a partial and the current name matches
		if ( item.type === PARTIAL && ( item.refName ===  name || item.name === name ) ) {
			item.inAttribute = attr;
			dest.push( item );
			return; // go no further
		}

		// if it has a fragment, process its items
		if ( item.fragment ) {
			collect( item.fragment.iterations || item.fragment.items, name, attr, dest );
		}

		// or if it is itself a fragment, process its items
		else if ( Array.isArray( item.items ) ) {
			collect( item.items, name, attr, dest );
		}

		// or if it is a component, step in and process its items
		else if ( item.type === COMPONENT && item.instance ) {
			// ...unless the partial is shadowed
			if ( item.instance.partials[ name ] ) return;
			collect( item.instance.fragment.items, name, attr, dest );
		}

		// if the item is an element, process its attributes too
		if ( item.type === ELEMENT ) {
			if ( Array.isArray( item.attributes ) ) {
				collect( item.attributes, name, true, dest );
			}
		}
	});
}

function forceResetTemplate ( partial ) {
	partial.forceResetTemplate();
}

var resetPartial = function ( name, partial ) {
	const collection = [];
	collect( this.fragment.items, name, false, collection );

	const promise = runloop.start();

	this.partials[ name ] = partial;
	collection.forEach( forceResetTemplate );

	runloop.end();

	return promise;
};

// TODO should resetTemplate be asynchronous? i.e. should it be a case
// of outro, update template, intro? I reckon probably not, since that
// could be achieved with unrender-resetTemplate-render. Also, it should
// conceptually be similar to resetPartial, which couldn't be async

function Ractive$resetTemplate ( template ) {
	templateConfigurator.init( null, this, { template });

	const transitionsEnabled = this.transitionsEnabled;
	this.transitionsEnabled = false;

	// Is this is a component, we need to set the `shouldDestroy`
	// flag, otherwise it will assume by default that a parent node
	// will be detached, and therefore it doesn't need to bother
	// detaching its own nodes
	const component = this.component;
	if ( component ) component.shouldDestroy = true;
	this.unrender();
	if ( component ) component.shouldDestroy = false;

	const promise = runloop.start();

	// remove existing fragment and create new one
	this.fragment.unbind().unrender( true );

	this.fragment = new Fragment({
		template: this.template,
		root: this,
		owner: this
	});

	const docFrag = createDocumentFragment();
	this.fragment.bind( this.viewmodel ).render( docFrag );

	// if this is a component, its el may not be valid, so find a
	// target based on the component container
	if ( component && !component.external ) {
		this.fragment.findParentNode().insertBefore( docFrag, component.findNextNode() );
	} else {
		this.el.insertBefore( docFrag, this.anchor );
	}

	runloop.end();

	this.transitionsEnabled = transitionsEnabled;

	return promise;
}

var reverse = makeArrayMethod( 'reverse' ).path;

function Ractive$set ( keypath, value, options ) {
	const ractive = this;

	const opts = typeof keypath === 'object' ? value : options;

	return set( build( ractive, keypath, value, opts && opts.isolated ), opts );
}

var shift = makeArrayMethod( 'shift' ).path;

var sort = makeArrayMethod( 'sort' ).path;

var splice = makeArrayMethod( 'splice' ).path;

function Ractive$subtract ( keypath, d, options ) {
	const num = typeof d === 'number' ? -d : -1;
	const opts = typeof d === 'object' ? d : options;
	return add( this, keypath, num, opts );
}

function Ractive$toggle ( keypath, options ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( badArguments );
	}

	return set( gather( this, keypath, null, options && options.isolated ).map( m => [ m, !m.get() ] ), options );
}

function Ractive$toCSS() {
	const cssIds = [ this.cssId, ...this.findAllComponents().map( c => c.cssId ) ];
	const uniqueCssIds = Object.keys(cssIds.reduce( ( ids, id ) => (ids[id] = true, ids), {}));
	return getCSS( uniqueCssIds );
}

function Ractive$toHTML () {
	return this.fragment.toString( true );
}

function toText () {
	return this.fragment.toString( false );
}

function Ractive$transition ( name, node, params ) {

	if ( node instanceof HTMLElement ) {
		// good to go
	}
	else if ( isObject( node ) ) {
		// omitted, use event node
		params = node;
	}

	// if we allow query selector, then it won't work
	// simple params like "fast"

	// else if ( typeof node === 'string' ) {
	// 	// query selector
	// 	node = this.find( node )
	// }

	node = node || this.event.node;

	if ( !node || !node._ractive ) {
		fatal( `No node was supplied for transition ${name}` );
	}

	params = params || {};
	const owner = node._ractive.proxy;
	const transition = new Transition({ owner, parentFragment: owner.parentFragment, name, params });
	transition.bind();

	const promise = runloop.start();
	runloop.registerTransition( transition );
	runloop.end();

	promise.then( () => transition.unbind() );
	return promise;
}

function unlink( here ) {
	const promise = runloop.start();
	this.viewmodel.joinAll( splitKeypath( here ), { lastLink: false } ).unlink();
	runloop.end();
	return promise;
}

const unrenderHook$1 = new Hook( 'unrender' );

function Ractive$unrender () {
	if ( !this.fragment.rendered ) {
		warnIfDebug( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
		return Promise.resolve();
	}

	this.unrendering = true;
	const promise = runloop.start();

	// If this is a component, and the component isn't marked for destruction,
	// don't detach nodes from the DOM unnecessarily
	const shouldDestroy = !this.component || ( this.component.anchor || {} ).shouldDestroy || this.component.shouldDestroy || this.shouldDestroy;
	this.fragment.unrender( shouldDestroy );
	if ( shouldDestroy ) this.destroyed = true;

	removeFromArray( this.el.__ractive_instances__, this );

	unrenderHook$1.fire( this );

	runloop.end();
	this.unrendering = false;

	return promise;
}

var unshift = makeArrayMethod( 'unshift' ).path;

function Ractive$updateModel ( keypath, cascade ) {
	const promise = runloop.start();

	if ( !keypath ) {
		this.viewmodel.updateFromBindings( true );
	} else {
		this.viewmodel.joinAll( splitKeypath( keypath ) ).updateFromBindings( cascade !== false );
	}

	runloop.end();

	return promise;
}

const proto = {
	add: Ractive$add,
	animate: Ractive$animate,
	attachChild,
	detach: Ractive$detach,
	detachChild,
	find: Ractive$find,
	findAll: Ractive$findAll,
	findAllComponents: Ractive$findAllComponents,
	findComponent: Ractive$findComponent,
	findContainer: Ractive$findContainer,
	findParent: Ractive$findParent,
	fire: Ractive$fire,
	get: Ractive$get,
	getContext: getContext$1,
	getNodeInfo: getNodeInfo$$1,
	insert: Ractive$insert,
	link,
	observe,
	observeOnce,
	off: Ractive$off,
	on: Ractive$on,
	once: Ractive$once,
	pop,
	push,
	readLink,
	render: Ractive$render,
	reset: Ractive$reset,
	resetPartial,
	resetTemplate: Ractive$resetTemplate,
	reverse,
	set: Ractive$set,
	shift,
	sort,
	splice,
	subtract: Ractive$subtract,
	teardown: Ractive$teardown,
	toggle: Ractive$toggle,
	toCSS: Ractive$toCSS,
	toCss: Ractive$toCSS,
	toHTML: Ractive$toHTML,
	toHtml: Ractive$toHTML,
	toText,
	transition: Ractive$transition,
	unlink,
	unrender: Ractive$unrender,
	unshift,
	update: Ractive$update,
	updateModel: Ractive$updateModel
};

Object.defineProperty( proto, 'target', {
	get() { return this.el; }
});

function isInstance ( object ) {
	return object && object instanceof this;
}

function sharedSet ( keypath, value, options ) {
	const opts = typeof keypath === 'object' ? value : options;
	const model = SharedModel$1;

	return set( build( { viewmodel: model }, keypath, value, true ), opts );
}

const callsSuper = /super\s*\(|\.call\s*\(\s*this/;

function extend ( ...options ) {
	if( !options.length ) {
		return extendOne( this );
	} else {
		return options.reduce( extendOne, this );
	}
}

function extendWith ( Class, options = {} ) {
	return extendOne( this, options, Class );
}

function extendOne ( Parent, options = {}, Target ) {
	let proto;
	let Child = typeof Target === 'function' && Target;

	if ( options.prototype instanceof Ractive ) {
		throw new Error( `Ractive no longer supports multiple inheritance.` );
	}

	if ( Child ) {
		if ( !( Child.prototype instanceof Parent ) ) {
			throw new Error( `Only classes that inherit the appropriate prototype may be used with extend` );
		}
		if ( !callsSuper.test( Child.toString() ) ) {
			throw new Error( `Only classes that call super in their constructor may be used with extend` );
		}

		proto = Child.prototype;
	} else {
		Child = function ( options ) {
			if ( !( this instanceof Child ) ) return new Child( options );

			construct( this, options || {} );
			initialise( this, options || {}, {} );
		};

		proto = Object.create( Parent.prototype );
		proto.constructor = Child;

		Child.prototype = proto;
	}

	// Static properties
	Object.defineProperties( Child, {
		// alias prototype as defaults
		defaults: { value: proto },

		extend: { value: extend, writable: true, configurable: true },
		extendWith: { value: extendWith, writable: true, configurable: true },
		extensions: { value: [] },

		isInstance: { value: isInstance },

		Parent: { value: Parent },
		Ractive: { value: Ractive },

		styleSet: { value: setCSSData.bind( Child ), configurable: true }
	});

	// extend configuration
	config.extend( Parent, proto, options, Child );

	// store event and observer registries on the constructor when extending
	Child._on = ( Parent._on || [] ).concat( toPairs( options.on ) );
	Child._observe = ( Parent._observe || [] ).concat( toPairs( options.observe ) );

	Parent.extensions.push( Child );

	// attribute defs are not inherited, but they need to be stored
	if ( options.attributes ) {
		let attrs;

		// allow an array of optional props or an object with arrays for optional and required props
		if ( Array.isArray( options.attributes ) ) {
			attrs = { optional: options.attributes, required: [] };
		} else {
			attrs = options.attributes;
		}

		// make sure the requisite keys actually store arrays
		if ( !Array.isArray( attrs.required ) ) attrs.required = [];
		if ( !Array.isArray( attrs.optional ) ) attrs.optional = [];

		Child.attributes = attrs;
	}

	dataConfigurator.extend( Parent, proto, options, Child );

	if ( options.computed ) {
		proto.computed = Object.assign( Object.create( Parent.prototype.computed ), options.computed );
	}

	return Child;
}

// styleSet for Ractive
Object.defineProperty( Ractive, 'styleSet', { configurable: true, value: setCSSData.bind( Ractive ) } );

// sharedSet for Ractive
Object.defineProperty( Ractive, 'sharedSet', { value: sharedSet } );

function joinKeys ( ...keys ) {
	return keys.map( escapeKey ).join( '.' );
}

function splitKeypath$1 ( keypath ) {
	return splitKeypath( keypath ).map( unescapeKey );
}

function findPlugin(name, type, instance) {
	return findInViewHierarchy(type, instance, name);
}

function Ractive ( options ) {
	if ( !( this instanceof Ractive ) ) return new Ractive( options );

	construct( this, options || {} );
	initialise( this, options || {}, {} );
}

// check to see if we're being asked to force Ractive as a global for some weird environments
if ( win && !win.Ractive ) {
	let opts = '';
	const script = document.currentScript || /* istanbul ignore next */ document.querySelector( 'script[data-ractive-options]' );

	if ( script ) opts = script.getAttribute( 'data-ractive-options' ) || '';

	/* istanbul ignore next */
	if ( ~opts.indexOf( 'ForceGlobal' ) ) win.Ractive = Ractive;
}

Object.assign( Ractive.prototype, proto, defaults );
Ractive.prototype.constructor = Ractive;

// alias prototype as `defaults`
Ractive.defaults = Ractive.prototype;

// share defaults with the parser
shared.defaults = Ractive.defaults;
shared.Ractive = Ractive;

// static properties
Object.defineProperties( Ractive, {

	// debug flag
	DEBUG:            { writable: true, value: true },
	DEBUG_PROMISES:   { writable: true, value: true },

	// static methods:
	extend:           { value: extend },
	extendWith:       { value: extendWith },
	escapeKey:        { value: escapeKey },
	evalObjectString: { value: parseJSON },
	findPlugin:       { value: findPlugin },
	getContext:       { value: getContext$2 },
	getCSS:           { value: getCSS },
	getNodeInfo:      { value: getNodeInfo$1 },
	isInstance:       { value: isInstance },
	joinKeys:         { value: joinKeys },
	normaliseKeypath: { value: normalise },
	parse:            { value: parse },
	splitKeypath:     { value: splitKeypath$1 },
	// sharedSet and styleSet are in _extend because circular refs
	unescapeKey:      { value: unescapeKey },

	// support
	enhance:          { writable: true, value: false },
	svg:              { value: svg },

	// version
	VERSION:          { value: '0.9.4' },

	// plugins
	adaptors:         { writable: true, value: {} },
	components:       { writable: true, value: {} },
	decorators:       { writable: true, value: {} },
	easing:           { writable: true, value: easing },
	events:           { writable: true, value: {} },
	extensions:       { value: [] },
	interpolators:    { writable: true, value: interpolators },
	partials:         { writable: true, value: {} },
	transitions:      { writable: true, value: {} },

	// CSS variables
	cssData:          { configurable: true, value: {} },

	// access to @shared without an instance
	sharedData:       { value: data },

	// for getting the source Ractive lib from a constructor
	Ractive:          { value: Ractive },

	// to allow extending contexts
	Context:          { value: extern.Context.prototype }
});

Object.defineProperty( Ractive, '_cssModel', { configurable: true, value: new CSSModel( Ractive ) } );

export default Ractive;
//# sourceMappingURL=ractive.mjs.map
