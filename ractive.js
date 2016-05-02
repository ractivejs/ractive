/*
	Ractive.js v0.8.0-edge
	Mon May 02 2016 22:23:02 GMT+0000 (UTC) - commit 3c485fe5c9b4724a6ddd33d52aa89e2c828c8d80

	http://ractivejs.org
	http://twitter.com/RactiveJS

	Released under the MIT License.
*/


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  ((function() { var current = global.Ractive; var next = factory(); next.noConflict = function() { global.Ractive = current; return next; }; return global.Ractive = next; })());
}(this, function () { 'use strict';

  var defaults = {
  	// render placement:
  	el:                     void 0,
  	append:				    false,

  	// template:
  	template:               null,

  	// parse:
  	delimiters:             [ '{{', '}}' ],
  	tripleDelimiters:       [ '{{{', '}}}' ],
  	staticDelimiters:       [ '[[', ']]' ],
  	staticTripleDelimiters: [ '[[[', ']]]' ],
  	csp: 					true,
  	interpolate:            false,
  	preserveWhitespace:     false,
  	sanitize:               false,
  	stripComments:          true,

  	// data & binding:
  	data:                   {},
  	computed:               {},
  	magic:                  false,
  	modifyArrays:           true,
  	adapt:                  [],
  	isolated:               false,
  	twoway:                 true,
  	lazy:                   false,

  	// transitions:
  	noIntro:                false,
  	transitionsEnabled:     true,
  	complete:               void 0,

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
  	linear: function ( pos ) { return pos; },
  	easeIn: function ( pos ) { return Math.pow( pos, 3 ); },
  	easeOut: function ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
  	easeInOut: function ( pos ) {
  		if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
  		return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
  	}
  };

  var legacy = null;

  /*global console, navigator */

  var win = typeof window !== 'undefined' ? window : null;
  var doc = win ? document : null;

  var isClient = !!doc;
  var isJsdom = ( typeof navigator !== 'undefined' && /jsDom/.test( navigator.appName ) );
  var hasConsole = ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' );

  var magicSupported;
  try {
  	Object.defineProperty({}, 'test', { value: 0 });
  	magicSupported = true;
  } catch ( e ) {
  	magicSupported = false;
  }

  var svg = doc ?
  	doc.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' ) :
  	false;

  var vendors = [ 'o', 'ms', 'moz', 'webkit' ];

  var html   = 'http://www.w3.org/1999/xhtml';
  var mathml = 'http://www.w3.org/1998/Math/MathML';
  var svg$1    = 'http://www.w3.org/2000/svg';
  var xlink  = 'http://www.w3.org/1999/xlink';
  var xml    = 'http://www.w3.org/XML/1998/namespace';
  var xmlns  = 'http://www.w3.org/2000/xmlns';

  var namespaces = { html: html, mathml: mathml, svg: svg$1, xlink: xlink, xml: xml, xmlns: xmlns };

  var createElement;
  var matches;
  var div;
  var methodNames;
  var unprefixed;
  var prefixed;
  var i;
  var j;
  var makeFunction;
  // Test for SVG support
  if ( !svg ) {
  	createElement = function ( type, ns, extend ) {
  		if ( ns && ns !== html ) {
  			throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information';
  		}

  		return extend ?
  			doc.createElement( type, extend ) :
  			doc.createElement( type );
  	};
  } else {
  	createElement = function ( type, ns, extend ) {
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
  	var output;

  	if ( !input || typeof input === 'boolean' ) { return; }

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
  			output = doc.querySelector( input );
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

  	// IE8...
  	if ( !matches ) {
  		matches = function ( node, selector ) {
  			var nodes, parentNode, i;

  			parentNode = node.parentNode;

  			if ( !parentNode ) {
  				// empty dummy <div>
  				div.innerHTML = '';

  				parentNode = div;
  				node = node.cloneNode();

  				div.appendChild( node );
  			}

  			nodes = parentNode.querySelectorAll( selector );

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
  	if ( node && typeof node.parentNode !== 'unknown' && node.parentNode ) {
  		node.parentNode.removeChild( node );
  	}

  	return node;
  }

  function safeToStringValue( value ) {
  	return ( value == null || !value.toString ) ? '' : '' + value;
  }

  var create;
  var defineProperty;
  var defineProperties;
  try {
  	Object.defineProperty({}, 'test', { get: function() {}, set: function() {} });

  	if ( doc ) {
  		Object.defineProperty( createElement( 'div' ), 'test', { value: 0 });
  	}

  	defineProperty = Object.defineProperty;
  } catch ( err ) {
  	// Object.defineProperty doesn't exist, or we're in IE8 where you can
  	// only use it with DOM objects (what were you smoking, MSFT?)
  	defineProperty = function ( obj, prop, desc ) {
  		obj[ prop ] = desc.value;
  	};
  }

  try {
  	try {
  		Object.defineProperties({}, { test: { value: 0 } });
  	} catch ( err ) {
  		// TODO how do we account for this? noMagic = true;
  		throw err;
  	}

  	if ( doc ) {
  		Object.defineProperties( createElement( 'div' ), { test: { value: 0 } });
  	}

  	defineProperties = Object.defineProperties;
  } catch ( err ) {
  	defineProperties = function ( obj, props ) {
  		var prop;

  		for ( prop in props ) {
  			if ( props.hasOwnProperty( prop ) ) {
  				defineProperty( obj, prop, props[ prop ] );
  			}
  		}
  	};
  }

  try {
  	Object.create( null );

  	create = Object.create;
  } catch ( err ) {
  	// sigh
  	create = (function () {
  		var F = function () {};

  		return function ( proto, props ) {
  			var obj;

  			if ( proto === null ) {
  				return {};
  			}

  			F.prototype = proto;
  			obj = new F();

  			if ( props ) {
  				Object.defineProperties( obj, props );
  			}

  			return obj;
  		};
  	}());
  }

  function extendObj ( target ) {
  	var sources = [], len = arguments.length - 1;
  	while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  	var prop;

  	sources.forEach( function ( source ) {
  		for ( prop in source ) {
  			if ( hasOwn.call( source, prop ) ) {
  				target[ prop ] = source[ prop ];
  			}
  		}
  	});

  	return target;
  }

  function fillGaps ( target ) {
  	var sources = [], len = arguments.length - 1;
  	while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  	sources.forEach( function ( s ) {
  		for ( var key in s ) {
  			if ( hasOwn.call( s, key ) && !( key in target ) ) {
  				target[ key ] = s[ key ];
  			}
  		}
  	});

  	return target;
  }

  var hasOwn = Object.prototype.hasOwnProperty;

  var toString = Object.prototype.toString;
  // thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
  function isArray ( thing ) {
  	return toString.call( thing ) === '[object Array]';
  }

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

  function noop () {}

  var alreadyWarned = {};
  var log;
  var printWarning;
  var welcome;
  if ( hasConsole ) {
  	var welcomeIntro = [
  		("%cRactive.js %c0.8.0-edge %cin debug mode, %cmore..."),
  		'color: rgb(114, 157, 52); font-weight: normal;',
  		'color: rgb(85, 85, 85); font-weight: normal;',
  		'color: rgb(85, 85, 85); font-weight: normal;',
  		'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;'
  	];
  	var welcomeMessage = "You're running Ractive 0.8.0-edge in debug mode - messages will be printed to the console to help you fix problems and optimise your application.\n\nTo disable debug mode, add this line at the start of your app:\n  Ractive.DEBUG = false;\n\nTo disable debug mode when your app is minified, add this snippet:\n  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});\n\nGet help and support:\n  http://docs.ractivejs.org\n  http://stackoverflow.com/questions/tagged/ractivejs\n  http://groups.google.com/forum/#!forum/ractive-js\n  http://twitter.com/ractivejs\n\nFound a bug? Raise an issue:\n  https://github.com/ractivejs/ractive/issues\n\n";

  	welcome = function () {
  		var hasGroup = !!console.groupCollapsed;
  		console[ hasGroup ? 'groupCollapsed' : 'log' ].apply( console, welcomeIntro );
  		console.log( welcomeMessage );
  		if ( hasGroup ) {
  			console.groupEnd( welcomeIntro );
  		}

  		welcome = noop;
  	};

  	printWarning = function ( message, args ) {
  		welcome();

  		// extract information about the instance this message pertains to, if applicable
  		if ( typeof args[ args.length - 1 ] === 'object' ) {
  			var options = args.pop();
  			var ractive = options ? options.ractive : null;

  			if ( ractive ) {
  				// if this is an instance of a component that we know the name of, add
  				// it to the message
  				var name;
  				if ( ractive.component && ( name = ractive.component.name ) ) {
  					message = "<" + name + "> " + message;
  				}

  				var node;
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
  	return message.replace( /%s/g, function () { return args.shift(); } );
  }

  function fatal ( message ) {
  	var args = [], len = arguments.length - 1;
  	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  	message = format( message, args );
  	throw new Error( message );
  }

  function logIfDebug () {
  	if ( Ractive.DEBUG ) {
  		log.apply( null, arguments );
  	}
  }

  function warn ( message ) {
  	var args = [], len = arguments.length - 1;
  	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  	message = format( message, args );
  	printWarning( message, args );
  }

  function warnOnce ( message ) {
  	var args = [], len = arguments.length - 1;
  	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

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
  var badArguments = 'Bad arguments';
  var noRegistryFunctionReturn = 'A function was specified for "%s" %s, but no %s was returned';
  var missingPlugin = function ( name, type ) { return ("Missing \"" + name + "\" " + type + " plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#" + type + "s"); };

  function findInViewHierarchy ( registryName, ractive, name ) {
  	var instance = findInstance( registryName, ractive, name );
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
  		var interpol = findInViewHierarchy( 'interpolators', ractive, type );
  		if ( interpol ) return interpol( from, to ) || null;

  		fatal( missingPlugin( type, 'interpolator' ) );
  	}

  	return interpolators.number( from, to ) ||
  	       interpolators.array( from, to ) ||
  	       interpolators.object( from, to ) ||
  	       null;
  }

  function snap ( to ) {
  	return function () { return to; };
  }

  var interpolators = {
  	number: function ( from, to ) {
  		var delta;

  		if ( !isNumeric( from ) || !isNumeric( to ) ) {
  			return null;
  		}

  		from = +from;
  		to = +to;

  		delta = to - from;

  		if ( !delta ) {
  			return function () { return from; };
  		}

  		return function ( t ) {
  			return from + ( t * delta );
  		};
  	},

  	array: function ( from, to ) {
  		var intermediate, interpolators, len, i;

  		if ( !isArray( from ) || !isArray( to ) ) {
  			return null;
  		}

  		intermediate = [];
  		interpolators = [];

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
  			var i = len;

  			while ( i-- ) {
  				intermediate[i] = interpolators[i]( t );
  			}

  			return intermediate;
  		};
  	},

  	object: function ( from, to ) {
  		var properties, len, interpolators, intermediate, prop;

  		if ( !isObject( from ) || !isObject( to ) ) {
  			return null;
  		}

  		properties = [];
  		intermediate = {};
  		interpolators = {};

  		for ( prop in from ) {
  			if ( hasOwn.call( from, prop ) ) {
  				if ( hasOwn.call( to, prop ) ) {
  					properties.push( prop );
  					interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] ) || snap( to[ prop ] );
  				}

  				else {
  					intermediate[ prop ] = from[ prop ];
  				}
  			}
  		}

  		for ( prop in to ) {
  			if ( hasOwn.call( to, prop ) && !hasOwn.call( from, prop ) ) {
  				intermediate[ prop ] = to[ prop ];
  			}
  		}

  		len = properties.length;

  		return function ( t ) {
  			var i = len, prop;

  			while ( i-- ) {
  				prop = properties[i];

  				intermediate[ prop ] = interpolators[ prop ]( t );
  			}

  			return intermediate;
  		};
  	}
  };

  var refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
  var splitPattern = /([^\\](?:\\\\)*)\./;
  var escapeKeyPattern = /\\|\./g;
  var unescapeKeyPattern = /((?:\\)+)\1|\\(\.)/g;

  function escapeKey ( key ) {
  	if ( typeof key === 'string' ) {
  		return key.replace( escapeKeyPattern, '\\$&' );
  	}

  	return key;
  }

  function normalise ( ref ) {
  	return ref ? ref.replace( refPattern, '.$1' ) : '';
  }

  function splitKeypathI ( keypath ) {
  	var result = [],
  		match;

  	keypath = normalise( keypath );

  	while ( match = splitPattern.exec( keypath ) ) {
  		var index = match.index + match[1].length;
  		result.push( keypath.substr( 0, index ) );
  		keypath = keypath.substr( index + 1 );
  	}

  	result.push(keypath);

  	return result;
  }

  function unescapeKey ( key ) {
  	if ( typeof key === 'string' ) {
  		return key.replace( unescapeKeyPattern, '$1$2' );
  	}

  	return key;
  }

  var errorMessage = 'Cannot add to a non-numeric value';

  function add ( ractive, keypath, d ) {
  	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
  		throw new Error( 'Bad arguments' );
  	}

  	var changes;

  	if ( /\*/.test( keypath ) ) {
  		changes = {};

  		ractive.viewmodel.findMatches( splitKeypathI( keypath ) ).forEach( function ( model ) {
  			var value = model.get();

  			if ( !isNumeric( value ) ) throw new Error( errorMessage );

  			changes[ model.getKeypath() ] = value + d;
  		});

  		return ractive.set( changes );
  	}

  	var value = ractive.get( keypath );

  	if ( !isNumeric( value ) ) {
  		throw new Error( errorMessage );
  	}

  	return ractive.set( keypath, +value + d );
  }

  function Ractive$add ( keypath, d ) {
  	return add( this, keypath, ( d === undefined ? 1 : +d ) );
  }

  // TODO: deprecate in future release
  var deprecations = {
  	construct: {
  		deprecated: 'beforeInit',
  		replacement: 'onconstruct'
  	},
  	render: {
  		deprecated: 'init',
  		message: 'The "init" method has been deprecated ' +
  			'and will likely be removed in a future release. ' +
  			'You can either use the "oninit" method which will fire ' +
  			'only once prior to, and regardless of, any eventual ractive ' +
  			'instance being rendered, or if you need to access the ' +
  			'rendered DOM, use "onrender" instead. ' +
  			'See http://docs.ractivejs.org/latest/migrating for more information.'
  	},
  	complete: {
  		deprecated: 'complete',
  		replacement: 'oncomplete'
  	}
  };

  var Hook = function Hook ( event ) {
  	this.event = event;
  	this.method = 'on' + event;
  	this.deprecate = deprecations[ event ];
  };

  Hook.prototype.call = function call ( method, ractive, arg ) {
  	if ( ractive[ method ] ) {
  		arg ? ractive[ method ]( arg ) : ractive[ method ]();
  		return true;
  	}
  };

  Hook.prototype.fire = function fire ( ractive, arg ) {
  	this.call( this.method, ractive, arg );

  	// handle deprecations
  	if ( !ractive[ this.method ] && this.deprecate && this.call( this.deprecate.deprecated, ractive, arg ) ) {
  		if ( this.deprecate.message ) {
  			warnIfDebug( this.deprecate.message );
  		} else {
  			warnIfDebug( 'The method "%s" has been deprecated in favor of "%s" and will likely be removed in a future release. See http://docs.ractivejs.org/latest/migrating for more information.', this.deprecate.deprecated, this.deprecate.replacement );
  		}
  	}

  	// TODO should probably use internal method, in case ractive.fire was overwritten
  	arg ? ractive.fire( this.event, arg ) : ractive.fire( this.event );
  };

  function addToArray ( array, value ) {
  	var index = array.indexOf( value );

  	if ( index === -1 ) {
  		array.push( value );
  	}
  }

  function arrayContains ( array, value ) {
  	for ( var i = 0, c = array.length; i < c; i++ ) {
  		if ( array[i] == value ) {
  			return true;
  		}
  	}

  	return false;
  }

  function arrayContentsMatch ( a, b ) {
  	var i;

  	if ( !isArray( a ) || !isArray( b ) ) {
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

  	var index = array.indexOf( member );

  	if ( index !== -1 ) {
  		array.splice( index, 1 );
  	}
  }

  function toArray ( arrayLike ) {
  	var array = [], i = arrayLike.length;
  	while ( i-- ) {
  		array[i] = arrayLike[i];
  	}

  	return array;
  }

  var _Promise;
  var PENDING = {};
  var FULFILLED = {};
  var REJECTED = {};
  if ( typeof Promise === 'function' ) {
  	// use native Promise
  	_Promise = Promise;
  } else {
  	_Promise = function ( callback ) {
  		var fulfilledHandlers = [],
  			rejectedHandlers = [],
  			state = PENDING,

  			result,
  			dispatchHandlers,
  			makeResolver,
  			fulfil,
  			reject,

  			promise;

  		makeResolver = function ( newState ) {
  			return function ( value ) {
  				if ( state !== PENDING ) {
  					return;
  				}

  				result = value;
  				state = newState;

  				dispatchHandlers = makeDispatcher( ( state === FULFILLED ? fulfilledHandlers : rejectedHandlers ), result );

  				// dispatch onFulfilled and onRejected handlers asynchronously
  				wait( dispatchHandlers );
  			};
  		};

  		fulfil = makeResolver( FULFILLED );
  		reject = makeResolver( REJECTED );

  		try {
  			callback( fulfil, reject );
  		} catch ( err ) {
  			reject( err );
  		}

  		promise = {
  			// `then()` returns a Promise - 2.2.7
  			then: function ( onFulfilled, onRejected ) {
  				var promise2 = new _Promise( function ( fulfil, reject ) {

  					var processResolutionHandler = function ( handler, handlers, forward ) {

  						// 2.2.1.1
  						if ( typeof handler === 'function' ) {
  							handlers.push( function ( p1result ) {
  								var x;

  								try {
  									x = handler( p1result );
  									resolve( promise2, x, fulfil, reject );
  								} catch ( err ) {
  									reject( err );
  								}
  							});
  						} else {
  							// Forward the result of promise1 to promise2, if resolution handlers
  							// are not given
  							handlers.push( forward );
  						}
  					};

  					// 2.2
  					processResolutionHandler( onFulfilled, fulfilledHandlers, fulfil );
  					processResolutionHandler( onRejected, rejectedHandlers, reject );

  					if ( state !== PENDING ) {
  						// If the promise has resolved already, dispatch the appropriate handlers asynchronously
  						wait( dispatchHandlers );
  					}

  				});

  				return promise2;
  			}
  		};

  		promise[ 'catch' ] = function ( onRejected ) {
  			return this.then( null, onRejected );
  		};

  		return promise;
  	};

  	_Promise.all = function ( promises ) {
  		return new _Promise( function ( fulfil, reject ) {
  			var result = [], pending, i, processPromise;

  			if ( !promises.length ) {
  				fulfil( result );
  				return;
  			}

  			processPromise = function ( promise, i ) {
  				if ( promise && typeof promise.then === 'function' ) {
  					promise.then( function ( value ) {
  						result[i] = value;
  						--pending || fulfil( result );
  					}, reject );
  				}

  				else {
  					result[i] = promise;
  					--pending || fulfil( result );
  				}
  			};

  			pending = i = promises.length;
  			while ( i-- ) {
  				processPromise( promises[i], i );
  			}
  		});
  	};

  	_Promise.resolve = function ( value ) {
  		return new _Promise( function ( fulfil ) {
  			fulfil( value );
  		});
  	};

  	_Promise.reject = function ( reason ) {
  		return new _Promise( function ( fulfil, reject ) {
  			reject( reason );
  		});
  	};
  }

  var Promise$1 = _Promise;

  // TODO use MutationObservers or something to simulate setImmediate
  function wait ( callback ) {
  	setTimeout( callback, 0 );
  }

  function makeDispatcher ( handlers, result ) {
  	return function () {
  		var handler;

  		while ( handler = handlers.shift() ) {
  			handler( result );
  		}
  	};
  }

  function resolve ( promise, x, fulfil, reject ) {
  	// Promise Resolution Procedure
  	var then;

  	// 2.3.1
  	if ( x === promise ) {
  		throw new TypeError( 'A promise\'s fulfillment handler cannot return the same promise' );
  	}

  	// 2.3.2
  	if ( x instanceof _Promise ) {
  		x.then( fulfil, reject );
  	}

  	// 2.3.3
  	else if ( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
  		try {
  			then = x.then; // 2.3.3.1
  		} catch ( e ) {
  			reject( e ); // 2.3.3.2
  			return;
  		}

  		// 2.3.3.3
  		if ( typeof then === 'function' ) {
  			var called, resolvePromise, rejectPromise;

  			resolvePromise = function ( y ) {
  				if ( called ) {
  					return;
  				}
  				called = true;
  				resolve( promise, y, fulfil, reject );
  			};

  			rejectPromise = function ( r ) {
  				if ( called ) {
  					return;
  				}
  				called = true;
  				reject( r );
  			};

  			try {
  				then.call( x, resolvePromise, rejectPromise );
  			} catch ( e ) {
  				if ( !called ) { // 2.3.3.3.4.1
  					reject( e ); // 2.3.3.3.4.2
  					called = true;
  					return;
  				}
  			}
  		}

  		else {
  			fulfil( x );
  		}
  	}

  	else {
  		fulfil( x );
  	}
  }

  var TransitionManager = function TransitionManager ( callback, parent ) {
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
  };

  TransitionManager.prototype.add = function add ( transition ) {
  	var list = transition.isIntro ? this.intros : this.outros;
  	list.push( transition );
  };

  TransitionManager.prototype.addChild = function addChild ( child ) {
  	this.children.push( child );

  	this.totalChildren += 1;
  	this.outroChildren += 1;
  };

  TransitionManager.prototype.decrementOutros = function decrementOutros () {
  	this.outroChildren -= 1;
  	check( this );
  };

  TransitionManager.prototype.decrementTotal = function decrementTotal () {
  	this.totalChildren -= 1;
  	check( this );
  };

  TransitionManager.prototype.detachNodes = function detachNodes () {
  	this.detachQueue.forEach( detach );
  	this.children.forEach( _detachNodes );
  };

  TransitionManager.prototype.remove = function remove ( transition ) {
  	var list = transition.isIntro ? this.intros : this.outros;
  	removeFromArray( list, transition );
  	check( this );
  };

  TransitionManager.prototype.start = function start () {
  	detachImmediate( this );
  	this.intros.concat( this.outros ).forEach( function ( t ) { return t.start(); } );
  	this.ready = true;
  	check( this );
  };

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
  		if ( tm.parent && !tm.parent.outrosComplete ) {
  			tm.parent.decrementOutros( tm );
  		} else {
  			tm.detachNodes();
  		}

  		tm.outrosComplete = true;
  	}

  	// Once everything is done, we can notify parent transition
  	// manager and call the callback
  	if ( !tm.intros.length && !tm.totalChildren ) {
  		if ( typeof tm.callback === 'function' ) {
  			tm.callback();
  		}

  		if ( tm.parent ) {
  			tm.parent.decrementTotal();
  		}
  	}
  }

  // check through the detach queue to see if a node is up or downstream from a
  // transition and if not, go ahead and detach it
  function detachImmediate ( manager ) {
  	var queue = manager.detachQueue;
  	var outros = collectAllOutros( manager );

  	var i = queue.length, j = 0, node, trans;
  	start: while ( i-- ) {
  		node = queue[i].node;
  		j = outros.length;
  		while ( j-- ) {
  			trans = outros[j].node;
  			// check to see if the node is, contains, or is contained by the transitioning node
  			if ( trans === node || trans.contains( node ) || node.contains( trans ) ) continue start;
  		}

  		// no match, we can drop it
  		queue[i].detach();
  		queue.splice( i, 1 );
  	}
  }

  function collectAllOutros ( manager, list ) {
  	if ( !list ) {
  		list = [];
  		var parent = manager;
  		while ( parent.parent ) parent = parent.parent;
  		return collectAllOutros( parent, list );
  	} else {
  		var i = manager.children.length;
  		while ( i-- ) {
  			list = collectAllOutros( manager.children[i], list );
  		}
  		list = list.concat( manager.outros );
  		return list;
  	}
  }

  var changeHook = new Hook( 'change' );

  var batch;

  var runloop = {
  	start: function ( instance, returnPromise ) {
  		var promise, fulfilPromise;

  		if ( returnPromise ) {
  			promise = new Promise$1( function ( f ) { return ( fulfilPromise = f ); } );
  		}

  		batch = {
  			previousBatch: batch,
  			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
  			fragments: [],
  			tasks: [],
  			immediateObservers: [],
  			deferredObservers: [],
  			ractives: [],
  			instance: instance
  		};

  		return promise;
  	},

  	end: function () {
  		flushChanges();
  		batch = batch.previousBatch;
  	},

  	addFragment: function ( fragment ) {
  		addToArray( batch.fragments, fragment );
  	},

  	addInstance: function ( instance ) {
  		if ( batch ) addToArray( batch.ractives, instance );
  	},

  	addObserver: function ( observer, defer ) {
  		addToArray( defer ? batch.deferredObservers : batch.immediateObservers, observer );
  	},

  	registerTransition: function ( transition ) {
  		transition._manager = batch.transitionManager;
  		batch.transitionManager.add( transition );
  	},

  	// synchronise node detachments with transition ends
  	detachWhenReady: function ( thing ) {
  		batch.transitionManager.detachQueue.push( thing );
  	},

  	scheduleTask: function ( task, postRender ) {
  		var _batch;

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
  	}
  };

  function dispatch ( observer ) {
  	observer.dispatch();
  }

  function flushChanges () {
  	var which = batch.immediateObservers;
  	batch.immediateObservers = [];
  	which.forEach( dispatch );

  	// Now that changes have been fully propagated, we can update the DOM
  	// and complete other tasks
  	var i = batch.fragments.length;
  	var fragment;

  	which = batch.fragments;
  	batch.fragments = [];
  	var ractives = batch.ractives;
  	batch.ractives = [];

  	while ( i-- ) {
  		fragment = which[i];

  		// TODO deprecate this. It's annoying and serves no useful function
  		var ractive = fragment.ractive;
  		changeHook.fire( ractive, ractive.viewmodel.changes );
  		ractive.viewmodel.changes = {};
  		removeFromArray( ractives, ractive );

  		fragment.update();
  	}

  	i = ractives.length;
  	while ( i-- ) {
  		var ractive$1 = ractives[i];
  		changeHook.fire( ractive$1, ractive$1.viewmodel.changes );
  		ractive$1.viewmodel.changes = {};
  	}

  	batch.transitionManager.start();

  	which = batch.deferredObservers;
  	batch.deferredObservers = [];
  	which.forEach( dispatch );

  	var tasks = batch.tasks;
  	batch.tasks = [];

  	for ( i = 0; i < tasks.length; i += 1 ) {
  		tasks[i]();
  	}

  	// If updating the view caused some model blowback - e.g. a triple
  	// containing <option> elements caused the binding on the <select>
  	// to update - then we start over
  	if ( batch.fragments.length || batch.immediateObservers.length || batch.deferredObservers.length || batch.ractives.length ) return flushChanges();
  }

  var noAnimation = Promise$1.resolve();
  defineProperty( noAnimation, 'stop', { value: noop });

  var linear = easing.linear;

  function getOptions ( options, instance ) {
  	options = options || {};

  	var easing;
  	if ( options.easing ) {
  		easing = typeof options.easing === 'function' ?
  			options.easing :
  			instance.easing[ options.easing ];
  	}

  	return {
  		easing: easing || linear,
  		duration: 'duration' in options ? options.duration : 400,
  		complete: options.complete || noop,
  		step: options.step || noop
  	};
  }

  function Ractive$animate ( keypath, to, options ) {
  	if ( typeof keypath === 'object' ) {
  		var keys = Object.keys( keypath );

  		throw new Error( ("ractive.animate(...) no longer supports objects. Instead of ractive.animate({\n  " + (keys.map( function ( key ) { return ("'" + key + "': " + (keypath[ key ])); } ).join( '\n  ' )) + "\n}, {...}), do\n\n" + (keys.map( function ( key ) { return ("ractive.animate('" + key + "', " + (keypath[ key ]) + ", {...});"); } ).join( '\n' )) + "\n") );
  	}

  	options = getOptions( options, this );

  	var model = this.viewmodel.joinAll( splitKeypathI( keypath ) );
  	var from = model.get();

  	// don't bother animating values that stay the same
  	if ( isEqual( from, to ) ) {
  		options.complete( options.to );
  		return noAnimation; // TODO should this have .then and .catch methods?
  	}

  	var interpolator = interpolate( from, to, this, options.interpolator );

  	// if we can't interpolate the value, set it immediately
  	if ( !interpolator ) {
  		runloop.start();
  		model.set( to );
  		runloop.end();

  		return noAnimation;
  	}

  	return model.animate( from, to, options, interpolator );
  }

  var detachHook = new Hook( 'detach' );

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

  function Ractive$find ( selector ) {
  	if ( !this.el ) throw new Error( ("Cannot call ractive.find('" + selector + "') unless instance is rendered to the DOM") );

  	return this.fragment.find( selector );
  }

  function sortByDocumentPosition ( node, otherNode ) {
  	if ( node.compareDocumentPosition ) {
  		var bitmask = node.compareDocumentPosition( otherNode );
  		return ( bitmask & 2 ) ? 1 : -1;
  	}

  	// In old IE, we can piggy back on the mechanism for
  	// comparing component positions
  	return sortByItemPosition( node, otherNode );
  }

  function sortByItemPosition ( a, b ) {
  	var ancestryA = getAncestry( a.component || a._ractive.proxy );
  	var ancestryB = getAncestry( b.component || b._ractive.proxy );

  	var oldestA = lastItem( ancestryA );
  	var oldestB = lastItem( ancestryB );
  	var mutualAncestor;

  	// remove items from the end of both ancestries as long as they are identical
  	// - the final one removed is the closest mutual ancestor
  	while ( oldestA && ( oldestA === oldestB ) ) {
  		ancestryA.pop();
  		ancestryB.pop();

  		mutualAncestor = oldestA;

  		oldestA = lastItem( ancestryA );
  		oldestB = lastItem( ancestryB );
  	}

  	// now that we have the mutual ancestor, we can find which is earliest
  	oldestA = oldestA.component || oldestA;
  	oldestB = oldestB.component || oldestB;

  	var fragmentA = oldestA.parentFragment;
  	var fragmentB = oldestB.parentFragment;

  	// if both items share a parent fragment, our job is easy
  	if ( fragmentA === fragmentB ) {
  		var indexA = fragmentA.items.indexOf( oldestA );
  		var indexB = fragmentB.items.indexOf( oldestB );

  		// if it's the same index, it means one contains the other,
  		// so we see which has the longest ancestry
  		return ( indexA - indexB ) || ancestryA.length - ancestryB.length;
  	}

  	// if mutual ancestor is a section, we first test to see which section
  	// fragment comes first
  	var fragments = mutualAncestor.iterations;
  	if ( fragments ) {
  		var indexA$1 = fragments.indexOf( fragmentA );
  		var indexB$1 = fragments.indexOf( fragmentB );

  		return ( indexA$1 - indexB$1 ) || ancestryA.length - ancestryB.length;
  	}

  	throw new Error( 'An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
  }

  function getParent ( item ) {
  	var parentFragment = item.parentFragment;

  	if ( parentFragment ) return parentFragment.owner;

  	if ( item.component && ( parentFragment = item.component.parentFragment ) ) {
  		return parentFragment.owner;
  	}
  }

  function getAncestry ( item ) {
  	var ancestry = [ item ];
  	var ancestor = getParent( item );

  	while ( ancestor ) {
  		ancestry.push( ancestor );
  		ancestor = getParent( ancestor );
  	}

  	return ancestry;
  }


  var Query = function Query ( ractive, selector, live, isComponentQuery ) {
  	this.ractive = ractive;
  	this.selector = selector;
  	this.live = live;
  	this.isComponentQuery = isComponentQuery;

  	this.result = [];

  	this.dirty = true;
  };

  Query.prototype.add = function add ( item ) {
  	this.result.push( item );
  	this.makeDirty();
  };

  Query.prototype.cancel = function cancel () {
  	var liveQueries = this._root[ this.isComponentQuery ? 'liveComponentQueries' : 'liveQueries' ];
  	var selector = this.selector;

  	var index = liveQueries.indexOf( selector );

  	if ( index !== -1 ) {
  		liveQueries.splice( index, 1 );
  		liveQueries[ selector ] = null;
  	}
  };

  Query.prototype.init = function init () {
  	this.dirty = false;
  };

  Query.prototype.makeDirty = function makeDirty () {
  	var this$1 = this;

  		if ( !this.dirty ) {
  		this.dirty = true;

  		// Once the DOM has been updated, ensure the query
  		// is correctly ordered
  		runloop.scheduleTask( function () { return this$1.update(); } );
  	}
  };

  Query.prototype.remove = function remove ( nodeOrComponent ) {
  	var index = this.result.indexOf( this.isComponentQuery ? nodeOrComponent.instance : nodeOrComponent );
  	if ( index !== -1 ) this.result.splice( index, 1 );
  };

  Query.prototype.update = function update () {
  	this.result.sort( this.isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
  	this.dirty = false;
  };

  Query.prototype.test = function test ( item ) {
  	return this.isComponentQuery ?
  		( !this.selector || item.name === this.selector ) :
  		( item ? matches( item, this.selector ) : null );
  };

  function Ractive$findAll ( selector, options ) {
  	if ( !this.el ) throw new Error( ("Cannot call ractive.findAll('" + selector + "', ...) unless instance is rendered to the DOM") );

  	options = options || {};
  	var liveQueries = this._liveQueries;

  	// Shortcut: if we're maintaining a live query with this
  	// selector, we don't need to traverse the parallel DOM
  	var query = liveQueries[ selector ];
  	if ( query ) {
  		// Either return the exact same query, or (if not live) a snapshot
  		return ( options && options.live ) ? query : query.slice();
  	}

  	query = new Query( this, selector, !!options.live, false );

  	// Add this to the list of live queries Ractive needs to maintain,
  	// if applicable
  	if ( query.live ) {
  		liveQueries.push( selector );
  		liveQueries[ '_' + selector ] = query;
  	}

  	this.fragment.findAll( selector, query );

  	query.init();
  	return query.result;
  }

  function Ractive$findAllComponents ( selector, options ) {
  	options = options || {};
  	var liveQueries = this._liveComponentQueries;

  	// Shortcut: if we're maintaining a live query with this
  	// selector, we don't need to traverse the parallel DOM
  	var query = liveQueries[ selector ];
  	if ( query ) {
  		// Either return the exact same query, or (if not live) a snapshot
  		return ( options && options.live ) ? query : query.slice();
  	}

  	query = new Query( this, selector, !!options.live, true );

  	// Add this to the list of live queries Ractive needs to maintain,
  	// if applicable
  	if ( query.live ) {
  		liveQueries.push( selector );
  		liveQueries[ '_' + selector ] = query;
  	}

  	this.fragment.findAllComponents( selector, query );

  	query.init();
  	return query.result;
  }

  function Ractive$findComponent ( selector ) {
  	return this.fragment.findComponent( selector );
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

  var starMaps = {};

  // This function takes a keypath such as 'foo.bar.baz', and returns
  // all the variants of that keypath that include a wildcard in place
  // of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
  // These are then checked against the dependants map (ractive.viewmodel.depsMap)
  // to see if any pattern observers are downstream of one or more of
  // these wildcard keypaths (e.g. 'foo.bar.*.status')
  function getPotentialWildcardMatches ( keypath ) {
  	var keys, starMap, mapper, i, result, wildcardKeypath;

  	keys = splitKeypathI( keypath );
  	if( !( starMap = starMaps[ keys.length ]) ) {
  		starMap = getStarMap( keys.length );
  	}

  	result = [];

  	mapper = function ( star, i ) {
  		return star ? '*' : keys[i];
  	};

  	i = starMap.length;
  	while ( i-- ) {
  		wildcardKeypath = starMap[i].map( mapper ).join( '.' );

  		if ( !result.hasOwnProperty( wildcardKeypath ) ) {
  			result.push( wildcardKeypath );
  			result[ wildcardKeypath ] = true;
  		}
  	}

  	return result;
  }

  // This function returns all the possible true/false combinations for
  // a given number - e.g. for two, the possible combinations are
  // [ true, true ], [ true, false ], [ false, true ], [ false, false ].
  // It does so by getting all the binary values between 0 and e.g. 11
  function getStarMap ( num ) {
  	var ones = '', max, binary, starMap, mapper, i, j, l, map;

  	if ( !starMaps[ num ] ) {
  		starMap = [];

  		while ( ones.length < num ) {
  			ones += 1;
  		}

  		max = parseInt( ones, 2 );

  		mapper = function ( digit ) {
  			return digit === '1';
  		};

  		for ( i = 0; i <= max; i += 1 ) {
  			binary = i.toString( 2 );
  			while ( binary.length < num ) {
  				binary = '0' + binary;
  			}

  			map = [];
  			l = binary.length;
  			for (j = 0; j < l; j++) {
  				map.push( mapper( binary[j] ) );
  			}
  			starMap[i] = map;
  		}

  		starMaps[ num ] = starMap;
  	}

  	return starMaps[ num ];
  }

  var wildcardCache = {};

  function fireEvent ( ractive, eventName, options ) {
  	if ( options === void 0 ) options = {};

  	if ( !eventName ) { return; }

  	if ( !options.event ) {
  		options.event = {
  			name: eventName,
  			// until event not included as argument default
  			_noArg: true
  		};
  	} else {
  		options.event.name = eventName;
  	}

  	var eventNames = getWildcardNames( eventName );

  	fireEventAs( ractive, eventNames, options.event, options.args, true );
  }

  function getWildcardNames ( eventName ) {
  	if ( wildcardCache.hasOwnProperty( eventName ) ) {
  		return wildcardCache[ eventName ];
  	} else {
  		return wildcardCache[ eventName ] = getPotentialWildcardMatches( eventName );
  	}
  }

  function fireEventAs  ( ractive, eventNames, event, args, initialFire ) {

  	if ( initialFire === void 0 ) initialFire = false;

  	var subscribers, i, bubble = true;

  	enqueue( ractive, event );

  	for ( i = eventNames.length; i >= 0; i-- ) {
  		subscribers = ractive._subs[ eventNames[ i ] ];

  		if ( subscribers ) {
  			bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble;
  		}
  	}

  	dequeue( ractive );

  	if ( ractive.parent && bubble ) {

  		if ( initialFire && ractive.component ) {
  			var fullName = ractive.component.name + '.' + eventNames[ eventNames.length-1 ];
  			eventNames = getWildcardNames( fullName );

  			if( event && !event.component ) {
  				event.component = ractive;
  			}
  		}

  		fireEventAs( ractive.parent, eventNames, event, args );
  	}
  }

  function notifySubscribers ( ractive, subscribers, event, args ) {
  	var originalEvent = null, stopEvent = false;

  	if ( event && !event._noArg ) {
  		args = [ event ].concat( args );
  	}

  	// subscribers can be modified inflight, e.g. "once" functionality
  	// so we need to copy to make sure everyone gets called
  	subscribers = subscribers.slice();

  	for ( var i = 0, len = subscribers.length; i < len; i += 1 ) {
  		if ( subscribers[ i ].apply( ractive, args ) === false ) {
  			stopEvent = true;
  		}
  	}

  	if ( event && !event._noArg && stopEvent && ( originalEvent = event.original ) ) {
  		originalEvent.preventDefault && originalEvent.preventDefault();
  		originalEvent.stopPropagation && originalEvent.stopPropagation();
  	}

  	return !stopEvent;
  }

  function Ractive$fire ( eventName ) {
  	var args = [], len = arguments.length - 1;
  	while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  	fireEvent( this, eventName, { args: args });
  }

  function badReference ( key ) {
  	throw new Error( ("An index or key reference (" + key + ") cannot have child properties") );
  }

  function resolveAmbiguousReference ( fragment, ref ) {
  	var localViewmodel = fragment.findContext().root;
  	var keys = splitKeypathI( ref );
  	var key = keys[0];

  	var hasContextChain;
  	var crossedComponentBoundary;
  	var aliases;

  	while ( fragment ) {
  		// repeated fragments
  		if ( fragment.isIteration ) {
  			if ( key === fragment.parent.keyRef ) {
  				if ( keys.length > 1 ) badReference( key );
  				return fragment.context.getKeyModel();
  			}

  			if ( key === fragment.parent.indexRef ) {
  				if ( keys.length > 1 ) badReference( key );
  				return fragment.context.getIndexModel( fragment.index );
  			}
  		}

  		// alias node or iteration
  		if ( ( ( aliases = fragment.owner.aliases ) || ( aliases = fragment.aliases ) ) && aliases.hasOwnProperty( key ) ) {
  			var model = aliases[ key ];

  			if ( keys.length === 1 ) return model;
  			else if ( typeof model.joinAll === 'function' ) {
  				return model.joinAll( keys.slice( 1 ) );
  			}
  		}

  		if ( fragment.context ) {
  			// TODO better encapsulate the component check
  			if ( !fragment.isRoot || fragment.ractive.component ) hasContextChain = true;

  			if ( fragment.context.has( key ) ) {
  				if ( crossedComponentBoundary ) {
  					localViewmodel.map( key, fragment.context.joinKey( key ) );
  				}

  				return fragment.context.joinAll( keys );
  			}
  		}

  		if ( fragment.componentParent && !fragment.ractive.isolated ) {
  			// ascend through component boundary
  			fragment = fragment.componentParent;
  			crossedComponentBoundary = true;
  		} else {
  			fragment = fragment.parent;
  		}
  	}

  	if ( !hasContextChain ) {
  		return localViewmodel.joinAll( keys );
  	}
  }

  var stack = [];
  var captureGroup;

  function startCapturing () {
  	stack.push( captureGroup = [] );
  }

  function stopCapturing () {
  	var dependencies = stack.pop();
  	captureGroup = stack[ stack.length - 1 ];
  	return dependencies;
  }

  function capture ( model ) {
  	if ( captureGroup ) {
  		captureGroup.push( model );
  	}
  }

  function bind               ( x ) { x.bind(); }
  function cancel             ( x ) { x.cancel(); }
  function handleChange       ( x ) { x.handleChange(); }
  function mark               ( x ) { x.mark(); }
  function render             ( x ) { x.render(); }
  function rebind             ( x ) { x.rebind(); }
  function teardown           ( x ) { x.teardown(); }
  function unbind             ( x ) { x.unbind(); }
  function unrender           ( x ) { x.unrender(); }
  function unrenderAndDestroy ( x ) { x.unrender( true ); }
  function update             ( x ) { x.update(); }
  function toString$1           ( x ) { return x.toString(); }
  function toEscapedString    ( x ) { return x.toString( true ); }

  var requestAnimationFrame;

  // If window doesn't exist, we don't need requestAnimationFrame
  if ( !win ) {
  	requestAnimationFrame = null;
  } else {
  	// https://gist.github.com/paulirish/1579671
  	(function(vendors, lastTime, win) {

  		var x, setTimeout;

  		if ( win.requestAnimationFrame ) {
  			return;
  		}

  		for ( x = 0; x < vendors.length && !win.requestAnimationFrame; ++x ) {
  			win.requestAnimationFrame = win[vendors[x]+'RequestAnimationFrame'];
  		}

  		if ( !win.requestAnimationFrame ) {
  			setTimeout = win.setTimeout;

  			win.requestAnimationFrame = function(callback) {
  				var currTime, timeToCall, id;

  				currTime = Date.now();
  				timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
  				id = setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );

  				lastTime = currTime + timeToCall;
  				return id;
  			};
  		}

  	}( vendors, 0, win ));

  	requestAnimationFrame = win.requestAnimationFrame;
  }

  var rAF = requestAnimationFrame;

  var getTime = ( win && win.performance && typeof win.performance.now === 'function' ) ?
  	function () { return win.performance.now(); } :
  	function () { return Date.now(); };

  // TODO what happens if a transition is aborted?

  var tickers = [];
  var running = false;

  function tick () {
  	runloop.start();

  	var now = getTime();

  	var i;
  	var ticker;

  	for ( i = 0; i < tickers.length; i += 1 ) {
  		ticker = tickers[i];

  		if ( !ticker.tick( now ) ) {
  			// ticker is complete, remove it from the stack, and decrement i so we don't miss one
  			tickers.splice( i--, 1 );
  		}
  	}

  	runloop.end();

  	if ( tickers.length ) {
  		rAF( tick );
  	} else {
  		running = false;
  	}
  }

  var Ticker = function Ticker ( options ) {
  	this.duration = options.duration;
  	this.step = options.step;
  	this.complete = options.complete;
  	this.easing = options.easing;

  	this.start = getTime();
  	this.end = this.start + this.duration;

  	this.running = true;

  	tickers.push( this );
  	if ( !running ) rAF( tick );
  };

  Ticker.prototype.tick = function tick$1 ( now ) {
  	if ( !this.running ) return false;

  	if ( now > this.end ) {
  		if ( this.step ) this.step( 1 );
  		if ( this.complete ) this.complete( 1 );

  		return false;
  	}

  	var elapsed = now - this.start;
  	var eased = this.easing( elapsed / this.duration );

  	if ( this.step ) this.step( eased );

  	return true;
  };

  Ticker.prototype.stop = function stop () {
  	if ( this.abort ) this.abort();
  	this.running = false;
  };

  var prefixers = {};

  // TODO this is legacy. sooner we can replace the old adaptor API the better
  function prefixKeypath ( obj, prefix ) {
  	var prefixed = {}, key;

  	if ( !prefix ) {
  		return obj;
  	}

  	prefix += '.';

  	for ( key in obj ) {
  		if ( obj.hasOwnProperty( key ) ) {
  			prefixed[ prefix + key ] = obj[ key ];
  		}
  	}

  	return prefixed;
  }

  function getPrefixer ( rootKeypath ) {
  	var rootDot;

  	if ( !prefixers[ rootKeypath ] ) {
  		rootDot = rootKeypath ? rootKeypath + '.' : '';

  		prefixers[ rootKeypath ] = function ( relativeKeypath, value ) {
  			var obj;

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

  var KeyModel = function KeyModel ( key ) {
  	this.value = key;
  	this.isReadonly = true;
  	this.dependants = [];
  };

  KeyModel.prototype.get = function get () {
  	return unescapeKey( this.value );
  };

  KeyModel.prototype.getKeypath = function getKeypath () {
  	return unescapeKey( this.value );
  };

  KeyModel.prototype.rebind = function rebind ( key ) {
  	this.value = key;
  	this.dependants.forEach( handleChange );
  };

  KeyModel.prototype.register = function register ( dependant ) {
  	this.dependants.push( dependant );
  };

  KeyModel.prototype.unregister = function unregister ( dependant ) {
  	removeFromArray( this.dependants, dependant );
  };

  var KeypathModel = function KeypathModel ( parent, ractive ) {
  	this.parent = parent;
  	this.ractive = ractive;
  	this.value = ractive ? parent.getKeypath( ractive ) : parent.getKeypath();
  	this.dependants = [];
  	this.children = [];
  };

  KeypathModel.prototype.addChild = function addChild( model ) {
  	this.children.push( model );
  	model.owner = this;
  };

  KeypathModel.prototype.get = function get () {
  	return this.value;
  };

  KeypathModel.prototype.getKeypath = function getKeypath () {
  	return this.value;
  };

  KeypathModel.prototype.handleChange = function handleChange$1 () {
  	this.value = this.ractive ? this.parent.getKeypath( this.ractive ) : this.parent.getKeypath();
  	if ( this.ractive && this.owner ) {
  		this.ractive.viewmodel.keypathModels[ this.owner.value ] = this;
  	}
  	this.children.forEach( handleChange );
  	this.dependants.forEach( handleChange );
  };

  KeypathModel.prototype.register = function register ( dependant ) {
  	this.dependants.push( dependant );
  };

  KeypathModel.prototype.removeChild = function removeChild( model ) {
  	removeFromArray( this.children, model );
  };

  KeypathModel.prototype.teardown = function teardown$1 () {
  	if ( this.owner ) this.owner.removeChild( this );
  	this.children.forEach( teardown );
  };

  KeypathModel.prototype.unregister = function unregister ( dependant ) {
  	removeFromArray( this.dependants, dependant );
  };

  var hasProp = Object.prototype.hasOwnProperty;

  function updateFromBindings ( model ) {
  	model.updateFromBindings( true );
  }

  function updateKeypathDependants ( model ) {
  	model.updateKeypathDependants();
  }

  var originatingModel = null;

  var Model = function Model ( parent, key ) {
  	this.deps = [];

  	this.children = [];
  	this.childByKey = {};

  	this.indexModels = [];

  	this.unresolved = [];
  	this.unresolvedByKey = {};

  	this.bindings = [];
  	this.patternObservers = [];

  	this.value = undefined;

  	this.ticker = null;

  	if ( parent ) {
  		this.parent = parent;
  		this.root = parent.root;
  		this.key = unescapeKey( key );
  		this.isReadonly = parent.isReadonly;

  		if ( parent.value ) {
  			this.value = parent.value[ this.key ];
  			this.adapt();
  		}
  	}
  };

  Model.prototype.adapt = function adapt () {
  	var this$1 = this;

  		var adaptors = this.root.adaptors;
  	var len = adaptors.length;

  	this.rewrap = false;

  	// Exit early if no adaptors
  	if ( len === 0 ) return;

  	var value = this.value;

  	// TODO remove this legacy nonsense
  	var ractive = this.root.ractive;
  	var keypath = this.getKeypath();

  	// tear previous adaptor down if present
  	if ( this.wrapper ) {
  		var shouldTeardown = !this.wrapper.reset || this.wrapper.reset( value ) === false;

  		if ( shouldTeardown ) {
  			this.wrapper.teardown();
  			this.wrapper = null;

  			// don't branch for undefined values
  			if ( this.value !== undefined ) {
  				var parentValue = this.parent.value || this.parent.createBranch( this.key );
  				if ( parentValue[ this.key ] !== this.value ) parentValue[ this.key ] = value;
  			}
  		} else {
  			this.value = this.wrapper.get();
  			return;
  		}
  	}

  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		var adaptor = adaptors[i];
  		if ( adaptor.filter( value, keypath, ractive ) ) {
  			this$1.wrapper = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
  			this$1.wrapper.value = this$1.value;
  			this$1.wrapper.__model = this$1; // massive temporary hack to enable array adaptor

  			this$1.value = this$1.wrapper.get();

  			break;
  		}
  	}
  };

  Model.prototype.addUnresolved = function addUnresolved ( key, resolver ) {
  	if ( !this.unresolvedByKey[ key ] ) {
  		this.unresolved.push( key );
  		this.unresolvedByKey[ key ] = [];
  	}

  	this.unresolvedByKey[ key ].push( resolver );
  };

  Model.prototype.animate = function animate ( from, to, options, interpolator ) {
  	var this$1 = this;

  		if ( this.ticker ) this.ticker.stop();

  	var fulfilPromise;
  	var promise = new Promise$1( function ( fulfil ) { return fulfilPromise = fulfil; } );

  	this.ticker = new Ticker({
  		duration: options.duration,
  		easing: options.easing,
  		step: function ( t ) {
  			var value = interpolator( t );
  			this$1.applyValue( value );
  			if ( options.step ) options.step( t, value );
  		},
  		complete: function () {
  			this$1.applyValue( to );
  			if ( options.complete ) options.complete( to );

  			this$1.ticker = null;
  			fulfilPromise();
  		}
  	});

  	promise.stop = this.ticker.stop;
  	return promise;
  };

  Model.prototype.applyValue = function applyValue ( value ) {
  	if ( isEqual( value, this.value ) ) return;

  	// TODO deprecate this nonsense
  	this.registerChange( this.getKeypath(), value );

  	if ( this.parent.wrapper && this.parent.wrapper.set ) {
  		this.parent.wrapper.set( this.key, value );
  		this.parent.value = this.parent.wrapper.get();

  		this.value = this.parent.value[ this.key ];
  		this.adapt();
  	} else if ( this.wrapper ) {
  		this.value = value;
  		this.adapt();
  	} else {
  		var parentValue = this.parent.value || this.parent.createBranch( this.key );
  		parentValue[ this.key ] = value;

  		this.value = value;
  		this.adapt();
  	}

  	this.parent.clearUnresolveds();
  	this.clearUnresolveds();

  	// notify dependants
  	var previousOriginatingModel = originatingModel; // for the array.length special case
  	originatingModel = this;

  	this.children.forEach( mark );
  	this.deps.forEach( handleChange );

  	this.notifyUpstream();

  	originatingModel = previousOriginatingModel;
  };

  Model.prototype.clearUnresolveds = function clearUnresolveds ( specificKey ) {
  	var this$1 = this;

  		var i = this.unresolved.length;

  	while ( i-- ) {
  		var key = this$1.unresolved[i];

  		if ( specificKey && key !== specificKey ) continue;

  		var resolvers = this$1.unresolvedByKey[ key ];
  		var hasKey = this$1.has( key );

  		var j = resolvers.length;
  		while ( j-- ) {
  			if ( hasKey ) resolvers[j].attemptResolution();
  			if ( resolvers[j].resolved ) resolvers.splice( j, 1 );
  		}

  		if ( !resolvers.length ) {
  			this$1.unresolved.splice( i, 1 );
  			this$1.unresolvedByKey[ key ] = null;
  		}
  	}
  };

  Model.prototype.createBranch = function createBranch ( key ) {
  	var branch = isNumeric( key ) ? [] : {};
  	this.set( branch );

  	return branch;
  };

  Model.prototype.findMatches = function findMatches ( keys ) {
  	var len = keys.length;

  	var existingMatches = [ this ];
  	var matches;
  	var i;

  	var loop = function (  ) {
  		var key = keys[i];

  		if ( key === '*' ) {
  			matches = [];
  			existingMatches.forEach( function ( model ) {
  				matches.push.apply( matches, model.getValueChildren( model.get() ) );
  			});
  		} else {
  			matches = existingMatches.map( function ( model ) { return model.joinKey( key ); } );
  		}

  		existingMatches = matches;
  	};

  		for ( i = 0; i < len; i += 1 ) loop(  );

  	return matches;
  };

  Model.prototype.get = function get ( shouldCapture ) {
  	if ( shouldCapture ) capture( this );
  	return this.value;
  };

  Model.prototype.getIndexModel = function getIndexModel ( fragmentIndex ) {
  	var indexModels = this.parent.indexModels;

  	// non-numeric keys are a special of a numeric index in a object iteration
  	if ( typeof this.key === 'string' && fragmentIndex !== undefined ) {
  		return new KeyModel( fragmentIndex );
  	} else if ( !indexModels[ this.key ] ) {
  		indexModels[ this.key ] = new KeyModel( this.key );
  	}

  	return indexModels[ this.key ];
  };

  Model.prototype.getKeyModel = function getKeyModel () {
  	// TODO... different to IndexModel because key can never change
  	return new KeyModel( escapeKey( this.key ) );
  };

  Model.prototype.getKeypathModel = function getKeypathModel ( ractive ) {
  	var keypath = this.getKeypath(), model = this.keypathModel || ( this.keypathModel = new KeypathModel( this ) );

  	if ( ractive && ractive.component ) {
  		var mapped = this.getKeypath( ractive );
  		if ( mapped !== keypath ) {
  			var map = ractive.viewmodel.keypathModels || ( ractive.viewmodel.keypathModels = {} );
  			var child = map[ keypath ] || ( map[ keypath ] = new KeypathModel( this, ractive ) );
  			model.addChild( child );
  			return child;
  		}
  	}

  	return model;
  };

  Model.prototype.getKeypath = function getKeypath ( ractive ) {
  	var root = this.parent.isRoot ? escapeKey( this.key ) : this.parent.getKeypath() + '.' + escapeKey( this.key );

  	if ( ractive && ractive.component ) {
  		var map = ractive.viewmodel.mappings;
  		for ( var k in map ) {
  			if ( root.indexOf( map[ k ].getKeypath() ) >= 0 ) {
  				root = root.replace( map[ k ].getKeypath(), k );
  				break;
  			}
  		}
  	}

  	return root;
  };

  Model.prototype.getValueChildren = function getValueChildren ( value ) {
  	var this$1 = this;

  		var children;
  	if ( isArray( value ) ) {
  		children = [];
  		// special case - array.length. This is a horrible kludge, but
  		// it'll do for now. Alternatives welcome
  		if ( originatingModel && originatingModel.parent === this && originatingModel.key === 'length' ) {
  			children.push( originatingModel );
  		}
  		value.forEach( function ( m, i ) {
  			children.push( this$1.joinKey( i ) );
  		});

  	}

  	else if ( isObject( value ) || typeof value === 'function' ) {
  		children = Object.keys( value ).map( function ( key ) { return this$1.joinKey( key ); } );
  	}

  	else if ( value != null ) {
  		return [];
  	}

  	return children;
  };

  Model.prototype.has = function has ( key ) {
  	var value = this.get();
  	if ( !value ) return false;

  	key = unescapeKey( key );
  	if ( hasProp.call( value, key ) ) return true;

  	// We climb up the constructor chain to find if one of them contains the key
  	var constructor = value.constructor;
  	while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
  		if ( hasProp.call( constructor.prototype, key ) ) return true;
  		constructor = constructor.constructor;
  	}

  	return false;
  };

  Model.prototype.joinKey = function joinKey ( key ) {
  	if ( key === undefined || key === '' ) return this;

  	if ( !this.childByKey.hasOwnProperty( key ) ) {
  		var child = new Model( this, key );
  		this.children.push( child );
  		this.childByKey[ key ] = child;
  	}

  	return this.childByKey[ key ];
  };

  Model.prototype.joinAll = function joinAll ( keys ) {
  	var model = this;
  	for ( var i = 0; i < keys.length; i += 1 ) {
  		model = model.joinKey( keys[i] );
  	}

  	return model;
  };

  Model.prototype.mark = function mark$1 () {
  	var value = this.retrieve();

  	if ( !isEqual( value, this.value ) ) {
  		var old = this.value;
  		this.value = value;

  		// make sure the wrapper stays in sync
  		if ( old !== value || this.rewrap ) this.adapt();

  		this.children.forEach( mark );

  		this.deps.forEach( handleChange );
  		this.clearUnresolveds();
  	}
  };

  Model.prototype.merge = function merge ( array, comparator ) {
  	var oldArray = comparator ? this.value.map( comparator ) : this.value;
  	var newArray = comparator ? array.map( comparator ) : array;

  	var oldLength = oldArray.length;

  	var usedIndices = {};
  	var firstUnusedIndex = 0;

  	var newIndices = oldArray.map( function ( item ) {
  		var index;
  		var start = firstUnusedIndex;

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
  	this._merged = true;
  	this.shuffle( newIndices );
  };

  Model.prototype.notifyUpstream = function notifyUpstream () {
  	var parent = this.parent, prev = this;
  	while ( parent ) {
  		if ( parent.patternObservers.length ) parent.patternObservers.forEach( function ( o ) { return o.notify( prev.key ); } );
  		parent.deps.forEach( handleChange );
  		prev = parent;
  		parent = parent.parent;
  	}
  };

  Model.prototype.register = function register ( dep ) {
  	this.deps.push( dep );
  };

  Model.prototype.registerChange = function registerChange ( key, value ) {
  	if ( !this.isRoot ) {
  		this.root.registerChange( key, value );
  	} else {
  		this.changes[ key ] = value;
  		runloop.addInstance( this.root.ractive );
  	}
  };

  Model.prototype.registerPatternObserver = function registerPatternObserver ( observer ) {
  	this.patternObservers.push( observer );
  	this.register( observer );
  };

  Model.prototype.registerTwowayBinding = function registerTwowayBinding ( binding ) {
  	this.bindings.push( binding );
  };

  Model.prototype.removeUnresolved = function removeUnresolved ( key, resolver ) {
  	var resolvers = this.unresolvedByKey[ key ];

  	if ( resolvers ) {
  		removeFromArray( resolvers, resolver );
  	}
  };

  Model.prototype.retrieve = function retrieve () {
  	return this.parent.value ? this.parent.value[ this.key ] : undefined;
  };

  Model.prototype.set = function set ( value ) {
  	if ( this.ticker ) this.ticker.stop();
  	this.applyValue( value );
  };

  Model.prototype.shuffle = function shuffle ( newIndices ) {
  	var this$1 = this;

  		var indexModels = [];

  	newIndices.forEach( function ( newIndex, oldIndex ) {
  		if ( newIndex !== oldIndex && this$1.childByKey[oldIndex] ) this$1.childByKey[oldIndex].shuffled();

  		if ( !~newIndex ) return;

  		var model = this$1.indexModels[ oldIndex ];

  		if ( !model ) return;

  		indexModels[ newIndex ] = model;

  		if ( newIndex !== oldIndex ) {
  			model.rebind( newIndex );
  		}
  	});

  	this.indexModels = indexModels;

  	// shuffles need to happen before marks...
  	this.deps.forEach( function ( dep ) {
  		if ( dep.shuffle ) dep.shuffle( newIndices );
  	});

  	this.updateKeypathDependants();
  	this.mark();

  	// ...but handleChange must happen after (TODO document why)
  	this.deps.forEach( function ( dep ) {
  		if ( !dep.shuffle ) dep.handleChange();
  	});
  };

  Model.prototype.shuffled = function shuffled () {
  	var this$1 = this;

  		var i = this.children.length;
  	while ( i-- ) {
  		this$1.children[i].shuffled();
  	}
  	if ( this.wrapper ) {
  		this.wrapper.teardown();
  		this.wrapper = null;
  		this.rewrap = true;
  	}
  };

  Model.prototype.teardown = function teardown$1 () {
  	this.children.forEach( teardown );
  	if ( this.wrapper ) this.wrapper.teardown();
  	if ( this.keypathModels ) {
  		for ( var k in this.keypathModels ) {
  			this.keypathModels[ k ].teardown();
  		}
  	}
  };

  Model.prototype.unregister = function unregister ( dependant ) {
  	removeFromArray( this.deps, dependant );
  };

  Model.prototype.unregisterPatternObserver = function unregisterPatternObserver ( observer ) {
  	removeFromArray( this.patternObservers, observer );
  	this.unregister( observer );
  };

  Model.prototype.unregisterTwowayBinding = function unregisterTwowayBinding ( binding ) {
  	removeFromArray( this.bindings, binding );
  };

  Model.prototype.updateFromBindings = function updateFromBindings$1 ( cascade ) {
  	var this$1 = this;

  		var i = this.bindings.length;
  	while ( i-- ) {
  		var value = this$1.bindings[i].getValue();
  		if ( value !== this$1.value ) this$1.set( value );
  	}

  	if ( cascade ) {
  		this.children.forEach( updateFromBindings );
  	}
  };

  Model.prototype.updateKeypathDependants = function updateKeypathDependants$1 () {
  	this.children.forEach( updateKeypathDependants );
  	if ( this.keypathModel ) this.keypathModel.handleChange();
  };

  var GlobalModel = (function (Model) {
  	function GlobalModel ( ) {
  		Model.call( this, null, '@global' );
  		this.value = typeof global !== 'undefined' ? global : window;
  		this.isRoot = true;
  		this.root = this;
  		this.adaptors = [];
  	}

  	GlobalModel.prototype = Object.create( Model && Model.prototype );
  	GlobalModel.prototype.constructor = GlobalModel;

  	GlobalModel.prototype.getKeypath = function getKeypath() {
  		return '@global';
  	};

  	// global model doesn't contribute changes events because it has no instance
  	GlobalModel.prototype.registerChange = function registerChange () {};

  	return GlobalModel;
  }(Model));

  var GlobalModel$1 = new GlobalModel();

  function resolveReference ( fragment, ref ) {
  	var context = fragment.findContext();

  	// special references
  	// TODO does `this` become `.` at parse time?
  	if ( ref === '.' || ref === 'this' ) return context;
  	if ( ref === '@keypath' ) return context.getKeypathModel( fragment.ractive );
  	if ( ref === '@rootpath' ) return context.getKeypathModel();
  	if ( ref === '@index' ) {
  		var repeater = fragment.findRepeatingFragment();
  		// make sure the found fragment is actually an iteration
  		if ( !repeater.isIteration ) return;
  		return repeater.context.getIndexModel( repeater.index );
  	}
  	if ( ref === '@key' ) return fragment.findRepeatingFragment().context.getKeyModel();
  	if ( ref === '@ractive' ) {
  		return fragment.ractive.viewmodel.getRactiveModel();
  	}
  	if ( ref === '@global' ) {
  		return GlobalModel$1;
  	}

  	// ancestor references
  	if ( ref[0] === '~' ) return fragment.ractive.viewmodel.joinAll( splitKeypathI( ref.slice( 2 ) ) );
  	if ( ref[0] === '.' ) {
  		var parts = ref.split( '/' );

  		while ( parts[0] === '.' || parts[0] === '..' ) {
  			var part = parts.shift();

  			if ( part === '..' ) {
  				context = context.parent;
  			}
  		}

  		ref = parts.join( '/' );

  		// special case - `{{.foo}}` means the same as `{{./foo}}`
  		if ( ref[0] === '.' ) ref = ref.slice( 1 );
  		return context.joinAll( splitKeypathI( ref ) );
  	}

  	return resolveAmbiguousReference( fragment, ref );
  }

  function Ractive$get ( keypath ) {
  	if ( !keypath ) return this.viewmodel.get( true );

  	var keys = splitKeypathI( keypath );
  	var key = keys[0];

  	var model;

  	if ( !this.viewmodel.has( key ) ) {
  		// if this is an inline component, we may need to create
  		// an implicit mapping
  		if ( this.component && !this.isolated ) {
  			model = resolveReference( this.component.parentFragment, key );

  			if ( model ) {
  				this.viewmodel.map( key, model );
  			}
  		}
  	}

  	model = this.viewmodel.joinAll( keys );
  	return model.get( true );
  }

  var insertHook = new Hook( 'insert' );

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

  	ractive.findAllComponents('*').forEach( function ( child ) {
  		fireInsertHook( child.instance );
  	});
  }

  function link( there, here ) {
  	if ( here === there || (there + '.').indexOf( here + '.' ) === 0 || (here + '.').indexOf( there + '.' ) === 0 ) {
  		throw new Error( 'A keypath cannot be linked to itself.' );
  	}

  	var promise = runloop.start();

  	var model;
  	var ln = this._links[ here ];

  	if ( ln ) {
  		if ( ln.source.model.str !== there || ln.dest.model.str !== here ) {
  			ln.unlink();
  			delete this._links[ here ];
  			this.viewmodel.joinAll( splitKeypathI( here ) ).set( ln.initialValue );
  		} else { // already linked, so nothing to do
  			runloop.end();
  			return promise;
  		}
  	}

  	// may need to allow a mapping to resolve implicitly
  	var sourcePath = splitKeypathI( there );
  	if ( !this.viewmodel.has( sourcePath[0] ) && this.component ) {
  		model = resolveReference( this.component.parentFragment, sourcePath[0] );

  		if ( model ) {
  			this.viewmodel.map( sourcePath[0], model );
  		}
  	}

  	ln = new Link( this.viewmodel.joinAll( sourcePath ), this.viewmodel.joinAll( splitKeypathI( here ) ), this );
  	this._links[ here ] = ln;
  	ln.source.handleChange();

  	runloop.end();

  	return promise;
  }

  var Link = function Link ( source, dest, ractive ) {
  	this.source = new LinkSide( source, this );
  	this.dest = new LinkSide( dest, this );
  	this.ractive = ractive;
  	this.locked = false;
  	this.initialValue = dest.get();
  };

  Link.prototype.sync = function sync ( side ) {
  	if ( !this.locked ) {
  		this.locked = true;

  		if ( side === this.dest ) {
  			this.source.model.set( this.dest.model.get() );
  		} else {
  			this.dest.model.set( this.source.model.get() );
  		}

  		this.locked = false;
  	}
  };

  Link.prototype.unlink = function unlink () {
  	this.source.model.unregister( this.source );
  	this.dest.model.unregister( this.dest );
  };

  var LinkSide = function LinkSide ( model, owner ) {
  	this.model = model;
  	this.owner = owner;
  	model.register( this );
  };

  LinkSide.prototype.handleChange = function handleChange () {
  	this.owner.sync( this );
  };

  var comparators = {};

  function getComparator ( option ) {
  	if ( !option ) return null; // use existing arrays
  	if ( option === true ) return JSON.stringify;
  	if ( typeof option === 'function' ) return option;

  	if ( typeof option === 'string' ) {
  		return comparators[ option ] || ( comparators[ option ] = function ( thing ) { return thing[ option ]; } );
  	}

  	throw new Error( 'If supplied, options.compare must be a string, function, or `true`' ); // TODO link to docs
  }

  function Ractive$merge ( keypath, array, options ) {
  	var model = this.viewmodel.joinAll( splitKeypathI( keypath ) );
  	var promise = runloop.start( this, true );
  	var value = model.get();

  	if ( array === value ) {
  		throw new Error( 'You cannot merge an array with itself' ); // TODO link to docs
  	} else if ( !isArray( value ) || !isArray( array ) ) {
  		throw new Error( 'You cannot merge an array with a non-array' );
  	}

  	var comparator = getComparator( options && options.compare );
  	model.merge( array, comparator );

  	runloop.end();
  	return promise;
  }

  function observe ( keypath, callback, options ) {
  	var this$1 = this;

  	var observers = [];
  	var map;

  	if ( isObject( keypath ) ) {
  		map = keypath;
  		options = callback || {};

  		Object.keys( map ).forEach( function ( keypath ) {
  			var callback = map[ keypath ];

  			keypath.split( ' ' ).forEach( function ( keypath ) {
  				observers.push( createObserver( this$1, keypath, callback, options ) );
  			});
  		});
  	}

  	else {
  		var keypaths;

  		if ( typeof keypath === 'function' ) {
  			options = callback;
  			callback = keypath;
  			keypaths = [ '' ];
  		} else {
  			keypaths = keypath.split( ' ' );
  		}

  		keypaths.forEach( function ( keypath ) {
  			observers.push( createObserver( this$1, keypath, callback, options || {} ) );
  		});
  	}

  	// add observers to the Ractive instance, so they can be
  	// cancelled on ractive.teardown()
  	this._observers.push.apply( this._observers, observers );

  	return {
  		cancel: function () {
  			observers.forEach( function ( observer ) {
  				removeFromArray ( this$1._observers, observer );
  				observer.cancel();
  			} );
  		}
  	};
  }

  function createObserver ( ractive, keypath, callback, options ) {
  	var viewmodel = ractive.viewmodel;

  	var keys = splitKeypathI( keypath );
  	var wildcardIndex = keys.indexOf( '*' );

  	// normal keypath - no wildcards
  	if ( !~wildcardIndex ) {
  		var key = keys[0];

  		// if not the root model itself, check if viewmodel has key.
  		if ( key !== '' && !viewmodel.has( key ) ) {
  			// if this is an inline component, we may need to create an implicit mapping
  			if ( ractive.component ) {
  				var model = resolveReference( ractive.component.parentFragment, key );
  				if ( model ) viewmodel.map( key, model );
  			}
  		}

  		var model$1 = viewmodel.joinAll( keys );
  		return new Observer( ractive, model$1, callback, options );
  	}

  	// pattern observers - more complex case
  	var baseModel = wildcardIndex === 0 ?
  		viewmodel :
  		viewmodel.joinAll( keys.slice( 0, wildcardIndex ) );

  	return new PatternObserver( ractive, baseModel, keys.splice( wildcardIndex ), callback, options );
  }

  var Observer = function Observer ( ractive, model, callback, options ) {
  	this.context = options.context || ractive;
  	this.model = model;
  	this.keypath = model.getKeypath( ractive );
  	this.callback = callback;

  	this.oldValue = undefined;
  	this.newValue = model.get();

  	this.defer = options.defer;
  	this.once = options.once;
  	this.strict = options.strict;

  	this.dirty = false;

  	if ( options.init !== false ) {
  		this.dispatch();
  	} else {
  		this.oldValue = this.newValue;
  	}

  	model.register( this );
  };

  Observer.prototype.cancel = function cancel () {
  	this.model.unregister( this );
  };

  Observer.prototype.dispatch = function dispatch () {
  	this.callback.call( this.context, this.newValue, this.oldValue, this.keypath );
  	this.oldValue = this.newValue;
  	this.dirty = false;
  };

  Observer.prototype.handleChange = function handleChange () {
  	if ( !this.dirty ) {
  		this.newValue = this.model.get();

  		if ( this.strict && this.newValue === this.oldValue ) return;

  		runloop.addObserver( this, this.defer );
  		this.dirty = true;

  		if ( this.once ) this.cancel();
  	}
  };

  var PatternObserver = function PatternObserver ( ractive, baseModel, keys, callback, options ) {
  	var this$1 = this;

  		this.context = options.context || ractive;
  	this.ractive = ractive;
  	this.baseModel = baseModel;
  	this.keys = keys;
  	this.callback = callback;

  	var pattern = keys.join( '\\.' ).replace( /\*/g, '(.+)' );
  	var baseKeypath = baseModel.getKeypath( ractive );
  	this.pattern = new RegExp( ("^" + (baseKeypath ? baseKeypath + '\\.' : '') + "" + pattern + "$") );

  	this.oldValues = {};
  	this.newValues = {};

  	this.defer = options.defer;
  	this.once = options.once;
  	this.strict = options.strict;

  	this.dirty = false;
  	this.changed = [];
  	this.partial = false;

  	var models = baseModel.findMatches( this.keys );

  	models.forEach( function ( model ) {
  		this$1.newValues[ model.getKeypath( this$1.ractive ) ] = model.get();
  	});

  	if ( options.init !== false ) {
  		this.dispatch();
  	} else {
  		this.oldValues = this.newValues;
  	}

  	baseModel.registerPatternObserver( this );
  };

  PatternObserver.prototype.cancel = function cancel () {
  	this.baseModel.unregisterPatternObserver( this );
  };

  PatternObserver.prototype.dispatch = function dispatch () {
  	var this$1 = this;

  		Object.keys( this.newValues ).forEach( function ( keypath ) {
  		if ( this$1.newKeys && !this$1.newKeys[ keypath ] ) return;

  		var newValue = this$1.newValues[ keypath ];
  		var oldValue = this$1.oldValues[ keypath ];

  		if ( this$1.strict && newValue === oldValue ) return;
  		if ( isEqual( newValue, oldValue ) ) return;

  		var args = [ newValue, oldValue, keypath ];
  		if ( keypath ) {
  			var wildcards = this$1.pattern.exec( keypath ).slice( 1 );
  			args = args.concat( wildcards );
  		}

  		this$1.callback.apply( this$1.context, args );
  	});

  	if ( this.partial ) {
  		for ( var k in this.newValues ) {
  			this.oldValues[k] = this.newValues[k];
  		}
  	} else {
  		this.oldValues = this.newValues;
  	}

  	this.newKeys = null;
  	this.dirty = false;
  };

  PatternObserver.prototype.notify = function notify ( key ) {
  	this.changed.push( key );
  };

  PatternObserver.prototype.shuffle = function shuffle ( newIndices ) {
  	var this$1 = this;

  		if ( !isArray( this.baseModel.value ) ) return;

  	var base = this.baseModel.getKeypath( this.ractive );
  	var max = this.baseModel.value.length;
  	var suffix = this.keys.length > 1 ? '.' + this.keys.slice( 1 ).join( '.' ) : '';

  	this.newKeys = {};
  	for ( var i = 0; i < newIndices.length; i++ ) {
  		if ( newIndices[ i ] === -1 || newIndices[ i ] === i ) continue;
  		this$1.newKeys[ ("" + base + "." + i + "" + suffix) ] = true;
  	}

  	for ( var i$1 = newIndices.touchedFrom; i$1 < max; i$1++ ) {
  		this$1.newKeys[ ("" + base + "." + i$1 + "" + suffix) ] = true;
  	}
  };

  PatternObserver.prototype.handleChange = function handleChange () {
  	var this$1 = this;

  		if ( !this.dirty ) {
  		this.newValues = {};

  		// handle case where previously extant keypath no longer exists -
  		// observer should still fire, with undefined as new value
  		// TODO huh. according to the test suite that's not the case...
  		// Object.keys( this.oldValues ).forEach( keypath => {
  		// this.newValues[ keypath ] = undefined;
  		// });

  		if ( !this.changed.length ) {
  			this.baseModel.findMatches( this.keys ).forEach( function ( model ) {
  				var keypath = model.getKeypath( this$1.ractive );
  				this$1.newValues[ keypath ] = model.get();
  			});
  			this.partial = false;
  		} else {
  			var ok = this.baseModel.isRoot ?
  				this.changed :
  				this.changed.map( function ( key ) { return this$1.baseModel.getKeypath( this$1.ractive ) + '.' + escapeKey( key ); } );

  			this.baseModel.findMatches( this.keys ).forEach( function ( model ) {
  				var keypath = model.getKeypath( this$1.ractive );
  				// is this model on a changed keypath?
  				if ( ok.filter( function ( k ) { return keypath.indexOf( k ) === 0 && ( keypath.length === k.length || keypath[k.length] === '.' ); } ).length ) {
  					this$1.newValues[ keypath ] = model.get();
  				}
  			});
  			this.partial = true;
  		}

  		runloop.addObserver( this, this.defer );
  		this.dirty = true;
  		this.changed.length = 0;

  		if ( this.once ) this.cancel();
  	}
  };

  function observeList ( keypath, callback, options ) {
  	if ( typeof keypath !== 'string' ) {
  		throw new Error( 'ractive.observeList() must be passed a string as its first argument' );
  	}

  	var model = this.viewmodel.joinAll( splitKeypathI( keypath ) );
  	var observer = new ListObserver( this, model, callback, options || {} );

  	// add observer to the Ractive instance, so it can be
  	// cancelled on ractive.teardown()
  	this._observers.push( observer );

  	return {
  		cancel: function () {
  			observer.cancel();
  		}
  	};
  }

  function negativeOne () {
  	return -1;
  }

  var ListObserver = function ListObserver ( context, model, callback, options ) {
  	this.context = context;
  	this.model = model;
  	this.keypath = model.getKeypath();
  	this.callback = callback;

  	this.pending = null;

  	model.register( this );

  	if ( options.init !== false ) {
  		this.sliced = [];
  		this.shuffle([]);
  		this.handleChange();
  	} else {
  		this.sliced = this.slice();
  	}
  };

  ListObserver.prototype.handleChange = function handleChange () {
  	if ( this.pending ) {
  		// post-shuffle
  		this.callback( this.pending );
  		this.pending = null;
  	}

  	else {
  		// entire array changed
  		this.shuffle( this.sliced.map( negativeOne ) );
  		this.handleChange();
  	}
  };

  ListObserver.prototype.shuffle = function shuffle ( newIndices ) {
  	var this$1 = this;

  		var newValue = this.slice();

  	var inserted = [];
  	var deleted = [];
  	var start;

  	var hadIndex = {};

  	newIndices.forEach( function ( newIndex, oldIndex ) {
  		hadIndex[ newIndex ] = true;

  		if ( newIndex !== oldIndex && start === undefined ) {
  			start = oldIndex;
  		}

  		if ( newIndex === -1 ) {
  			deleted.push( this$1.sliced[ oldIndex ] );
  		}
  	});

  	if ( start === undefined ) start = newIndices.length;

  	var len = newValue.length;
  	for ( var i = 0; i < len; i += 1 ) {
  		if ( !hadIndex[i] ) inserted.push( newValue[i] );
  	}

  	this.pending = { inserted: inserted, deleted: deleted, start: start };
  	this.sliced = newValue;
  };

  ListObserver.prototype.slice = function slice () {
  	var value = this.model.get();
  	return isArray( value ) ? value.slice() : [];
  };

  var onceOptions = { init: false, once: true };

  function observeOnce ( keypath, callback, options ) {
  	if ( isObject( keypath ) || typeof keypath === 'function' ) {
  		options = extendObj( callback || {}, onceOptions );
  		return this.observe( keypath, options );
  	}

  	options = extendObj( options || {}, onceOptions );
  	return this.observe( keypath, callback, options );
  }

  function trim ( str ) { return str.trim(); };

  function notEmptyString ( str ) { return str !== ''; };

  function Ractive$off ( eventName, callback ) {
  	// if no arguments specified, remove all callbacks
  	var this$1 = this;

  	if ( !eventName ) {
  		// TODO use this code instead, once the following issue has been resolved
  		// in PhantomJS (tests are unpassable otherwise!)
  		// https://github.com/ariya/phantomjs/issues/11856
  		// defineProperty( this, '_subs', { value: create( null ), configurable: true });
  		for ( eventName in this._subs ) {
  			delete this._subs[ eventName ];
  		}
  	}

  	else {
  		// Handle multiple space-separated event names
  		var eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

  		eventNames.forEach( function ( eventName ) {
  			var subscribers = this$1._subs[ eventName ];

  			// If we have subscribers for this event...
  			if ( subscribers ) {
  				// ...if a callback was specified, only remove that
  				if ( callback ) {
  					var index = subscribers.indexOf( callback );
  					if ( index !== -1 ) {
  						subscribers.splice( index, 1 );
  					}
  				}

  				// ...otherwise remove all callbacks
  				else {
  					this$1._subs[ eventName ] = [];
  				}
  			}
  		});
  	}

  	return this;
  }

  function Ractive$on ( eventName, callback ) {
  	// allow multiple listeners to be bound in one go
  	var this$1 = this;

  	if ( typeof eventName === 'object' ) {
  		var listeners = [];
  		var n;

  		for ( n in eventName ) {
  			if ( eventName.hasOwnProperty( n ) ) {
  				listeners.push( this.on( n, eventName[ n ] ) );
  			}
  		}

  		return {
  			cancel: function () {
  				var listener;
  				while ( listener = listeners.pop() ) listener.cancel();
  			}
  		};
  	}

  	// Handle multiple space-separated event names
  	var eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

  	eventNames.forEach( function ( eventName ) {
  		( this$1._subs[ eventName ] || ( this$1._subs[ eventName ] = [] ) ).push( callback );
  	});

  	return {
  		cancel: function () { return this$1.off( eventName, callback ); }
  	};
  }

  function Ractive$once ( eventName, handler ) {
  	var listener = this.on( eventName, function () {
  		handler.apply( this, arguments );
  		listener.cancel();
  	});

  	// so we can still do listener.cancel() manually
  	return listener;
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
  	var spliceArguments, newIndices = [], removeStart, removeEnd, balance, i;

  	spliceArguments = getSpliceEquivalent( length, methodName, args );

  	if ( !spliceArguments ) {
  		return null; // TODO support reverse and sort?
  	}

  	balance = ( spliceArguments.length - 2 ) - spliceArguments[1];

  	removeStart = Math.min( length, spliceArguments[0] );
  	removeEnd = removeStart + spliceArguments[1];

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

  			while ( args.length < 2 ) {
  				args.push( length - args[0] );
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

  var arrayProto = Array.prototype;

  function makeArrayMethod ( methodName ) {
  	return function ( keypath ) {
  		var args = [], len = arguments.length - 1;
  		while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  		var model = this.viewmodel.joinAll( splitKeypathI( keypath ) );
  		var array = model.get();

  		if ( !isArray( array ) ) {
  			if ( array === undefined ) {
  				array = [];
  				var result$1 = arrayProto[ methodName ].apply( array, args );
  				return this.set( keypath, array ).then( function () { return result$1; } );
  			} else {
  				throw new Error( ("shuffle array method " + methodName + " called on non-array at " + (model.getKeypath())) );
  			}
  		}

  		var newIndices = getNewIndices( array.length, methodName, args );
  		var result = arrayProto[ methodName ].apply( array, args );

  		var promise = runloop.start( this, true ).then( function () { return result; } );
  		promise.result = result;

  		if ( newIndices ) {
  			model.shuffle( newIndices );
  		} else {
  			model.set( result );
  		}

  		runloop.end();

  		return promise;
  	};
  }

  var pop = makeArrayMethod( 'pop' );

  var push = makeArrayMethod( 'push' );

  var PREFIX = '/* Ractive.js component styles */';

  // Holds current definitions of styles.
  var styleDefinitions = [];

  // Flag to tell if we need to update the CSS
  var isDirty = false;

  // These only make sense on the browser. See additional setup below.
  var styleElement = null;
  var useCssText = null;

  function addCSS( styleDefinition ) {
  	styleDefinitions.push( styleDefinition );
  	isDirty = true;
  }

  function applyCSS() {

  	// Apply only seems to make sense when we're in the DOM. Server-side renders
  	// can call toCSS to get the updated CSS.
  	if ( !doc || !isDirty ) return;

  	if ( useCssText ) {
  		styleElement.styleSheet.cssText = getCSS( null );
  	} else {
  		styleElement.innerHTML = getCSS( null );
  	}

  	isDirty = false;
  }

  function getCSS( cssIds ) {

  	var filteredStyleDefinitions = cssIds ? styleDefinitions.filter( function ( style ) { return ~cssIds.indexOf( style.id ); } ) : styleDefinitions;

  	return filteredStyleDefinitions.reduce( function ( styles, style ) { return ("" + styles + "\n\n/* {" + (style.id) + "} */\n" + (style.styles)); }, PREFIX );

  }

  // If we're on the browser, additional setup needed.
  if ( doc && ( !styleElement || !styleElement.parentNode ) ) {

  	styleElement = doc.createElement( 'style' );
  	styleElement.type = 'text/css';

  	doc.getElementsByTagName( 'head' )[ 0 ].appendChild( styleElement );

  	useCssText = !!styleElement.styleSheet;
  }

  var renderHook = new Hook( 'render' );
  var completeHook = new Hook( 'complete' );

  function render$1 ( ractive, target, anchor, occupants ) {
  	// if `noIntro` is `true`, temporarily disable transitions
  	var transitionsEnabled = ractive.transitionsEnabled;
  	if ( ractive.noIntro ) ractive.transitionsEnabled = false;

  	var promise = runloop.start( ractive, true );
  	runloop.scheduleTask( function () { return renderHook.fire( ractive ); }, true );

  	if ( ractive.fragment.rendered ) {
  		throw new Error( 'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first' );
  	}

  	anchor = getElement( anchor ) || ractive.anchor;

  	ractive.el = target;
  	ractive.anchor = anchor;

  	// ensure encapsulated CSS is up-to-date
  	if ( ractive.cssId ) applyCSS();

  	if ( target ) {
  		( target.__ractive_instances__ || ( target.__ractive_instances__ = [] ) ).push( ractive );

  		if ( anchor ) {
  			var docFrag = doc.createDocumentFragment();
  			ractive.fragment.render( docFrag );
  			target.insertBefore( docFrag, anchor );
  		} else {
  			ractive.fragment.render( target, occupants );
  		}
  	}

  	runloop.end();
  	ractive.transitionsEnabled = transitionsEnabled;

  	return promise.then( function () { return completeHook.fire( ractive ); } );
  }

  function Ractive$render ( target, anchor ) {
  	target = getElement( target ) || this.el;

  	if ( !this.append && target ) {
  		// Teardown any existing instances *before* trying to set up the new one -
  		// avoids certain weird bugs
  		var others = target.__ractive_instances__;
  		if ( others ) others.forEach( teardown );

  		// make sure we are the only occupants
  		if ( !this.enhance ) {
  			target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
  		}
  	}

  	var occupants = this.enhance ? toArray( target.childNodes ) : null;
  	var promise = render$1( this, target, anchor, occupants );

  	if ( occupants ) {
  		while ( occupants.length ) target.removeChild( occupants.pop() );
  	}

  	return promise;
  }

  var adaptConfigurator = {
  	extend: function ( Parent, proto, options ) {
  		proto.adapt = combine( proto.adapt, ensureArray( options.adapt ) );
  	},

  	init: function () {}
  };

  function combine ( a, b ) {
  	var c = a.slice();
  	var i = b.length;

  	while ( i-- ) {
  		if ( !~c.indexOf( b[i] ) ) {
  			c.push( b[i] );
  		}
  	}

  	return c;
  }

  var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g;
  var commentsPattern = /\/\*.*?\*\//g;
  var selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
  var excludePattern = /^(?:@|\d+%)/;
  var dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;

  function trim$1 ( str ) {
  	return str.trim();
  }

  function extractString ( unit ) {
  	return unit.str;
  }

  function transformSelector ( selector, parent ) {
  	var selectorUnits = [];
  	var match;

  	while ( match = selectorUnitPattern.exec( selector ) ) {
  		selectorUnits.push({
  			str: match[0],
  			base: match[1],
  			modifiers: match[2]
  		});
  	}

  	// For each simple selector within the selector, we need to create a version
  	// that a) combines with the id, and b) is inside the id
  	var base = selectorUnits.map( extractString );

  	var transformed = [];
  	var i = selectorUnits.length;

  	while ( i-- ) {
  		var appended = base.slice();

  		// Pseudo-selectors should go after the attribute selector
  		var unit = selectorUnits[i];
  		appended[i] = unit.base + parent + unit.modifiers || '';

  		var prepended = base.slice();
  		prepended[i] = parent + ' ' + prepended[i];

  		transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
  	}

  	return transformed.join( ', ' );
  }

  function transformCss ( css, id ) {
  	var dataAttr = "[data-ractive-css~=\"{" + id + "}\"]";

  	var transformed;

  	if ( dataRvcGuidPattern.test( css ) ) {
  		transformed = css.replace( dataRvcGuidPattern, dataAttr );
  	} else {
  		transformed = css
  		.replace( commentsPattern, '' )
  		.replace( selectorsPattern, function ( match, $1 ) {
  			// don't transform at-rules and keyframe declarations
  			if ( excludePattern.test( $1 ) ) return match;

  			var selectors = $1.split( ',' ).map( trim$1 );
  			var transformed = selectors
  				.map( function ( selector ) { return transformSelector( selector, dataAttr ); } )
  				.join( ', ' ) + ' ';

  			return match.replace( $1, transformed );
  		});
  	}

  	return transformed;
  }

  function s4() {
  	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  function uuid() {
  	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  var cssConfigurator = {
  	name: 'css',

  	// Called when creating a new component definition
  	extend: function ( Parent, proto, options ) {
  		if ( !options.css ) return;

  		var id = uuid();
  		var styles = options.noCssTransform ? options.css : transformCss( options.css, id );

  		proto.cssId = id;

  		addCSS( { id: id, styles: styles } );

  	},

  	// Called when creating a new component instance
  	init: function ( Parent, target, options ) {
  		if ( !options.css ) return;

  		warnIfDebug( ("\nThe css option is currently not supported on a per-instance basis and will be discarded. Instead, we recommend instantiating from a component definition with a css option.\n\nconst Component = Ractive.extend({\n\t...\n\tcss: '/* your css */',\n\t...\n});\n\nconst componentInstance = new Component({ ... })\n\t\t") );
  	}

  };

  function bind$1 ( fn, context ) {
  	if ( !/this/.test( fn.toString() ) ) return fn;

  	var bound = fn.bind( context );
  	for ( var prop in fn ) bound[ prop ] = fn[ prop ];

  	return bound;
  }

  function validate ( data ) {
  	// Warn if userOptions.data is a non-POJO
  	if ( data && data.constructor !== Object ) {
  		if ( typeof data === 'function' ) {
  			// TODO do we need to support this in the new Ractive() case?
  		} else if ( typeof data !== 'object' ) {
  			fatal( ("data option must be an object or a function, `" + data + "` is not valid") );
  		} else {
  			warnIfDebug( 'If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged' );
  		}
  	}
  }

  var dataConfigurator = {
  	name: 'data',

  	extend: function ( Parent, proto, options ) {
  		var key;
  		var value;

  		// check for non-primitives, which could cause mutation-related bugs
  		if ( options.data && isObject( options.data ) ) {
  			for ( key in options.data ) {
  				value = options.data[ key ];

  				if ( value && typeof value === 'object' ) {
  					if ( isObject( value ) || isArray( value ) ) {
  						warnIfDebug( ("Passing a `data` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:\n\n  // this...\n  data: function () {\n    return {\n      myObject: {}\n    };\n  })\n\n  // instead of this:\n  data: {\n    myObject: {}\n  }") );
  					}
  				}
  			}
  		}

  		proto.data = combine$1( proto.data, options.data );
  	},

  	init: function ( Parent, ractive, options ) {
  		var result = combine$1( Parent.prototype.data, options.data );

  		if ( typeof result === 'function' ) result = result.call( ractive );

  		// bind functions to the ractive instance at the top level,
  		// unless it's a non-POJO (in which case alarm bells should ring)
  		if ( result && result.constructor === Object ) {
  			for ( var prop in result ) {
  				if ( typeof result[ prop ] === 'function' ) result[ prop ] = bind$1( result[ prop ], ractive );
  			}
  		}

  		return result || {};
  	},

  	reset: function ( ractive ) {
  		var result = this.init( ractive.constructor, ractive, ractive.viewmodel );
  		ractive.viewmodel.root.set( result );
  		return true;
  	}
  };

  function combine$1 ( parentValue, childValue ) {
  	validate( childValue );

  	var parentIsFn = typeof parentValue === 'function';
  	var childIsFn = typeof childValue === 'function';

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
  		var child = childIsFn ? callDataFunction( childValue, this ) : childValue;
  		var parent = parentIsFn ? callDataFunction( parentValue, this ) : parentValue;

  		return fromProperties( child, parent );
  	};
  }

  function callDataFunction ( fn, context ) {
  	var data = fn.call( context );

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
  		for ( var key in secondary ) {
  			if ( !( key in primary ) ) {
  				primary[ key ] = secondary[ key ];
  			}
  		}

  		return primary;
  	}

  	return primary || secondary;
  }

  var TEMPLATE_VERSION = 3;

  var pattern = /\$\{([^\}]+)\}/g;

  function fromExpression ( body, length ) {
  	if ( length === void 0 ) length = 0;

  	var args = new Array( length );

  	while ( length-- ) {
  		args[length] = "_" + length;
  	}

  	// Functions created directly with new Function() look like this:
  	//     function anonymous (_0 /**/) { return _0*2 }
  	//
  	// With this workaround, we get a little more compact:
  	//     function (_0){return _0*2}
  	return new Function( [], ("return function (" + (args.join(',')) + "){return(" + body + ");};") )();
  }

  function fromComputationString ( str, bindTo ) {
  	var hasThis;

  	var functionBody = 'return (' + str.replace( pattern, function ( match, keypath ) {
  		hasThis = true;
  		return ("__ractive.get(\"" + keypath + "\")");
  	}) + ');';

  	if ( hasThis ) functionBody = "var __ractive = this; " + functionBody;
  	var fn = new Function( functionBody );
  	return hasThis ? fn.bind( bindTo ) : fn;
  }

  var functions = create( null );

  function getFunction ( str, i ) {
  	if ( functions[ str ] ) return functions[ str ];
  	return functions[ str ] = createFunction( str, i );
  }

  function addFunctions( template ) {
  	if ( !template ) return;

  	var exp = template.e;

  	if ( !exp ) return;

  	Object.keys( exp ).forEach( function ( str ) {
  		if ( functions[ str ] ) return;
  		functions[ str ] = exp[ str ];
  	});
  }

  var Parser;
  var ParseError;
  var leadingWhitespace = /^\s+/;
  ParseError = function ( message ) {
  	this.name = 'ParseError';
  	this.message = message;
  	try {
  		throw new Error(message);
  	} catch (e) {
  		this.stack = e.stack;
  	}
  };

  ParseError.prototype = Error.prototype;

  Parser = function ( str, options ) {
  	var this$1 = this;

  	var items, item, lineStart = 0;

  	this.str = str;
  	this.options = options || {};
  	this.pos = 0;

  	this.lines = this.str.split( '\n' );
  	this.lineEnds = this.lines.map( function ( line ) {
  		var lineEnd = lineStart + line.length + 1; // +1 for the newline

  		lineStart = lineEnd;
  		return lineEnd;
  	}, 0 );

  	// Custom init logic
  	if ( this.init ) this.init( str, options );

  	items = [];

  	while ( ( this$1.pos < this$1.str.length ) && ( item = this$1.read() ) ) {
  		items.push( item );
  	}

  	this.leftover = this.remaining();
  	this.result = this.postProcess ? this.postProcess( items, options ) : items;
  };

  Parser.prototype = {
  	read: function ( converters ) {
  		var this$1 = this;

  		var pos, i, len, item;

  		if ( !converters ) converters = this.converters;

  		pos = this.pos;

  		len = converters.length;
  		for ( i = 0; i < len; i += 1 ) {
  			this$1.pos = pos; // reset for each attempt

  			if ( item = converters[i]( this$1 ) ) {
  				return item;
  			}
  		}

  		return null;
  	},

  	getLinePos: function ( char ) {
  		var this$1 = this;

  		var lineNum = 0, lineStart = 0, columnNum;

  		while ( char >= this$1.lineEnds[ lineNum ] ) {
  			lineStart = this$1.lineEnds[ lineNum ];
  			lineNum += 1;
  		}

  		columnNum = char - lineStart;
  		return [ lineNum + 1, columnNum + 1, char ]; // line/col should be one-based, not zero-based!
  	},

  	error: function ( message ) {
  		var pos = this.getLinePos( this.pos );
  		var lineNum = pos[0];
  		var columnNum = pos[1];

  		var line = this.lines[ pos[0] - 1 ];
  		var numTabs = 0;
  		var annotation = line.replace( /\t/g, function ( match, char ) {
  			if ( char < pos[1] ) {
  				numTabs += 1;
  			}

  			return '  ';
  		}) + '\n' + new Array( pos[1] + numTabs ).join( ' ' ) + '^----';

  		var error = new ParseError( ("" + message + " at line " + lineNum + " character " + columnNum + ":\n" + annotation) );

  		error.line = pos[0];
  		error.character = pos[1];
  		error.shortMessage = message;

  		throw error;
  	},

  	matchString: function ( string ) {
  		if ( this.str.substr( this.pos, string.length ) === string ) {
  			this.pos += string.length;
  			return string;
  		}
  	},

  	matchPattern: function ( pattern ) {
  		var match;

  		if ( match = pattern.exec( this.remaining() ) ) {
  			this.pos += match[0].length;
  			return match[1] || match[0];
  		}
  	},

  	allowWhitespace: function () {
  		this.matchPattern( leadingWhitespace );
  	},

  	remaining: function () {
  		return this.str.substring( this.pos );
  	},

  	nextChar: function () {
  		return this.str.charAt( this.pos );
  	}
  };

  Parser.extend = function ( proto ) {
  	var Parent = this, Child, key;

  	Child = function ( str, options ) {
  		Parser.call( this, str, options );
  	};

  	Child.prototype = create( Parent.prototype );

  	for ( key in proto ) {
  		if ( hasOwn.call( proto, key ) ) {
  			Child.prototype[ key ] = proto[ key ];
  		}
  	}

  	Child.extend = Parser.extend;
  	return Child;
  };

  var Parser$1 = Parser;

  var TEXT              = 1;
  var INTERPOLATOR      = 2;
  var TRIPLE            = 3;
  var SECTION           = 4;
  var INVERTED          = 5;
  var CLOSING           = 6;
  var ELEMENT           = 7;
  var PARTIAL           = 8;
  var COMMENT           = 9;
  var DELIMCHANGE       = 10;
  var CLOSING_TAG       = 14;
  var COMPONENT         = 15;
  var YIELDER           = 16;
  var INLINE_PARTIAL    = 17;
  var DOCTYPE           = 18;
  var ALIAS             = 19;

  var NUMBER_LITERAL    = 20;
  var STRING_LITERAL    = 21;
  var ARRAY_LITERAL     = 22;
  var OBJECT_LITERAL    = 23;
  var BOOLEAN_LITERAL   = 24;
  var REGEXP_LITERAL    = 25;

  var GLOBAL            = 26;
  var KEY_VALUE_PAIR    = 27;


  var REFERENCE         = 30;
  var REFINEMENT        = 31;
  var MEMBER            = 32;
  var PREFIX_OPERATOR   = 33;
  var BRACKETED         = 34;
  var CONDITIONAL       = 35;
  var INFIX_OPERATOR    = 36;

  var INVOCATION        = 40;

  var SECTION_IF        = 50;
  var SECTION_UNLESS    = 51;
  var SECTION_EACH      = 52;
  var SECTION_WITH      = 53;
  var SECTION_IF_WITH   = 54;

  var ELSE              = 60;
  var ELSEIF            = 61;

  var delimiterChangePattern = /^[^\s=]+/;
  var whitespacePattern = /^\s+/;
  function readDelimiterChange ( parser ) {
  	var start, opening, closing;

  	if ( !parser.matchString( '=' ) ) {
  		return null;
  	}

  	start = parser.pos;

  	// allow whitespace before new opening delimiter
  	parser.allowWhitespace();

  	opening = parser.matchPattern( delimiterChangePattern );
  	if ( !opening ) {
  		parser.pos = start;
  		return null;
  	}

  	// allow whitespace (in fact, it's necessary...)
  	if ( !parser.matchPattern( whitespacePattern ) ) {
  		return null;
  	}

  	closing = parser.matchPattern( delimiterChangePattern );
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

  var regexpPattern = /^(\/(?:[^\n\r\u2028\u2029/\\[]|\\.|\[(?:[^\n\r\u2028\u2029\]\\]|\\.)*])+\/(?:([gimuy])(?![a-z]*\2))*(?![a-zA-Z_$0-9]))/;

  function readNumberLiteral ( parser ) {
  	var result;

  	if ( result = parser.matchPattern( regexpPattern ) ) {
  		return {
  			t: REGEXP_LITERAL,
  			v: result
  		};
  	}

  	return null;
  }

  var delimiterChangeToken = { t: DELIMCHANGE, exclude: true };

  function readMustache ( parser ) {
  	var mustache, i;

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
  }

  function readMustacheOfType ( parser, tag ) {
  	var start, mustache, reader, i;

  	start = parser.pos;

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
  		var rewind = parser.pos;
  		if ( !readNumberLiteral( parser ) ) {
  			parser.pos = rewind - ( tag.close.length );
  			parser.error( 'Attempted to close a section that wasn\'t open' );
  		} else {
  			parser.pos = rewind;
  		}
  	}

  	for ( i = 0; i < tag.readers.length; i += 1 ) {
  		reader = tag.readers[i];

  		if ( mustache = reader( parser, tag ) ) {
  			if ( tag.isStatic ) {
  				mustache.s = true; // TODO make this `1` instead - more compact
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

  var expectedExpression = 'Expected a JavaScript expression';
  var expectedParen = 'Expected closing paren';

  // bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
  var numberPattern = /^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;

  function readNumberLiteral$1 ( parser ) {
  	var result;

  	if ( result = parser.matchPattern( numberPattern ) ) {
  		return {
  			t: NUMBER_LITERAL,
  			v: result
  		};
  	}

  	return null;
  }

  function readBooleanLiteral ( parser ) {
  	var remaining = parser.remaining();

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

  var stringMiddlePattern;
  var escapeSequencePattern;
  var lineContinuationPattern;
  // Match one or more characters until: ", ', \, or EOL/EOF.
  // EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
  stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;

  // Match one escape sequence, including the backslash.
  escapeSequencePattern = /^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;

  // Match one ES5 line continuation (backslash + line terminator).
  lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;

  // Helper for defining getDoubleQuotedString and getSingleQuotedString.
  function makeQuotedStringMatcher ( okQuote ) {
  	return function ( parser ) {
  		var literal = '"';
  		var done = false;
  		var next;

  		while ( !done ) {
  			next = ( parser.matchPattern( stringMiddlePattern ) || parser.matchPattern( escapeSequencePattern ) ||
  				parser.matchString( okQuote ) );
  			if ( next ) {
  				if ( next === ("\"") ) {
  					literal += "\\\"";
  				} else if ( next === ("\\'") ) {
  					literal += "'";
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
  }

  var getSingleQuotedString = makeQuotedStringMatcher( ("\"") );
  var getDoubleQuotedString = makeQuotedStringMatcher( ("'") );

  function readStringLiteral ( parser ) {
  	var start, string;

  	start = parser.pos;

  	if ( parser.matchString( '"' ) ) {
  		string = getDoubleQuotedString( parser );

  		if ( !parser.matchString( '"' ) ) {
  			parser.pos = start;
  			return null;
  		}

  		return {
  			t: STRING_LITERAL,
  			v: string
  		};
  	}

  	if ( parser.matchString( ("'") ) ) {
  		string = getSingleQuotedString( parser );

  		if ( !parser.matchString( ("'") ) ) {
  			parser.pos = start;
  			return null;
  		}

  		return {
  			t: STRING_LITERAL,
  			v: string
  		};
  	}

  	return null;
  }

  var namePattern = /^[a-zA-Z_$][a-zA-Z_$0-9]*/;

  var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

  // http://mathiasbynens.be/notes/javascript-properties
  // can be any name, string literal, or number literal
  function readKey ( parser ) {
  	var token;

  	if ( token = readStringLiteral( parser ) ) {
  		return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
  	}

  	if ( token = readNumberLiteral$1( parser ) ) {
  		return token.v;
  	}

  	if ( token = parser.matchPattern( namePattern ) ) {
  		return token;
  	}

  	return null;
  }

  function readKeyValuePair ( parser ) {
  	var start, key, value;

  	start = parser.pos;

  	// allow whitespace between '{' and key
  	parser.allowWhitespace();

  	var refKey = parser.nextChar() !== '\'' && parser.nextChar() !== '"';

  	key = readKey( parser );
  	if ( key === null ) {
  		parser.pos = start;
  		return null;
  	}

  	// allow whitespace between key and ':'
  	parser.allowWhitespace();

  	// es2015 shorthand property
  	if ( refKey && ( parser.nextChar() === ',' || parser.nextChar() === '}' ) ) {
  		if ( !namePattern.test( key ) ) {
  			parser.error( ("Expected a valid reference, but found '" + key + "' instead.") );
  		}

  		return {
  			t: KEY_VALUE_PAIR,
  			k: key,
  			v: {
  				t: REFERENCE,
  				n: key
  			}
  		};
  	}

  	// next character must be ':'
  	if ( !parser.matchString( ':' ) ) {
  		parser.pos = start;
  		return null;
  	}

  	// allow whitespace between ':' and value
  	parser.allowWhitespace();

  	// next expression must be a, well... expression
  	value = readExpression( parser );
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
  	var start, pairs, pair, keyValuePairs;

  	start = parser.pos;

  	pair = readKeyValuePair( parser );
  	if ( pair === null ) {
  		return null;
  	}

  	pairs = [ pair ];

  	if ( parser.matchString( ',' ) ) {
  		keyValuePairs = readKeyValuePairs( parser );

  		if ( !keyValuePairs ) {
  			parser.pos = start;
  			return null;
  		}

  		return pairs.concat( keyValuePairs );
  	}

  	return pairs;
  }

  function readObjectLiteral ( parser ) {
  	var start, keyValuePairs;

  	start = parser.pos;

  	// allow whitespace
  	parser.allowWhitespace();

  	if ( !parser.matchString( '{' ) ) {
  		parser.pos = start;
  		return null;
  	}

  	keyValuePairs = readKeyValuePairs( parser );

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
  }

  function readExpressionList ( parser ) {
  	parser.allowWhitespace();

  	var expr = readExpression( parser );

  	if ( expr === null ) return null;

  	var expressions = [ expr ];

  	// allow whitespace between expression and ','
  	parser.allowWhitespace();

  	if ( parser.matchString( ',' ) ) {
  		var next = readExpressionList( parser );
  		if ( next === null ) parser.error( expectedExpression );

  		expressions.push.apply( expressions, next );
  	}

  	return expressions;
  }

  function readArrayLiteral ( parser ) {
  	var start, expressionList;

  	start = parser.pos;

  	// allow whitespace before '['
  	parser.allowWhitespace();

  	if ( !parser.matchString( '[' ) ) {
  		parser.pos = start;
  		return null;
  	}

  	expressionList = readExpressionList( parser );

  	if ( !parser.matchString( ']' ) ) {
  		parser.pos = start;
  		return null;
  	}

  	return {
  		t: ARRAY_LITERAL,
  		m: expressionList
  	};
  }

  function readLiteral ( parser ) {
  	return readNumberLiteral$1( parser )  ||
  	       readBooleanLiteral( parser ) ||
  	       readStringLiteral( parser )  ||
  	       readObjectLiteral( parser )  ||
  	       readArrayLiteral( parser )   ||
  	       readNumberLiteral( parser );
  }

  var prefixPattern = /^(?:~\/|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/;
  var globals;
  var keywords;
  // if a reference is a browser global, we don't deference it later, so it needs special treatment
  globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null|Object|Number|String|Boolean)\b/;

  // keywords are not valid references, with the exception of `this`
  keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

  var legalReference = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:\.(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
  var relaxedName = /^[a-zA-Z_$][-\/a-zA-Z_$0-9]*/;

  function readReference ( parser ) {
  	var startPos, prefix, name, global, reference, fullLength, lastDotIndex;

  	startPos = parser.pos;

  	name = parser.matchPattern( /^@(?:keypath|rootpath|index|key|ractive|global)/ );

  	if ( !name ) {
  		prefix = parser.matchPattern( prefixPattern ) || '';
  		name = ( !prefix && parser.relaxedNames && parser.matchPattern( relaxedName ) ) ||
  		       parser.matchPattern( legalReference );

  		if ( !name && prefix === '.' ) {
  			prefix = '';
  			name = '.';
  		}
  	}

  	if ( !name ) {
  		return null;
  	}

  	// bug out if it's a keyword (exception for ancestor/restricted refs - see https://github.com/ractivejs/ractive/issues/1497)
  	if ( !prefix && !parser.relaxedNames && keywords.test( name ) ) {
  		parser.pos = startPos;
  		return null;
  	}

  	// if this is a browser global, stop here
  	if ( !prefix && globals.test( name ) ) {
  		global = globals.exec( name )[0];
  		parser.pos = startPos + global.length;

  		return {
  			t: GLOBAL,
  			v: global
  		};
  	}

  	fullLength = ( prefix || '' ).length + name.length;
  	reference = ( prefix || '' ) + normalise( name );

  	if ( parser.matchString( '(' ) ) {
  		// if this is a method invocation (as opposed to a function) we need
  		// to strip the method name from the reference combo, else the context
  		// will be wrong
  		// but only if the reference was actually a member and not a refinement
  		lastDotIndex = reference.lastIndexOf( '.' );
  		if ( lastDotIndex !== -1 && name[ name.length - 1 ] !== ']' ) {
  			var refLength = reference.length;
  			reference = reference.substr( 0, lastDotIndex );
  			parser.pos = startPos + (fullLength - ( refLength - lastDotIndex ) );
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

  	var expr = readExpression( parser );

  	if ( !expr ) parser.error( expectedExpression );

  	parser.allowWhitespace();

  	if ( !parser.matchString( ')' ) ) parser.error( expectedParen );

  	return {
  		t: BRACKETED,
  		x: expr
  	};
  }

  function readPrimary ( parser ) {
  	return readLiteral( parser )
  		|| readReference( parser )
  		|| readBracketedExpression( parser );
  }

  function readRefinement ( parser ) {
  	// some things call for strict refinement (partial names), meaning no space between reference and refinement
  	if ( !parser.strictRefinement ) {
  		parser.allowWhitespace();
  	}

  	// "." name
  	if ( parser.matchString( '.' ) ) {
  		parser.allowWhitespace();

  		var name = parser.matchPattern( namePattern );
  		if ( name ) {
  			return {
  				t: REFINEMENT,
  				n: name
  			};
  		}

  		parser.error( 'Expected a property name' );
  	}

  	// "[" expression "]"
  	if ( parser.matchString( '[' ) ) {
  		parser.allowWhitespace();

  		var expr = readExpression( parser );
  		if ( !expr ) parser.error( expectedExpression );

  		parser.allowWhitespace();

  		if ( !parser.matchString( ']' ) ) parser.error( ("Expected ']'") );

  		return {
  			t: REFINEMENT,
  			x: expr
  		};
  	}

  	return null;
  }

  function readMemberOrInvocation ( parser ) {
  	var expression = readPrimary( parser );

  	if ( !expression ) return null;

  	while ( expression ) {
  		var refinement = readRefinement( parser );
  		if ( refinement ) {
  			expression = {
  				t: MEMBER,
  				x: expression,
  				r: refinement
  			};
  		}

  		else if ( parser.matchString( '(' ) ) {
  			parser.allowWhitespace();
  			var expressionList = readExpressionList( parser );

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
  }

  var readTypeOf;
  var makePrefixSequenceMatcher;
  makePrefixSequenceMatcher = function ( symbol, fallthrough ) {
  	return function ( parser ) {
  		var expression;

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
  	var i, len, matcher, prefixOperators, fallthrough;

  	prefixOperators = '! ~ + - typeof'.split( ' ' );

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

  var readLogicalOr;
  var makeInfixSequenceMatcher;
  makeInfixSequenceMatcher = function ( symbol, fallthrough ) {
  	return function ( parser ) {
  		var start, left, right;

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
  	var i, len, matcher, infixOperators, fallthrough;

  	// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
  	// Each sequence matcher will initially fall through to its higher precedence
  	// neighbour, and only attempt to match if one of the higher precedence operators
  	// (or, ultimately, a literal, reference, or bracketed expression) already matched
  	infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );

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
  	var start, expression, ifTrue, ifFalse;

  	expression = readLogicalOr$1( parser );
  	if ( !expression ) {
  		return null;
  	}

  	start = parser.pos;

  	parser.allowWhitespace();

  	if ( !parser.matchString( '?' ) ) {
  		parser.pos = start;
  		return expression;
  	}

  	parser.allowWhitespace();

  	ifTrue = readExpression( parser );
  	if ( !ifTrue ) {
  		parser.error( expectedExpression );
  	}

  	parser.allowWhitespace();

  	if ( !parser.matchString( ':' ) ) {
  		parser.error( 'Expected ":"' );
  	}

  	parser.allowWhitespace();

  	ifFalse = readExpression( parser );
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

  function flattenExpression ( expression ) {
  	var refs;

  	extractRefs( expression, refs = [] );

  	return {
  		r: refs,
  		s: stringify( expression )
  	};

  	function stringify ( node ) {
  		switch ( node.t ) {
  			case BOOLEAN_LITERAL:
  			case GLOBAL:
  			case NUMBER_LITERAL:
  			case REGEXP_LITERAL:
  				return node.v;

  			case STRING_LITERAL:
  				return JSON.stringify( String( node.v ) );

  			case ARRAY_LITERAL:
  				return '[' + ( node.m ? node.m.map( stringify ).join( ',' ) : '' ) + ']';

  			case OBJECT_LITERAL:
  				return '{' + ( node.m ? node.m.map( stringify ).join( ',' ) : '' ) + '}';

  			case KEY_VALUE_PAIR:
  				return node.k + ':' + stringify( node.v );

  			case PREFIX_OPERATOR:
  				return ( node.s === 'typeof' ? 'typeof ' : node.s ) + stringify( node.o );

  			case INFIX_OPERATOR:
  				return stringify( node.o[0] ) + ( node.s.substr( 0, 2 ) === 'in' ? ' ' + node.s + ' ' : node.s ) + stringify( node.o[1] );

  			case INVOCATION:
  				return stringify( node.x ) + '(' + ( node.o ? node.o.map( stringify ).join( ',' ) : '' ) + ')';

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
  }

  // TODO maybe refactor this?
  function extractRefs ( node, refs ) {
  	var i, list;

  	if ( node.t === REFERENCE ) {
  		if ( refs.indexOf( node.n ) === -1 ) {
  			refs.unshift( node.n );
  		}
  	}

  	list = node.o || node.m;
  	if ( list ) {
  		if ( isObject( list ) ) {
  			extractRefs( list, refs );
  		} else {
  			i = list.length;
  			while ( i-- ) {
  				extractRefs( list[i], refs );
  			}
  		}
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
  	var referenceExpression;

  	if ( expression ) {
  		while ( expression.t === BRACKETED && expression.x ) {
  			expression = expression.x;
  		}

  		if ( expression.t === REFERENCE ) {
  			mustache.r = expression.n;
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
  	var members = [], refinement;

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

  function readTriple ( parser, tag ) {
  	var expression = readExpression( parser ), triple;

  	if ( !expression ) {
  		return null;
  	}

  	if ( !parser.matchString( tag.close ) ) {
  		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
  	}

  	triple = { t: TRIPLE };
  	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

  	return triple;
  }

  function readUnescaped ( parser, tag ) {
  	var expression, triple;

  	if ( !parser.matchString( '&' ) ) {
  		return null;
  	}

  	parser.allowWhitespace();

  	expression = readExpression( parser );

  	if ( !expression ) {
  		return null;
  	}

  	if ( !parser.matchString( tag.close ) ) {
  		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
  	}

  	triple = { t: TRIPLE };
  	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

  	return triple;
  }

  var legalAlias = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
  var asRE = /^as/i;

  function readAliases( parser ) {
  	var aliases = [], alias, start = parser.pos;

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
  	var expr, alias, start = parser.pos;

  	parser.allowWhitespace();

  	expr = readExpression( parser, [] );

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

  	alias = parser.matchPattern( legalAlias );

  	if ( !alias ) {
  		parser.error( 'Expected a legal alias name.' );
  	}

  	return { n: alias, x: expr };
  }

  function readPartial ( parser, tag ) {
  	if ( !parser.matchString( '>' ) ) return null;

  	parser.allowWhitespace();

  	// Partial names can include hyphens, so we can't use readExpression
  	// blindly. Instead, we use the `relaxedNames` flag to indicate that
  	// `foo-bar` should be read as a single name, rather than 'subtract
  	// bar from foo'
  	parser.relaxedNames = parser.strictRefinement = true;
  	var expression = readExpression( parser );
  	parser.relaxedNames = parser.strictRefinement = false;

  	if ( !expression ) return null;

  	var partial = { t: PARTIAL };
  	refineExpression( expression, partial ); // TODO...

  	parser.allowWhitespace();

  	// check for alias context e.g. `{{>foo bar as bat, bip as bop}}` then
  	// turn it into `{{#with bar as bat, bip as bop}}{{>foo}}{{/with}}`
  	var aliases = readAliases( parser );
  	if ( aliases ) {
  		partial = {
  			t: ALIAS,
  			z: aliases,
  			f: [ partial ]
  		};
  	}

  	// otherwise check for literal context e.g. `{{>foo bar}}` then
  	// turn it into `{{#with bar}}{{>foo}}{{/with}}`
  	else {
  		var context = readExpression( parser );
  		if ( context) {
  			partial = {
  				t: SECTION,
  				n: SECTION_WITH,
  				f: [ partial ]
  			};

  			refineExpression( context, partial );
  		}
  	}

  	parser.allowWhitespace();

  	if ( !parser.matchString( tag.close ) ) {
  		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
  	}

  	return partial;
  }

  function readComment ( parser, tag ) {
  	var index;

  	if ( !parser.matchString( '!' ) ) {
  		return null;
  	}

  	index = parser.remaining().indexOf( tag.close );

  	if ( index !== -1 ) {
  		parser.pos += index + tag.close.length;
  		return { t: COMMENT };
  	}
  }

  function readExpressionOrReference ( parser, expectedFollowers ) {
  	var start, expression, i;

  	start = parser.pos;
  	expression = readExpression( parser );

  	if ( !expression ) {
  		// valid reference but invalid expression e.g. `{{new}}`?
  		var ref = parser.matchPattern( /^(\w+)/ );
  		if ( ref ) {
  			return {
  				t: REFERENCE,
  				n: ref
  			};
  		}

  		return null;
  	}

  	for ( i = 0; i < expectedFollowers.length; i += 1 ) {
  		if ( parser.remaining().substr( 0, expectedFollowers[i].length ) === expectedFollowers[i] ) {
  			return expression;
  		}
  	}

  	parser.pos = start;
  	return readReference( parser );
  }

  function readInterpolator ( parser, tag ) {
  	var start, expression, interpolator, err;

  	start = parser.pos;

  	// TODO would be good for perf if we could do away with the try-catch
  	try {
  		expression = readExpressionOrReference( parser, [ tag.close ]);
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
  		parser.error( ("Expected closing delimiter '" + (tag.close) + "' after reference") );

  		if ( !expression ) {
  			// special case - comment
  			if ( parser.nextChar() === '!' ) {
  				return null;
  			}

  			parser.error( ("Expected expression or legal reference") );
  		}
  	}

  	interpolator = { t: INTERPOLATOR };
  	refineExpression( expression, interpolator ); // TODO handle this differently - it's mysterious

  	return interpolator;
  }

  var yieldPattern = /^yield\s*/;

  function readYielder ( parser, tag ) {
  	if ( !parser.matchPattern( yieldPattern ) ) return null;

  	var name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-]*/ );

  	parser.allowWhitespace();

  	if ( !parser.matchString( tag.close ) ) {
  		parser.error( ("expected legal partial name") );
  	}

  	var yielder = { t: YIELDER };
  	if ( name ) yielder.n = name;

  	return yielder;
  }

  function readClosing ( parser, tag ) {
  	var start, remaining, index, closing;

  	start = parser.pos;

  	if ( !parser.matchString( tag.open ) ) {
  		return null;
  	}

  	parser.allowWhitespace();

  	if ( !parser.matchString( '/' ) ) {
  		parser.pos = start;
  		return null;
  	}

  	parser.allowWhitespace();

  	remaining = parser.remaining();
  	index = remaining.indexOf( tag.close );

  	if ( index !== -1 ) {
  		closing = {
  			t: CLOSING,
  			r: remaining.substr( 0, index ).split( ' ' )[0]
  		};

  		parser.pos += index;

  		if ( !parser.matchString( tag.close ) ) {
  			parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
  		}

  		return closing;
  	}

  	parser.pos = start;
  	return null;
  }

  var elsePattern = /^\s*else\s*/;

  function readElse ( parser, tag ) {
  	var start = parser.pos;

  	if ( !parser.matchString( tag.open ) ) {
  		return null;
  	}

  	if ( !parser.matchPattern( elsePattern ) ) {
  		parser.pos = start;
  		return null;
  	}

  	if ( !parser.matchString( tag.close ) ) {
  		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
  	}

  	return {
  		t: ELSE
  	};
  }

  var elsePattern$1 = /^\s*elseif\s+/;

  function readElseIf ( parser, tag ) {
  	var start = parser.pos;

  	if ( !parser.matchString( tag.open ) ) {
  		return null;
  	}

  	if ( !parser.matchPattern( elsePattern$1 ) ) {
  		parser.pos = start;
  		return null;
  	}

  	var expression = readExpression( parser );

  	if ( !parser.matchString( tag.close ) ) {
  		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
  	}

  	return {
  		t: ELSEIF,
  		x: expression
  	};
  }

  var handlebarsBlockCodes = {
  	'each':    SECTION_EACH,
  	'if':      SECTION_IF,
  	'with':    SECTION_IF_WITH,
  	'unless':  SECTION_UNLESS
  };

  var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
  var keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
  var handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' );
  function readSection ( parser, tag ) {
  	var start, expression, section, child, children, hasElse, block, unlessBlock, conditions, closed, i, expectedClose, aliasOnly = false;

  	start = parser.pos;

  	if ( parser.matchString( '^' ) ) {
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
  		var aliases = readAliases( parser );
  		if ( aliases ) {
  			aliasOnly = true;
  			section.z = aliases;
  			section.t = ALIAS;
  		}
  	} else if ( block === 'each' ) {
  		var alias = readAlias( parser );
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
  			var extra;

  			if ( extra = parser.matchPattern( keyIndexRefPattern ) ) {
  				section.i = i + ',' + extra;
  			} else {
  				section.i = i;
  			}
  		}
  	}

  	parser.allowWhitespace();

  	if ( !parser.matchString( tag.close ) ) {
  		parser.error( ("Expected closing delimiter '" + (tag.close) + "'") );
  	}

  	parser.sectionDepth += 1;
  	children = section.f;

  	conditions = [];

  	do {
  		if ( child = readClosing( parser, tag ) ) {
  			if ( expectedClose && child.r !== expectedClose ) {
  				parser.error( ("Expected " + (tag.open) + "/" + expectedClose + "" + (tag.close)) );
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
  				unlessBlock = createUnlessBlock( expression );
  			}

  			unlessBlock.f.push({
  				t: SECTION,
  				n: SECTION_IF,
  				x: flattenExpression( combine$2( conditions.concat( child.x ) ) ),
  				f: children = []
  			});

  			conditions.push( invert( child.x ) );
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
  				unlessBlock = createUnlessBlock( expression );
  				children = unlessBlock.f;
  			} else {
  				unlessBlock.f.push({
  					t: SECTION,
  					n: SECTION_IF,
  					x: flattenExpression( combine$2( conditions ) ),
  					f: children = []
  				});
  			}
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

  function createUnlessBlock ( expression ) {
  	var unlessBlock = {
  		t: SECTION,
  		n: SECTION_UNLESS,
  		f: []
  	};

  	refineExpression( expression, unlessBlock );
  	return unlessBlock;
  }

  function invert ( expression ) {
  	if ( expression.t === PREFIX_OPERATOR && expression.s === '!' ) {
  		return expression.o;
  	}

  	return {
  		t: PREFIX_OPERATOR,
  		s: '!',
  		o: parensIfNecessary( expression )
  	};
  }

  function combine$2 ( expressions ) {
  	if ( expressions.length === 1 ) {
  		return expressions[0];
  	}

  	return {
  		t: INFIX_OPERATOR,
  		s: '&&',
  		o: [
  			parensIfNecessary( expressions[0] ),
  			parensIfNecessary( combine$2( expressions.slice( 1 ) ) )
  		]
  	};
  }

  function parensIfNecessary ( expression ) {
  	// TODO only wrap if necessary
  	return {
  		t: BRACKETED,
  		x: expression
  	};
  }

  var OPEN_COMMENT = '<!--';
  var CLOSE_COMMENT = '-->';
  function readHtmlComment ( parser ) {
  	var start, content, remaining, endIndex, comment;

  	start = parser.pos;

  	if ( !parser.matchString( OPEN_COMMENT ) ) {
  		return null;
  	}

  	remaining = parser.remaining();
  	endIndex = remaining.indexOf( CLOSE_COMMENT );

  	if ( endIndex === -1 ) {
  		parser.error( 'Illegal HTML - expected closing comment sequence (\'-->\')' );
  	}

  	content = remaining.substr( 0, endIndex );
  	parser.pos += endIndex + 3;

  	comment = {
  		t: COMMENT,
  		c: content
  	};

  	if ( parser.includeLinePositions ) {
  		comment.p = parser.getLinePos( start );
  	}

  	return comment;
  }

  // https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
  var booleanAttributes = /^(allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|translate|trueSpeed|typeMustMatch|visible)$/i;
  var voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

  var htmlEntities = { quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetasym: 977, upsih: 978, piv: 982, ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660, forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715, prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736, and: 8743, or: 8744, cap: 8745, cup: 8746, 'int': 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776, ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839, oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, lang: 9001, rang: 9002, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830	};
  var controlCharacters = [ 8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376 ];
  var entityPattern = new RegExp( '&(#?(?:x[\\w\\d]+|\\d+|' + Object.keys( htmlEntities ).join( '|' ) + '));?', 'g' );
  var codePointSupport = typeof String.fromCodePoint === 'function';
  var codeToChar = codePointSupport ? String.fromCodePoint : String.fromCharCode;

  function decodeCharacterReferences ( html ) {
  	return html.replace( entityPattern, function ( match, entity ) {
  		var code;

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

  var lessThan = /</g;
  var greaterThan = />/g;
  var amp = /&/g;
  var invalid = 65533;

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

  var leadingLinebreak = /^[ \t\f\r\n]*\r?\n/;
  var trailingLinebreak = /\r?\n[ \t\f\r\n]*$/;
  function stripStandalones ( items ) {
  	var i, current, backOne, backTwo, lastSectionItem;

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
  }

  function isString ( item ) {
  	return typeof item === 'string';
  }

  function isComment ( item ) {
  	return item.t === COMMENT || item.t === DELIMCHANGE;
  }

  function isSection ( item ) {
  	return ( item.t === SECTION || item.t === INVERTED ) && item.f;
  }

  function trimWhitespace ( items, leadingPattern, trailingPattern ) {
  	var item;

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
  }

  var contiguousWhitespace = /[ \t\f\r\n]+/g;
  var preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i;
  var leadingWhitespace$1 = /^[ \t\f\r\n]+/;
  var trailingWhitespace = /[ \t\f\r\n]+$/;
  var leadingNewLine = /^(?:\r\n|\r|\n)/;
  var trailingNewLine = /(?:\r\n|\r|\n)$/;

  function cleanup ( items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace ) {
  	var i,
  		item,
  		previousItem,
  		nextItem,
  		preserveWhitespaceInsideFragment,
  		removeLeadingWhitespaceInsideFragment,
  		removeTrailingWhitespaceInsideFragment,
  		key;

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
  			var isPreserveWhitespaceElement = item.t === ELEMENT && preserveWhitespaceElements.test( item.e );
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
  			cleanup( item.l.f, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );

  			items.splice( i + 1, 0, item.l );
  			delete item.l; // TODO would be nice if there was a way around this
  		}

  		// Clean up element attributes
  		if ( item.a ) {
  			for ( key in item.a ) {
  				if ( item.a.hasOwnProperty( key ) && typeof item.a[ key ] !== 'string' ) {
  					cleanup( item.a[ key ], stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
  				}
  			}
  		}

  		// Clean up conditional attributes
  		if ( item.m ) {
  			cleanup( item.m, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
  		}

  		// Clean up event handlers
  		if ( item.v ) {
  			for ( key in item.v ) {
  				if ( item.v.hasOwnProperty( key ) ) {
  					// clean up names
  					if ( isArray( item.v[ key ].n ) ) {
  						cleanup( item.v[ key ].n, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
  					}

  					// clean up params
  					if ( isArray( item.v[ key ].d ) ) {
  						cleanup( item.v[ key ].d, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
  					}
  				}
  			}
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

  var closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;

  function readClosingTag ( parser ) {
  	var start, tag;

  	start = parser.pos;

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

  var pattern$1 = /[-/\\^$*+?.()|[\]{}]/g;

  function escapeRegExp ( str ) {
  	return str.replace( pattern$1, '\\$&' );
  }

  var regExpCache = {};

  function getLowestIndex ( haystack, needles ) {
  	return haystack.search( regExpCache[needles.join()] || ( regExpCache[needles.join()] = new RegExp( needles.map( escapeRegExp ).join( '|' ) ) ) );
  }

  var attributeNamePattern = /^[^\s"'>\/=]+/;
  var unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/;
  function readAttribute ( parser ) {
  	var attr, name, value;

  	parser.allowWhitespace();

  	name = parser.matchPattern( attributeNamePattern );
  	if ( !name ) {
  		return null;
  	}

  	attr = { name: name };

  	value = readAttributeValue( parser );
  	if ( value != null ) { // not null/undefined
  		attr.value = value;
  	}

  	return attr;
  }

  function readAttributeValue ( parser ) {
  	var start, valueStart, startDepth, value;

  	start = parser.pos;

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

  	valueStart = parser.pos;
  	startDepth = parser.sectionDepth;

  	value = readQuotedAttributeValue( parser, ("'") ) ||
  			readQuotedAttributeValue( parser, ("\"") ) ||
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
  	var start, text, haystack, needles, index;

  	start = parser.pos;

  	text = parser.matchPattern( unquotedAttributeValueTextPattern );

  	if ( !text ) {
  		return null;
  	}

  	haystack = text;
  	needles = parser.tags.map( function ( t ) { return t.open; } ); // TODO refactor... we do this in readText.js as well

  	if ( ( index = getLowestIndex( haystack, needles ) ) !== -1 ) {
  		text = text.substr( 0, index );
  		parser.pos = start + text.length;
  	}

  	return text;
  }

  function readUnquotedAttributeValue ( parser ) {
  	var tokens, token;

  	parser.inAttribute = true;

  	tokens = [];

  	token = readMustache( parser ) || readUnquotedAttributeValueToken( parser );
  	while ( token !== null ) {
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
  	var start, tokens, token;

  	start = parser.pos;

  	if ( !parser.matchString( quoteMark ) ) {
  		return null;
  	}

  	parser.inAttribute = quoteMark;

  	tokens = [];

  	token = readMustache( parser ) || readQuotedStringToken( parser, quoteMark );
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
  	var haystack = parser.remaining();

  	var needles = parser.tags.map( function ( t ) { return t.open; } ); // TODO refactor... we do this in readText.js as well
  	needles.push( quoteMark );

  	var index = getLowestIndex( haystack, needles );

  	if ( index === -1 ) {
  		parser.error( 'Quoted attribute value must have a closing quote' );
  	}

  	if ( !index ) {
  		return null;
  	}

  	parser.pos += index;
  	return haystack.substr( 0, index );
  }

  // simple JSON parser, without the restrictions of JSON parse
  // (i.e. having to double-quote keys).
  //
  // If passed a hash of values as the second argument, ${placeholders}
  // will be replaced with those values

  var specials = {
  	'true': true,
  	'false': false,
  	'null': null,
  	undefined: undefined
  };

  var specialsPattern = new RegExp( '^(?:' + Object.keys( specials ).join( '|' ) + ')' );
  var numberPattern$1 = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
  var placeholderPattern = /\$\{([^\}]+)\}/g;
  var placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
  var onlyWhitespace = /^\s*$/;

  var JsonParser = Parser$1.extend({
  	init: function ( str, options ) {
  		this.values = options.values;
  		this.allowWhitespace();
  	},

  	postProcess: function ( result ) {
  		if ( result.length !== 1 || !onlyWhitespace.test( this.leftover ) ) {
  			return null;
  		}

  		return { value: result[0].v };
  	},

  	converters: [
  		function getPlaceholder ( parser ) {
  			if ( !parser.values ) return null;

  			var placeholder = parser.matchPattern( placeholderAtStartPattern );

  			if ( placeholder && ( parser.values.hasOwnProperty( placeholder ) ) ) {
  				return { v: parser.values[ placeholder ] };
  			}
  		},

  		function getSpecial ( parser ) {
  			var special = parser.matchPattern( specialsPattern );
  			if ( special ) return { v: specials[ special ] };
  		},

  		function getNumber ( parser ) {
  			var number = parser.matchPattern( numberPattern$1 );
  			if ( number ) return { v: +number };
  		},

  		function getString ( parser ) {
  			var stringLiteral = readStringLiteral( parser );
  			var values = parser.values;

  			if ( stringLiteral && values ) {
  				return {
  					v: stringLiteral.v.replace( placeholderPattern, function ( match, $1 ) { return ( $1 in values ? values[ $1 ] : $1 ); } )
  				};
  			}

  			return stringLiteral;
  		},

  		function getObject ( parser ) {
  			if ( !parser.matchString( '{' ) ) return null;

  			var result = {};

  			parser.allowWhitespace();

  			if ( parser.matchString( '}' ) ) {
  				return { v: result };
  			}

  			var pair;
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

  			var result = [];

  			parser.allowWhitespace();

  			if ( parser.matchString( ']' ) ) {
  				return { v: result };
  			}

  			var valueToken;
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

  	var key = readKey( parser );

  	if ( !key ) return null;

  	var pair = { key: key };

  	parser.allowWhitespace();
  	if ( !parser.matchString( ':' ) ) {
  		return null;
  	}
  	parser.allowWhitespace();

  	var valueToken = parser.read();

  	if ( !valueToken ) return null;

  	pair.value = valueToken.v;
  	return pair;
  }

  function parseJSON ( str, values ) {
  	var parser = new JsonParser( str, { values: values });
  	return parser.result;
  }

  var methodCallPattern = /^([a-zA-Z_$][a-zA-Z_$0-9]*)\(/;
  var methodCallExcessPattern = /\)\s*$/;
  var spreadPattern = /(\s*,{0,1}\s*\.{3}arguments\s*)$/;
  var ExpressionParser;
  ExpressionParser = Parser$1.extend({
  	converters: [ readExpression ]
  });

  // TODO clean this up, it's shocking
  function processDirective ( tokens, parentParser ) {
  	var result,
  		match,
  		token,
  		colonIndex,
  		directiveName,
  		directiveArgs,
  		parsed;

  	if ( typeof tokens === 'string' ) {
  		if ( match = methodCallPattern.exec( tokens ) ) {
  			var end = tokens.lastIndexOf(')');

  			// check for invalid method calls
  			if ( !methodCallExcessPattern.test( tokens ) ) {
  				parentParser.error( ("Invalid input after method call expression '" + (tokens.slice(end + 1)) + "'") );
  			}

  			result = { m: match[1] };
  			var sliced = tokens.slice( result.m.length + 1, end );

  			// does the method include spread of ...arguments?
  			var args = sliced.replace( spreadPattern, '' );

  			// if so, other arguments should be appended to end of method arguments
  			if ( sliced !== args ) {
  				result.g = true;
  			}

  			if ( args ) {
  				var parser = new ExpressionParser( '[' + args + ']' );
  				result.a = flattenExpression( parser.result[0] );
  			}

  			return result;
  		}

  		if ( tokens.indexOf( ':' ) === -1 ) {
  			return tokens.trim();
  		}

  		tokens = [ tokens ];
  	}

  	result = {};

  	directiveName = [];
  	directiveArgs = [];

  	if ( tokens ) {
  		while ( tokens.length ) {
  			token = tokens.shift();

  			if ( typeof token === 'string' ) {
  				colonIndex = token.indexOf( ':' );

  				if ( colonIndex === -1 ) {
  					directiveName.push( token );
  				} else {
  					// is the colon the first character?
  					if ( colonIndex ) {
  						// no
  						directiveName.push( token.substr( 0, colonIndex ) );
  					}

  					// if there is anything after the colon in this token, treat
  					// it as the first token of the directiveArgs fragment
  					if ( token.length > colonIndex + 1 ) {
  						directiveArgs[0] = token.substring( colonIndex + 1 );
  					}

  					break;
  				}
  			}

  			else {
  				directiveName.push( token );
  			}
  		}

  		directiveArgs = directiveArgs.concat( tokens );
  	}

  	if ( !directiveName.length ) {
  		result = '';
  	} else if ( directiveArgs.length || typeof directiveName !== 'string' ) {
  		result = {
  			// TODO is this really necessary? just use the array
  			n: ( directiveName.length === 1 && typeof directiveName[0] === 'string' ? directiveName[0] : directiveName )
  		};

  		if ( directiveArgs.length === 1 && typeof directiveArgs[0] === 'string' ) {
  			parsed = parseJSON( '[' + directiveArgs[0] + ']' );
  			result.a = parsed ? parsed.value : [ directiveArgs[0].trim() ];
  		}

  		else {
  			result.d = directiveArgs;
  		}
  	} else {
  		result = directiveName;
  	}

  	return result;
  }

  var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
  var validTagNameFollower = /^[\s\n\/>]/;
  var onPattern = /^on/;
  var proxyEventPattern = /^on-([a-zA-Z\\*\\.$_][a-zA-Z\\*\\.$_0-9\-]+)$/;
  var reservedEventNames = /^(?:change|reset|teardown|update|construct|config|init|render|unrender|detach|insert)$/;
  var directives = { 'intro-outro': 't0', intro: 't1', outro: 't2', decorator: 'o' };
  var exclude = { exclude: true };
  var disallowedContents;
  // based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
  disallowedContents = {
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

  function readElement ( parser ) {
  	var start,
  		element,
  		directiveName,
  		match,
  		addProxyEvent,
  		attribute,
  		directive,
  		selfClosing,
  		children,
  		partials,
  		hasPartials,
  		child,
  		closed,
  		pos,
  		remaining,
  		closingTag;

  	start = parser.pos;

  	if ( parser.inside || parser.inAttribute ) {
  		return null;
  	}

  	if ( !parser.matchString( '<' ) ) {
  		return null;
  	}

  	// if this is a closing tag, abort straight away
  	if ( parser.nextChar() === '/' ) {
  		return null;
  	}

  	element = {};
  	if ( parser.includeLinePositions ) {
  		element.p = parser.getLinePos( start );
  	}

  	if ( parser.matchString( '!' ) ) {
  		element.t = DOCTYPE;
  		if ( !parser.matchPattern( /^doctype/i ) ) {
  			parser.error( 'Expected DOCTYPE declaration' );
  		}

  		element.a = parser.matchPattern( /^(.+?)>/ );
  		return element;
  	}

  	element.t = ELEMENT;

  	// element name
  	element.e = parser.matchPattern( tagNamePattern );
  	if ( !element.e ) {
  		return null;
  	}

  	// next character must be whitespace, closing solidus or '>'
  	if ( !validTagNameFollower.test( parser.nextChar() ) ) {
  		parser.error( 'Illegal tag name' );
  	}

  	addProxyEvent = function ( name, directive ) {
  		var directiveName = directive.n || directive;

  		if ( reservedEventNames.test( directiveName ) ) {
  			parser.pos -= directiveName.length;
  			parser.error( 'Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, detach, insert)' );
  		}

  		element.v[ name ] = directive;
  	};

  	parser.allowWhitespace();

  	// directives and attributes
  	while ( attribute = readMustache( parser ) || readAttribute( parser ) ) {
  		// regular attributes
  		if ( attribute.name ) {
  			// intro, outro, decorator
  			if ( directiveName = directives[ attribute.name ] ) {
  				element[ directiveName ] = processDirective( attribute.value, parser );
  			}

  			// on-click etc
  			else if ( match = proxyEventPattern.exec( attribute.name ) ) {
  				if ( !element.v ) element.v = {};
  				directive = processDirective( attribute.value, parser );
  				addProxyEvent( match[1], directive );
  			}

  			else {
  				if ( !parser.sanitizeEventAttributes || !onPattern.test( attribute.name ) ) {
  					if ( !element.a ) element.a = {};
  					element.a[ attribute.name ] = attribute.value || ( attribute.value === '' ? '' : 0 );
  				}
  			}
  		}

  		// {{#if foo}}class='foo'{{/if}}
  		else {
  			if ( !element.m ) element.m = [];
  			element.m.push( attribute );
  		}

  		parser.allowWhitespace();
  	}

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

  	var lowerCaseName = element.e.toLowerCase();
  	var preserveWhitespace = parser.preserveWhitespace;

  	if ( !selfClosing && !voidElementNames.test( element.e ) ) {
  		parser.elementStack.push( lowerCaseName );

  		// Special case - if we open a script element, further tags should
  		// be ignored unless they're a closing script element
  		if ( lowerCaseName === 'script' || lowerCaseName === 'style' || lowerCaseName === 'textarea' ) {
  			parser.inside = lowerCaseName;
  		}

  		children = [];
  		partials = create( null );

  		do {
  			pos = parser.pos;
  			remaining = parser.remaining();

  			if ( !remaining ) {
  				parser.error( ("Missing end " + (parser.elementStack.length > 1 ? 'tags' : 'tag') + " (" + (parser.elementStack.reverse().map( function ( x ) { return ("</" + x + ">"); } ).join( '' )) + ")") );
  			}

  			// if for example we're in an <li> element, and we see another
  			// <li> tag, close the first so they become siblings
  			if ( !canContain( lowerCaseName, remaining ) ) {
  				closed = true;
  			}

  			// closing tag
  			else if ( closingTag = readClosingTag( parser ) ) {
  				closed = true;

  				var closingTagName = closingTag.e.toLowerCase();

  				// if this *isn't* the closing tag for the current element...
  				if ( closingTagName !== lowerCaseName ) {
  					// rewind parser
  					parser.pos = pos;

  					// if it doesn't close a parent tag, error
  					if ( !~parser.elementStack.indexOf( closingTagName ) ) {
  						var errorMessage = 'Unexpected closing tag';

  						// add additional help for void elements, since component names
  						// might clash with them
  						if ( voidElementNames.test( closingTagName ) ) {
  							errorMessage += " (<" + closingTagName + "> is a void element - it cannot contain children)";
  						}

  						parser.error( errorMessage );
  					}
  				}
  			}

  			// implicit close by closing section tag. TODO clean this up
  			else if ( child = readClosing( parser, { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] } ) ) {
  				closed = true;
  				parser.pos = pos;
  			}

  			else {
  				if ( child = parser.read( PARTIAL_READERS ) ) {
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
  	var match, disallowed;

  	match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec( remaining );
  	disallowed = disallowedContents[ name ];

  	if ( !match || !disallowed ) {
  		return true;
  	}

  	return !~disallowed.indexOf( match[1].toLowerCase() );
  }

  function readText ( parser ) {
  	var index, remaining, disallowed, barrier;

  	remaining = parser.remaining();

  	if ( parser.textOnlyMode ) {
  		disallowed = parser.tags.map( function ( t ) { return t.open; } );
  		disallowed = disallowed.concat( parser.tags.map( function ( t ) { return '\\' + t.open; } ) );

  		index = getLowestIndex( remaining, disallowed );
  	} else {
  		barrier = parser.inside ? '</' + parser.inside : '<';

  		if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
  			index = remaining.indexOf( barrier );
  		} else {
  			disallowed = parser.tags.map( function ( t ) { return t.open; } );
  			disallowed = disallowed.concat( parser.tags.map( function ( t ) { return '\\' + t.open; } ) );

  			// http://developers.whatwg.org/syntax.html#syntax-attributes
  			if ( parser.inAttribute === true ) {
  				// we're inside an unquoted attribute value
  				disallowed.push( ("\""), ("'"), ("="), ("<"), (">"), '`' );
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

  var startPattern = /^<!--\s*/;
  var namePattern$1 = /s*>\s*([a-zA-Z_$][-a-zA-Z_$0-9]*)\s*/;
  var finishPattern = /\s*-->/;

  function readPartialDefinitionComment ( parser ) {
  	var start = parser.pos;
  	var open = parser.standardDelimiters[0];
  	var close = parser.standardDelimiters[1];

  	if ( !parser.matchPattern( startPattern ) || !parser.matchString( open ) ) {
  		parser.pos = start;
  		return null;
  	}

  	var name = parser.matchPattern( namePattern$1 );

  	warnOnceIfDebug( ("Inline partial comments are deprecated.\nUse this...\n  {{#partial " + name + "}} ... {{/partial}}\n\n...instead of this:\n  <!-- {{>" + name + "}} --> ... <!-- {{/" + name + "}} -->'") );

  	// make sure the rest of the comment is in the correct place
  	if ( !parser.matchString( close ) || !parser.matchPattern( finishPattern ) ) {
  		parser.pos = start;
  		return null;
  	}

  	var content = [];
  	var closed;

  	var endPattern = new RegExp('^<!--\\s*' + escapeRegExp( open ) + '\\s*\\/\\s*' + name + '\\s*' + escapeRegExp( close ) + '\\s*-->');

  	do {
  		if ( parser.matchPattern( endPattern ) ) {
  			closed = true;
  		}

  		else {
  			var child = parser.read( READERS );
  			if ( !child ) {
  				parser.error( ("expected closing comment ('<!-- " + open + "/" + name + "" + close + " -->')") );
  			}

  			content.push( child );
  		}
  	} while ( !closed );

  	return {
  		t: INLINE_PARTIAL,
  		f: content,
  		n: name
  	};
  }

  var partialDefinitionSectionPattern = /^#\s*partial\s+/;

  function readPartialDefinitionSection ( parser ) {
  	var start, name, content, child, closed;

  	start = parser.pos;

  	var delimiters = parser.standardDelimiters;

  	if ( !parser.matchString( delimiters[0] ) ) {
  		return null;
  	}

  	if ( !parser.matchPattern( partialDefinitionSectionPattern ) ) {
  		parser.pos = start;
  		return null;
  	}

  	name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-\/]*/ );

  	if ( !name ) {
  		parser.error( 'expected legal partial name' );
  	}

  	if ( !parser.matchString( delimiters[1] ) ) {
  		parser.error( ("Expected closing delimiter '" + (delimiters[1]) + "'") );
  	}

  	content = [];

  	do {
  		// TODO clean this up
  		if ( child = readClosing( parser, { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] }) ) {
  			if ( !child.r === 'partial' ) {
  				parser.error( ("Expected " + (delimiters[0]) + "/partial" + (delimiters[1])) );
  			}

  			closed = true;
  		}

  		else {
  			child = parser.read( READERS );

  			if ( !child ) {
  				parser.error( ("Expected " + (delimiters[0]) + "/partial" + (delimiters[1])) );
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
  	var fragment = [];
  	var partials = create( null );
  	var hasPartials = false;

  	var preserveWhitespace = parser.preserveWhitespace;

  	while ( parser.pos < parser.str.length ) {
  		var pos = parser.pos, item, partial;

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

  	var result = {
  		v: TEMPLATE_VERSION,
  		t: fragment
  	};

  	if ( hasPartials ) {
  		result.p = partials;
  	}

  	return result;
  }

  function insertExpressions ( obj, expr ) {

  	Object.keys( obj ).forEach( function ( key ) {
  		if  ( isExpression( key, obj ) ) return addTo( obj, expr );

  		var ref = obj[ key ];
  		if ( hasChildren( ref ) ) insertExpressions( ref, expr );
   	});
  }

  function isExpression( key, obj ) {
  	return key === 's' && isArray( obj.r );
  }

  function addTo( obj, expr ) {
  	var s = obj.s, r = obj.r;
  	if ( !expr[ s ] ) expr[ s ] = fromExpression( s, r.length );
  }

  function hasChildren( ref ) {
  	return isArray( ref ) || isObject( ref );
  }

  // See https://github.com/ractivejs/template-spec for information
  // about the Ractive template specification

  var STANDARD_READERS = [ readPartial, readUnescaped, readSection, readYielder, readInterpolator, readComment ];
  var TRIPLE_READERS = [ readTriple ];
  var STATIC_READERS = [ readUnescaped, readSection, readInterpolator ]; // TODO does it make sense to have a static section?

  var StandardParser;

  function parse ( template, options ) {
  	return new StandardParser( template, options || {} ).result;
  }

  parse.computedStrings = function( computed ) {
  	if ( !computed ) return [];

  	Object.keys( computed ).forEach( function ( key ) {
  		var value = computed[ key ];
  		if ( typeof value === 'string' ) {
  			computed[ key ] = fromComputationString( value );
  		}
  	});
  };


  var READERS = [ readMustache, readHtmlComment, readElement, readText ];
  var PARTIAL_READERS = [ readPartialDefinitionComment, readPartialDefinitionSection ];

  StandardParser = Parser$1.extend({
  	init: function ( str, options ) {
  		var tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ],
  			staticDelimiters = options.staticDelimiters || [ '[[', ']]' ],
  			staticTripleDelimiters = options.staticTripleDelimiters || [ '[[[', ']]]' ];

  		this.standardDelimiters = options.delimiters || [ '{{', '}}' ];

  		this.tags = [
  			{ isStatic: false, isTriple: false, open: this.standardDelimiters[0], close: this.standardDelimiters[1], readers: STANDARD_READERS },
  			{ isStatic: false, isTriple: true,  open: tripleDelimiters[0],        close: tripleDelimiters[1],        readers: TRIPLE_READERS },
  			{ isStatic: true,  isTriple: false, open: staticDelimiters[0],        close: staticDelimiters[1],        readers: STATIC_READERS },
  			{ isStatic: true,  isTriple: true,  open: staticTripleDelimiters[0],  close: staticTripleDelimiters[1],  readers: TRIPLE_READERS }
  		];

  		this.sortMustacheTags();

  		this.sectionDepth = 0;
  		this.elementStack = [];

  		this.interpolate = {
  			script: !options.interpolate || options.interpolate.script !== false,
  			style: !options.interpolate || options.interpolate.style !== false,
  			textarea: true
  		};

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
  	},

  	postProcess: function ( result ) {
  		// special case - empty string
  		if ( !result.length ) {
  			return { t: [], v: TEMPLATE_VERSION };
  		}

  		if ( this.sectionDepth > 0 ) {
  			this.error( 'A section was left open' );
  		}

  		cleanup( result[0].t, this.stripComments, this.preserveWhitespace, !this.preserveWhitespace, !this.preserveWhitespace );

  		if ( this.csp !== false ) {
  			var expr = {};
  			insertExpressions( result[0].t, expr );
  			if ( Object.keys( expr ).length ) result[0].e = expr;
  		}

  		return result[0];
  	},

  	converters: [
  		readTemplate
  	],

  	sortMustacheTags: function () {
  		// Sort in order of descending opening delimiter length (longer first),
  		// to protect against opening delimiters being substrings of each other
  		this.tags.sort( function ( a, b ) {
  			return b.open.length - a.open.length;
  		});
  	}
  });

  var parseOptions = [
  	'delimiters',
  	'tripleDelimiters',
  	'staticDelimiters',
  	'staticTripleDelimiters',
  	'csp',
  	'interpolate',
  	'preserveWhitespace',
  	'sanitize',
  	'stripComments'
  ];

  var TEMPLATE_INSTRUCTIONS = "Either preparse or use a ractive runtime source that includes the parser. ";

  var COMPUTATION_INSTRUCTIONS = "Either use:\n\n\tRactive.parse.computedStrings( component.computed )\n\nat build time to pre-convert the strings to functions, or use functions instead of strings in computed properties.";


  function throwNoParse ( method, error, instructions ) {
  	if ( !method ) {
  		fatal( ("Missing Ractive.parse - cannot parse " + error + ". " + instructions) );
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

  var parser = {

  	fromId: function ( id, options ) {
  		if ( !doc ) {
  			if ( options && options.noThrow ) { return; }
  			throw new Error( ("Cannot retrieve template #" + id + " as Ractive is not running in a browser.") );
  		}

  		if ( id ) id = id.replace( /^#/, '' );

  		var template;

  		if ( !( template = doc.getElementById( id ) )) {
  			if ( options && options.noThrow ) { return; }
  			throw new Error( ("Could not find template element with id #" + id) );
  		}

  		if ( template.tagName.toUpperCase() !== 'SCRIPT' ) {
  			if ( options && options.noThrow ) { return; }
  			throw new Error( ("Template element with id #" + id + ", must be a <script> element") );
  		}

  		return ( 'textContent' in template ? template.textContent : template.innerHTML );

  	},

  	isParsed: function ( template) {
  		return !( typeof template === 'string' );
  	},

  	getParseOptions: function ( ractive ) {
  		// Could be Ractive or a Component
  		if ( ractive.defaults ) { ractive = ractive.defaults; }

  		return parseOptions.reduce( function ( val, key ) {
  			val[ key ] = ractive[ key ];
  			return val;
  		}, {});
  	},

  	parse: function ( template, options ) {
  		throwNoParse( parse, 'template', TEMPLATE_INSTRUCTIONS );
  		var parsed = parse( template, options );
  		addFunctions( parsed );
  		return parsed;
  	},

  	parseFor: function( template, ractive ) {
  		return this.parse( template, this.getParseOptions( ractive ) );
  	}
  };

  var templateConfigurator = {
  	name: 'template',

  	extend: function ( Parent, proto, options ) {
  		// only assign if exists
  		if ( 'template' in options ) {
  			var template = options.template;

  			if ( typeof template === 'function' ) {
  				proto.template = template;
  			} else {
  				proto.template = parseTemplate( template, proto );
  			}
  		}
  	},

  	init: function ( Parent, ractive, options ) {
  		// TODO because of prototypal inheritance, we might just be able to use
  		// ractive.template, and not bother passing through the Parent object.
  		// At present that breaks the test mocks' expectations
  		var template = 'template' in options ? options.template : Parent.prototype.template;
  		template = template || { v: TEMPLATE_VERSION, t: [] };

  		if ( typeof template === 'function' ) {
  			var fn = template;
  			template = getDynamicTemplate( ractive, fn );

  			ractive._config.template = {
  				fn: fn,
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

  	reset: function ( ractive ) {
  		var result = resetValue( ractive );

  		if ( result ) {
  			var parsed = parseTemplate( result, ractive );

  			ractive.template = parsed.t;
  			extendPartials( ractive.partials, parsed.p, true );

  			return true;
  		}
  	}
  };

  function resetValue ( ractive ) {
  	var initial = ractive._config.template;

  	// If this isn't a dynamic template, there's nothing to do
  	if ( !initial || !initial.fn ) {
  		return;
  	}

  	var result = getDynamicTemplate( ractive, initial.fn );

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
  		parse: function ( template, options ) {
  			if ( options === void 0 ) options = parser.getParseOptions( ractive );

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
  		throw new Error( ("The template cannot be " + template + ".") );
  	}

  	// Check the parsed template has a version at all
  	else if ( typeof template.v !== 'number' ) {
  		throw new Error( 'The template parser was passed a non-string template, but the template doesn\'t have a version.  Make sure you\'re passing in the template you think you are.' );
  	}

  	// Check we're using the correct version
  	else if ( template.v !== TEMPLATE_VERSION ) {
  		throw new Error( ("Mismatched template version (expected " + TEMPLATE_VERSION + ", got " + (template.v) + ") Please ensure you are using the latest version of Ractive.js in your build process as well as in your app") );
  	}
  }

  function extendPartials ( existingPartials, newPartials, overwrite ) {
  	if ( !newPartials ) return;

  	// TODO there's an ambiguity here - we need to overwrite in the `reset()`
  	// case, but not initially...

  	for ( var key in newPartials ) {
  		if ( overwrite || !existingPartials.hasOwnProperty( key ) ) {
  			existingPartials[ key ] = newPartials[ key ];
  		}
  	}
  }

  var registryNames = [
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

  var Registry = function Registry ( name, useDefaults ) {
  	this.name = name;
  	this.useDefaults = useDefaults;
  };

  Registry.prototype.extend = function extend ( Parent, proto, options ) {
  	this.configure(
  		this.useDefaults ? Parent.defaults : Parent,
  		this.useDefaults ? proto : proto.constructor,
  		options );
  };

  Registry.prototype.init = function init () {
  	// noop
  };

  Registry.prototype.configure = function configure ( Parent, target, options ) {
  	var name = this.name;
  	var option = options[ name ];

  	var registry = create( Parent[name] );

  	for ( var key in option ) {
  		registry[ key ] = option[ key ];
  	}

  	target[ name ] = registry;
  };

  Registry.prototype.reset = function reset ( ractive ) {
  	var registry = ractive[ this.name ];
  	var changed = false;

  	Object.keys( registry ).forEach( function ( key ) {
  		var item = registry[ key ];
  			
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
  };

  var registries = registryNames.map( function ( name ) { return new Registry( name, name === 'computed' ); } );

  function wrap ( parent, name, method ) {
  	if ( !/_super/.test( method ) ) return method;

  	function wrapper () {
  		var superMethod = getSuperMethod( wrapper._parent, name );
  		var hasSuper = '_super' in this;
  		var oldSuper = this._super;

  		this._super = superMethod;

  		var result = method.apply( this, arguments );

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
  		var value = parent[ name ];

  		return typeof value === 'function' ?
  			value :
  			function () { return value; };
  	}

  	return noop;
  }

  function getMessage( deprecated, correct, isError ) {
  	return "options." + deprecated + " has been deprecated in favour of options." + correct + "."
  		+ ( isError ? (" You cannot specify both options, please use options." + correct + ".") : '' );
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
  	if ( isArray( options.adaptors ) ) {
  		deprecateOption( options, 'adaptors', 'adapt' );
  	}
  }

  var custom = {
  	adapt: adaptConfigurator,
  	css: cssConfigurator,
  	data: dataConfigurator,
  	template: templateConfigurator
  };

  var defaultKeys = Object.keys( defaults );

  var isStandardKey = makeObj( defaultKeys.filter( function ( key ) { return !custom[ key ]; } ) );

  // blacklisted keys that we don't double extend
  var isBlacklisted = makeObj( defaultKeys.concat( registries.map( function ( r ) { return r.name; } ) ) );

  var order = [].concat(
  	defaultKeys.filter( function ( key ) { return !registries[ key ] && !custom[ key ]; } ),
  	registries,
  	//custom.data,
  	custom.template,
  	custom.css
  );

  var config = {
  	extend: function ( Parent, proto, options ) { return configure( 'extend', Parent, proto, options ); },

  	init: function ( Parent, ractive, options ) { return configure( 'init', Parent, ractive, options ); },

  	reset: function ( ractive ) {
  		return order.filter( function ( c ) {
  			return c.reset && c.reset( ractive );
  		}).map( function ( c ) { return c.name; } );
  	},

  	// this defines the order. TODO this isn't used anywhere in the codebase,
  	// only in the test suite - should get rid of it
  	order: order
  };

  function configure ( method, Parent, target, options ) {
  	deprecate( options );

  	for ( var key in options ) {
  		if ( isStandardKey.hasOwnProperty( key ) ) {
  			var value = options[ key ];

  			// warn the developer if they passed a function and ignore its value

  			// NOTE: we allow some functions on "el" because we duck type element lists
  			// and some libraries or ef'ed-up virtual browsers (phantomJS) return a
  			// function object as the result of querySelector methods
  			if ( key !== 'el' && typeof value === 'function' ) {
  				warnIfDebug( ("" + key + " is a Ractive option that does not expect a function and will be ignored"),
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

  	registries.forEach( function ( registry ) {
  		registry[ method ]( Parent, target, options );
  	});

  	adaptConfigurator[ method ]( Parent, target, options );
  	templateConfigurator[ method ]( Parent, target, options );
  	cssConfigurator[ method ]( Parent, target, options );

  	extendOtherMethods( Parent.prototype, target, options );
  }

  function extendOtherMethods ( parent, target, options ) {
  	for ( var key in options ) {
  		if ( !isBlacklisted[ key ] && options.hasOwnProperty( key ) ) {
  			var member = options[ key ];

  			// if this is a method that overwrites a method, wrap it:
  			if ( typeof member === 'function' ) {
  				member = wrap( parent, key, member );
  			}

  			target[ key ] = member;
  		}
  	}
  }

  function makeObj ( array ) {
  	var obj = {};
  	array.forEach( function ( x ) { return obj[x] = true; } );
  	return obj;
  }

  var shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ];

  var completeHook$1 = new Hook( 'complete' );
  var resetHook = new Hook( 'reset' );
  var renderHook$1 = new Hook( 'render' );
  var unrenderHook = new Hook( 'unrender' );

  function Ractive$reset ( data ) {
  	data = data || {};

  	if ( typeof data !== 'object' ) {
  		throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
  	}

  	// TEMP need to tidy this up
  	data = dataConfigurator.init( this.constructor, this, { data: data });

  	var promise = runloop.start( this, true );

  	// If the root object is wrapped, try and use the wrapper's reset value
  	var wrapper = this.viewmodel.wrapper;
  	if ( wrapper && wrapper.reset ) {
  		if ( wrapper.reset( data ) === false ) {
  			// reset was rejected, we need to replace the object
  			this.viewmodel.set( data );
  		}
  	} else {
  		this.viewmodel.set( data );
  	}

  	// reset config items and track if need to rerender
  	var changes = config.reset( this );
  	var rerender;

  	var i = changes.length;
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

  function collect( source, name, dest ) {
  	source.forEach( function ( item ) {
  		// queue to rerender if the item is a partial and the current name matches
  		if ( item.type === PARTIAL && ( item.refName ===  name || item.name === name ) ) {
  			dest.push( item );
  			return; // go no further
  		}

  		// if it has a fragment, process its items
  		if ( item.fragment ) {
  			collect( item.fragment.iterations || item.fragment.items, name, dest );
  		}

  		// or if it is itself a fragment, process its items
  		else if ( isArray( item.items ) ) {
  			collect( item.items, name, dest );
  		}

  		// or if it is a component, step in and process its items
  		else if ( item.type === COMPONENT && item.instance ) {
  			// ...unless the partial is shadowed
  			if ( item.instance.partials[ name ] ) return;
  			collect( item.instance.fragment.items, name, dest );
  		}

  		// if the item is an element, process its attributes too
  		if ( item.type === ELEMENT ) {
  			if ( isArray( item.attributes ) ) {
  				collect( item.attributes, name, dest );
  			}

  			if ( isArray( item.conditionalAttributes ) ) {
  				collect( item.conditionalAttributes, name, dest );
  			}
  		}
  	});
  }

  function forceResetTemplate ( partial ) {
  	partial.forceResetTemplate();
  }

  function resetPartial ( name, partial ) {
  	var collection = [];
  	collect( this.fragment.items, name, collection );

  	var promise = runloop.start( this, true );

  	this.partials[ name ] = partial;
  	collection.forEach( forceResetTemplate );

  	runloop.end();

  	return promise;
  }

  var Item = function Item ( options ) {
  	this.parentFragment = options.parentFragment;
  	this.ractive = options.parentFragment.ractive;

  	this.template = options.template;
  	this.index = options.index;
  	this.type = options.template.t;

  	this.dirty = false;
  };

  Item.prototype.bubble = function bubble () {
  	if ( !this.dirty ) {
  		this.dirty = true;
  		this.parentFragment.bubble();
  	}
  };

  Item.prototype.find = function find () {
  	return null;
  };

  Item.prototype.findAll = function findAll () {
  	// noop
  };

  Item.prototype.findComponent = function findComponent () {
  	return null;
  };

  Item.prototype.findAllComponents = function findAllComponents () {
  	// noop;
  };

  Item.prototype.findNextNode = function findNextNode () {
  	return this.parentFragment.findNextNode( this );
  };

  Item.prototype.valueOf = function valueOf () {
  	return this.toString();
  };

  var ComputationChild = (function (Model) {
  	function ComputationChild () {
  		Model.apply(this, arguments);
  	}

  	ComputationChild.prototype = Object.create( Model && Model.prototype );
  	ComputationChild.prototype.constructor = ComputationChild;

  	ComputationChild.prototype.get = function get ( shouldCapture ) {
  		if ( shouldCapture ) capture( this );

  		var parentValue = this.parent.get();
  		return parentValue ? parentValue[ this.key ] : undefined;
  	};

  	ComputationChild.prototype.handleChange = function handleChange$1 () {
  		this.dirty = true;

  		this.deps.forEach( handleChange );
  		this.children.forEach( handleChange );
  		this.clearUnresolveds(); // TODO is this necessary?
  	};

  	ComputationChild.prototype.joinKey = function joinKey ( key ) {
  		if ( key === undefined || key === '' ) return this;

  		if ( !this.childByKey.hasOwnProperty( key ) ) {
  			var child = new ComputationChild( this, key );
  			this.children.push( child );
  			this.childByKey[ key ] = child;
  		}

  		return this.childByKey[ key ];
  	};

  	return ComputationChild;
  }(Model));

  function getValue ( model ) {
  	return model ? model.get( true ) : undefined;
  }

  var ExpressionProxy = (function (Model) {
  	function ExpressionProxy ( fragment, template ) {
  		var this$1 = this;

  		Model.call( this, fragment.ractive.viewmodel, null );

  		this.fragment = fragment;
  		this.template = template;

  		this.isReadonly = true;

  		this.fn = getFunction( template.s, template.r.length );
  		this.computation = null;

  		this.resolvers = [];
  		this.models = this.template.r.map( function ( ref, index ) {
  			var model = resolveReference( this$1.fragment, ref );
  			var resolver;

  			if ( !model ) {
  				resolver = this$1.fragment.resolve( ref, function ( model ) {
  					removeFromArray( this$1.resolvers, resolver );
  					this$1.models[ index ] = model;
  					this$1.bubble();
  				});

  				this$1.resolvers.push( resolver );
  			}

  			return model;
  		});

  		this.bubble();
  	}

  	ExpressionProxy.prototype = Object.create( Model && Model.prototype );
  	ExpressionProxy.prototype.constructor = ExpressionProxy;

  	ExpressionProxy.prototype.bubble = function bubble () {
  		var this$1 = this;

  		var ractive = this.fragment.ractive;

  		// TODO the @ prevents computed props from shadowing keypaths, but the real
  		// question is why it's a computed prop in the first place... (hint, it's
  		// to do with {{else}} blocks)
  		var key = '@' + this.template.s.replace( /_(\d+)/g, function ( match, i ) {
  			if ( i >= this$1.models.length ) return match;

  			var model = this$1.models[i];
  			return model ? model.getKeypath() : '@undefined';
  		});

  		// TODO can/should we reuse computations?
  		var signature = {
  			getter: function () {
  				var values = this$1.models.map( getValue );
  				return this$1.fn.apply( ractive, values );
  			},
  			getterString: key
  		};

  		var computation = ractive.viewmodel.compute( key, signature );

  		this.value = computation.get(); // TODO should not need this, eventually

  		if ( this.computation ) {
  			this.computation.unregister( this );
  			// notify children...
  		}

  		this.computation = computation;
  		computation.register( this );

  		this.handleChange();
  	};

  	ExpressionProxy.prototype.get = function get ( shouldCapture ) {
  		return this.computation.get( shouldCapture );
  	};

  	ExpressionProxy.prototype.getKeypath = function getKeypath () {
  		return this.computation ? this.computation.getKeypath() : '@undefined';
  	};

  	ExpressionProxy.prototype.handleChange = function handleChange$1 () {
  		this.deps.forEach( handleChange );
  		this.children.forEach( handleChange );

  		this.clearUnresolveds();
  	};

  	ExpressionProxy.prototype.joinKey = function joinKey ( key ) {
  		if ( key === undefined || key === '' ) return this;

  		if ( !this.childByKey.hasOwnProperty( key ) ) {
  			var child = new ComputationChild( this, key );
  			this.children.push( child );
  			this.childByKey[ key ] = child;
  		}

  		return this.childByKey[ key ];
  	};

  	ExpressionProxy.prototype.mark = function mark () {
  		this.handleChange();
  	};

  	ExpressionProxy.prototype.retrieve = function retrieve () {
  		return this.get();
  	};

  	ExpressionProxy.prototype.teardown = function teardown () {
  		this.unbind();
  		this.fragment = undefined;
  		if ( this.computation ) {
  			this.computation.teardown();
  		}
  		this.computation = undefined;
  		Model.prototype.teardown.call(this);
  	};

  	ExpressionProxy.prototype.unregister = function unregister( dep ) {
  		Model.prototype.unregister.call( this, dep );
  		if ( !this.deps.length ) this.teardown();
  	};

  	ExpressionProxy.prototype.unbind = function unbind$1 () {
  		var this$1 = this;

  		this.resolvers.forEach( unbind );

  		var i = this.models.length;
  		while ( i-- ) {
  			if ( this$1.models[i] ) this$1.models[i].unregister( this$1 );
  		}
  	};

  	return ExpressionProxy;
  }(Model));

  var ReferenceExpressionChild = (function (Model) {
  	function ReferenceExpressionChild ( parent, key ) {
  		Model.call ( this, parent, key );
  	}

  	ReferenceExpressionChild.prototype = Object.create( Model && Model.prototype );
  	ReferenceExpressionChild.prototype.constructor = ReferenceExpressionChild;

  	ReferenceExpressionChild.prototype.applyValue = function applyValue ( value ) {
  		if ( isEqual( value, this.value ) ) return;

  		var parent = this.parent, keys = [ this.key ];
  		while ( parent ) {
  			if ( parent.base ) {
  				var target = parent.model.joinAll( keys );
  				target.applyValue( value );
  				break;
  			}

  			keys.unshift( parent.key );

  			parent = parent.parent;
  		}
  	};

  	ReferenceExpressionChild.prototype.joinKey = function joinKey ( key ) {
  		if ( key === undefined || key === '' ) return this;

  		if ( !this.childByKey.hasOwnProperty( key ) ) {
  			var child = new ReferenceExpressionChild( this, key );
  			this.children.push( child );
  			this.childByKey[ key ] = child;
  		}

  		return this.childByKey[ key ];
  	};

  	return ReferenceExpressionChild;
  }(Model));

  var ReferenceExpressionProxy = (function (Model) {
  	function ReferenceExpressionProxy ( fragment, template ) {
  		var this$1 = this;

  		Model.call( this, null, null );
  		this.root = fragment.ractive.viewmodel;

  		this.resolvers = [];

  		this.base = resolve$1( fragment, template );
  		var baseResolver;

  		if ( !this.base ) {
  			baseResolver = fragment.resolve( template.r, function ( model ) {
  				this$1.base = model;
  				this$1.bubble();

  				removeFromArray( this$1.resolvers, baseResolver );
  			});

  			this.resolvers.push( baseResolver );
  		}

  		var intermediary = {
  			handleChange: function () { return this$1.bubble(); }
  		};

  		this.members = template.m.map( function ( template, i ) {
  			if ( typeof template === 'string' ) {
  				return { get: function () { return template; } };
  			}

  			var model;
  			var resolver;

  			if ( template.t === REFERENCE ) {
  				model = resolveReference( fragment, template.n );

  				if ( model ) {
  					model.register( intermediary );
  				} else {
  					resolver = fragment.resolve( template.n, function ( model ) {
  						this$1.members[i] = model;

  						model.register( intermediary );
  						this$1.bubble();

  						removeFromArray( this$1.resolvers, resolver );
  					});

  					this$1.resolvers.push( resolver );
  				}

  				return model;
  			}

  			model = new ExpressionProxy( fragment, template );
  			model.register( intermediary );
  			return model;
  		});

  		this.isUnresolved = true;
  		this.bubble();
  	}

  	ReferenceExpressionProxy.prototype = Object.create( Model && Model.prototype );
  	ReferenceExpressionProxy.prototype.constructor = ReferenceExpressionProxy;

  	ReferenceExpressionProxy.prototype.bubble = function bubble () {
  		var this$1 = this;

  		if ( !this.base ) return;

  		// if some members are not resolved, abort
  		var i = this.members.length;
  		while ( i-- ) {
  			if ( !this$1.members[i] ) return;
  		}

  		this.isUnresolved = false;

  		var keys = this.members.map( function ( model ) { return escapeKey( String( model.get() ) ); } );
  		var model = this.base.joinAll( keys );

  		if ( this.model ) {
  			this.model.unregister( this );
  			this.model.unregisterTwowayBinding( this );
  		}

  		this.model = model;
  		this.parent = model.parent;

  		model.register( this );
  		model.registerTwowayBinding( this );

  		if ( this.keypathModel ) this.keypathModel.handleChange();

  		this.mark();
  	};

  	ReferenceExpressionProxy.prototype.forceResolution = function forceResolution () {
  		this.resolvers.forEach( function ( resolver ) { return resolver.forceResolution(); } );
  		this.bubble();
  	};

  	ReferenceExpressionProxy.prototype.get = function get () {
  		return this.model ? this.model.get() : undefined;
  	};

  	// indirect two-way bindings
  	ReferenceExpressionProxy.prototype.getValue = function getValue () {
  		var this$1 = this;

  		var i = this.bindings.length;
  		while ( i-- ) {
  			var value = this$1.bindings[i].getValue();
  			if ( value !== this$1.value ) return value;
  		}

  		return this.value;
  	};

  	ReferenceExpressionProxy.prototype.getKeypath = function getKeypath () {
  		return this.model ? this.model.getKeypath() : '@undefined';
  	};

  	ReferenceExpressionProxy.prototype.handleChange = function handleChange () {
  		this.mark();
  	};

  	ReferenceExpressionProxy.prototype.joinKey = function joinKey ( key ) {
  		if ( key === undefined || key === '' ) return this;

  		if ( !this.childByKey.hasOwnProperty( key ) ) {
  			var child = new ReferenceExpressionChild( this, key );
  			this.children.push( child );
  			this.childByKey[ key ] = child;
  		}

  		return this.childByKey[ key ];
  	};

  	ReferenceExpressionProxy.prototype.retrieve = function retrieve () {
  		return this.get();
  	};

  	ReferenceExpressionProxy.prototype.set = function set ( value ) {
  		if ( !this.model ) throw new Error( 'Unresolved reference expression. This should not happen!' );
  		this.model.set( value );
  	};

  	ReferenceExpressionProxy.prototype.unbind = function unbind$1 () {
  		this.resolvers.forEach( unbind );
  	};

  	return ReferenceExpressionProxy;
  }(Model));

  function resolve$1 ( fragment, template ) {
  	if ( template.r ) {
  		return resolveReference( fragment, template.r );
  	}

  	else if ( template.x ) {
  		return new ExpressionProxy( fragment, template.x );
  	}

  	else {
  		return new ReferenceExpressionProxy( fragment, template.rx );
  	}
  }

  function resolveAliases( section ) {
  	if ( section.template.z ) {
  		section.aliases = {};

  		var refs = section.template.z;
  		for ( var i = 0; i < refs.length; i++ ) {
  			section.aliases[ refs[i].n ] = resolve$1( section.parentFragment, refs[i].x );
  		}
  	}
  }

  var Alias = (function (Item) {
  	function Alias ( options ) {
  		Item.call( this, options );

  		this.fragment = null;
  	}

  	Alias.prototype = Object.create( Item && Item.prototype );
  	Alias.prototype.constructor = Alias;

  	Alias.prototype.bind = function bind () {
  		resolveAliases( this );

  		this.fragment = new Fragment({
  			owner: this,
  			template: this.template.f
  		}).bind();
  	};

  	Alias.prototype.detach = function detach () {
  		return this.fragment ? this.fragment.detach() : createDocumentFragment();
  	};

  	Alias.prototype.find = function find ( selector ) {
  		if ( this.fragment ) {
  			return this.fragment.find( selector );
  		}
  	};

  	Alias.prototype.findAll = function findAll ( selector, query ) {
  		if ( this.fragment ) {
  			this.fragment.findAll( selector, query );
  		}
  	};

  	Alias.prototype.findComponent = function findComponent ( name ) {
  		if ( this.fragment ) {
  			return this.fragment.findComponent( name );
  		}
  	};

  	Alias.prototype.findAllComponents = function findAllComponents ( name, query ) {
  		if ( this.fragment ) {
  			this.fragment.findAllComponents( name, query );
  		}
  	};

  	Alias.prototype.firstNode = function firstNode ( skipParent ) {
  		return this.fragment && this.fragment.firstNode( skipParent );
  	};

  	Alias.prototype.rebind = function rebind () {
  		resolveAliases( this );
  		if ( this.fragment ) this.fragment.rebind();
  	};

  	Alias.prototype.render = function render ( target ) {
  		this.rendered = true;
  		if ( this.fragment ) this.fragment.render( target );
  	};

  	Alias.prototype.toString = function toString ( escape ) {
  		return this.fragment ? this.fragment.toString( escape ) : '';
  	};

  	Alias.prototype.unbind = function unbind () {
  		this.aliases = {};
  		if ( this.fragment ) this.fragment.unbind();
  	};

  	Alias.prototype.unrender = function unrender ( shouldDestroy ) {
  		if ( this.rendered && this.fragment ) this.fragment.unrender( shouldDestroy );
  		this.rendered = false;
  	};

  	Alias.prototype.update = function update () {
  		if ( this.dirty ) {
  			this.dirty = false;
  			this.fragment.update();
  		}
  	};

  	return Alias;
  }(Item));

  function processWrapper ( wrapper, array, methodName, newIndices ) {
  	var __model = wrapper.__model;

  	if ( newIndices ) {
  		__model.shuffle( newIndices );
  	} else {
  		// If this is a sort or reverse, we just do root.set()...
  		// TODO use merge logic?
  		//root.viewmodel.mark( keypath );
  	}
  }

  var mutatorMethods = [ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ];
  var patchedArrayProto = [];

  mutatorMethods.forEach( function ( methodName ) {
  	var method = function () {
  		var this$1 = this;
  		var args = [], len = arguments.length;
  		while ( len-- ) args[ len ] = arguments[ len ];

  		var newIndices = getNewIndices( this.length, methodName, args );

  		// apply the underlying method
  		var result = Array.prototype[ methodName ].apply( this, arguments );

  		// trigger changes
  		runloop.start();

  		this._ractive.setting = true;
  		var i = this._ractive.wrappers.length;
  		while ( i-- ) {
  			processWrapper( this$1._ractive.wrappers[i], this$1, methodName, newIndices );
  		}

  		runloop.end();

  		this._ractive.setting = false;
  		return result;
  	};

  	defineProperty( patchedArrayProto, methodName, {
  		value: method
  	});
  });

  var patchArrayMethods;
  var unpatchArrayMethods;

  // can we use prototype chain injection?
  // http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
  if ( ({}).__proto__ ) {
  	// yes, we can
  	patchArrayMethods = function ( array ) { return array.__proto__ = patchedArrayProto; };
  	unpatchArrayMethods = function ( array ) { return array.__proto__ = Array.prototype; };
  }

  else {
  	// no, we can't
  	patchArrayMethods = function ( array ) {
  		var i = mutatorMethods.length;
  		while ( i-- ) {
  			var methodName = mutatorMethods[i];
  			defineProperty( array, methodName, {
  				value: patchedArrayProto[ methodName ],
  				configurable: true
  			});
  		}
  	};

  	unpatchArrayMethods = function ( array ) {
  		var i = mutatorMethods.length;
  		while ( i-- ) {
  			delete array[ mutatorMethods[i] ];
  		}
  	};
  }

  patchArrayMethods.unpatch = unpatchArrayMethods; // TODO export separately?
  var patch = patchArrayMethods;

  var errorMessage$1 = 'Something went wrong in a rather interesting way';

  var arrayAdaptor = {
  	filter: function ( object ) {
  		// wrap the array if a) b) it's an array, and b) either it hasn't been wrapped already,
  		// or the array didn't trigger the get() itself
  		return isArray( object ) && ( !object._ractive || !object._ractive.setting );
  	},
  	wrap: function ( ractive, array, keypath ) {
  		return new ArrayWrapper( ractive, array, keypath );
  	}
  };

  var ArrayWrapper = function ArrayWrapper ( ractive, array ) {
  	this.root = ractive;
  	this.value = array;
  	this.__model = null; // filled in later

  	// if this array hasn't already been ractified, ractify it
  	if ( !array._ractive ) {
  		// define a non-enumerable _ractive property to store the wrappers
  		defineProperty( array, '_ractive', {
  			value: {
  				wrappers: [],
  				instances: [],
  				setting: false
  			},
  			configurable: true
  		});

  		patch( array );
  	}

  	// store the ractive instance, so we can handle transitions later
  	if ( !array._ractive.instances[ ractive._guid ] ) {
  		array._ractive.instances[ ractive._guid ] = 0;
  		array._ractive.instances.push( ractive );
  	}

  	array._ractive.instances[ ractive._guid ] += 1;
  	array._ractive.wrappers.push( this );
  };

  ArrayWrapper.prototype.get = function get () {
  	return this.value;
  };

  ArrayWrapper.prototype.reset = function reset ( value ) {
  	return this.value === value;
  };

  ArrayWrapper.prototype.teardown = function teardown () {
  	var array, storage, wrappers, instances, index;

  	array = this.value;
  	storage = array._ractive;
  	wrappers = storage.wrappers;
  	instances = storage.instances;

  	// if teardown() was invoked because we're clearing the cache as a result of
  	// a change that the array itself triggered, we can save ourselves the teardown
  	// and immediate setup
  	if ( storage.setting ) {
  		return false; // so that we don't remove it from cached wrappers
  	}

  	index = wrappers.indexOf( this );
  	if ( index === -1 ) {
  		throw new Error( errorMessage$1 );
  	}

  	wrappers.splice( index, 1 );

  	// if nothing else depends on this array, we can revert it to its
  	// natural state
  	if ( !wrappers.length ) {
  		delete array._ractive;
  		patch.unpatch( this.value );
  	}

  	else {
  		// remove ractive instance if possible
  		instances[ this.root._guid ] -= 1;
  		if ( !instances[ this.root._guid ] ) {
  			index = instances.indexOf( this.root );

  			if ( index === -1 ) {
  				throw new Error( errorMessage$1 );
  			}

  			instances.splice( index, 1 );
  		}
  	}
  };

  var magicAdaptor;

  try {
  	Object.defineProperty({}, 'test', { get: function() {}, set: function() {} });

  	magicAdaptor = {
  		filter: function ( value ) {
  			return value && typeof value === 'object';
  		},
  		wrap: function ( ractive, value, keypath ) {
  			return new MagicWrapper( ractive, value, keypath );
  		}
  	};
  } catch ( err ) {
  	magicAdaptor = false;
  }

  var magicAdaptor$1 = magicAdaptor;

  function createOrWrapDescriptor ( originalDescriptor, ractive, keypath ) {
  	if ( originalDescriptor.set && originalDescriptor.set.__magic ) {
  		originalDescriptor.set.__magic.dependants.push({ ractive: ractive, keypath: keypath });
  		return originalDescriptor;
  	}

  	var setting;

  	var dependants = [{ ractive: ractive, keypath: keypath }];

  	var descriptor = {
  		get: function () {
  			return 'value' in originalDescriptor ? originalDescriptor.value : originalDescriptor.get();
  		},
  		set: function ( value ) {
  			if ( setting ) return;

  			if ( 'value' in originalDescriptor ) {
  				originalDescriptor.value = value;
  			} else {
  				originalDescriptor.set( value );
  			}

  			setting = true;
  			dependants.forEach( function (ref) {
  				var ractive = ref.ractive;
  				var keypath = ref.keypath;

  				ractive.set( keypath, value );
  			});
  			setting = false;
  		},
  		enumerable: true
  	};

  	descriptor.set.__magic = { dependants: dependants, originalDescriptor: originalDescriptor };

  	return descriptor;
  }

  function revert ( descriptor, ractive, keypath ) {
  	if ( !descriptor.set || !descriptor.set.__magic ) return true;

  	var dependants = descriptor.set.__magic;
  	var i = dependants.length;
  	while ( i-- ) {
  		var dependant = dependants[i];
  		if ( dependant.ractive === ractive && dependant.keypath === keypath ) {
  			dependants.splice( i, 1 );
  			return false;
  		}
  	}
  }

  var MagicWrapper = function MagicWrapper ( ractive, value, keypath ) {
  	var this$1 = this;

  		this.ractive = ractive;
  	this.value = value;
  	this.keypath = keypath;

  	this.originalDescriptors = {};

  	// wrap all properties with getters
  	Object.keys( value ).forEach( function ( key ) {
  		var originalDescriptor = Object.getOwnPropertyDescriptor( this$1.value, key );
  		this$1.originalDescriptors[ key ] = originalDescriptor;

  		var childKeypath = keypath ? ("" + keypath + "." + (escapeKey( key ))) : escapeKey( key );

  		var descriptor = createOrWrapDescriptor( originalDescriptor, ractive, childKeypath );



  		Object.defineProperty( this$1.value, key, descriptor );
  	});
  };

  MagicWrapper.prototype.get = function get () {
  	return this.value;
  };

  MagicWrapper.prototype.reset = function reset ( value ) {
  	return this.value === value;
  };

  MagicWrapper.prototype.set = function set ( key, value ) {
  	this.value[ key ] = value;
  };

  MagicWrapper.prototype.teardown = function teardown () {
  	var this$1 = this;

  		Object.keys( this.value ).forEach( function ( key ) {
  		var descriptor = Object.getOwnPropertyDescriptor( this$1.value, key );
  		if ( !descriptor.set || !descriptor.set.__magic ) return;

  		revert( descriptor );

  		if ( descriptor.set.__magic.dependants.length === 1 ) {
  			Object.defineProperty( this$1.value, key, descriptor.set.__magic.originalDescriptor );
  		}
  	});
  };

  var MagicArrayWrapper = function MagicArrayWrapper ( ractive, array, keypath ) {
  	this.value = array;

  	this.magic = true;

  	this.magicWrapper = magicAdaptor$1.wrap( ractive, array, keypath );
  	this.arrayWrapper = arrayAdaptor.wrap( ractive, array, keypath );

  	// ugh, this really is a terrible hack
  	Object.defineProperty( this, '__model', {
  		get: function () {
  			return this.arrayWrapper.__model;
  		},
  		set: function ( model ) {
  			this.arrayWrapper.__model = model;
  		}
  	});
  };

  MagicArrayWrapper.prototype.get = function get () {
  	return this.value;
  };

  MagicArrayWrapper.prototype.teardown = function teardown () {
  	this.arrayWrapper.teardown();
  	this.magicWrapper.teardown();
  };

  MagicArrayWrapper.prototype.reset = function reset ( value ) {
  	return this.arrayWrapper.reset( value ) && this.magicWrapper.reset( value );
  };

  var magicArrayAdaptor = {
  	filter: function ( object, keypath, ractive ) {
  		return magicAdaptor$1.filter( object, keypath, ractive ) && arrayAdaptor.filter( object );
  	},

  	wrap: function ( ractive, array, keypath ) {
  		return new MagicArrayWrapper( ractive, array, keypath );
  	}
  };

  // TODO this is probably a bit anal, maybe we should leave it out
  function prettify ( fnBody ) {
  	var lines = fnBody
  		.replace( /^\t+/gm, function ( tabs ) { return tabs.split( '\t' ).join( '  ' ); } )
  		.split( '\n' );

  	var minIndent = lines.length < 2 ? 0 :
  		lines.slice( 1 ).reduce( function ( prev, line ) {
  			return Math.min( prev, /^\s*/.exec( line )[0].length );
  		}, Infinity );

  	return lines.map( function ( line, i ) {
  		return '    ' + ( i ? line.substring( minIndent ) : line );
  	}).join( '\n' );
  }

  // Ditto. This function truncates the stack to only include app code
  function truncateStack ( stack ) {
  	if ( !stack ) return '';

  	var lines = stack.split( '\n' );
  	var name = Computation.name + '.getValue';

  	var truncated = [];

  	var len = lines.length;
  	for ( var i = 1; i < len; i += 1 ) {
  		var line = lines[i];

  		if ( ~line.indexOf( name ) ) {
  			return truncated.join( '\n' );
  		} else {
  			truncated.push( line );
  		}
  	}
  }

  var Computation = (function (Model) {
  	function Computation ( viewmodel, signature, key ) {
  		Model.call( this, null, null );

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

  		this.boundsSensitive = true;
  		this.dirty = true;

  		// TODO: is there a less hackish way to do this?
  		this.shuffle = undefined;
  	}

  	Computation.prototype = Object.create( Model && Model.prototype );
  	Computation.prototype.constructor = Computation;

  	Computation.prototype.get = function get ( shouldCapture ) {
  		if ( shouldCapture ) capture( this );

  		if ( this.dirty ) {
  			this.dirty = false;
  			this.value = this.getValue();
  			this.adapt();
  		}

  		return this.value;
  	};

  	Computation.prototype.getValue = function getValue () {
  		startCapturing();
  		var result;

  		try {
  			result = this.signature.getter.call( this.context );
  		} catch ( err ) {
  			warnIfDebug( ("Failed to compute " + (this.getKeypath()) + ": " + (err.message || err)) );

  			// TODO this is all well and good in Chrome, but...
  			// ...also, should encapsulate this stuff better, and only
  			// show it if Ractive.DEBUG
  			if ( hasConsole ) {
  				if ( console.groupCollapsed ) console.groupCollapsed( '%cshow details', 'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;' );
  				var functionBody = prettify( this.signature.getterString );
  				var stack = this.signature.getterUseStack ? '\n\n' + truncateStack( err.stack ) : '';
  				console.error( ("" + (err.name) + ": " + (err.message) + "\n\n" + functionBody + "" + stack) );
  				if ( console.groupCollapsed ) console.groupEnd();
  			}
  		}

  		var dependencies = stopCapturing();
  		this.setDependencies( dependencies );

  		return result;
  	};

  	Computation.prototype.handleChange = function handleChange$1 () {
  		this.dirty = true;

  		this.deps.forEach( handleChange );
  		this.children.forEach( handleChange );
  		this.clearUnresolveds(); // TODO same question as on Model - necessary for primitives?
  	};

  	Computation.prototype.joinKey = function joinKey ( key ) {
  		if ( key === undefined || key === '' ) return this;

  		if ( !this.childByKey.hasOwnProperty( key ) ) {
  			var child = new ComputationChild( this, key );
  			this.children.push( child );
  			this.childByKey[ key ] = child;
  		}

  		return this.childByKey[ key ];
  	};

  	Computation.prototype.mark = function mark () {
  		this.handleChange();
  	};

  	Computation.prototype.set = function set ( value ) {
  		if ( !this.signature.setter ) {
  			throw new Error( ("Cannot set read-only computed value '" + (this.key) + "'") );
  		}

  		this.signature.setter( value );
  	};

  	Computation.prototype.setDependencies = function setDependencies ( dependencies ) {
  		// unregister any soft dependencies we no longer have
  		var this$1 = this;

  		var i = this.dependencies.length;
  		while ( i-- ) {
  			var model = this$1.dependencies[i];
  			if ( !~dependencies.indexOf( model ) ) model.unregister( this$1 );
  		}

  		// and add any new ones
  		i = dependencies.length;
  		while ( i-- ) {
  			var model$1 = dependencies[i];
  			if ( !~this$1.dependencies.indexOf( model$1 ) ) model$1.register( this$1 );
  		}

  		this.dependencies = dependencies;
  	};

  	Computation.prototype.teardown = function teardown () {
  		var this$1 = this;

  		var i = this.dependencies.length;
  		while ( i-- ) {
  			if ( this$1.dependencies[i] ) this$1.dependencies[i].unregister( this$1 );
  		}
  		if ( this.root.computations[this.key] === this ) delete this.root.computations[this.key];
  		Model.prototype.teardown.call(this);
  	};

  	return Computation;
  }(Model));

  var RactiveModel = (function (Model) {
  	function RactiveModel ( ractive ) {
  		Model.call( this, null, '' );
  		this.value = ractive;
  		this.isRoot = true;
  		this.root = this;
  		this.adaptors = [];
  		this.ractive = ractive;
  		this.changes = {};
  	}

  	RactiveModel.prototype = Object.create( Model && Model.prototype );
  	RactiveModel.prototype.constructor = RactiveModel;

  	RactiveModel.prototype.getKeypath = function getKeypath() {
  		return '@ractive';
  	};

  	return RactiveModel;
  }(Model));

  var hasProp$1 = Object.prototype.hasOwnProperty;

  var RootModel = (function (Model) {
  	function RootModel ( options ) {
  		Model.call( this, null, null );

  		// TODO deprecate this
  		this.changes = {};

  		this.isRoot = true;
  		this.root = this;
  		this.ractive = options.ractive; // TODO sever this link

  		this.value = options.data;
  		this.adaptors = options.adapt;
  		this.adapt();

  		this.mappings = {};

  		this.computationContext = options.ractive;
  		this.computations = {};
  	}

  	RootModel.prototype = Object.create( Model && Model.prototype );
  	RootModel.prototype.constructor = RootModel;

  	RootModel.prototype.applyChanges = function applyChanges () {
  		this._changeHash = {};
  		this.flush();

  		return this._changeHash;
  	};

  	RootModel.prototype.compute = function compute ( key, signature ) {
  		var computation = new Computation( this, signature, key );
  		this.computations[ key ] = computation;

  		return computation;
  	};

  	RootModel.prototype.extendChildren = function extendChildren ( fn ) {
  		var mappings = this.mappings;
  		Object.keys( mappings ).forEach( function ( key ) {
  			fn( key, mappings[ key ] );
  		});

  		var computations = this.computations;
  		Object.keys( computations ).forEach( function ( key ) {
  			var computation = computations[ key ];
  			// exclude template expressions
  			if ( !computation.isExpression ) {
  				fn( key, computation );
  			}
  		});
  	};

  	RootModel.prototype.get = function get ( shouldCapture ) {
  		if ( shouldCapture ) capture( this );
  		var result = extendObj( {}, this.value );

  		this.extendChildren( function ( key, model ) {
  			result[ key ] = model.value;
  		});

  		return result;
  	};

  	RootModel.prototype.getKeypath = function getKeypath () {
  		return '';
  	};

  	RootModel.prototype.getRactiveModel = function getRactiveModel() {
  		return this.ractiveModel || ( this.ractiveModel = new RactiveModel( this.ractive ) );
  	};

  	RootModel.prototype.getValueChildren = function getValueChildren () {
  		var children = Model.prototype.getValueChildren.call( this, this.value );

  		this.extendChildren( function ( key, model ) {
  			children.push( model );
  		});

  		return children;
  	};

  	RootModel.prototype.handleChange = function handleChange$1 () {
  		this.deps.forEach( handleChange );
  	};

  	RootModel.prototype.has = function has ( key ) {
  		if ( ( key in this.mappings ) || ( key in this.computations ) ) return true;

  		var value = this.value;

  		key = unescapeKey( key );
  		if ( hasProp$1.call( value, key ) ) return true;

  		// We climb up the constructor chain to find if one of them contains the key
  		var constructor = value.constructor;
  		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
  			if ( hasProp$1.call( constructor.prototype, key ) ) return true;
  			constructor = constructor.constructor;
  		}

  		return false;
  	};

  	RootModel.prototype.joinKey = function joinKey ( key ) {
  		if ( key === '@global' ) return GlobalModel$1;
  		if ( key === '@ractive' ) return this.getRactiveModel();

  		return this.mappings.hasOwnProperty( key ) ? this.mappings[ key ] :
  		       this.computations.hasOwnProperty( key ) ? this.computations[ key ] :
  		       Model.prototype.joinKey.call( this, key );
  	};

  	RootModel.prototype.map = function map ( localKey, origin ) {
  		// TODO remapping
  		this.mappings[ localKey ] = origin;
  		origin.register( this );
  	};

  	RootModel.prototype.set = function set ( value ) {
  		// TODO wrapping root node is a baaaad idea. We should prevent this
  		var wrapper = this.wrapper;
  		if ( wrapper ) {
  			var shouldTeardown = !wrapper.reset || wrapper.reset( value ) === false;

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
  		this.clearUnresolveds(); // TODO do we need to do this with primitive values? if not, what about e.g. unresolved `length` property of null -> string?
  	};

  	RootModel.prototype.retrieve = function retrieve () {
  		return this.value;
  	};

  	RootModel.prototype.teardown = function teardown () {
  		var this$1 = this;

  		var keys = Object.keys( this.mappings );
  		var i = keys.length;
  		while ( i-- ){
  			if ( this$1.mappings[ keys[i] ] ) this$1.mappings[ keys[i] ].unregister( this$1 );
  		}

  		Model.prototype.teardown.call(this);
  	};

  	RootModel.prototype.update = function update () {
  		// noop
  	};

  	RootModel.prototype.updateFromBindings = function updateFromBindings ( cascade ) {
  		var this$1 = this;

  		Model.prototype.updateFromBindings.call( this, cascade );

  		if ( cascade ) {
  			// TODO computations as well?
  			Object.keys( this.mappings ).forEach( function ( key ) {
  				var model = this$1.mappings[ key ];
  				model.updateFromBindings( cascade );
  			});
  		}
  	};

  	return RootModel;
  }(Model));

  function getComputationSignature ( ractive, key, signature ) {
  	var getter;
  	var setter;

  	// useful for debugging
  	var getterString;
  	var getterUseStack;
  	var setterString;

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
  		getter: getter,
  		setter: setter,
  		getterString: getterString,
  		setterString: setterString,
  		getterUseStack: getterUseStack
  	};
  }

  var constructHook = new Hook( 'construct' );

  var registryNames$1 = [
  	'adaptors',
  	'components',
  	'decorators',
  	'easing',
  	'events',
  	'interpolators',
  	'partials',
  	'transitions'
  ];

  var uid = 0;

  function construct ( ractive, options ) {
  	if ( Ractive.DEBUG ) welcome();

  	initialiseProperties( ractive );

  	// TODO remove this, eventually
  	defineProperty( ractive, 'data', { get: deprecateRactiveData });

  	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
  	constructHook.fire( ractive, options );

  	// Add registries
  	registryNames$1.forEach( function ( name ) {
  		ractive[ name ] = extendObj( create( ractive.constructor[ name ] || null ), options[ name ] );
  	});

  	// Create a viewmodel
  	var viewmodel = new RootModel({
  		adapt: getAdaptors( ractive, ractive.adapt, options ),
  		data: dataConfigurator.init( ractive.constructor, ractive, options ),
  		ractive: ractive
  	});

  	ractive.viewmodel = viewmodel;

  	// Add computed properties
  	var computed = extendObj( create( ractive.constructor.prototype.computed ), options.computed );

  	for ( var key in computed ) {
  		var signature = getComputationSignature( ractive, key, computed[ key ] );
  		viewmodel.compute( key, signature );
  	}
  }

  function combine$3 ( a, b ) {
  	var c = a.slice();
  	var i = b.length;

  	while ( i-- ) {
  		if ( !~c.indexOf( b[i] ) ) {
  			c.push( b[i] );
  		}
  	}

  	return c;
  }

  function getAdaptors ( ractive, protoAdapt, options ) {
  	protoAdapt = protoAdapt.map( lookup );
  	var adapt = ensureArray( options.adapt ).map( lookup );

  	adapt = combine$3( protoAdapt, adapt );

  	var magic = 'magic' in options ? options.magic : ractive.magic;
  	var modifyArrays = 'modifyArrays' in options ? options.modifyArrays : ractive.modifyArrays;

  	if ( magic ) {
  		if ( !magicSupported ) {
  			throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
  		}

  		if ( modifyArrays ) {
  			adapt.push( magicArrayAdaptor );
  		}

  		adapt.push( magicAdaptor$1 );
  	}

  	if ( modifyArrays ) {
  		adapt.push( arrayAdaptor );
  	}

  	return adapt;


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
  	ractive._subs = create( null );

  	// storage for item configuration from instantiation to reset,
  	// like dynamic functions or original values
  	ractive._config = {};

  	// nodes registry
  	ractive.nodes = {};

  	// events
  	ractive.event = null;
  	ractive._eventQueue = [];

  	// live queries
  	ractive._liveQueries = [];
  	ractive._liveComponentQueries = [];

  	// observers
  	ractive._observers = [];

  	// links
  	ractive._links = {};

  	if(!ractive.component){
  		ractive.root = ractive;
  		ractive.parent = ractive.container = null; // TODO container still applicable?
  	}

  }

  function deprecateRactiveData () {
  	throw new Error( 'Using `ractive.data` is no longer supported - you must use the `ractive.get()` API instead' );
  }

  function getChildQueue ( queue, ractive ) {
  	return queue[ ractive._guid ] || ( queue[ ractive._guid ] = [] );
  }

  function fire ( hookQueue, ractive ) {
  	var childQueue = getChildQueue( hookQueue.queue, ractive );

  	hookQueue.hook.fire( ractive );

  	// queue is "live" because components can end up being
  	// added while hooks fire on parents that modify data values.
  	while ( childQueue.length ) {
  		fire( hookQueue, childQueue.shift() );
  	}

  	delete hookQueue.queue[ ractive._guid ];
  }

  var HookQueue = function HookQueue ( event ) {
  	this.hook = new Hook( event );
  	this.inProcess = {};
  	this.queue = {};
  };

  HookQueue.prototype.begin = function begin ( ractive ) {
  	this.inProcess[ ractive._guid ] = true;
  };

  HookQueue.prototype.end = function end ( ractive ) {
  	var parent = ractive.parent;

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
  };

  var configHook = new Hook( 'config' );
  var initHook = new HookQueue( 'init' );

  function initialise ( ractive, userOptions, options ) {
  	Object.keys( ractive.viewmodel.computations ).forEach( function ( key ) {
  		var computation = ractive.viewmodel.computations[ key ];

  		if ( ractive.viewmodel.value.hasOwnProperty( key ) ) {
  			computation.set( ractive.viewmodel.value[ key ] );
  		}
  	});

  	// init config from Parent and options
  	config.init( ractive.constructor, ractive, userOptions );

  	configHook.fire( ractive );
  	initHook.begin( ractive );

  	var fragment;

  	// Render virtual DOM
  	if ( ractive.template ) {
  		var cssIds;

  		if ( options.cssIds || ractive.cssId ) {
  			cssIds = options.cssIds ? options.cssIds.slice() : [];

  			if ( ractive.cssId ) {
  				cssIds.push( ractive.cssId );
  			}
  		}

  		ractive.fragment = fragment = new Fragment({
  			owner: ractive,
  			template: ractive.template,
  			cssIds: cssIds
  		}).bind( ractive.viewmodel );
  	}

  	initHook.end( ractive );

  	if ( fragment ) {
  		// render automatically ( if `el` is specified )
  		var el = getElement( ractive.el );
  		if ( el ) {
  			var promise = ractive.render( el, ractive.append );

  			if ( Ractive.DEBUG_PROMISES ) {
  				promise['catch']( function ( err ) {
  					warnOnceIfDebug( 'Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;' );
  					warnIfDebug( 'An error happened during rendering', { ractive: ractive });
  					logIfDebug( err );

  					throw err;
  				});
  			}
  		}
  	}
  }

  function gatherRefs( fragment ) {
  	var key = {}, index = {};

  	// walk up the template gather refs as we go
  	while ( fragment ) {
  		if ( fragment.parent && ( fragment.parent.indexRef || fragment.parent.keyRef ) ) {
  			var ref = fragment.parent.indexRef;
  			if ( ref && !( ref in index ) ) index[ref] = fragment.index;
  			ref = fragment.parent.keyRef;
  			if ( ref && !( ref in key ) ) key[ref] = fragment.key;
  		}

  		if ( fragment.componentParent && !fragment.ractive.isolated ) {
  			fragment = fragment.componentParent;
  		} else {
  			fragment = fragment.parent;
  		}
  	}

  	return { key: key, index: index };
  }

  var eventPattern = /^event(?:\.(.+))?$/;
  var argumentsPattern = /^arguments\.(\d*)$/;
  var dollarArgsPattern = /^\$(\d*)$/;

  var EventDirective = function EventDirective ( owner, event, template ) {
  	this.owner = owner;
  	this.event = event;
  	this.template = template;

  	this.ractive = owner.parentFragment.ractive;
  	this.parentFragment = owner.parentFragment;

  	this.context = null;
  	this.passthru = false;

  	// method calls
  	this.method = null;
  	this.resolvers = null;
  	this.models = null;
  	this.argsFn = null;

  	// handler directive
  	this.action = null;
  	this.args = null;
  };

  EventDirective.prototype.bind = function bind () {
  	var this$1 = this;

  		this.context = this.parentFragment.findContext();

  	var template = this.template;

  	if ( template.m ) {
  		this.method = template.m;

  		// pass-thru "...arguments"
  		this.passthru = !!template.g;

  		if ( template.a ) {
  			this.resolvers = [];
  			this.models = template.a.r.map( function ( ref, i ) {

  				if ( eventPattern.test( ref ) ) {
  					// on-click="foo(event.node)"
  					return {
  						event: true,
  						keys: ref.length > 5 ? splitKeypathI( ref.slice( 6 ) ) : [],
  						unbind: noop
  					};
  				}

  				var argMatch = argumentsPattern.exec( ref );
  				if ( argMatch ) {
  					// on-click="foo(arguments[0])"
  					return {
  						argument: true,
  						index: argMatch[1]
  					};
  				}

  				var dollarMatch = dollarArgsPattern.exec( ref );
  				if ( dollarMatch ) {
  					// on-click="foo($1)"
  					return {
  						argument: true,
  						index: dollarMatch[1] - 1
  					};
  				}

  				var resolver;

  				var model = resolveReference( this$1.parentFragment, ref );
  				if ( !model ) {
  					resolver = this$1.parentFragment.resolve( ref, function ( model ) {
  						this$1.models[i] = model;
  						removeFromArray( this$1.resolvers, resolver );
  					});

  					this$1.resolvers.push( resolver );
  				}

  				return model;
  			});

  			this.argsFn = getFunction( template.a.s, template.a.r.length );
  		}

  	}

  	else {
  		// TODO deprecate this style of directive
  		this.action = typeof template === 'string' ? // on-click='foo'
  			template :
  			typeof template.n === 'string' ? // on-click='{{dynamic}}'
  				template.n :
  				new Fragment({
  					owner: this,
  					template: template.n
  				});

  		this.args = template.a ? // static arguments
  			( typeof template.a === 'string' ? [ template.a ] : template.a ) :
  			template.d ? // dynamic arguments
  				new Fragment({
  					owner: this,
  					template: template.d
  				}) :
  				[]; // no arguments
  	}

  	if ( this.template.n && typeof this.template.n !== 'string' ) this.action.bind();
  	if ( this.template.d ) this.args.bind();
  };

  EventDirective.prototype.bubble = function bubble () {
  	if ( !this.dirty ) {
  		this.dirty = true;
  		this.owner.bubble();
  	}
  };

  EventDirective.prototype.fire = function fire ( event, passedArgs ) {

  	// augment event object
  	if ( passedArgs === void 0 ) passedArgs = [];

  		if ( event ) {
  		var refs = gatherRefs( this.parentFragment );
  		event.keypath = this.context.getKeypath( this.ractive );
  		event.rootpath = this.context.getKeypath();
  		event.context = this.context.get();
  		event.index = refs.index;
  		event.key = refs.key;
  	}

  	if ( this.method ) {
  		if ( typeof this.ractive[ this.method ] !== 'function' ) {
  			throw new Error( ("Attempted to call a non-existent method (\"" + (this.method) + "\")") );
  		}

  		var args;

  		if ( event ) passedArgs.unshift( event );

  		if ( this.models ) {
  			var values = this.models.map( function ( model ) {
  				if ( !model ) return undefined;

  				if ( model.event ) {
  					var obj = event;
  					var keys = model.keys.slice();

  					while ( keys.length ) obj = obj[ keys.shift() ];
  					return obj;
  				}

  				if ( model.argument ) {
  					return passedArgs ? passedArgs[ model.index ] : void 0;
  				}

  				if ( model.wrapper ) {
  					return model.wrapper.value;
  				}

  				return model.get();
  			});

  			args = this.argsFn.apply( null, values );
  		}

  		if ( this.passthru ) {
  			args = args ? args.concat( passedArgs ) : passedArgs;
  		}

  		// make event available as `this.event`
  		var ractive = this.ractive;
  		var oldEvent = ractive.event;

  		ractive.event = event;
  		var result = ractive[ this.method ].apply( ractive, args );

  		// Auto prevent and stop if return is explicitly false
  		var original;
  		if ( result === false && ( original = event.original ) ) {
  			original.preventDefault && original.preventDefault();
  			original.stopPropagation && original.stopPropagation();
  		}

  		ractive.event = oldEvent;
  	}

  	else {
  		var action = this.action.toString();
  		var args$1 = this.template.d ? this.args.getArgsList() : this.args;

  		if ( passedArgs.length ) args$1 = args$1.concat( passedArgs );

  		if ( event ) event.name = action;

  		fireEvent( this.ractive, action, {
  			event: event,
  			args: args$1
  		});
  	}
  };

  EventDirective.prototype.rebind = function rebind () {
  	this.unbind();
  	this.bind();
  };

  EventDirective.prototype.render = function render () {
  	this.event.listen( this );
  };

  EventDirective.prototype.unbind = function unbind$1 () {
  	var template = this.template;

  	if ( template.m ) {
  		if ( this.resolvers ) this.resolvers.forEach( unbind );
  		this.resolvers = [];

  		this.models = null;
  	}

  	else {
  		// TODO this is brittle and non-explicit, fix it
  		if ( this.action.unbind ) this.action.unbind();
  		if ( this.args.unbind ) this.args.unbind();
  	}
  };

  EventDirective.prototype.unrender = function unrender () {
  	this.event.unlisten();
  };

  EventDirective.prototype.update = function update () {
  	if ( this.method || !this.dirty ) return; // nothing to do

  	this.dirty = false;

  	// ugh legacy
  	if ( this.action.update ) this.action.update();
  	if ( this.template.d ) this.args.update();
  };

  var RactiveEvent = function RactiveEvent ( ractive, name ) {
  	this.ractive = ractive;
  	this.name = name;
  	this.handler = null;
  };

  RactiveEvent.prototype.listen = function listen ( directive ) {
  	var ractive = this.ractive;

  	this.handler = ractive.on( this.name, function () {
  		var event;

  		// semi-weak test, but what else? tag the event obj ._isEvent ?
  		if ( arguments.length && arguments[0] && arguments[0].node ) {
  			event = Array.prototype.shift.call( arguments );
  			event.component = ractive;
  		}

  		var args = Array.prototype.slice.call( arguments );
  		directive.fire( event, args );

  		// cancel bubbling
  		return false;
  	});
  };

  RactiveEvent.prototype.unlisten = function unlisten () {
  	this.handler.cancel();
  };

  // TODO it's unfortunate that this has to run every time a
  // component is rendered... is there a better way?
  function updateLiveQueries ( component ) {
  	// Does this need to be added to any live queries?
  	var instance = component.ractive;

  	do {
  		var liveQueries = instance._liveComponentQueries;

  		var i = liveQueries.length;
  		while ( i-- ) {
  			var name = liveQueries[i];
  			var query = liveQueries[ ("_" + name) ];

  			if ( query.test( component ) ) {
  				query.add( component.instance );
  				// keep register of applicable selectors, for when we teardown
  				component.liveQueries.push( query );
  			}
  		}
  	} while ( instance = instance.parent );
  }

  function removeFromLiveComponentQueries ( component ) {
  	var instance = component.ractive;

  	while ( instance ) {
  		var query = instance._liveComponentQueries[ ("_" + (component.name)) ];
  		if ( query ) query.remove( component );

  		instance = instance.parent;
  	}
  }

  function makeDirty ( query ) {
  	query.makeDirty();
  }

  var teardownHook = new Hook( 'teardown' );

  var Component = (function (Item) {
  	function Component ( options, ComponentConstructor ) {
  		Item.call( this, options );
  		this.type = COMPONENT; // override ELEMENT from super

  		var instance = create( ComponentConstructor.prototype );

  		this.instance = instance;
  		this.name = options.template.e;
  		this.parentFragment = options.parentFragment;
  		this.complexMappings = [];

  		this.liveQueries = [];

  		if ( instance.el ) {
  			warnIfDebug( ("The <" + (this.name) + "> component has a default 'el' property; it has been disregarded") );
  		}

  		var partials = options.template.p || {};
  		if ( !( 'content' in partials ) ) partials.content = options.template.f || [];
  		this._partials = partials; // TEMP

  		this.yielders = {};

  		// find container
  		var fragment = options.parentFragment;
  		var container;
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

  		construct( this.instance, { partials: partials });

  		// for hackability, this could be an open option
  		// for any ractive instance, but for now, just
  		// for components and just for ractive...
  		instance._inlinePartials = partials;

  		this.eventHandlers = [];
  		if ( this.template.v ) this.setupEvents();
  	}

  	Component.prototype = Object.create( Item && Item.prototype );
  	Component.prototype.constructor = Component;

  	Component.prototype.bind = function bind$1 () {
  		var this$1 = this;

  		var viewmodel = this.instance.viewmodel;
  		var childData = viewmodel.value;

  		// determine mappings
  		if ( this.template.a ) {
  			Object.keys( this.template.a ).forEach( function ( localKey ) {
  				var template = this$1.template.a[ localKey ];
  				var model;
  				var fragment;

  				if ( template === 0 ) {
  					// empty attributes are `true`
  					viewmodel.joinKey( localKey ).set( true );
  				}

  				else if ( typeof template === 'string' ) {
  					var parsed = parseJSON( template );
  					viewmodel.joinKey( localKey ).set( parsed ? parsed.value : template );
  				}

  				else if ( isArray( template ) ) {
  					if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
  						model = resolve$1( this$1.parentFragment, template[0] );

  						if ( !model ) {
  							warnOnceIfDebug( ("The " + localKey + "='{{" + (template[0].r) + "}}' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity"), { ractive: this$1.instance }); // TODO add docs page explaining this
  							this$1.parentFragment.ractive.get( localKey ); // side-effect: create mappings as necessary
  							model = this$1.parentFragment.findContext().joinKey( localKey );
  						}

  						viewmodel.map( localKey, model );

  						if ( model.get() === undefined && localKey in childData ) {
  							model.set( childData[ localKey ] );
  						}
  					}

  					else {
  						fragment = new Fragment({
  							owner: this$1,
  							template: template
  						}).bind();

  						model = viewmodel.joinKey( localKey );
  						model.set( fragment.valueOf() );

  						// this is a *bit* of a hack
  						fragment.bubble = function () {
  							Fragment.prototype.bubble.call( fragment );
  							fragment.update();
  							model.set( fragment.valueOf() );
  						};

  						this$1.complexMappings.push( fragment );
  					}
  				}
  			});
  		}

  		initialise( this.instance, {
  			partials: this._partials
  		}, {
  			cssIds: this.parentFragment.cssIds
  		});

  		this.eventHandlers.forEach( bind );
  	};

  	Component.prototype.bubble = function bubble () {
  		if ( !this.dirty ) {
  			this.dirty = true;
  			this.parentFragment.bubble();
  		}
  	};

  	Component.prototype.checkYielders = function checkYielders () {
  		var this$1 = this;

  		Object.keys( this.yielders ).forEach( function ( name ) {
  			if ( this$1.yielders[ name ].length > 1 ) {
  				runloop.end();
  				throw new Error( ("A component template can only have one {{yield" + (name ? ' ' + name : '') + "}} declaration at a time") );
  			}
  		});
  	};

  	Component.prototype.detach = function detach () {
  		return this.instance.fragment.detach();
  	};

  	Component.prototype.find = function find ( selector ) {
  		return this.instance.fragment.find( selector );
  	};

  	Component.prototype.findAll = function findAll ( selector, query ) {
  		this.instance.fragment.findAll( selector, query );
  	};

  	Component.prototype.findComponent = function findComponent ( name ) {
  		if ( !name || this.name === name ) return this.instance;

  		if ( this.instance.fragment ) {
  			return this.instance.fragment.findComponent( name );
  		}
  	};

  	Component.prototype.findAllComponents = function findAllComponents ( name, query ) {
  		if ( query.test( this ) ) {
  			query.add( this.instance );

  			if ( query.live ) {
  				this.liveQueries.push( query );
  			}
  		}

  		this.instance.fragment.findAllComponents( name, query );
  	};

  	Component.prototype.firstNode = function firstNode ( skipParent ) {
  		return this.instance.fragment.firstNode( skipParent );
  	};

  	Component.prototype.rebind = function rebind$1 () {
  		var this$1 = this;

  		this.complexMappings.forEach( rebind );

  		this.liveQueries.forEach( makeDirty );

  		// update relevant mappings
  		var viewmodel = this.instance.viewmodel;
  		viewmodel.mappings = {};

  		if ( this.template.a ) {
  			Object.keys( this.template.a ).forEach( function ( localKey ) {
  				var template = this$1.template.a[ localKey ];
  				var model;

  				if ( isArray( template ) && template.length === 1 && template[0].t === INTERPOLATOR ) {
  					model = resolve$1( this$1.parentFragment, template[0] );

  					if ( !model ) {
  						// TODO is this even possible?
  						warnOnceIfDebug( ("The " + localKey + "='{{" + (template[0].r) + "}}' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity"), { ractive: this$1.instance });
  						this$1.parentFragment.ractive.get( localKey ); // side-effect: create mappings as necessary
  						model = this$1.parentFragment.findContext().joinKey( localKey );
  					}

  					viewmodel.map( localKey, model );
  				}
  			});
  		}

  		this.instance.fragment.rebind( viewmodel );
  	};

  	Component.prototype.render = function render$1$$ ( target, occupants ) {
  		render$1( this.instance, target, null, occupants );

  		this.checkYielders();
  		this.eventHandlers.forEach( render );
  		updateLiveQueries( this );

  		this.rendered = true;
  	};

  	Component.prototype.setupEvents = function setupEvents () {
  		var this$1 = this;

  		var handlers = this.eventHandlers;

  		Object.keys( this.template.v ).forEach( function ( key ) {
  			var eventNames = key.split( '-' );
  			var template = this$1.template.v[ key ];

  			eventNames.forEach( function ( eventName ) {
  				var event = new RactiveEvent( this$1.instance, eventName );
  				handlers.push( new EventDirective( this$1, event, template ) );
  			});
  		});
  	};

  	Component.prototype.toString = function toString () {
  		return this.instance.toHTML();
  	};

  	Component.prototype.unbind = function unbind$1 () {
  		this.complexMappings.forEach( unbind );

  		var instance = this.instance;
  		instance.viewmodel.teardown();
  		instance.fragment.unbind();
  		instance._observers.forEach( cancel );

  		removeFromLiveComponentQueries( this );

  		if ( instance.fragment.rendered && instance.el.__ractive_instances__ ) {
  			removeFromArray( instance.el.__ractive_instances__, instance );
  		}

  		Object.keys( instance._links ).forEach( function ( k ) { return instance._links[k].unlink(); } );

  		teardownHook.fire( instance );
  	};

  	Component.prototype.unrender = function unrender$1 ( shouldDestroy ) {
  		var this$1 = this;

  		this.shouldDestroy = shouldDestroy;
  		this.instance.unrender();
  		this.eventHandlers.forEach( unrender );
  		this.liveQueries.forEach( function ( query ) { return query.remove( this$1.instance ); } );
  	};

  	Component.prototype.update = function update$1 () {
  		this.dirty = false;
  		this.instance.fragment.update();
  		this.checkYielders();
  		this.eventHandlers.forEach( update );
  		this.complexMappings.forEach( update );
  	};

  	return Component;
  }(Item));

  var Doctype = (function (Item) {
  	function Doctype () {
  		Item.apply(this, arguments);
  	}

  	Doctype.prototype = Object.create( Item && Item.prototype );
  	Doctype.prototype.constructor = Doctype;

  	Doctype.prototype.bind = function bind () {
  		// noop
  	};

  	Doctype.prototype.render = function render () {
  		// noop
  	};

  	Doctype.prototype.teardown = function teardown () {
  		// noop
  	};

  	Doctype.prototype.toString = function toString () {
  		return '<!DOCTYPE' + this.template.a + '>';
  	};

  	Doctype.prototype.unbind = function unbind () {
  		// noop
  	};

  	Doctype.prototype.unrender = function unrender () {
  		// noop
  	};

  	return Doctype;
  }(Item));

  function camelCase ( hyphenatedStr ) {
  	return hyphenatedStr.replace( /-([a-zA-Z])/g, function ( match, $1 ) {
  		return $1.toUpperCase();
  	});
  }

  var space = /\s+/;
  var specials$1 = { 'float': 'cssFloat' };
  var remove = /\/\*(?:[\s\S]*?)\*\//g;
  var escape = /url\(\s*(['"])(?:\\[\s\S]|(?!\1).)*\1\s*\)|url\((?:\\[\s\S]|[^)])*\)|(['"])(?:\\[\s\S]|(?!\1).)*\2/gi;
  var value = /\0(\d+)/g;

  function readStyle ( css ) {
      var values = [];

      if ( typeof css !== 'string' ) return {};

      return css.replace( escape, function ( match ) { return ("\u0000" + (values.push( match ) - 1)); })
          .replace( remove, '' )
          .split( ';' )
          .filter( function ( rule ) { return !!rule.trim(); } )
          .map( function ( rule ) { return rule.replace( value, function ( match, n ) { return values[ n ]; } ); } )
          .reduce(function ( rules, rule ) {
              var i = rule.indexOf(':');
              var name = camelCase( rule.substr( 0, i ).trim() );
              rules[ specials$1[ name ] || name ] = rule.substr( i + 1 ).trim();
              return rules;
          }, {});
  }

  function readClass ( str ) {
    var list = str.split( space );

    // remove any empty entries
    var i = list.length;
    while ( i-- ) {
      if ( !list[i] ) list.splice( i, 1 );
    }

    return list;
  }

  var textTypes = [ undefined, 'text', 'search', 'url', 'email', 'hidden', 'password', 'search', 'reset', 'submit' ];

  function getUpdateDelegate ( attribute ) {
  	var element = attribute.element, name = attribute.name;

  	if ( name === 'id' ) return updateId;

  	if ( name === 'value' ) {
  		// special case - selects
  		if ( element.name === 'select' && name === 'value' ) {
  			return element.getAttribute( 'multiple' ) ? updateMultipleSelectValue : updateSelectValue;
  		}

  		if ( element.name === 'textarea' ) return updateStringValue;

  		// special case - contenteditable
  		if ( element.getAttribute( 'contenteditable' ) != null ) return updateContentEditableValue;

  		// special case - <input>
  		if ( element.name === 'input' ) {
  			var type = element.getAttribute( 'type' );

  			// type='file' value='{{fileList}}'>
  			if ( type === 'file' ) return noop; // read-only

  			// type='radio' name='{{twoway}}'
  			if ( type === 'radio' && element.binding && element.binding.attribute.name === 'name' ) return updateRadioValue;

  			if ( ~textTypes.indexOf( type ) ) return updateStringValue;
  		}

  		return updateValue;
  	}

  	var node = element.node;

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

  	if ( attribute.isBoolean ) return updateBoolean;

  	if ( attribute.namespace && attribute.namespace !== attribute.node.namespaceURI ) return updateNamespacedAttribute;

  	return updateAttribute;
  }

  function updateId () {
  	var ref = this, node = ref.node;
  	var value = this.getValue();

  	delete this.ractive.nodes[ node.id ];
  	this.ractive.nodes[ value ] = node;

  	node.id = value;
  }

  function updateMultipleSelectValue () {
  	var value = this.getValue();

  	if ( !isArray( value ) ) value = [ value ];

  	var options = this.node.options;
  	var i = options.length;

  	while ( i-- ) {
  		var option = options[i];
  		var optionValue = option._ractive ?
  			option._ractive.value :
  			option.value; // options inserted via a triple don't have _ractive

  		option.selected = arrayContains( value, optionValue );
  	}
  }

  function updateSelectValue () {
  	var value = this.getValue();

  	if ( !this.locked ) { // TODO is locked still a thing?
  		this.node._ractive.value = value;

  		var options = this.node.options;
  		var i = options.length;

  		while ( i-- ) {
  			var option = options[i];
  			var optionValue = option._ractive ?
  				option._ractive.value :
  				option.value; // options inserted via a triple don't have _ractive

  			if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
  				option.selected = true;
  				return;
  			}
  		}

  		this.node.selectedIndex = -1;
  	}
  }


  function updateContentEditableValue () {
  	var value = this.getValue();

  	if ( !this.locked ) {
  		this.node.innerHTML = value === undefined ? '' : value;
  	}
  }

  function updateRadioValue () {
  	var node = this.node;
  	var wasChecked = node.checked;

  	var value = this.getValue();

  	//node.value = this.element.getAttribute( 'value' );
  	node.value = this.node._ractive.value = value;
  	node.checked = value === this.element.getAttribute( 'name' );

  	// This is a special case - if the input was checked, and the value
  	// changed so that it's no longer checked, the twoway binding is
  	// most likely out of date. To fix it we have to jump through some
  	// hoops... this is a little kludgy but it works
  	if ( wasChecked && !node.checked && this.element.binding && this.element.binding.rendered ) {
  		this.element.binding.group.model.set( this.element.binding.group.getValue() );
  	}
  }

  function updateValue () {
  	if ( !this.locked ) {
  		var value = this.getValue();

  		this.node.value = this.node._ractive.value = value;
  		this.node.setAttribute( 'value', value );
  	}
  }

  function updateStringValue () {
  	if ( !this.locked ) {
  		var value = this.getValue();

  		this.node._ractive.value = value;

  		this.node.value = safeToStringValue( value );
  		this.node.setAttribute( 'value', safeToStringValue( value ) );
  	}
  }

  function updateRadioName () {
  	this.node.checked = ( this.getValue() == this.node._ractive.value );
  }

  function updateCheckboxName () {
  	var ref = this, element = ref.element, node = ref.node;
  	var binding = element.binding;

  	var value = this.getValue();
  	var valueAttribute = element.getAttribute( 'value' );

  	if ( !isArray( value ) ) {
  		binding.isChecked = node.checked = ( value == valueAttribute );
  	} else {
  		var i = value.length;
  		while ( i-- ) {
  			if ( valueAttribute == value[i] ) {
  				binding.isChecked = node.checked = true;
  				return;
  			}
  		}
  		binding.isChecked = node.checked = false;
  	}
  }

  function updateStyleAttribute () {
  	var props = readStyle( this.getValue() || '' );
  	var style = this.node.style;
  	var keys = Object.keys( props );
  	var prev = this.previous || [];

  	var i = 0;
  	while ( i < keys.length ) {
  		if ( keys[i] in style ) style[ keys[i] ] = props[ keys[i] ];
  		i++;
  	}

  	// remove now-missing attrs
  	i = prev.length;
  	while ( i-- ) {
  		if ( !~keys.indexOf( prev[i] ) && prev[i] in style ) style[ prev[i] ] = '';
  	}

  	this.previous = keys;
  }

  var camelize = /(-.)/g;
  function updateInlineStyle () {
  	if ( !this.styleName ) {
  		this.styleName = this.name.substr( 6 ).replace( camelize, function ( s ) { return s.charAt( 1 ).toUpperCase(); } );
  	}

  	this.node.style[ this.styleName ] = this.getValue();
  }

  function updateClassName () {
  	var value = readClass( safeToStringValue( this.getValue() ) );
  	var attr = readClass( this.node.className );
  	var prev = this.previous || [];

  	var i = 0;
  	while ( i < value.length ) {
  		if ( !~attr.indexOf( value[i] ) ) attr.push( value[i] );
  		i++;
  	}

  	// remove now-missing classes
  	i = prev.length;
  	while ( i-- ) {
  		if ( !~value.indexOf( prev[i] ) ) {
  			var idx = attr.indexOf( prev[i] );
  			if ( ~idx ) attr.splice( idx, 1 );
  		}
  	}

  	this.node.className = attr.join( ' ' );

  	this.previous = value;
  }

  function updateInlineClass () {
  	var name = this.name.substr( 6 );
  	var attr = readClass( this.node.className );
  	var value = this.getValue();

  	if ( value && !~attr.indexOf( name ) ) attr.push( name );
  	else if ( !value && ~attr.indexOf( name ) ) attr.splice( attr.indexOf( name ), 1 );

  	this.node.className = attr.join( ' ' );
  }

  function updateBoolean () {
  	// with two-way binding, only update if the change wasn't initiated by the user
  	// otherwise the cursor will often be sent to the wrong place
  	if ( !this.locked ) {
  		if ( this.useProperty ) {
  			this.node[ this.propertyName ] = this.getValue();
  		} else {
  			if ( this.getValue() ) {
  				this.node.setAttribute( this.propertyName, '' );
  			} else {
  				this.node.removeAttribute( this.propertyName );
  			}
  		}
  	}
  }

  function updateAttribute () {
  	this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
  }

  function updateNamespacedAttribute () {
  	this.node.setAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ), safeToStringValue( this.getString() ) );
  }

  var propertyNames = {
  	'accept-charset': 'acceptCharset',
  	accesskey: 'accessKey',
  	bgcolor: 'bgColor',
  	'class': 'className',
  	codebase: 'codeBase',
  	colspan: 'colSpan',
  	contenteditable: 'contentEditable',
  	datetime: 'dateTime',
  	dirname: 'dirName',
  	'for': 'htmlFor',
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

  function lookupNamespace ( node, prefix ) {
  	var qualified = "xmlns:" + prefix;

  	while ( node ) {
  		if ( node.hasAttribute( qualified ) ) return node.getAttribute( qualified );
  		node = node.parentNode;
  	}

  	return namespaces[ prefix ];
  }

  var Attribute = (function (Item) {
  	function Attribute ( options ) {
  		Item.call( this, options );

  		this.name = options.name;
  		this.namespace = null;
  		this.element = options.element;
  		this.parentFragment = options.element.parentFragment; // shared
  		this.ractive = this.parentFragment.ractive;

  		this.rendered = false;
  		this.updateDelegate = null;
  		this.fragment = null;
  		this.value = null;

  		if ( !isArray( options.template ) ) {
  			this.value = options.template;
  			if ( this.value === 0 ) {
  				this.value = '';
  			}
  		} else {
  			this.fragment = new Fragment({
  				owner: this,
  				template: options.template
  			});
  		}

  		this.interpolator = this.fragment &&
  		                    this.fragment.items.length === 1 &&
  		                    this.fragment.items[0].type === INTERPOLATOR &&
  		                    this.fragment.items[0];
  	}

  	Attribute.prototype = Object.create( Item && Item.prototype );
  	Attribute.prototype.constructor = Attribute;

  	Attribute.prototype.bind = function bind () {
  		if ( this.fragment ) {
  			this.fragment.bind();
  		}
  	};

  	Attribute.prototype.bubble = function bubble () {
  		if ( !this.dirty ) {
  			this.element.bubble();
  			this.dirty = true;
  		}
  	};

  	Attribute.prototype.getString = function getString () {
  		return this.fragment ?
  			this.fragment.toString() :
  			this.value != null ? '' + this.value : '';
  	};

  	// TODO could getValue ever be called for a static attribute,
  	// or can we assume that this.fragment exists?
  	Attribute.prototype.getValue = function getValue () {
  		return this.fragment ? this.fragment.valueOf() : booleanAttributes.test( this.name ) ? true : this.value;
  	};

  	Attribute.prototype.rebind = function rebind () {
  		if (this.fragment) this.fragment.rebind();
  	};

  	Attribute.prototype.render = function render () {
  		var node = this.element.node;
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
  			var index = this.name.indexOf( ':' );
  			if ( index !== -1 ) {
  				this.namespace = lookupNamespace( node, this.name.slice( 0, index ) );
  			} else {
  				this.namespace = node.namespaceURI;
  			}
  		}

  		this.rendered = true;
  		this.updateDelegate = getUpdateDelegate( this );
  		this.updateDelegate();
  	};

  	Attribute.prototype.toString = function toString () {
  		var value = this.getValue();

  		// Special case - select and textarea values (should not be stringified)
  		if ( this.name === 'value' && ( this.element.getAttribute( 'contenteditable' ) !== undefined || ( this.element.name === 'select' || this.element.name === 'textarea' ) ) ) {
  			return;
  		}

  		// Special case – bound radio `name` attributes
  		if ( this.name === 'name' && this.element.name === 'input' && this.interpolator && this.element.getAttribute( 'type' ) === 'radio' ) {
  			return ("name=\"{{" + (this.interpolator.model.getKeypath()) + "}}\"");
  		}

  		if ( booleanAttributes.test( this.name ) ) return value ? this.name : '';
  		if ( value == null ) return '';

  		var str = safeToStringValue( this.getString() )
  			.replace( /&/g, '&amp;' )
  			.replace( /"/g, '&quot;' )
  			.replace( /'/g, '&#39;' );

  		return str ?
  			("" + (this.name) + "=\"" + str + "\"") :
  			this.name;
  	};

  	Attribute.prototype.unbind = function unbind () {
  		if ( this.fragment ) this.fragment.unbind();
  	};

  	Attribute.prototype.update = function update () {
  		if ( this.dirty ) {
  			this.dirty = false;
  			if ( this.fragment ) this.fragment.update();
  			if ( this.rendered ) this.updateDelegate();
  		}
  	};

  	return Attribute;
  }(Item));

  var div$1 = doc ? createElement( 'div' ) : null;

  var ConditionalAttribute = (function (Item) {
  	function ConditionalAttribute ( options ) {
  		Item.call( this, options );

  		this.attributes = [];

  		this.owner = options.owner;

  		this.fragment = new Fragment({
  			ractive: this.ractive,
  			owner: this,
  			template: [ this.template ]
  		});

  		this.dirty = false;
  	}

  	ConditionalAttribute.prototype = Object.create( Item && Item.prototype );
  	ConditionalAttribute.prototype.constructor = ConditionalAttribute;

  	ConditionalAttribute.prototype.bind = function bind () {
  		this.fragment.bind();
  	};

  	ConditionalAttribute.prototype.bubble = function bubble () {
  		if ( !this.dirty ) {
  			this.dirty = true;
  			this.owner.bubble();
  		}
  	};

  	ConditionalAttribute.prototype.rebind = function rebind () {
  		this.fragment.rebind();
  	};

  	ConditionalAttribute.prototype.render = function render () {
  		this.node = this.owner.node;
  		this.isSvg = this.node.namespaceURI === svg$1;

  		this.rendered = true;
  		this.dirty = true; // TODO this seems hacky, but necessary for tests to pass in browser AND node.js
  		this.update();
  	};

  	ConditionalAttribute.prototype.toString = function toString () {
  		return this.fragment.toString();
  	};

  	ConditionalAttribute.prototype.unbind = function unbind () {
  		this.fragment.unbind();
  	};

  	ConditionalAttribute.prototype.unrender = function unrender () {
  		this.rendered = false;
  	};

  	ConditionalAttribute.prototype.update = function update () {
  		var this$1 = this;

  		var str;
  		var attrs;

  		if ( this.dirty ) {
  			this.dirty = false;

  			this.fragment.update();

  			if ( this.rendered ) {
  				str = this.fragment.toString();
  				attrs = parseAttributes( str, this.isSvg );

  				// any attributes that previously existed but no longer do
  				// must be removed
  				this.attributes.filter( function ( a ) { return notIn( attrs, a ); } ).forEach( function ( a ) {
  					this$1.node.removeAttribute( a.name );
  				});

  				attrs.forEach( function ( a ) {
  					this$1.node.setAttribute( a.name, a.value );
  				});

  				this.attributes = attrs;
  			}
  		}
  	};

  	return ConditionalAttribute;
  }(Item));

  function parseAttributes ( str, isSvg ) {
  	var tagName = isSvg ? 'svg' : 'div';
  	return str
  		? (div$1.innerHTML = "<" + tagName + " " + str + "></" + tagName + ">") &&
  			toArray(div$1.childNodes[0].attributes)
  		: [];
  }

  function notIn ( haystack, needle ) {
  	var i = haystack.length;

  	while ( i-- ) {
  		if ( haystack[i].name === needle.name ) {
  			return false;
  		}
  	}

  	return true;
  }

  var missingDecorator = {
  	update: noop,
  	teardown: noop
  };

  var Decorator = function Decorator ( owner, template ) {
  	this.owner = owner;
  	this.template = template;

  	this.parentFragment = owner.parentFragment;
  	this.ractive = owner.ractive;

  	this.dynamicName = typeof template.n === 'object';
  	this.dynamicArgs = !!template.d;

  	if ( this.dynamicName ) {
  		this.nameFragment = new Fragment({
  			owner: this,
  			template: template.n
  		});
  	} else {
  		this.name = template.n || template;
  	}

  	if ( this.dynamicArgs ) {
  		this.argsFragment = new Fragment({
  			owner: this,
  			template: template.d
  		});
  	} else {
  		this.args = template.a || [];
  	}

  	this.node = null;
  	this.intermediary = null;
  };

  Decorator.prototype.bind = function bind () {
  	if ( this.dynamicName ) {
  		this.nameFragment.bind();
  		this.name = this.nameFragment.toString();
  	}

  	if ( this.dynamicArgs ) this.argsFragment.bind();
  };

  Decorator.prototype.bubble = function bubble () {
  	if ( !this.dirty ) {
  		this.dirty = true;
  		this.owner.bubble();
  	}
  };

  Decorator.prototype.rebind = function rebind () {
  	if ( this.dynamicName ) this.nameFragment.rebind();
  	if ( this.dynamicArgs ) this.argsFragment.rebind();
  };

  Decorator.prototype.render = function render () {
  	var fn = findInViewHierarchy( 'decorators', this.ractive, this.name );

  	if ( !fn ) {
  		warnOnce( missingPlugin( this.name, 'decorator' ) );
  		this.intermediary = missingDecorator;
  		return;
  	}

  	this.node = this.owner.node;

  	var args = this.dynamicArgs ? this.argsFragment.getArgsList() : this.args;
  	this.intermediary = fn.apply( this.ractive, [ this.node ].concat( args ) );

  	if ( !this.intermediary || !this.intermediary.teardown ) {
  		throw new Error( ("The '" + (this.name) + "' decorator must return an object with a teardown method") );
  	}
  };

  Decorator.prototype.unbind = function unbind () {
  	if ( this.dynamicName ) this.nameFragment.unbind();
  	if ( this.dynamicArgs ) this.argsFragment.unbind();
  };

  Decorator.prototype.unrender = function unrender () {
  	if ( this.intermediary ) this.intermediary.teardown();
  };

  Decorator.prototype.update = function update () {
  	if ( !this.dirty ) return;

  	this.dirty = false;

  	var nameChanged = false;

  	if ( this.dynamicName && this.nameFragment.dirty ) {
  		var name = this.nameFragment.toString();
  		nameChanged = name !== this.name;
  		this.name = name;
  	}

  	if ( this.intermediary ) {
  		if ( nameChanged || !this.intermediary.update ) {
  			this.unrender();
  			this.render();
  		}
  		else {
  			if ( this.dynamicArgs ) {
  				if ( this.argsFragment.dirty ) {
  					var args = this.argsFragment.getArgsList();
  					this.intermediary.update.apply( this.ractive, args );
  				}
  			}
  			else {
  				this.intermediary.update.apply( this.ractive, this.args );
  			}
  		}
  	}

  	// need to run these for unrender/render cases
  	// so can't just be in conditional if above

  	if ( this.dynamicName && this.nameFragment.dirty ) {
  		this.nameFragment.update();
  	}

  	if ( this.dynamicArgs && this.argsFragment.dirty ) {
  		this.argsFragment.update();
  	}
  };

  var DOMEvent = function DOMEvent ( name, owner ) {
  	if ( name.indexOf( '*' ) !== -1 ) {
  		fatal( ("Only component proxy-events may contain \"*\" wildcards, <" + (owner.name) + " on-" + name + "=\"...\"/> is not valid") );
  	}

  	this.name = name;
  	this.owner = owner;
  	this.node = null;
  	this.handler = null;
  };

  DOMEvent.prototype.listen = function listen ( directive ) {
  	var node = this.node = this.owner.node;
  	var name = this.name;

  	if ( !( ("on" + name) in node ) ) {
  		warnOnce( missingPlugin( name, 'events' ) );
  		}

  		node.addEventListener( name, this.handler = function( event ) {
  		directive.fire({
  				node: node,
  			original: event
  			});
  		}, false );
  };

  DOMEvent.prototype.unlisten = function unlisten () {
  	this.node.removeEventListener( this.name, this.handler, false );
  };

  var CustomEvent = function CustomEvent ( eventPlugin, owner ) {
  	this.eventPlugin = eventPlugin;
  	this.owner = owner;
  	this.handler = null;
  };

  CustomEvent.prototype.listen = function listen ( directive ) {
  	var node = this.owner.node;

  	this.handler = this.eventPlugin( node, function ( event ) {
  		if ( event === void 0 ) event = {};

  			event.node = event.node || node;
  		directive.fire( event );
  	});
  };

  CustomEvent.prototype.unlisten = function unlisten () {
  	this.handler.teardown();
  };

  var prefix;

  if ( !isClient ) {
  	prefix = null;
  } else {
  	var prefixCache = {};
  	var testStyle = createElement( 'div' ).style;

  	prefix = function ( prop ) {
  		prop = camelCase( prop );

  		if ( !prefixCache[ prop ] ) {
  			if ( testStyle[ prop ] !== undefined ) {
  				prefixCache[ prop ] = prop;
  			}

  			else {
  				// test vendors...
  				var capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );

  				var i = vendors.length;
  				while ( i-- ) {
  					var vendor = vendors[i];
  					if ( testStyle[ vendor + capped ] !== undefined ) {
  						prefixCache[ prop ] = vendor + capped;
  						break;
  					}
  				}
  			}
  		}

  		return prefixCache[ prop ];
  	};
  }

  var prefix$1 = prefix;

  var visible;
  var hidden = 'hidden';

  if ( doc ) {
  	var prefix$2;

  	if ( hidden in doc ) {
  		prefix$2 = '';
  	} else {
  		var i$1 = vendors.length;
  		while ( i$1-- ) {
  			var vendor = vendors[i$1];
  			hidden = vendor + 'Hidden';

  			if ( hidden in doc ) {
  				prefix$2 = vendor;
  				break;
  			}
  		}
  	}

  	if ( prefix$2 !== undefined ) {
  		doc.addEventListener( prefix$2 + 'visibilitychange', onChange );
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

  function onHide () {
  	visible = false;
  }

  function onShow () {
  	visible = true;
  }

  var unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );

  function unprefix ( prop ) {
  	return prop.replace( unprefixPattern, '' );
  }

  var vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );

  function hyphenate ( str ) {
  	if ( !str ) return ''; // edge case

  	if ( vendorPattern.test( str ) ) str = '-' + str;

  	return str.replace( /[A-Z]/g, function ( match ) { return '-' + match.toLowerCase(); } );
  }

  var createTransitions;

  if ( !isClient ) {
  	createTransitions = null;
  } else {
  	var testStyle$1 = createElement( 'div' ).style;
  	var linear$1 = function ( x ) { return x; };

  	var canUseCssTransitions = {};
  	var cannotUseCssTransitions = {};

  	// determine some facts about our environment
  	var TRANSITION;
  	var TRANSITIONEND;
  	var CSS_TRANSITIONS_ENABLED;
  	var TRANSITION_DURATION;
  	var TRANSITION_PROPERTY;
  	var TRANSITION_TIMING_FUNCTION;

  	if ( testStyle$1.transition !== undefined ) {
  		TRANSITION = 'transition';
  		TRANSITIONEND = 'transitionend';
  		CSS_TRANSITIONS_ENABLED = true;
  	} else if ( testStyle$1.webkitTransition !== undefined ) {
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
  		setTimeout( function () {
  			var jsTransitionsComplete;
  			var cssTransitionsComplete;

  			function checkComplete () {
  				if ( jsTransitionsComplete && cssTransitionsComplete ) {
  					// will changes to events and fire have an unexpected consequence here?
  					t.ractive.fire( t.name + ':end', t.node, t.isIntro );
  					resolve();
  				}
  			}

  			// this is used to keep track of which elements can use CSS to animate
  			// which properties
  			var hashPrefix = ( t.node.namespaceURI || '' ) + t.node.tagName;

  			// need to reset transition properties
  			var style = t.node.style;
  			var previous = {
  				property: style[ TRANSITION_PROPERTY ],
  				timing: style[ TRANSITION_TIMING_FUNCTION ],
  				duration: style[ TRANSITION_DURATION ]
  			};

  			style[ TRANSITION_PROPERTY ] = changedProperties.map( prefix$1 ).map( hyphenate ).join( ',' );
  			style[ TRANSITION_TIMING_FUNCTION ] = hyphenate( options.easing || 'linear' );
  			style[ TRANSITION_DURATION ] = ( options.duration / 1000 ) + 's';

  			function transitionEndHandler ( event ) {
  				var index = changedProperties.indexOf( camelCase( unprefix( event.propertyName ) ) );

  				if ( index !== -1 ) {
  					changedProperties.splice( index, 1 );
  				}

  				if ( changedProperties.length ) {
  					// still transitioning...
  					return;
  				}

  				style[ TRANSITION_PROPERTY ] = previous.property;
  				style[ TRANSITION_TIMING_FUNCTION ] = previous.duration;
  				style[ TRANSITION_DURATION ] = previous.timing;

  				t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );

  				cssTransitionsComplete = true;
  				checkComplete();
  			}

  			t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );

  			setTimeout( function () {
  				var i = changedProperties.length;
  				var hash;
  				var originalValue;
  				var index;
  				var propertiesToTransitionInJs = [];
  				var prop;
  				var suffix;
  				var interpolator;

  				while ( i-- ) {
  					prop = changedProperties[i];
  					hash = hashPrefix + prop;

  					if ( CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[ hash ] ) {
  						style[ prefix$1( prop ) ] = to[ prop ];

  						// If we're not sure if CSS transitions are supported for
  						// this tag/property combo, find out now
  						if ( !canUseCssTransitions[ hash ] ) {
  							originalValue = t.getStyle( prop );

  							// if this property is transitionable in this browser,
  							// the current style will be different from the target style
  							canUseCssTransitions[ hash ] = ( t.getStyle( prop ) != to[ prop ] );
  							cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];

  							// Reset, if we're going to use timers after all
  							if ( cannotUseCssTransitions[ hash ] ) {
  								style[ prefix$1( prop ) ] = originalValue;
  							}
  						}
  					}

  					if ( !CSS_TRANSITIONS_ENABLED || cannotUseCssTransitions[ hash ] ) {
  						// we need to fall back to timer-based stuff
  						if ( originalValue === undefined ) {
  							originalValue = t.getStyle( prop );
  						}

  						// need to remove this from changedProperties, otherwise transitionEndHandler
  						// will get confused
  						index = changedProperties.indexOf( prop );
  						if ( index === -1 ) {
  							warnIfDebug( 'Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!', { node: t.node });
  						} else {
  							changedProperties.splice( index, 1 );
  						}

  						// TODO Determine whether this property is animatable at all

  						suffix = /[^\d]*$/.exec( to[ prop ] )[0];
  						interpolator = interpolate( parseFloat( originalValue ), parseFloat( to[ prop ] ) ) || ( function () { return to[ prop ]; } );

  						// ...then kick off a timer-based transition
  						propertiesToTransitionInJs.push({
  							name: prefix$1( prop ),
  							interpolator: interpolator,
  							suffix: suffix
  						});
  					}
  				}

  				// javascript transitions
  				if ( propertiesToTransitionInJs.length ) {
  					var easing;

  					if ( typeof options.easing === 'string' ) {
  						easing = t.ractive.easing[ options.easing ];

  						if ( !easing ) {
  							warnOnceIfDebug( missingPlugin( options.easing, 'easing' ) );
  							easing = linear$1;
  						}
  					} else if ( typeof options.easing === 'function' ) {
  						easing = options.easing;
  					} else {
  						easing = linear$1;
  					}

  					new Ticker({
  						duration: options.duration,
  						easing: easing,
  						step: function ( pos ) {
  							var i = propertiesToTransitionInJs.length;
  							while ( i-- ) {
  								var prop = propertiesToTransitionInJs[i];
  								t.node.style[ prop.name ] = prop.interpolator( pos ) + prop.suffix;
  							}
  						},
  						complete: function () {
  							jsTransitionsComplete = true;
  							checkComplete();
  						}
  					});
  				} else {
  					jsTransitionsComplete = true;
  				}

  				if ( !changedProperties.length ) {
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

  function resetStyle ( node, style ) {
  	if ( style ) {
  		node.setAttribute( 'style', style );
  	} else {
  		// Next line is necessary, to remove empty style attribute!
  		// See http://stackoverflow.com/a/7167553
  		node.getAttribute( 'style' );
  		node.removeAttribute( 'style' );
  	}
  }

  var getComputedStyle = win && ( win.getComputedStyle || legacy.getComputedStyle );
  var resolved = Promise$1.resolve();

  var Transition = function Transition ( ractive, node, name, params, eventName ) {
  	this.ractive = ractive;
  	this.node = node;
  	this.name = name;
  	this.params = params;

  	// TODO this will need to change...
  	this.eventName = eventName;
  	this.isIntro = eventName !== 'outro';

  	if ( typeof name === 'function' ) {
  		this._fn = name;
  	}
  	else {
  		this._fn = findInViewHierarchy( 'transitions', ractive, name );

  		if ( !this._fn ) {
  			warnOnceIfDebug( missingPlugin( name, 'transition' ), { ractive: ractive });
  		}
  	}
  };

  Transition.prototype.animateStyle = function animateStyle ( style, value, options ) {
  	var this$1 = this;

  		if ( arguments.length === 4 ) {
  		throw new Error( 't.animateStyle() returns a promise - use .then() instead of passing a callback' );
  	}

  	// Special case - page isn't visible. Don't animate anything, because
  	// that way you'll never get CSS transitionend events
  	if ( !visible ) {
  		this.setStyle( style, value );
  		return resolved;
  	}

  	var to;

  	if ( typeof style === 'string' ) {
  		to = {};
  		to[ style ] = value;
  	} else {
  		to = style;

  		// shuffle arguments
  		options = value;
  	}

  	// As of 0.3.9, transition authors should supply an `option` object with
  	// `duration` and `easing` properties (and optional `delay`), plus a
  	// callback function that gets called after the animation completes

  	// TODO remove this check in a future version
  	if ( !options ) {
  		warnOnceIfDebug( 'The "%s" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340', this.name );
  		options = this;
  	}

  	return new Promise$1( function ( fulfil ) {
  		// Edge case - if duration is zero, set style synchronously and complete
  		if ( !options.duration ) {
  			this$1.setStyle( to );
  			fulfil();
  			return;
  		}

  		// Get a list of the properties we're animating
  		var propertyNames = Object.keys( to );
  		var changedProperties = [];

  		// Store the current styles
  		var computedStyle = getComputedStyle( this$1.node );

  		var i = propertyNames.length;
  		while ( i-- ) {
  			var prop = propertyNames[i];
  			var current = computedStyle[ prefix$1( prop ) ];

  			if ( current === '0px' ) current = 0;

  			// we need to know if we're actually changing anything
  			if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
  				changedProperties.push( prop );

  				// make the computed style explicit, so we can animate where
  				// e.g. height='auto'
  				this$1.node.style[ prefix$1( prop ) ] = current;
  			}
  		}

  		// If we're not actually changing anything, the transitionend event
  		// will never fire! So we complete early
  		if ( !changedProperties.length ) {
  			fulfil();
  			return;
  		}

  		createTransitions$1( this$1, to, options, changedProperties, fulfil );
  	});
  };

  Transition.prototype.getStyle = function getStyle ( props ) {
  	var computedStyle = getComputedStyle( this.node );

  	if ( typeof props === 'string' ) {
  		var value = computedStyle[ prefix$1( props ) ];
  		return value === '0px' ? 0 : value;
  	}

  	if ( !isArray( props ) ) {
  		throw new Error( 'Transition$getStyle must be passed a string, or an array of strings representing CSS properties' );
  	}

  	var styles = {};

  	var i = props.length;
  	while ( i-- ) {
  		var prop = props[i];
  		var value$1 = computedStyle[ prefix$1( prop ) ];

  		if ( value$1 === '0px' ) value$1 = 0;
  		styles[ prop ] = value$1;
  	}

  	return styles;
  };

  Transition.prototype.processParams = function processParams ( params, defaults ) {
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

  	return extendObj( {}, defaults, params );
  };

  Transition.prototype.setStyle = function setStyle ( style, value ) {
  	if ( typeof style === 'string' ) {
  		this.node.style[ prefix$1( style ) ] = value;
  	}

  	else {
  		var prop;
  		for ( prop in style ) {
  			if ( style.hasOwnProperty( prop ) ) {
  				this.node.style[ prefix$1( prop ) ] = style[ prop ];
  			}
  		}
  	}

  	return this;
  };

  Transition.prototype.start = function start () {
  	var this$1 = this;

  		var node = this.node;
  	var originalStyle = node.getAttribute( 'style' );

  	var completed;

  	// create t.complete() - we don't want this on the prototype,
  	// because we don't want `this` silliness when passing it as
  	// an argument
  	this.complete = function ( noReset ) {
  		if ( completed ) {
  			return;
  		}

  		if ( !noReset && this$1.eventName === 'intro' ) {
  			resetStyle( node, originalStyle);
  		}

  		this$1._manager.remove( this$1 );

  		completed = true;
  	};

  	// If the transition function doesn't exist, abort
  	if ( !this._fn ) {
  		this.complete();
  		return;
  	}

  	var promise = this._fn.apply( this.ractive, [ this ].concat( this.params ) );
  	if ( promise ) promise.then( this.complete );
  };

  function updateLiveQueries$1 ( element ) {
  	// Does this need to be added to any live queries?
  	var node = element.node;
  	var instance = element.ractive;

  	do {
  		var liveQueries = instance._liveQueries;

  		var i = liveQueries.length;
  		while ( i-- ) {
  			var selector = liveQueries[i];
  			var query = liveQueries[ ("_" + selector) ];

  			if ( query.test( node ) ) {
  				query.add( node );
  				// keep register of applicable selectors, for when we teardown
  				element.liveQueries.push( query );
  			}
  		}
  	} while ( instance = instance.parent );
  }

  // TODO element.parent currently undefined
  function findParentForm ( element ) {
  	while ( element = element.parent ) {
  		if ( element.name === 'form' ) {
  			return element;
  		}
  	}
  }

  function warnAboutAmbiguity ( description, ractive ) {
  	warnOnceIfDebug( ("The " + description + " being used for two-way binding is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity"), { ractive: ractive });
  }

  var Binding = function Binding ( element, name ) {
  	if ( name === void 0 ) name = 'value';

  		this.element = element;
  	this.ractive = element.ractive;
  	this.attribute = element.attributeByName[ name ];

  	var interpolator = this.attribute.interpolator;
  	interpolator.twowayBinding = this;

  	var model = interpolator.model;

  	// not bound?
  	if ( !model ) {
  		// try to force resolution
  		interpolator.resolver.forceResolution();
  		model = interpolator.model;

  		warnAboutAmbiguity( ("'" + (interpolator.template.r) + "' reference"), this.ractive );
  	}

  	else if ( model.isUnresolved ) {
  		// reference expressions (e.g. foo[bar])
  		model.forceResolution();
  		warnAboutAmbiguity( 'expression', this.ractive );
  	}

  	// TODO include index/key/keypath refs as read-only
  	else if ( model.isReadonly ) {
  		var keypath = model.getKeypath().replace( /^@/, '' );
  			warnOnceIfDebug( ("Cannot use two-way binding on <" + (element.name) + "> element: " + keypath + " is read-only. To suppress this warning use <" + (element.name) + " twoway='false'...>"), { ractive: this.ractive });
  		return false;
  	}

  	this.attribute.isTwoway = true;
  	this.model = model;

  	// initialise value, if it's undefined
  	var value = model.get();
  	this.wasUndefined = value === undefined;

  	if ( value === undefined && this.getInitialValue ) {
  		value = this.getInitialValue();
  		model.set( value );
  	}

  	var parentForm = findParentForm( element );
  	if ( parentForm ) {
  		this.resetValue = value;
  		parentForm.formBindings.push( this );
  	}
  };

  Binding.prototype.bind = function bind () {
  	this.model.registerTwowayBinding( this );
  };

  Binding.prototype.handleChange = function handleChange () {
  	var this$1 = this;

  		runloop.start( this.root );
  	this.attribute.locked = true;
  	this.model.set( this.getValue() );
  	runloop.scheduleTask( function () { return this$1.attribute.locked = false; } );
  	runloop.end();
  };

  Binding.prototype.rebind = function rebind () {
  	// TODO what does this work with CheckboxNameBinding et al?
  	this.unbind();
  	this.model = this.attribute.interpolator.model;
  	this.bind();
  };

  Binding.prototype.render = function render () {
  	this.node = this.element.node;
  	this.node._ractive.binding = this;
  	this.rendered = true; // TODO is this used anywhere?
  	};

  Binding.prototype.setFromNode = function setFromNode ( node ) {
  	this.model.set( node.value );
  	};

  	Binding.prototype.unbind = function unbind () {
  	this.model.unregisterTwowayBinding( this );
  };

  Binding.prototype.unrender = function unrender () {
  	// noop?
  };

  // This is the handler for DOM events that would lead to a change in the model
  // (i.e. change, sometimes, input, and occasionally click and keyup)
  function handleDomEvent () {
  	this._ractive.binding.handleChange();
  }

  var CheckboxBinding = (function (Binding) {
  	function CheckboxBinding ( element ) {
  		Binding.call( this, element, 'checked' );
  	}

  	CheckboxBinding.prototype = Object.create( Binding && Binding.prototype );
  	CheckboxBinding.prototype.constructor = CheckboxBinding;

  	CheckboxBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);

  		this.node.addEventListener( 'change', handleDomEvent, false );

  		if ( this.node.attachEvent ) {
  			this.node.addEventListener( 'click', handleDomEvent, false );
  		}
  	};

  	CheckboxBinding.prototype.unrender = function unrender () {
  		this.node.removeEventListener( 'change', handleDomEvent, false );
  		this.node.removeEventListener( 'click', handleDomEvent, false );
  	};

  	CheckboxBinding.prototype.getInitialValue = function getInitialValue () {
  		return !!this.element.getAttribute( 'checked' );
  	};

  	CheckboxBinding.prototype.getValue = function getValue () {
  		return this.node.checked;
  	};

  	CheckboxBinding.prototype.setFromNode = function setFromNode ( node ) {
  		this.model.set( node.checked );
  	};

  	return CheckboxBinding;
  }(Binding));

  function getBindingGroup ( group, model, getValue ) {
  	var hash = "" + group + "-bindingGroup";
  	return model[hash] || ( model[ hash ] = new BindingGroup( hash, model, getValue ) );
  }

  var BindingGroup = function BindingGroup ( hash, model, getValue ) {
  	var this$1 = this;

  		this.model = model;
  	this.hash = hash;
  	this.getValue = function () {
  		this$1.value = getValue.call(this$1);
  		return this$1.value;
  	};

  	this.bindings = [];
  };

  BindingGroup.prototype.add = function add ( binding ) {
  	this.bindings.push( binding );
  };

  BindingGroup.prototype.bind = function bind () {
  	this.value = this.model.get();
  	this.model.registerTwowayBinding( this );
  	this.bound = true;
  };

  BindingGroup.prototype.remove = function remove ( binding ) {
  	removeFromArray( this.bindings, binding );
  	if ( !this.bindings.length ) {
  		this.unbind();
  	}
  };

  BindingGroup.prototype.unbind = function unbind () {
  	this.model.unregisterTwowayBinding( this );
  	this.bound = false;
  	delete this.model[this.hash];
  };

  var push$1 = [].push;

  function getValue$1() {
  	var all = this.bindings.filter(function ( b ) { return b.node && b.node.checked; }).map(function ( b ) { return b.element.getAttribute( 'value' ); });
  	var res = [];
  	all.forEach(function ( v ) { if ( !arrayContains( res, v ) ) res.push( v ); });
  	return res;
  }

  var CheckboxNameBinding = (function (Binding) {
  	function CheckboxNameBinding ( element ) {
  		Binding.call( this, element, 'name' );

  		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this

  		// Each input has a reference to an array containing it and its
  		// group, as two-way binding depends on being able to ascertain
  		// the status of all inputs within the group
  		this.group = getBindingGroup( 'checkboxes', this.model, getValue$1 );
  		this.group.add( this );

  		if ( this.noInitialValue ) {
  			this.group.noInitialValue = true;
  		}

  		// If no initial value was set, and this input is checked, we
  		// update the model
  		if ( this.group.noInitialValue && this.element.getAttribute( 'checked' ) ) {
  			var existingValue = this.model.get();
  			var bindingValue = this.element.getAttribute( 'value' );

  			if ( !arrayContains( existingValue, bindingValue ) ) {
  				push$1.call( existingValue, bindingValue ); // to avoid triggering runloop with array adaptor
  			}
  		}
  	}

  	CheckboxNameBinding.prototype = Object.create( Binding && Binding.prototype );
  	CheckboxNameBinding.prototype.constructor = CheckboxNameBinding;

  	CheckboxNameBinding.prototype.bind = function bind () {
  		if ( !this.group.bound ) {
  			this.group.bind();
  		}
  	};

  	CheckboxNameBinding.prototype.changed = function changed () {
  		var wasChecked = !!this.isChecked;
  		this.isChecked = this.node.checked;
  		return this.isChecked === wasChecked;
  	};

  	CheckboxNameBinding.prototype.getInitialValue = function getInitialValue () {
  		// This only gets called once per group (of inputs that
  		// share a name), because it only gets called if there
  		// isn't an initial value. By the same token, we can make
  		// a note of that fact that there was no initial value,
  		// and populate it using any `checked` attributes that
  		// exist (which users should avoid, but which we should
  		// support anyway to avoid breaking expectations)
  		this.noInitialValue = true; // TODO are noInitialValue and wasUndefined the same thing?
  		return [];
  	};

  	CheckboxNameBinding.prototype.getValue = function getValue$1 () {
  		return this.group.value;
  	};

  	CheckboxNameBinding.prototype.handleChange = function handleChange () {
  		this.isChecked = this.element.node.checked;
  		this.group.value = this.model.get();
  		var value = this.element.getAttribute( 'value' );
  		if ( this.isChecked && !arrayContains( this.group.value, value ) ) {
  			this.group.value.push( value );
  		} else if ( !this.isChecked && arrayContains( this.group.value, value ) ) {
  			removeFromArray( this.group.value, value );
  		}
  		Binding.prototype.handleChange.call(this);
  	};

  	CheckboxNameBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);

  		var node = this.node;

  		var existingValue = this.model.get();
  		var bindingValue = this.element.getAttribute( 'value' );

  		if ( isArray( existingValue ) ) {
  			this.isChecked = arrayContains( existingValue, bindingValue );
  		} else {
  			this.isChecked = existingValue == bindingValue;
  		}

  		node.name = '{{' + this.model.getKeypath() + '}}';
  		node.checked = this.isChecked;

  		node.addEventListener( 'change', handleDomEvent, false );

  		// in case of IE emergency, bind to click event as well
  		if ( node.attachEvent ) {
  			node.addEventListener( 'click', handleDomEvent, false );
  		}
  	};

  	CheckboxNameBinding.prototype.setFromNode = function setFromNode ( node ) {
  		this.group.bindings.forEach( function ( binding ) { return binding.wasUndefined = true; } );

  		if ( node.checked ) {
  			var valueSoFar = this.group.getValue();
  			valueSoFar.push( this.element.getAttribute( 'value' ) );

  			this.group.model.set( valueSoFar );
  		}
  	};

  	CheckboxNameBinding.prototype.unbind = function unbind () {
  		this.group.remove( this );
  	};

  	CheckboxNameBinding.prototype.unrender = function unrender () {
  		var node = this.element.node;

  		node.removeEventListener( 'change', handleDomEvent, false );
  		node.removeEventListener( 'click', handleDomEvent, false );
  	};

  	return CheckboxNameBinding;
  }(Binding));

  var ContentEditableBinding = (function (Binding) {
  	function ContentEditableBinding () {
  		Binding.apply(this, arguments);
  	}

  	ContentEditableBinding.prototype = Object.create( Binding && Binding.prototype );
  	ContentEditableBinding.prototype.constructor = ContentEditableBinding;

  	ContentEditableBinding.prototype.getInitialValue = function getInitialValue () {
  		return this.element.fragment ? this.element.fragment.toString() : '';
  	};

  	ContentEditableBinding.prototype.getValue = function getValue () {
  		return this.element.node.innerHTML;
  	};

  	ContentEditableBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);

  		var node = this.node;

  		node.addEventListener( 'change', handleDomEvent, false );
  		node.addEventListener( 'blur', handleDomEvent, false );

  		if ( !this.ractive.lazy ) {
  			node.addEventListener( 'input', handleDomEvent, false );

  			if ( node.attachEvent ) {
  				node.addEventListener( 'keyup', handleDomEvent, false );
  			}
  		}
  	};

  	ContentEditableBinding.prototype.setFromNode = function setFromNode ( node ) {
  		this.model.set( node.innerHTML );
  	};

  	ContentEditableBinding.prototype.unrender = function unrender () {
  		var node = this.node;

  		node.removeEventListener( 'blur', handleDomEvent, false );
  		node.removeEventListener( 'change', handleDomEvent, false );
  		node.removeEventListener( 'input', handleDomEvent, false );
  		node.removeEventListener( 'keyup', handleDomEvent, false );
  	};

  	return ContentEditableBinding;
  }(Binding));

  function handleBlur () {
  	handleDomEvent.call( this );

  	var value = this._ractive.binding.model.get();
  	this.value = value == undefined ? '' : value;
  }

  function handleDelay ( delay ) {
  	var timeout;

  	return function () {
  		var this$1 = this;

  		if ( timeout ) clearTimeout( timeout );

  		timeout = setTimeout( function () {
  			var binding = this$1._ractive.binding;
  			if ( binding.rendered ) handleDomEvent.call( this$1 );
  			timeout = null;
  		}, delay );
  	};
  }

  var GenericBinding = (function (Binding) {
  	function GenericBinding () {
  		Binding.apply(this, arguments);
  	}

  	GenericBinding.prototype = Object.create( Binding && Binding.prototype );
  	GenericBinding.prototype.constructor = GenericBinding;

  	GenericBinding.prototype.getInitialValue = function getInitialValue () {
  		return '';
  	};

  	GenericBinding.prototype.getValue = function getValue () {
  		return this.node.value;
  	};

  	GenericBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);

  		// any lazy setting for this element overrides the root
  		// if the value is a number, it's a timeout
  		var lazy = this.ractive.lazy;
  		var timeout = false;

  		// TODO handle at parse time
  		if ( this.element.template.a && ( 'lazy' in this.element.template.a ) ) {
  			lazy = this.element.template.a.lazy;
  			if ( lazy === 0 ) lazy = true; // empty attribute
  		}

  		// TODO handle this at parse time as well?
  		if ( lazy === 'false' ) lazy = false;

  		if ( isNumeric( lazy ) ) {
  			timeout = +lazy;
  			lazy = false;
  		}

  		this.handler = timeout ? handleDelay( timeout ) : handleDomEvent;

  		var node = this.node;

  		node.addEventListener( 'change', handleDomEvent, false );

  		if ( !lazy ) {
  			node.addEventListener( 'input', this.handler, false );

  			if ( node.attachEvent ) {
  				node.addEventListener( 'keyup', this.handler, false );
  			}
  		}

  		node.addEventListener( 'blur', handleBlur, false );
  	};

  	GenericBinding.prototype.unrender = function unrender () {
  		var node = this.element.node;
  		this.rendered = false;

  		node.removeEventListener( 'change', handleDomEvent, false );
  		node.removeEventListener( 'input', this.handler, false );
  		node.removeEventListener( 'keyup', this.handler, false );
  		node.removeEventListener( 'blur', handleBlur, false );
  	};

  	return GenericBinding;
  }(Binding));

  function getSelectedOptions ( select ) {
      return select.selectedOptions
  		? toArray( select.selectedOptions )
  		: select.options
  			? toArray( select.options ).filter( function ( option ) { return option.selected; } )
  			: [];
  }

  var MultipleSelectBinding = (function (Binding) {
  	function MultipleSelectBinding () {
  		Binding.apply(this, arguments);
  	}

  	MultipleSelectBinding.prototype = Object.create( Binding && Binding.prototype );
  	MultipleSelectBinding.prototype.constructor = MultipleSelectBinding;

  	MultipleSelectBinding.prototype.forceUpdate = function forceUpdate () {
  		var this$1 = this;

  		var value = this.getValue();

  		if ( value !== undefined ) {
  			this.attribute.locked = true;
  			runloop.scheduleTask( function () { return this$1.attribute.locked = false; } );
  			this.model.set( value );
  		}
  	};

  	MultipleSelectBinding.prototype.getInitialValue = function getInitialValue () {
  		return this.element.options
  			.filter( function ( option ) { return option.getAttribute( 'selected' ); } )
  			.map( function ( option ) { return option.getAttribute( 'value' ); } );
  	};

  	MultipleSelectBinding.prototype.getValue = function getValue () {
  		var options = this.element.node.options;
  		var len = options.length;

  		var selectedValues = [];

  		for ( var i = 0; i < len; i += 1 ) {
  			var option = options[i];

  			if ( option.selected ) {
  				var optionValue = option._ractive ? option._ractive.value : option.value;
  				selectedValues.push( optionValue );
  			}
  		}

  		return selectedValues;
  	};

  	MultipleSelectBinding.prototype.handleChange = function handleChange () {
  		var attribute = this.attribute;
  		var previousValue = attribute.getValue();

  		var value = this.getValue();

  		if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
  			Binding.prototype.handleChange.call(this);
  		}

  		return this;
  	};

  	MultipleSelectBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);

  		this.node.addEventListener( 'change', handleDomEvent, false );

  		if ( this.model.get() === undefined ) {
  			// get value from DOM, if possible
  			this.handleChange();
  		}
  	};

  	MultipleSelectBinding.prototype.setFromNode = function setFromNode ( node ) {
  		var selectedOptions = getSelectedOptions( node );
  		var i = selectedOptions.length;
  		var result = new Array( i );

  		while ( i-- ) {
  			var option = selectedOptions[i];
  			result[i] = option._ractive ? option._ractive.value : option.value;
  		}

  		this.model.set( result );
  	};

  	MultipleSelectBinding.prototype.setValue = function setValue () {
  		throw new Error( 'TODO not implemented yet' );
  	};

  	MultipleSelectBinding.prototype.unrender = function unrender () {
  		this.node.removeEventListener( 'change', handleDomEvent, false );
  	};

  	MultipleSelectBinding.prototype.updateModel = function updateModel () {
  		if ( this.attribute.value === undefined || !this.attribute.value.length ) {
  			this.keypath.set( this.initialValue );
  		}
  	};

  	return MultipleSelectBinding;
  }(Binding));

  var NumericBinding = (function (GenericBinding) {
  	function NumericBinding () {
  		GenericBinding.apply(this, arguments);
  	}

  	NumericBinding.prototype = Object.create( GenericBinding && GenericBinding.prototype );
  	NumericBinding.prototype.constructor = NumericBinding;

  	NumericBinding.prototype.getInitialValue = function getInitialValue () {
  		return undefined;
  	};

  	NumericBinding.prototype.getValue = function getValue () {
  		var value = parseFloat( this.node.value );
  		return isNaN( value ) ? undefined : value;
  	};

  	NumericBinding.prototype.setFromNode = function setFromNode( node ) {
  		var value = parseFloat( node.value );
  		if ( !isNaN( value ) ) this.model.set( value );
  	};

  	return NumericBinding;
  }(GenericBinding));

  var siblings = {};

  function getSiblings ( hash ) {
  	return siblings[ hash ] || ( siblings[ hash ] = [] );
  }

  var RadioBinding = (function (Binding) {
  	function RadioBinding ( element ) {
  		Binding.call( this, element, 'checked' );

  		this.siblings = getSiblings( this.ractive._guid + this.element.getAttribute( 'name' ) );
  		this.siblings.push( this );
  	}

  	RadioBinding.prototype = Object.create( Binding && Binding.prototype );
  	RadioBinding.prototype.constructor = RadioBinding;

  	RadioBinding.prototype.getValue = function getValue () {
  		return this.node.checked;
  	};

  	RadioBinding.prototype.handleChange = function handleChange () {
  		runloop.start( this.root );

  		this.siblings.forEach( function ( binding ) {
  			binding.model.set( binding.getValue() );
  		});

  		runloop.end();
  	};

  	RadioBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);

  		this.node.addEventListener( 'change', handleDomEvent, false );

  		if ( this.node.attachEvent ) {
  			this.node.addEventListener( 'click', handleDomEvent, false );
  		}
  	};

  	RadioBinding.prototype.setFromNode = function setFromNode ( node ) {
  		this.model.set( node.checked );
  	};

  	RadioBinding.prototype.unbind = function unbind () {
  		removeFromArray( this.siblings, this );
  	};

  	RadioBinding.prototype.unrender = function unrender () {
  		this.node.removeEventListener( 'change', handleDomEvent, false );
  		this.node.removeEventListener( 'click', handleDomEvent, false );
  	};

  	return RadioBinding;
  }(Binding));

  function getValue$2() {
  	var checked = this.bindings.filter( function ( b ) { return b.node.checked; } );
  	if ( checked.length > 0 ) {
  		return checked[0].element.getAttribute( 'value' );
  	}
  }

  var RadioNameBinding = (function (Binding) {
  	function RadioNameBinding ( element ) {
  		Binding.call( this, element, 'name' );

  		this.group = getBindingGroup( 'radioname', this.model, getValue$2 );
  		this.group.add( this );

  		if ( element.checked ) {
  			this.group.value = this.getValue();
  		}
  	}

  	RadioNameBinding.prototype = Object.create( Binding && Binding.prototype );
  	RadioNameBinding.prototype.constructor = RadioNameBinding;

  	RadioNameBinding.prototype.bind = function bind () {
  		var this$1 = this;

  		if ( !this.group.bound ) {
  			this.group.bind();
  		}

  		// update name keypath when necessary
  		this.nameAttributeBinding = {
  			handleChange: function () { return this$1.node.name = "{{" + (this$1.model.getKeypath()) + "}}"; }
  		};

  		this.model.getKeypathModel().register( this.nameAttributeBinding );
  	};

  	RadioNameBinding.prototype.getInitialValue = function getInitialValue () {
  		if ( this.element.getAttribute( 'checked' ) ) {
  			return this.element.getAttribute( 'value' );
  		}
  	};

  	RadioNameBinding.prototype.getValue = function getValue$1 () {
  		return this.element.getAttribute( 'value' );
  	};

  	RadioNameBinding.prototype.handleChange = function handleChange () {
  		// If this <input> is the one that's checked, then the value of its
  		// `name` model gets set to its value
  		if ( this.node.checked ) {
  			this.group.value = this.getValue();
  			Binding.prototype.handleChange.call(this);
  		}
  	};

  	RadioNameBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);

  		var node = this.node;

  		node.name = "{{" + (this.model.getKeypath()) + "}}";
  		node.checked = this.model.get() == this.element.getAttribute( 'value' );

  		node.addEventListener( 'change', handleDomEvent, false );

  		if ( node.attachEvent ) {
  			node.addEventListener( 'click', handleDomEvent, false );
  		}
  	};

  	RadioNameBinding.prototype.setFromNode = function setFromNode ( node ) {
  		if ( node.checked ) {
  			this.group.model.set( this.element.getAttribute( 'value' ) );
  		}
  	};

  	RadioNameBinding.prototype.unbind = function unbind () {
  		this.group.remove( this );

  		this.model.getKeypathModel().unregister( this.nameAttributeBinding );
  	};

  	RadioNameBinding.prototype.unrender = function unrender () {
  		var node = this.node;

  		node.removeEventListener( 'change', handleDomEvent, false );
  		node.removeEventListener( 'click', handleDomEvent, false );
  	};

  	return RadioNameBinding;
  }(Binding));

  var SingleSelectBinding = (function (Binding) {
  	function SingleSelectBinding () {
  		Binding.apply(this, arguments);
  	}

  	SingleSelectBinding.prototype = Object.create( Binding && Binding.prototype );
  	SingleSelectBinding.prototype.constructor = SingleSelectBinding;

  	SingleSelectBinding.prototype.forceUpdate = function forceUpdate () {
  		var this$1 = this;

  		var value = this.getValue();

  		if ( value !== undefined ) {
  			this.attribute.locked = true;
  			runloop.scheduleTask( function () { return this$1.attribute.locked = false; } );
  			this.model.set( value );
  		}
  	};

  	SingleSelectBinding.prototype.getInitialValue = function getInitialValue () {
  		if ( this.element.getAttribute( 'value' ) !== undefined ) {
  			return;
  		}

  		var options = this.element.options;
  		var len = options.length;

  		if ( !len ) return;

  		var value;
  		var optionWasSelected;
  		var i = len;

  		// take the final selected option...
  		while ( i-- ) {
  			var option = options[i];

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
  	};

  	SingleSelectBinding.prototype.getValue = function getValue () {
  		var options = this.node.options;
  		var len = options.length;

  		var i;
  		for ( i = 0; i < len; i += 1 ) {
  			var option = options[i];

  			if ( options[i].selected && !options[i].disabled ) {
  				return option._ractive ? option._ractive.value : option.value;
  			}
  		}
  	};

  	SingleSelectBinding.prototype.render = function render () {
  		Binding.prototype.render.call(this);
  		this.node.addEventListener( 'change', handleDomEvent, false );
  	};

  	SingleSelectBinding.prototype.setFromNode = function setFromNode ( node ) {
  		var option = getSelectedOptions( node )[0];
  		this.model.set( option._ractive ? option._ractive.value : option.value );
  	};

  	// TODO this method is an anomaly... is it necessary?
  	SingleSelectBinding.prototype.setValue = function setValue ( value ) {
  		this.model.set( value );
  	};

  	SingleSelectBinding.prototype.unrender = function unrender () {
  		this.node.removeEventListener( 'change', handleDomEvent, false );
  	};

  	return SingleSelectBinding;
  }(Binding));

  function isBindable ( attribute ) {
  	return attribute &&
  	       attribute.template.length === 1 &&
  	       attribute.template[0].t === INTERPOLATOR &&
  	       !attribute.template[0].s;
  }

  function selectBinding ( element ) {
  	var attributes = element.attributeByName;

  	// contenteditable - bind if the contenteditable attribute is true
  	// or is bindable and may thus become true...
  	if ( element.getAttribute( 'contenteditable' ) || isBindable( attributes.contenteditable ) ) {
  		// ...and this element also has a value attribute to bind
  		return isBindable( attributes.value ) ? ContentEditableBinding : null;
  	}

  	// <input>
  	if ( element.name === 'input' ) {
  		var type = element.getAttribute( 'type' );

  		if ( type === 'radio' || type === 'checkbox' ) {
  			var bindName = isBindable( attributes.name );
  			var bindChecked = isBindable( attributes.checked );

  			// for radios we can either bind the name attribute, or the checked attribute - not both
  			if ( bindName && bindChecked ) {
  				if ( type === 'radio' ) {
  					warnIfDebug( 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both', { ractive: element.root });
  				} else {
  					// A checkbox with bindings for both name and checked - see https://github.com/ractivejs/ractive/issues/1749
  					return CheckboxBinding;
  				}
  			}

  			if ( bindName ) {
  				return type === 'radio' ? RadioNameBinding : CheckboxNameBinding;
  			}

  			if ( bindChecked ) {
  				return type === 'radio' ? RadioBinding : CheckboxBinding;
  			}
  		}

  		if ( type === 'file' && isBindable( attributes.value ) ) {
  			return Binding;
  		}

  		if ( isBindable( attributes.value ) ) {
  			return ( type === 'number' || type === 'range' ) ? NumericBinding : GenericBinding;
  		}

  		return null;
  	}

  	// <select>
  	if ( element.name === 'select' && isBindable( attributes.value ) ) {
  		return element.getAttribute( 'multiple' ) ? MultipleSelectBinding : SingleSelectBinding;
  	}

  	// <textarea>
  	if ( element.name === 'textarea' && isBindable( attributes.value ) ) {
  		return GenericBinding;
  	}
  }

  function makeDirty$1 ( query ) {
  	query.makeDirty();
  }

  var Element = (function (Item) {
  	function Element ( options ) {
  		var this$1 = this;

  		Item.call( this, options );

  		this.liveQueries = []; // TODO rare case. can we handle differently?

  		this.name = options.template.e.toLowerCase();
  		this.isVoid = voidElementNames.test( this.name );

  		// find parent element
  		var fragment = this.parentFragment;
  		while ( fragment ) {
  			if ( fragment.owner.type === ELEMENT ) {
  				this$1.parent = fragment.owner;
  				break;
  			}
  			fragment = fragment.parent;
  		}

  		if ( this.parent && this.parent.name === 'option' ) {
  			throw new Error( ("An <option> element cannot contain other elements (encountered <" + (this.name) + ">)") );
  		}

  		// create attributes
  		this.attributeByName = {};
  		this.attributes = [];

  		if ( this.template.a ) {
  			Object.keys( this.template.a ).forEach( function ( name ) {
  				// TODO process this at parse time
  				if ( name === 'twoway' || name === 'lazy' ) return;

  				var attribute = new Attribute({
  					name: name,
  					element: this$1,
  					parentFragment: this$1.parentFragment,
  					template: this$1.template.a[ name ]
  				});

  				this$1.attributeByName[ name ] = attribute;

  				if ( name !== 'value' && name !== 'type' ) this$1.attributes.push( attribute );
  			});

  			if ( this.attributeByName.type ) this.attributes.unshift( this.attributeByName.type );
  			if ( this.attributeByName.value ) this.attributes.push( this.attributeByName.value );
  		}

  		// create conditional attributes
  		this.conditionalAttributes = ( this.template.m || [] ).map( function ( template ) {
  			return new ConditionalAttribute({
  				owner: this$1,
  				parentFragment: this$1.parentFragment,
  				template: template
  			});
  		});

  		// create decorator
  		if ( this.template.o ) {
  			this.decorator = new Decorator( this, this.template.o );
  		}

  		// attach event handlers
  		this.eventHandlers = [];
  		if ( this.template.v ) {
  			Object.keys( this.template.v ).forEach( function ( key ) {
  				var eventNames = key.split( '-' );
  				var template = this$1.template.v[ key ];

  				eventNames.forEach( function ( eventName ) {
  					var fn = findInViewHierarchy( 'events', this$1.ractive, eventName );
  					// we need to pass in "this" in order to get
  					// access to node when it is created.
  					var event = fn ? new CustomEvent( fn, this$1 ) : new DOMEvent( eventName, this$1 );
  					this$1.eventHandlers.push( new EventDirective( this$1, event, template ) );
  				});
  			});
  		}

  		// create children
  		if ( options.template.f && !options.noContent ) {
  			this.fragment = new Fragment({
  				template: options.template.f,
  				owner: this,
  				cssIds: null
  			});
  		}

  		this.binding = null; // filled in later
  	}

  	Element.prototype = Object.create( Item && Item.prototype );
  	Element.prototype.constructor = Element;

  	Element.prototype.bind = function bind$1 () {
  		this.attributes.forEach( bind );
  		this.conditionalAttributes.forEach( bind );
  		this.eventHandlers.forEach( bind );

  		if ( this.decorator ) this.decorator.bind();
  		if ( this.fragment ) this.fragment.bind();

  		// create two-way binding if necessary
  		if ( this.binding = this.createTwowayBinding() ) this.binding.bind();
  	};

  	Element.prototype.createTwowayBinding = function createTwowayBinding () {
  		var attributes = this.template.a;

  		if ( !attributes ) return null;

  		var shouldBind = 'twoway' in attributes ?
  			attributes.twoway === 0 || attributes.twoway === 'true' : // covers `twoway` and `twoway='true'`
  			this.ractive.twoway;

  		if ( !shouldBind ) return null;

  		var Binding = selectBinding( this );

  		if ( !Binding ) return null;

  		var binding = new Binding( this );

  		return binding && binding.model ?
  			binding :
  			null;
  	};

  	Element.prototype.detach = function detach () {
  		if ( this.decorator ) this.decorator.unrender();
  		return detachNode( this.node );
  	};

  	Element.prototype.find = function find ( selector ) {
  		if ( matches( this.node, selector ) ) return this.node;
  		if ( this.fragment ) {
  			return this.fragment.find( selector );
  		}
  	};

  	Element.prototype.findAll = function findAll ( selector, query ) {
  		// Add this node to the query, if applicable, and register the
  		// query on this element
  		var matches = query.test( this.node );
  		if ( matches ) {
  			query.add( this.node );
  			if ( query.live ) this.liveQueries.push( query );
  		}

  		if ( this.fragment ) {
  			this.fragment.findAll( selector, query );
  		}
  	};

  	Element.prototype.findComponent = function findComponent ( name ) {
  		if ( this.fragment ) {
  			return this.fragment.findComponent( name );
  		}
  	};

  	Element.prototype.findAllComponents = function findAllComponents ( name, query ) {
  		if ( this.fragment ) {
  			this.fragment.findAllComponents( name, query );
  		}
  	};

  	Element.prototype.findNextNode = function findNextNode () {
  		return null;
  	};

  	Element.prototype.firstNode = function firstNode () {
  		return this.node;
  	};

  	Element.prototype.getAttribute = function getAttribute ( name ) {
  		var attribute = this.attributeByName[ name ];
  		return attribute ? attribute.getValue() : undefined;
  	};

  	Element.prototype.rebind = function rebind$1 () {
  		this.attributes.forEach( rebind );
  		this.conditionalAttributes.forEach( rebind );
  		this.eventHandlers.forEach( rebind );
  		if ( this.decorator ) this.decorator.rebind();
  		if ( this.fragment ) this.fragment.rebind();
  		if ( this.binding ) this.binding.rebind();

  		this.liveQueries.forEach( makeDirty$1 );
  	};

  	Element.prototype.render = function render$1 ( target, occupants ) {
  		// TODO determine correct namespace
  		var this$1 = this;

  		this.namespace = getNamespace( this );

  		var node;
  		var existing = false;

  		if ( occupants ) {
  			var n;
  			while ( ( n = occupants.shift() ) ) {
  				if ( n.nodeName === this$1.template.e.toUpperCase() && n.namespaceURI === this$1.namespace ) {
  					this$1.node = node = n;
  					existing = true;
  					break;
  				} else {
  					detachNode( n );
  				}
  			}
  		}

  		if ( !node ) {
  			node = createElement( this.template.e, this.namespace, this.getAttribute( 'is' ) );
  			this.node = node;
  		}

  		defineProperty( node, '_ractive', {
  			value: {
  				proxy: this,
  				fragment: this.parentFragment
  			}
  		});

  		// Is this a top-level node of a component? If so, we may need to add
  		// a data-ractive-css attribute, for CSS encapsulation
  		if ( this.parentFragment.cssIds ) {
  			node.setAttribute( 'data-ractive-css', this.parentFragment.cssIds.map( function ( x ) { return ("{" + x + "}"); } ).join( ' ' ) );
  		}

  		if ( existing && this.foundNode ) this.foundNode( node );

  		if ( this.fragment ) {
  			var children = existing ? toArray( node.childNodes ) : undefined;
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
  			var i = node.attributes.length;
  			while ( i-- ) {
  				var name = node.attributes[i].name;
  				if ( !this$1.template.a || !( name in this$1.template.a ) ) node.removeAttribute( name );
  			}
  		}

  		this.attributes.forEach( render );
  		this.conditionalAttributes.forEach( render );

  		if ( this.decorator ) runloop.scheduleTask( function () { return this$1.decorator.render(); }, true );
  		if ( this.binding ) this.binding.render();

  		this.eventHandlers.forEach( render );

  		updateLiveQueries$1( this );

  		// store so we can abort if it gets removed
  		this._introTransition = getTransition( this, this.template.t0 || this.template.t1, 'intro' );

  		if ( !existing ) {
  			target.appendChild( node );
  		}

  		this.rendered = true;
  	};

  	Element.prototype.toString = function toString () {
  		var tagName = this.template.e;

  		var attrs = this.attributes.map( stringifyAttribute ).join( '' ) +
  		            this.conditionalAttributes.map( stringifyAttribute ).join( '' );

  		// Special case - selected options
  		if ( this.name === 'option' && this.isSelected() ) {
  			attrs += ' selected';
  		}

  		// Special case - two-way radio name bindings
  		if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
  			attrs += ' checked';
  		}

  		var str = "<" + tagName + "" + attrs + ">";

  		if ( this.isVoid ) return str;

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

  		str += "</" + tagName + ">";
  		return str;
  	};

  	Element.prototype.unbind = function unbind$1 () {
  		this.attributes.forEach( unbind );
  		this.conditionalAttributes.forEach( unbind );

  		if ( this.decorator ) this.decorator.unbind();
  		if ( this.fragment ) this.fragment.unbind();
  	};

  	Element.prototype.unrender = function unrender$1 ( shouldDestroy ) {
  		if ( !this.rendered ) return;
  		this.rendered = false;

  		// unrendering before intro completed? complete it now
  		// TODO should be an API for aborting transitions
  		var transition = this._introTransition;
  		if ( transition ) transition.complete();

  		// Detach as soon as we can
  		if ( this.name === 'option' ) {
  			// <option> elements detach immediately, so that
  			// their parent <select> element syncs correctly, and
  			// since option elements can't have transitions anyway
  			this.detach();
  		} else if ( shouldDestroy ) {
  			runloop.detachWhenReady( this );
  		}

  		if ( this.fragment ) this.fragment.unrender();

  		this.eventHandlers.forEach( unrender );

  		if ( this.binding ) this.binding.unrender();
  		if ( !shouldDestroy && this.decorator ) this.decorator.unrender();

  		// outro transition
  		getTransition( this, this.template.t0 || this.template.t2, 'outro' );

  		// special case
  		var id = this.attributeByName.id;
  		if ( id  ) {
  			delete this.ractive.nodes[ id.getValue() ];
  		}

  		removeFromLiveQueries( this );
  		// TODO forms are a special case
  	};

  	Element.prototype.update = function update$1 () {
  		if ( this.dirty ) {
  			this.dirty = false;

  			this.attributes.forEach( update );
  			this.conditionalAttributes.forEach( update );
  			this.eventHandlers.forEach( update );

  			if ( this.decorator ) this.decorator.update();
  			if ( this.fragment ) this.fragment.update();
  		}
  	};

  	return Element;
  }(Item));

  function getTransition( owner, template, eventName ) {
  	if ( !template || !owner.ractive.transitionsEnabled ) return;

  	var name = getTransitionName( owner, template );
  	if ( !name ) return;

  	var params = getTransitionParams( owner, template );
  	var transition = new Transition( owner.ractive, owner.node, name, params, eventName );
  	runloop.registerTransition( transition );
  	return transition;
  }

  function getTransitionName ( owner, template ) {
  	var name = template.n || template;

  	if ( typeof name === 'string' ) return name;

  	var fragment = new Fragment({
  		owner: owner,
  		template: name
  	}).bind(); // TODO need a way to capture values without bind()

  	name = fragment.toString();
  	fragment.unbind();

  	return name;
  }

  function getTransitionParams ( owner, template ) {
  	if ( template.a ) return template.a;
  	if ( !template.d )  return;

  	// TODO is there a way to interpret dynamic arguments without all the
  	// 'dependency thrashing'?
  	var fragment = new Fragment({
  		owner: owner,
  		template: template.d
  	}).bind();

  	var params = fragment.getArgsList();
  	fragment.unbind();

  	return params;
  }

  function inputIsCheckedRadio ( element ) {
  	var attributes = element.attributeByName;

  	var typeAttribute  = attributes.type;
  	var valueAttribute = attributes.value;
  	var nameAttribute  = attributes.name;

  	if ( !typeAttribute || ( typeAttribute.value !== 'radio' ) || !valueAttribute || !nameAttribute.interpolator ) {
  		return;
  	}

  	if ( valueAttribute.getValue() === nameAttribute.interpolator.model.get() ) {
  		return true;
  	}
  }

  function stringifyAttribute ( attribute ) {
  	var str = attribute.toString();
  	return str ? ' ' + str : '';
  }

  function removeFromLiveQueries ( element ) {
  	var i = element.liveQueries.length;
  	while ( i-- ) {
  		var query = element.liveQueries[i];
  		query.remove( element.node );
  	}
  }

  function getNamespace ( element ) {
  	// Use specified namespace...
  	var xmlns = element.getAttribute( 'xmlns' );
  	if ( xmlns ) return xmlns;

  	// ...or SVG namespace, if this is an <svg> element
  	if ( element.name === 'svg' ) return svg$1;

  	var parent = element.parent;

  	if ( parent ) {
  		// ...or HTML, if the parent is a <foreignObject>
  		if ( parent.name === 'foreignobject' ) return html;

  		// ...or inherit from the parent node
  		return parent.node.namespaceURI;
  	}

  	return element.ractive.el.namespaceURI;
  }

  var Form = (function (Element) {
  	function Form ( options ) {
  		Element.call( this, options );
  		this.formBindings = [];
  	}

  	Form.prototype = Object.create( Element && Element.prototype );
  	Form.prototype.constructor = Form;

  	Form.prototype.render = function render ( target, occupants ) {
  		Element.prototype.render.call( this, target, occupants );
  		this.node.addEventListener( 'reset', handleReset, false );
  	};

  	Form.prototype.unrender = function unrender ( shouldDestroy ) {
  		this.node.removeEventListener( 'reset', handleReset, false );
  		Element.prototype.unrender.call( this, shouldDestroy );
  	};

  	return Form;
  }(Element));

  function handleReset () {
  	var element = this._ractive.proxy;

  	runloop.start();
  	element.formBindings.forEach( updateModel );
  	runloop.end();
  }

  function updateModel ( binding ) {
  	binding.model.set( binding.resetValue );
  }

  var Mustache = (function (Item) {
  	function Mustache ( options ) {
  		Item.call( this, options );

  		this.parentFragment = options.parentFragment;
  		this.template = options.template;
  		this.index = options.index;

  		this.isStatic = !!options.template.s;

  		this.model = null;
  		this.dirty = false;
  	}

  	Mustache.prototype = Object.create( Item && Item.prototype );
  	Mustache.prototype.constructor = Mustache;

  	Mustache.prototype.bind = function bind () {
  		// try to find a model for this view
  		var this$1 = this;

  		var model = resolve$1( this.parentFragment, this.template );
  		var value = model ? model.get() : undefined;

  		if ( this.isStatic ) {
  			this.model = { get: function () { return value; } };
  			return;
  		}

  		if ( model ) {
  			model.register( this );
  			this.model = model;
  		} else {
  			this.resolver = this.parentFragment.resolve( this.template.r, function ( model ) {
  				this$1.model = model;
  				model.register( this$1 );

  				this$1.handleChange();
  				this$1.resolver = null;
  			});
  		}
  	};

  	Mustache.prototype.handleChange = function handleChange () {
  		this.bubble();
  	};

  	Mustache.prototype.rebind = function rebind () {
  		if ( this.isStatic || !this.model ) return;

  		var model = resolve$1( this.parentFragment, this.template );

  		if ( model === this.model ) return;

  		this.model.unregister( this );

  		this.model = model;

  		if ( model ) {
  			model.register( this );
  			this.handleChange();
  		}
  	};

  	Mustache.prototype.unbind = function unbind () {
  		if ( !this.isStatic ) {
  			this.model && this.model.unregister( this );
  			this.model = undefined;
  			this.resolver && this.resolver.unbind();
  		}
  	};

  	return Mustache;
  }(Item));

  var Interpolator = (function (Mustache) {
  	function Interpolator () {
  		Mustache.apply(this, arguments);
  	}

  	Interpolator.prototype = Object.create( Mustache && Mustache.prototype );
  	Interpolator.prototype.constructor = Interpolator;

  	Interpolator.prototype.detach = function detach () {
  		return detachNode( this.node );
  	};

  	Interpolator.prototype.firstNode = function firstNode () {
  		return this.node;
  	};

  	Interpolator.prototype.getString = function getString () {
  		return this.model ? safeToStringValue( this.model.get() ) : '';
  	};

  	Interpolator.prototype.render = function render ( target, occupants ) {
  		var value = this.getString();

  		this.rendered = true;

  		if ( occupants ) {
  			var n = occupants[0];
  			if ( n && n.nodeType === 3 ) {
  				occupants.shift();
  				if ( n.nodeValue !== value ) {
  					n.nodeValue = value;
  				}
  			} else {
  				n = this.node = doc.createTextNode( value );
  				if ( occupants[0] ) {
  					target.insertBefore( n, occupants[0] );
  				} else {
  					target.appendChild( n );
  				}
  			}

  			this.node = n;
  		} else {
  			this.node = doc.createTextNode( value );
  			target.appendChild( this.node );
  		}
  	};

  	Interpolator.prototype.toString = function toString ( escape ) {
  		var string = this.getString();
  		return escape ? escapeHtml( string ) : string;
  	};

  	Interpolator.prototype.unrender = function unrender ( shouldDestroy ) {
  		if ( shouldDestroy ) this.detach();
  		this.rendered = false;
  	};

  	Interpolator.prototype.update = function update () {
  		if ( this.dirty ) {
  			this.dirty = false;
  			if ( this.rendered ) {
  				this.node.data = this.getString();
  			}
  		}
  	};

  	Interpolator.prototype.valueOf = function valueOf () {
  		return this.model ? this.model.get() : undefined;
  	};

  	return Interpolator;
  }(Mustache));

  var Input = (function (Element) {
  	function Input () {
  		Element.apply(this, arguments);
  	}

  	Input.prototype = Object.create( Element && Element.prototype );
  	Input.prototype.constructor = Input;

  	Input.prototype.render = function render ( target, occupants ) {
  		Element.prototype.render.call( this, target, occupants );
  		this.node.defaultValue = this.node.value;
  	};

  	return Input;
  }(Element));

  function findParentSelect ( element ) {
  	while ( element ) {
  		if ( element.name === 'select' ) return element;
  		element = element.parent;
  	}
  }

  var Option = (function (Element) {
  	function Option ( options ) {
  		var template = options.template;
  		if ( !template.a ) template.a = {};

  		// If the value attribute is missing, use the element's content,
  		// as long as it isn't disabled
  		if ( template.a.value === undefined && !( 'disabled' in template.a ) ) {
  			template.a.value = template.f || '';
  		}

  		Element.call( this, options );

  		this.select = findParentSelect( this.parent );
  	}

  	Option.prototype = Object.create( Element && Element.prototype );
  	Option.prototype.constructor = Option;

  	Option.prototype.bind = function bind () {
  		if ( !this.select ) {
  			Element.prototype.bind.call(this);
  			return;
  		}

  		// If the select has a value, it overrides the `selected` attribute on
  		// this option - so we delete the attribute
  		var selectedAttribute = this.attributeByName.selected;
  		if ( selectedAttribute && this.select.getAttribute( 'value' ) !== undefined ) {
  			var index = this.attributes.indexOf( selectedAttribute );
  			this.attributes.splice( index, 1 );
  			delete this.attributeByName.selected;
  		}

  		Element.prototype.bind.call(this);
  		this.select.options.push( this );
  	};

  	Option.prototype.isSelected = function isSelected () {
  		var optionValue = this.getAttribute( 'value' );

  		if ( optionValue === undefined || !this.select ) {
  			return false;
  		}

  		var selectValue = this.select.getAttribute( 'value' );

  		if ( selectValue == optionValue ) {
  			return true;
  		}

  		if ( this.select.getAttribute( 'multiple' ) && isArray( selectValue ) ) {
  			var i = selectValue.length;
  			while ( i-- ) {
  				if ( selectValue[i] == optionValue ) {
  					return true;
  				}
  			}
  		}
  	};

  	Option.prototype.unbind = function unbind () {
  		Element.prototype.unbind.call(this);

  		if ( this.select ) {
  			removeFromArray( this.select.options, this );
  		}
  	};

  	return Option;
  }(Element));

  function getPartialTemplate ( ractive, name, parentFragment ) {
  	// If the partial in instance or view heirarchy instances, great
  	var partial = getPartialFromRegistry( ractive, name, parentFragment || {} );
  	if ( partial ) return partial;

  	// Does it exist on the page as a script tag?
  	partial = parser.fromId( name, { noThrow: true } );
  	if ( partial ) {
  		// parse and register to this ractive instance
  		var parsed = parser.parseFor( partial, ractive );

  		// register extra partials on the ractive instance if they don't already exist
  		if ( parsed.p ) fillGaps( ractive.partials, parsed.p );

  		// register (and return main partial if there are others in the template)
  		return ractive.partials[ name ] = parsed.t;
  	}
  }

  function getPartialFromRegistry ( ractive, name, parentFragment ) {
  	// if there was an instance up-hierarchy, cool
  	var partial = findParentPartial( name, parentFragment.owner );
  	if ( partial ) return partial;

  	// find first instance in the ractive or view hierarchy that has this partial
  	var instance = findInstance( 'partials', ractive, name );

  	if ( !instance ) { return; }

  	partial = instance.partials[ name ];

  	// partial is a function?
  	var fn;
  	if ( typeof partial === 'function' ) {
  		fn = partial.bind( instance );
  		fn.isOwner = instance.partials.hasOwnProperty(name);
  		partial = fn.call( ractive, parser );
  	}

  	if ( !partial && partial !== '' ) {
  		warnIfDebug( noRegistryFunctionReturn, name, 'partial', 'partial', { ractive: ractive });
  		return;
  	}

  	// If this was added manually to the registry,
  	// but hasn't been parsed, parse it now
  	if ( !parser.isParsed( partial ) ) {
  		// use the parseOptions of the ractive instance on which it was found
  		var parsed = parser.parseFor( partial, instance );

  		// Partials cannot contain nested partials!
  		// TODO add a test for this
  		if ( parsed.p ) {
  			warnIfDebug( 'Partials ({{>%s}}) cannot contain nested inline partials', name, { ractive: ractive });
  		}

  		// if fn, use instance to store result, otherwise needs to go
  		// in the correct point in prototype chain on instance or constructor
  		var target = fn ? instance : findOwner( instance, name );

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
  		: findConstructor( constructor._Parent, key );
  }

  function findParentPartial( name, parent ) {
  	if ( parent ) {
  		if ( parent.template && parent.template.p && parent.template.p[name] ) {
  			return parent.template.p[name];
  		} else if ( parent.parentFragment && parent.parentFragment.owner ) {
  			return findParentPartial( name, parent.parentFragment.owner );
  		}
  	}
  }

  var Partial = (function (Mustache) {
  	function Partial () {
  		Mustache.apply(this, arguments);
  	}

  	Partial.prototype = Object.create( Mustache && Mustache.prototype );
  	Partial.prototype.constructor = Partial;

  	Partial.prototype.bind = function bind () {
  		// keep track of the reference name for future resets
  		this.refName = this.template.r;

  		// name matches take priority over expressions
  		var template = this.refName ? getPartialTemplate( this.ractive, this.refName, this.parentFragment ) || null : null;
  		var templateObj;

  		if ( template ) {
  			this.named = true;
  			this.setTemplate( this.template.r, template );
  		}

  		if ( !template ) {
  			Mustache.prototype.bind.call(this);
  			if ( this.model && ( templateObj = this.model.get() ) && typeof templateObj === 'object' && ( typeof templateObj.template === 'string' || isArray( templateObj.t ) ) ) {
  				if ( templateObj.template ) {
  					templateObj = parsePartial( this.template.r, templateObj.template, this.ractive );
  				}
  				this.setTemplate( this.template.r, templateObj.t );
  			} else if ( ( !this.model || typeof this.model.get() !== 'string' ) && this.refName ) {
  				this.setTemplate( this.refName, template );
  			} else {
  				this.setTemplate( this.model.get() );
  			}
  		}

  		this.fragment = new Fragment({
  			owner: this,
  			template: this.partialTemplate
  		}).bind();
  	};

  	Partial.prototype.detach = function detach () {
  		return this.fragment.detach();
  	};

  	Partial.prototype.find = function find ( selector ) {
  		return this.fragment.find( selector );
  	};

  	Partial.prototype.findAll = function findAll ( selector, query ) {
  		this.fragment.findAll( selector, query );
  	};

  	Partial.prototype.findComponent = function findComponent ( name ) {
  		return this.fragment.findComponent( name );
  	};

  	Partial.prototype.findAllComponents = function findAllComponents ( name, query ) {
  		this.fragment.findAllComponents( name, query );
  	};

  	Partial.prototype.firstNode = function firstNode ( skipParent ) {
  		return this.fragment.firstNode( skipParent );
  	};

  	Partial.prototype.forceResetTemplate = function forceResetTemplate () {
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
  			warnOnceIfDebug( ("Could not find template for partial '" + (this.name) + "'") );
  			this.partialTemplate = [];
  		}

  		this.fragment.resetTemplate( this.partialTemplate );
  		this.bubble();
  	};

  	Partial.prototype.rebind = function rebind () {
  		Mustache.prototype.unbind.call(this);
  		Mustache.prototype.bind.call(this);
  		this.fragment.rebind();
  	};

  	Partial.prototype.render = function render ( target, occupants ) {
  		this.fragment.render( target, occupants );
  	};

  	Partial.prototype.setTemplate = function setTemplate ( name, template ) {
  		this.name = name;

  		if ( !template && template !== null ) template = getPartialTemplate( this.ractive, name, this.parentFragment );

  		if ( !template ) {
  			warnOnceIfDebug( ("Could not find template for partial '" + name + "'") );
  		}

  		this.partialTemplate = template || [];
  	};

  	Partial.prototype.toString = function toString ( escape ) {
  		return this.fragment.toString( escape );
  	};

  	Partial.prototype.unbind = function unbind () {
  		Mustache.prototype.unbind.call(this);
  		this.fragment.unbind();
  	};

  	Partial.prototype.unrender = function unrender ( shouldDestroy ) {
  		this.fragment.unrender( shouldDestroy );
  	};

  	Partial.prototype.update = function update () {
  		var template;

  		if ( this.dirty ) {
  			this.dirty = false;

  			if ( !this.named ) {
  				if ( this.model ) {
  					template = this.model.get();
  				}

  				if ( template && typeof template === 'string' && template !== this.name ) {
  					this.setTemplate( template );
  					this.fragment.resetTemplate( this.partialTemplate );
  				} else if ( template && typeof template === 'object' && ( typeof template.template === 'string' || isArray( template.t ) ) ) {
  					if ( template.template ) {
  						template = parsePartial( this.name, template.template, this.ractive );
  					}
  					this.setTemplate( this.name, template.t );
  					this.fragment.resetTemplate( this.partialTemplate );
  				}
  			}

  			this.fragment.update();
  		}
  	};

  	return Partial;
  }(Mustache));

  function parsePartial( name, partial, ractive ) {
  	var parsed;

  	try {
  		parsed = parser.parse( partial, parser.getParseOptions( ractive ) );
  	} catch (e) {
  		warnIfDebug( ("Could not parse partial from expression '" + name + "'\n" + (e.message)) );
  	}

  	return parsed || { t: [] };
  }

  var RepeatedFragment = function RepeatedFragment ( options ) {
  	this.parent = options.owner.parentFragment;

  	// bit of a hack, so reference resolution works without another
  	// layer of indirection
  	this.parentFragment = this;
  	this.owner = options.owner;
  	this.ractive = this.parent.ractive;

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
  };

  RepeatedFragment.prototype.bind = function bind ( context ) {
  	var this$1 = this;

  		this.context = context;
  	var value = context.get();

  	// {{#each array}}...
  	if ( this.isArray = isArray( value ) ) {
  		// we can't use map, because of sparse arrays
  		this.iterations = [];
  		for ( var i = 0; i < value.length; i += 1 ) {
  			this$1.iterations[i] = this$1.createIteration( i, i );
  		}
  	}

  	// {{#each object}}...
  	else if ( isObject( value ) ) {
  		this.isArray = false;

  		// TODO this is a dreadful hack. There must be a neater way
  		if ( this.indexRef ) {
  			var refs = this.indexRef.split( ',' );
  			this.keyRef = refs[0];
  			this.indexRef = refs[1];
  		}

  		this.iterations = Object.keys( value ).map( function ( key, index ) {
  			return this$1.createIteration( key, index );
  		});
  	}

  	return this;
  };

  RepeatedFragment.prototype.bubble = function bubble () {
  	this.owner.bubble();
  };

  RepeatedFragment.prototype.createIteration = function createIteration ( key, index ) {
  	var fragment = new Fragment({
  		owner: this,
  		template: this.template
  	});

  	// TODO this is a bit hacky
  	fragment.key = key;
  	fragment.index = index;
  	fragment.isIteration = true;

  	var model = this.context.joinKey( key );

  	// set up an iteration alias if there is one
  	if ( this.owner.template.z ) {
  		fragment.aliases = {};
  		fragment.aliases[ this.owner.template.z[0].n ] = model;
  	}

  	return fragment.bind( model );
  };

  RepeatedFragment.prototype.detach = function detach () {
  	var docFrag = createDocumentFragment();
  	this.iterations.forEach( function ( fragment ) { return docFrag.appendChild( fragment.detach() ); } );
  	return docFrag;
  };

  RepeatedFragment.prototype.find = function find ( selector ) {
  	var this$1 = this;

  		var len = this.iterations.length;
  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		var found = this$1.iterations[i].find( selector );
  		if ( found ) return found;
  	}
  };

  RepeatedFragment.prototype.findAll = function findAll ( selector, query ) {
  	var this$1 = this;

  		var len = this.iterations.length;
  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		this$1.iterations[i].findAll( selector, query );
  	}
  };

  RepeatedFragment.prototype.findComponent = function findComponent ( name ) {
  	var this$1 = this;

  		var len = this.iterations.length;
  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		var found = this$1.iterations[i].findComponent( name );
  		if ( found ) return found;
  	}
  };

  RepeatedFragment.prototype.findAllComponents = function findAllComponents ( name, query ) {
  	var this$1 = this;

  		var len = this.iterations.length;
  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		this$1.iterations[i].findAllComponents( name, query );
  	}
  };

  RepeatedFragment.prototype.findNextNode = function findNextNode ( iteration ) {
  	var this$1 = this;

  		if ( iteration.index < this.iterations.length - 1 ) {
  		for ( var i = iteration.index + 1; i < this$1.iterations.length; i++ ) {
  			var node = this$1.iterations[ i ].firstNode( true );
  			if ( node ) return node;
  		}
  	}

  	return this.owner.findNextNode();
  };

  RepeatedFragment.prototype.firstNode = function firstNode ( skipParent ) {
  	return this.iterations[0] ? this.iterations[0].firstNode( skipParent ) : null;
  };

  RepeatedFragment.prototype.rebind = function rebind ( context ) {
  	var this$1 = this;

  		this.context = context;

  	this.iterations.forEach( function ( fragment ) {
  		var model = context.joinKey( fragment.key || fragment.index );
  		if ( this$1.owner.template.z ) {
  			fragment.aliases = {};
  			fragment.aliases[ this$1.owner.template.z[0].n ] = model;
  		}
  		fragment.rebind( model );
  	});
  };

  RepeatedFragment.prototype.render = function render ( target, occupants ) {
  	// TODO use docFrag.cloneNode...

  	if ( this.iterations ) {
  		this.iterations.forEach( function ( fragment ) { return fragment.render( target, occupants ); } );
  	}

  	this.rendered = true;
  };

  RepeatedFragment.prototype.shuffle = function shuffle ( newIndices ) {
  	var this$1 = this;

  		if ( !this.pendingNewIndices ) this.previousIterations = this.iterations.slice();

  	if ( !this.pendingNewIndices ) this.pendingNewIndices = [];

  	this.pendingNewIndices.push( newIndices );

  	var iterations = [];

  	newIndices.forEach( function ( newIndex, oldIndex ) {
  		if ( newIndex === -1 ) return;

  		var fragment = this$1.iterations[ oldIndex ];
  		iterations[ newIndex ] = fragment;

  		if ( newIndex !== oldIndex && fragment ) fragment.dirty = true;
  	});

  	this.iterations = iterations;

  	this.bubble();
  };

  RepeatedFragment.prototype.toString = function toString$1$$ ( escape ) {
  	return this.iterations ?
  		this.iterations.map( escape ? toEscapedString : toString$1 ).join( '' ) :
  		'';
  };

  RepeatedFragment.prototype.unbind = function unbind$1 () {
  	this.iterations.forEach( unbind );
  	return this;
  };

  RepeatedFragment.prototype.unrender = function unrender$1 ( shouldDestroy ) {
  	this.iterations.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
  	if ( this.pendingNewIndices && this.previousIterations ) {
  		this.previousIterations.forEach( function ( fragment ) {
  			if ( fragment.rendered ) shouldDestroy ? unrenderAndDestroy( fragment ) : unrender( fragment );
  		});
  	}
  	this.rendered = false;
  };

  // TODO smart update
  RepeatedFragment.prototype.update = function update$1 () {
  	// skip dirty check, since this is basically just a facade

  	var this$1 = this;

  		if ( this.pendingNewIndices ) {
  		this.updatePostShuffle();
  		return;
  	}

  	if ( this.updating ) return;
  	this.updating = true;

  	var value = this.context.get(),
  			  wasArray = this.isArray;

  	var toRemove;
  	var oldKeys;
  	var reset = true;
  	var i;

  	if ( this.isArray = isArray( value ) ) {
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
  			var fragment$1 = this$1.iterations[i];
  			if ( fragment$1.key in value ) {
  				oldKeys[ fragment$1.key ] = true;
  			} else {
  				this$1.iterations.splice( i, 1 );
  				toRemove.push( fragment$1 );
  			}
  		}
  	}

  	if ( reset ) {
  		toRemove = this.iterations;
  		this.iterations = [];
  	}

  	if ( toRemove ) {
  		toRemove.forEach( function ( fragment ) {
  			fragment.unbind();
  			fragment.unrender( true );
  		});
  	}

  	// update the remaining ones
  	this.iterations.forEach( update );

  	// add new iterations
  	var newLength = isArray( value ) ?
  		value.length :
  		isObject( value ) ?
  			Object.keys( value ).length :
  			0;

  	var docFrag;
  	var fragment;

  	if ( newLength > this.iterations.length ) {
  		docFrag = this.rendered ? createDocumentFragment() : null;
  		i = this.iterations.length;

  		if ( isArray( value ) ) {
  			while ( i < value.length ) {
  				fragment = this$1.createIteration( i, i );

  				this$1.iterations.push( fragment );
  				if ( this$1.rendered ) fragment.render( docFrag );

  				i += 1;
  			}
  		}

  		else if ( isObject( value ) ) {
  			// TODO this is a dreadful hack. There must be a neater way
  			if ( this.indexRef && !this.keyRef ) {
  				var refs = this.indexRef.split( ',' );
  				this.keyRef = refs[0];
  				this.indexRef = refs[1];
  			}

  			Object.keys( value ).forEach( function ( key ) {
  				if ( !oldKeys || !( key in oldKeys ) ) {
  					fragment = this$1.createIteration( key, i );

  					this$1.iterations.push( fragment );
  					if ( this$1.rendered ) fragment.render( docFrag );

  					i += 1;
  				}
  			});
  		}

  		if ( this.rendered ) {
  			var parentNode = this.parent.findParentNode();
  			var anchor = this.parent.findNextNode( this.owner );

  			parentNode.insertBefore( docFrag, anchor );
  		}
  	}

  	this.updating = false;
  };

  RepeatedFragment.prototype.updatePostShuffle = function updatePostShuffle () {
  	var this$1 = this;

  		var newIndices = this.pendingNewIndices[ 0 ];

  	// map first shuffle through
  	this.pendingNewIndices.slice( 1 ).forEach( function ( indices ) {
  		newIndices.forEach( function ( newIndex, oldIndex ) {
  			newIndices[ oldIndex ] = indices[ newIndex ];
  		});
  	});

  	// This algorithm (for detaching incorrectly-ordered fragments from the DOM and
  	// storing them in a document fragment for later reinsertion) seems a bit hokey,
  	// but it seems to work for now
  	var len = this.context.get().length;
  	var i, maxIdx = 0, merged = false;

  	newIndices.forEach( function ( newIndex, oldIndex ) {
  		var fragment = this$1.previousIterations[ oldIndex ];

  		// check for merged shuffles
  		if ( !merged && newIndex !== -1 ) {
  			if ( newIndex < maxIdx ) merged = true;
  			if ( newIndex > maxIdx ) maxIdx = newIndex;
  		}


  		if ( newIndex === -1 ) {
  			fragment.unbind().unrender( true );
  		} else {
  			fragment.index = newIndex;
  			var model = this$1.context.joinKey( newIndex );
  			if ( this$1.owner.template.z ) {
  				fragment.aliases = {};
  				fragment.aliases[ this$1.owner.template.z[0].n ] = model;
  			}
  			fragment.rebind( model );
  		}
  	});

  	// create new iterations
  	var docFrag = this.rendered ? createDocumentFragment() : null;
  	var parentNode = this.rendered ? this.parent.findParentNode() : null;

  	if ( merged ) {
  		for ( i = 0; i < len; i += 1 ) {
  			var frag = this$1.iterations[i];

  			if ( this$1.rendered ) {
  				if ( frag ) {
  					docFrag.appendChild( frag.detach() );
  				} else {
  					this$1.iterations[i] = this$1.createIteration( i, i );
  					this$1.iterations[i].render( docFrag );
  				}
  			}

  			if ( !this$1.rendered ) {
  				if ( !frag ) {
  					this$1.iterations[i] = this$1.createIteration( i, i );
  				}
  			}
  		}
  	} else {
  		for ( i = 0; i < len; i++ ) {
  			var frag$1 = this$1.iterations[i];

  			if ( this$1.rendered ) {
  				if ( frag$1 && docFrag.childNodes.length ) {
  					parentNode.insertBefore( docFrag, frag$1.firstNode() );
  				}

  				if ( !frag$1 ) {
  					frag$1 = this$1.iterations[i] = this$1.createIteration( i, i );
  					frag$1.render( docFrag );
  				}
  			} else if ( !frag$1 ) {
  				this$1.iterations[i] = this$1.createIteration( i, i );
  			}
  		}
  	}

  	if ( this.rendered && docFrag.childNodes.length ) {
  		parentNode.insertBefore( docFrag, this.owner.findNextNode() );
  	}

  	this.iterations.forEach( update );

  	this.pendingNewIndices = null;
  };

  function isEmpty ( value ) {
  	return !value ||
  	       ( isArray( value ) && value.length === 0 ) ||
  		   ( isObject( value ) && Object.keys( value ).length === 0 );
  }

  function getType ( value, hasIndexRef ) {
  	if ( hasIndexRef || isArray( value ) ) return SECTION_EACH;
  	if ( isObject( value ) || typeof value === 'function' ) return SECTION_IF_WITH;
  	if ( value === undefined ) return null;
  	return SECTION_IF;
  }

  var Section = (function (Mustache) {
  	function Section ( options ) {
  		Mustache.call( this, options );

  		this.sectionType = options.template.n || null;
  		this.templateSectionType = this.sectionType;
  		this.fragment = null;
  	}

  	Section.prototype = Object.create( Mustache && Mustache.prototype );
  	Section.prototype.constructor = Section;

  	Section.prototype.bind = function bind () {
  		Mustache.prototype.bind.call(this);

  		// if we managed to bind, we need to create children
  		if ( this.model ) {
  			this.dirty = true;
  			this.update();
  		} else if (this.sectionType && this.sectionType === SECTION_UNLESS) {
  			this.fragment = new Fragment({
  				owner: this,
  				template: this.template.f
  			}).bind();
  		}
  	};

  	Section.prototype.detach = function detach () {
  		return this.fragment ? this.fragment.detach() : createDocumentFragment();
  	};

  	Section.prototype.find = function find ( selector ) {
  		if ( this.fragment ) {
  			return this.fragment.find( selector );
  		}
  	};

  	Section.prototype.findAll = function findAll ( selector, query ) {
  		if ( this.fragment ) {
  			this.fragment.findAll( selector, query );
  		}
  	};

  	Section.prototype.findComponent = function findComponent ( name ) {
  		if ( this.fragment ) {
  			return this.fragment.findComponent( name );
  		}
  	};

  	Section.prototype.findAllComponents = function findAllComponents ( name, query ) {
  		if ( this.fragment ) {
  			this.fragment.findAllComponents( name, query );
  		}
  	};

  	Section.prototype.firstNode = function firstNode ( skipParent ) {
  		return this.fragment && this.fragment.firstNode( skipParent );
  	};

  	Section.prototype.rebind = function rebind () {
  		Mustache.prototype.rebind.call(this);

  		if ( this.fragment ) {
  			this.fragment.rebind( this.sectionType === SECTION_IF || this.sectionType === SECTION_UNLESS ? null : this.model );
  		}
  	};

  	Section.prototype.render = function render ( target, occupants ) {
  		this.rendered = true;
  		if ( this.fragment ) this.fragment.render( target, occupants );
  	};

  	Section.prototype.shuffle = function shuffle ( newIndices ) {
  		if ( this.fragment && this.sectionType === SECTION_EACH ) {
  			this.fragment.shuffle( newIndices );
  		}
  	};

  	Section.prototype.toString = function toString ( escape ) {
  		return this.fragment ? this.fragment.toString( escape ) : '';
  	};

  	Section.prototype.unbind = function unbind () {
  		Mustache.prototype.unbind.call(this);
  		if ( this.fragment ) this.fragment.unbind();
  	};

  	Section.prototype.unrender = function unrender ( shouldDestroy ) {
  		if ( this.rendered && this.fragment ) this.fragment.unrender( shouldDestroy );
  		this.rendered = false;
  	};

  	Section.prototype.update = function update () {
  		if ( !this.dirty ) return;
  		if ( !this.model && this.sectionType !== SECTION_UNLESS ) return;

  		this.dirty = false;

  		var value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
  		var lastType = this.sectionType;

  		// watch for switching section types
  		if ( this.sectionType === null || this.templateSectionType === null ) this.sectionType = getType( value, this.template.i );
  		if ( lastType && lastType !== this.sectionType && this.fragment ) {
  			if ( this.rendered ) {
  				this.fragment.unbind().unrender( true );
  			}

  			this.fragment = null;
  		}

  		var newFragment;

  		if ( this.sectionType === SECTION_EACH ) {
  			if ( this.fragment ) {
  				this.fragment.update();
  			} else {
  				// TODO can this happen?
  				newFragment = new RepeatedFragment({
  					owner: this,
  					template: this.template.f,
  					indexRef: this.template.i
  				}).bind( this.model );
  			}
  		}

  		// WITH is now IF_WITH; WITH is only used for {{>partial context}}
  		else if ( this.sectionType === SECTION_WITH ) {
  			if ( this.fragment ) {
  				this.fragment.update();
  			} else {
  				newFragment = new Fragment({
  					owner: this,
  					template: this.template.f
  				}).bind( this.model );
  			}
  		}

  		else if ( this.sectionType === SECTION_IF_WITH ) {
  			if ( this.fragment ) {
  				if ( isEmpty( value ) ) {
  					if ( this.rendered ) {
  						this.fragment.unbind().unrender( true );
  					}

  					this.fragment = null;
  				} else {
  					this.fragment.update();
  				}
  			} else if ( !isEmpty( value ) ) {
  				newFragment = new Fragment({
  					owner: this,
  					template: this.template.f
  				}).bind( this.model );
  			}
  		}

  		else {
  			var fragmentShouldExist = this.sectionType === SECTION_UNLESS ? isEmpty( value ) : !!value && !isEmpty( value );

  			if ( this.fragment ) {
  				if ( fragmentShouldExist ) {
  					this.fragment.update();
  				} else {
  					if ( this.rendered ) {
  						this.fragment.unbind().unrender( true );
  					}

  					this.fragment = null;
  				}
  			} else if ( fragmentShouldExist ) {
  				newFragment = new Fragment({
  					owner: this,
  					template: this.template.f
  				}).bind( null );
  			}
  		}

  		if ( newFragment ) {
  			if ( this.rendered ) {
  				var parentNode = this.parentFragment.findParentNode();
  				var anchor = this.parentFragment.findNextNode( this );

  				if ( anchor ) {
  					var docFrag = createDocumentFragment();
  					newFragment.render( docFrag );

  					// we use anchor.parentNode, not parentNode, because the sibling
  					// may be temporarily detached as a result of a shuffle
  					anchor.parentNode.insertBefore( docFrag, anchor );
  				} else {
  					newFragment.render( parentNode );
  				}
  			}

  			this.fragment = newFragment;
  		}
  	};

  	return Section;
  }(Mustache));

  function valueContains ( selectValue, optionValue ) {
  	var i = selectValue.length;
  	while ( i-- ) {
  		if ( selectValue[i] == optionValue ) return true;
  	}
  }

  var Select = (function (Element) {
  	function Select ( options ) {
  		Element.call( this, options );
  		this.options = [];
  	}

  	Select.prototype = Object.create( Element && Element.prototype );
  	Select.prototype.constructor = Select;

  	Select.prototype.foundNode = function foundNode ( node ) {
  		if ( this.binding ) {
  			var selectedOptions = getSelectedOptions( node );

  			if ( selectedOptions.length > 0 ) {
  				this.selectedOptions = selectedOptions;
  			}
  		}
  	};

  	Select.prototype.render = function render ( target, occupants ) {
  		Element.prototype.render.call( this, target, occupants );
  		this.sync();

  		var node = this.node;

  		var i = node.options.length;
  		while ( i-- ) {
  			node.options[i].defaultSelected = node.options[i].selected;
  		}

  		this.rendered = true;
  	};

  	Select.prototype.sync = function sync () {
  		var this$1 = this;

  		var selectNode = this.node;

  		if ( !selectNode ) return;

  		var options = toArray( selectNode.options );

  		if ( this.selectedOptions ) {
  			options.forEach( function ( o ) {
  				if ( this$1.selectedOptions.indexOf( o ) >= 0 ) o.selected = true;
  				else o.selected = false;
  			});
  			this.binding.setFromNode( selectNode );
  			delete this.selectedOptions;
  			return;
  		}

  		var selectValue = this.getAttribute( 'value' );
  		var isMultiple = this.getAttribute( 'multiple' );

  		// If the <select> has a specified value, that should override
  		// these options
  		if ( selectValue !== undefined ) {
  			var optionWasSelected;

  			options.forEach( function ( o ) {
  				var optionValue = o._ractive ? o._ractive.value : o.value;
  				var shouldSelect = isMultiple ? valueContains( selectValue, optionValue ) : selectValue == optionValue;

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
  	};

  	Select.prototype.update = function update () {
  		Element.prototype.update.call(this);
  		this.sync();
  	};

  	return Select;
  }(Element));

  var Textarea = (function (Input) {
  	function Textarea( options ) {
  		var template = options.template;

  		// if there is a bindable value, there should be no body
  		if ( template.a && template.a.value && isBindable( { template: template.a.value } ) ) {
  			options.noContent = true;
  		}

  		// otherwise, if there is a single bindable interpolator as content, move it to the value attr
  		else if ( template.f && (!template.a || !template.a.value) && isBindable( { template: template.f } ) ) {
  			if ( !template.a ) template.a = {};
  			template.a.value = template.f;
  			options.noContent = true;
  		}

  		Input.call( this, options );
  	}

  	Textarea.prototype = Object.create( Input && Input.prototype );
  	Textarea.prototype.constructor = Textarea;

  	Textarea.prototype.bubble = function bubble () {
  		var this$1 = this;

  		if ( !this.dirty ) {
  			this.dirty = true;

  			if ( this.rendered && !this.binding && this.fragment ) {
  				runloop.scheduleTask( function () {
  					this$1.dirty = false;
  					this$1.node.value = this$1.fragment.toString();
  				});
  			}

  			this.parentFragment.bubble(); // default behaviour
  		}
  	};

  	return Textarea;
  }(Input));

  var Text = (function (Item) {
  	function Text ( options ) {
  		Item.call( this, options );
  		this.type = TEXT;
  	}

  	Text.prototype = Object.create( Item && Item.prototype );
  	Text.prototype.constructor = Text;

  	Text.prototype.bind = function bind () {
  		// noop
  	};

  	Text.prototype.detach = function detach () {
  		return detachNode( this.node );
  	};

  	Text.prototype.firstNode = function firstNode () {
  		return this.node;
  	};

  	Text.prototype.rebind = function rebind () {
  		// noop
  	};

  	Text.prototype.render = function render ( target, occupants ) {
  		this.rendered = true;

  		if ( occupants ) {
  			var n = occupants[0];
  			if ( n && n.nodeType === 3 ) {
  				occupants.shift();
  				if ( n.nodeValue !== this.template ) {
  					n.nodeValue = this.template;
  				}
  			} else {
  				n = this.node = doc.createTextNode( this.template );
  				if ( occupants[0] ) {
  					target.insertBefore( n, occupants[0] );
  				} else {
  					target.appendChild( n );
  				}
  			}

  			this.node = n;
  		} else {
  			this.node = doc.createTextNode( this.template );
  			target.appendChild( this.node );
  		}
  	};

  	Text.prototype.toString = function toString ( escape ) {
  		return escape ? escapeHtml( this.template ) : this.template;
  	};

  	Text.prototype.unbind = function unbind () {
  		// noop
  	};

  	Text.prototype.unrender = function unrender ( shouldDestroy ) {
  		if ( this.rendered && shouldDestroy ) this.detach();
  		this.rendered = false;
  	};

  	Text.prototype.update = function update () {
  		// noop
  	};

  	Text.prototype.valueOf = function valueOf () {
  		return this.template;
  	};

  	return Text;
  }(Item));

  var elementCache = {};

  var ieBug;
  var ieBlacklist;

  try {
  	createElement( 'table' ).innerHTML = 'foo';
  } catch ( err ) {
  	ieBug = true;

  	ieBlacklist = {
  		TABLE:  [ '<table class="x">', '</table>' ],
  		THEAD:  [ '<table><thead class="x">', '</thead></table>' ],
  		TBODY:  [ '<table><tbody class="x">', '</tbody></table>' ],
  		TR:     [ '<table><tr class="x">', '</tr></table>' ],
  		SELECT: [ '<select class="x">', '</select>' ]
  	};
  }

  function insertHtml ( html, node, docFrag ) {
  	var nodes = [];

  	// render 0 and false
  	if ( html == null || html === '' ) return nodes;

  	var container;
  	var wrapper;
  	var selectedOption;

  	if ( ieBug && ( wrapper = ieBlacklist[ node.tagName ] ) ) {
  		container = element( 'DIV' );
  		container.innerHTML = wrapper[0] + html + wrapper[1];
  		container = container.querySelector( '.x' );

  		if ( container.tagName === 'SELECT' ) {
  			selectedOption = container.options[ container.selectedIndex ];
  		}
  	}

  	else if ( node.namespaceURI === svg$1 ) {
  		container = element( 'DIV' );
  		container.innerHTML = '<svg class="x">' + html + '</svg>';
  		container = container.querySelector( '.x' );
  	}

  	else if ( node.tagName === 'TEXTAREA' ) {
  		container = createElement( 'div' );

  		if ( typeof container.textContent !== 'undefined' ) {
  			container.textContent = html;
  		} else {
  			container.innerHTML = html;
  		}
  	}

  	else {
  		container = element( node.tagName );
  		container.innerHTML = html;

  		if ( container.tagName === 'SELECT' ) {
  			selectedOption = container.options[ container.selectedIndex ];
  		}
  	}

  	var child;
  	while ( child = container.firstChild ) {
  		nodes.push( child );
  		docFrag.appendChild( child );
  	}

  	// This is really annoying. Extracting <option> nodes from the
  	// temporary container <select> causes the remaining ones to
  	// become selected. So now we have to deselect them. IE8, you
  	// amaze me. You really do
  	// ...and now Chrome too
  	var i;
  	if ( node.tagName === 'SELECT' ) {
  		i = nodes.length;
  		while ( i-- ) {
  			if ( nodes[i] !== selectedOption ) {
  				nodes[i].selected = false;
  			}
  		}
  	}

  	return nodes;
  }

  function element ( tagName ) {
  	return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
  }

  var Triple = (function (Mustache) {
  	function Triple ( options ) {
  		Mustache.call( this, options );
  	}

  	Triple.prototype = Object.create( Mustache && Mustache.prototype );
  	Triple.prototype.constructor = Triple;

  	Triple.prototype.detach = function detach () {
  		var docFrag = createDocumentFragment();
  		this.nodes.forEach( function ( node ) { return docFrag.appendChild( node ); } );
  		return docFrag;
  	};

  	Triple.prototype.find = function find ( selector ) {
  		var this$1 = this;

  		var len = this.nodes.length;
  		var i;

  		for ( i = 0; i < len; i += 1 ) {
  			var node = this$1.nodes[i];

  			if ( node.nodeType !== 1 ) continue;

  			if ( matches( node, selector ) ) return node;

  			var queryResult = node.querySelector( selector );
  			if ( queryResult ) return queryResult;
  		}

  		return null;
  	};

  	Triple.prototype.findAll = function findAll ( selector, query ) {
  		var this$1 = this;

  		var len = this.nodes.length;
  		var i;

  		for ( i = 0; i < len; i += 1 ) {
  			var node = this$1.nodes[i];

  			if ( node.nodeType !== 1 ) continue;

  			if ( query.test( node ) ) query.add( node );

  			var queryAllResult = node.querySelectorAll( selector );
  			if ( queryAllResult ) {
  				var numNodes = queryAllResult.length;
  				var j;

  				for ( j = 0; j < numNodes; j += 1 ) {
  					query.add( queryAllResult[j] );
  				}
  			}
  		}
  	};

  	Triple.prototype.findComponent = function findComponent () {
  		return null;
  	};

  	Triple.prototype.firstNode = function firstNode () {
  		return this.nodes[0];
  	};

  	Triple.prototype.render = function render ( target ) {
  		var html = this.model ? this.model.get() : '';
  		this.nodes = insertHtml( html, this.parentFragment.findParentNode(), target );
  		this.rendered = true;
  	};

  	Triple.prototype.toString = function toString () {
  		return this.model && this.model.get() != null ? decodeCharacterReferences( '' + this.model.get() ) : '';
  	};

  	Triple.prototype.unrender = function unrender () {
  		if ( this.nodes ) this.nodes.forEach( function ( node ) { return detachNode( node ); } );
  		this.rendered = false;
  	};

  	Triple.prototype.update = function update () {
  		if ( this.rendered && this.dirty ) {
  			this.dirty = false;

  			this.unrender();
  			var docFrag = createDocumentFragment();
  			this.render( docFrag );

  			var parentNode = this.parentFragment.findParentNode();
  			var anchor = this.parentFragment.findNextNode( this );

  			parentNode.insertBefore( docFrag, anchor );
  		}
  	};

  	return Triple;
  }(Mustache));

  var Yielder = (function (Item) {
  	function Yielder ( options ) {
  		Item.call( this, options );

  		this.container = options.parentFragment.ractive;
  		this.component = this.container.component;

  		this.containerFragment = options.parentFragment;
  		this.parentFragment = this.component.parentFragment;

  		// {{yield}} is equivalent to {{yield content}}
  		this.name = options.template.n || '';
  	}

  	Yielder.prototype = Object.create( Item && Item.prototype );
  	Yielder.prototype.constructor = Yielder;

  	Yielder.prototype.bind = function bind () {
  		var name = this.name;

  		( this.component.yielders[ name ] || ( this.component.yielders[ name ] = [] ) ).push( this );

  		// TODO don't parse here
  		var template = this.container._inlinePartials[ name || 'content' ];

  		if ( typeof template === 'string' ) {
  			template = parse( template ).t;
  		}

  		if ( !template ) {
  			warnIfDebug( ("Could not find template for partial \"" + name + "\""), { ractive: this.ractive });
  			template = [];
  		}

  		this.fragment = new Fragment({
  			owner: this,
  			ractive: this.container.parent,
  			template: template
  		}).bind();
  	};

  	Yielder.prototype.bubble = function bubble () {
  		if ( !this.dirty ) {
  			this.containerFragment.bubble();
  			this.dirty = true;
  		}
  	};

  	Yielder.prototype.detach = function detach () {
  		return this.fragment.detach();
  	};

  	Yielder.prototype.find = function find ( selector ) {
  		return this.fragment.find( selector );
  	};

  	Yielder.prototype.findAll = function findAll ( selector, queryResult ) {
  		this.fragment.find( selector, queryResult );
  	};

  	Yielder.prototype.findComponent = function findComponent ( name ) {
  		return this.fragment.findComponent( name );
  	};

  	Yielder.prototype.findAllComponents = function findAllComponents ( name, queryResult ) {
  		this.fragment.findAllComponents( name, queryResult );
  	};

  	Yielder.prototype.findNextNode = function findNextNode() {
  		return this.containerFragment.findNextNode( this );
  	};

  	Yielder.prototype.firstNode = function firstNode ( skipParent ) {
  		return this.fragment.firstNode( skipParent );
  	};

  	Yielder.prototype.rebind = function rebind () {
  		this.fragment.rebind();
  	};

  	Yielder.prototype.render = function render ( target, occupants ) {
  		return this.fragment.render( target, occupants );
  	};

  	Yielder.prototype.setTemplate = function setTemplate ( name ) {
  		var template = this.parentFragment.ractive.partials[ name ];

  		if ( typeof template === 'string' ) {
  			template = parse( template ).t;
  		}

  		this.partialTemplate = template || []; // TODO warn on missing partial
  	};

  	Yielder.prototype.toString = function toString ( escape ) {
  		return this.fragment.toString( escape );
  	};

  	Yielder.prototype.unbind = function unbind () {
  		this.fragment.unbind();
  		removeFromArray( this.component.yielders[ this.name ], this );
  	};

  	Yielder.prototype.unrender = function unrender ( shouldDestroy ) {
  		this.fragment.unrender( shouldDestroy );
  	};

  	Yielder.prototype.update = function update () {
  		this.dirty = false;
  		this.fragment.update();
  	};

  	return Yielder;
  }(Item));

  // finds the component constructor in the registry or view hierarchy registries
  function getComponentConstructor ( ractive, name ) {
  	var instance = findInstance( 'components', ractive, name );
  	var Component;

  	if ( instance ) {
  		Component = instance.components[ name ];

  		// best test we have for not Ractive.extend
  		if ( !Component._Parent ) {
  			// function option, execute and store for reset
  			var fn = Component.bind( instance );
  			fn.isOwner = instance.components.hasOwnProperty( name );
  			Component = fn();

  			if ( !Component ) {
  				warnIfDebug( noRegistryFunctionReturn, name, 'component', 'component', { ractive: ractive });
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

  var constructors = {};
  constructors[ ALIAS ] = Alias;
  constructors[ DOCTYPE ] = Doctype;
  constructors[ INTERPOLATOR ] = Interpolator;
  constructors[ PARTIAL ] = Partial;
  constructors[ SECTION ] = Section;
  constructors[ TRIPLE ] = Triple;
  constructors[ YIELDER ] = Yielder;

  var specialElements = {
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
  		var ComponentConstructor = getComponentConstructor( options.parentFragment.ractive, options.template.e );
  		if ( ComponentConstructor ) {
  			return new Component( options, ComponentConstructor );
  		}

  		var tagName = options.template.e.toLowerCase();

  		var ElementConstructor = specialElements[ tagName ] || Element;
  		return new ElementConstructor( options );
  	}

  	var Item = constructors[ options.template.t ];

  	if ( !Item ) throw new Error( ("Unrecognised item type " + (options.template.t)) );

  	return new Item( options );
  }

  var ReferenceResolver = function ReferenceResolver ( fragment, reference, callback ) {
  	var this$1 = this;

  		this.fragment = fragment;
  	this.reference = normalise( reference );
  	this.callback = callback;

  	this.keys = splitKeypathI( reference );
  	this.resolved = false;

  	// TODO the consumer should take care of addUnresolved
  	// we attach to all the contexts between here and the root
  	// - whenever their values change, they can quickly
  	// check to see if we can resolve
  	while ( fragment ) {
  		if ( fragment.context ) {
  			fragment.context.addUnresolved( this$1.keys[0], this$1 );
  		}

  		fragment = fragment.componentParent || fragment.parent;
  	}
  };

  ReferenceResolver.prototype.attemptResolution = function attemptResolution () {
  	if ( this.resolved ) return;

  	var model = resolveAmbiguousReference( this.fragment, this.reference );

  	if ( model ) {
  		this.resolved = true;
  		this.callback( model );
  	}
  };

  ReferenceResolver.prototype.forceResolution = function forceResolution () {
  	if ( this.resolved ) return;

  	var model = this.fragment.findContext().joinAll( this.keys );
  	this.callback( model );
  	this.resolved = true;
  };

  ReferenceResolver.prototype.unbind = function unbind () {
  	var this$1 = this;

  		removeFromArray( this.fragment.unresolved, this );

  	if ( this.resolved ) return;

  	var fragment = this.fragment;
  	while ( fragment ) {
  		if ( fragment.context ) {
  			fragment.context.removeUnresolved( this$1.keys[0], this$1 );
  		}

  		fragment = fragment.componentParent || fragment.parent;
  	}
  };

  // TODO all this code needs to die
  function processItems ( items, values, guid, counter ) {
  	if ( counter === void 0 ) counter = 0;

  	return items.map( function ( item ) {
  		if ( item.type === TEXT ) {
  			return item.template;
  		}

  		if ( item.fragment ) {
  			if ( item.fragment.iterations ) {
  				return item.fragment.iterations.map( function ( fragment ) {
  					return processItems( fragment.items, values, guid, counter );
  				}).join( '' );
  			} else {
  				return processItems( item.fragment.items, values, guid, counter );
  			}
  		}

  		var placeholderId = "" + guid + "-" + (counter++);

  		values[ placeholderId ] = item.model ?
  			item.model.wrapper ?
  				item.model.wrapper.value :
  				item.model.get() :
  			undefined;

  		return '${' + placeholderId + '}';
  	}).join( '' );
  }

  function unrenderAndDestroy$1 ( item ) {
  	item.unrender( true );
  }

  var Fragment = function Fragment ( options ) {
  	this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute

  	this.isRoot = !options.owner.parentFragment;
  	this.parent = this.isRoot ? null : this.owner.parentFragment;
  	this.ractive = options.ractive || ( this.isRoot ? options.owner : this.parent.ractive );

  	this.componentParent = ( this.isRoot && this.ractive.component ) ? this.ractive.component.parentFragment : null;

  	this.context = null;
  	this.rendered = false;

  	// encapsulated styles should be inherited until they get applied by an element
  	this.cssIds = 'cssIds' in options ? options.cssIds : ( this.parent ? this.parent.cssIds : null );

  	this.resolvers = [];

  	this.dirty = false;
  	this.dirtyArgs = this.dirtyValue = true; // TODO getArgsList is nonsense - should deprecate legacy directives style

  	this.template = options.template || [];
  	this.createItems();
  };

  Fragment.prototype.bind = function bind$1 ( context ) {
  	this.context = context;
  	this.items.forEach( bind );
  	this.bound = true;

  	// in rare cases, a forced resolution (or similar) will cause the
  	// fragment to be dirty before it's even finished binding. In those
  	// cases we update immediately
  	if ( this.dirty ) this.update();

  	return this;
  };

  Fragment.prototype.bubble = function bubble () {
  	this.dirtyArgs = this.dirtyValue = true;

  	if ( !this.dirty ) {
  		this.dirty = true;

  		if ( this.isRoot ) { // TODO encapsulate 'is component root, but not overall root' check?
  			if ( this.ractive.component ) {
  				this.ractive.component.bubble();
  			} else if ( this.bound ) {
  				runloop.addFragment( this );
  			}
  		} else {
  			this.owner.bubble();
  		}
  	}
  };

  Fragment.prototype.createItems = function createItems () {
  	var this$1 = this;

  		this.items = this.template.map( function ( template, index ) {
  		return createItem({ parentFragment: this$1, template: template, index: index });
  	});
  };

  Fragment.prototype.detach = function detach () {
  	var docFrag = createDocumentFragment();
  	this.items.forEach( function ( item ) { return docFrag.appendChild( item.detach() ); } );
  	return docFrag;
  };

  Fragment.prototype.find = function find ( selector ) {
  	var this$1 = this;

  		var len = this.items.length;
  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		var found = this$1.items[i].find( selector );
  		if ( found ) return found;
  	}
  };

  Fragment.prototype.findAll = function findAll ( selector, query ) {
  	var this$1 = this;

  		if ( this.items ) {
  		var len = this.items.length;
  		var i;

  		for ( i = 0; i < len; i += 1 ) {
  			var item = this$1.items[i];

  			if ( item.findAll ) {
  				item.findAll( selector, query );
  			}
  		}
  	}

  	return query;
  };

  Fragment.prototype.findComponent = function findComponent ( name ) {
  	var this$1 = this;

  		var len = this.items.length;
  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		var found = this$1.items[i].findComponent( name );
  		if ( found ) return found;
  	}
  };

  Fragment.prototype.findAllComponents = function findAllComponents ( name, query ) {
  	var this$1 = this;

  		if ( this.items ) {
  		var len = this.items.length;
  		var i;

  		for ( i = 0; i < len; i += 1 ) {
  			var item = this$1.items[i];

  			if ( item.findAllComponents ) {
  				item.findAllComponents( name, query );
  			}
  		}
  	}

  	return query;
  };

  Fragment.prototype.findContext = function findContext () {
  	var fragment = this;
  	while ( !fragment.context ) fragment = fragment.parent;
  	return fragment.context;
  };

  Fragment.prototype.findNextNode = function findNextNode ( item ) {
  	// search for the next node going forward
  	var this$1 = this;

  		for ( var i = item.index + 1; i < this$1.items.length; i++ ) {
  		if ( !this$1.items[ i ] ) continue;

  		var node = this$1.items[ i ].firstNode( true );
  		if ( node ) return node;
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

  	return this.owner.findNextNode( this ); // the argument is in case the parent is a RepeatedFragment
  };

  Fragment.prototype.findParentNode = function findParentNode () {
  	var fragment = this;

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
  };

  Fragment.prototype.findRepeatingFragment = function findRepeatingFragment () {
  	var fragment = this;
  	// TODO better check than fragment.parent.iterations
  	while ( fragment.parent && !fragment.isIteration ) {
  		fragment = fragment.parent || fragment.componentParent;
  	}

  	return fragment;
  };

  Fragment.prototype.firstNode = function firstNode ( skipParent ) {
  	var this$1 = this;

  		var node;
  	for ( var i = 0; i < this$1.items.length; i++ ) {
  		node = this$1.items[i].firstNode( true );

  		if ( node ) {
  			return node;
  		}
  	}

  	if ( skipParent ) return null;

  	return this.parent.findNextNode( this.owner );
  };

  // TODO ideally, this would be deprecated in favour of an
  // expression-like approach
  Fragment.prototype.getArgsList = function getArgsList () {
  	if ( this.dirtyArgs ) {
  		var values = {};
  		var source = processItems( this.items, values, this.ractive._guid );
  		var parsed = parseJSON( '[' + source + ']', values );

  		this.argsList = parsed ?
  			parsed.value :
  			[ this.toString() ];

  		this.dirtyArgs = false;
  	}

  	return this.argsList;
  };

  Fragment.prototype.rebind = function rebind$1 ( context ) {
  	this.context = context;

  	this.items.forEach( rebind );
  };

  Fragment.prototype.render = function render ( target, occupants ) {
  	if ( this.rendered ) throw new Error( 'Fragment is already rendered!' );
  	this.rendered = true;

  	this.items.forEach( function ( item ) { return item.render( target, occupants ); } );
  };

  Fragment.prototype.resetTemplate = function resetTemplate ( template ) {
  	var wasBound = this.bound;
  	var wasRendered = this.rendered;

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
  			var parentNode = this.findParentNode();
  			var anchor = this.parent ? this.parent.findNextNode( this.owner ) : null;

  			if ( anchor ) {
  				var docFrag = createDocumentFragment();
  				this.render( docFrag );
  				parentNode.insertBefore( docFrag, anchor );
  			} else {
  				this.render( parentNode );
  			}
  		}
  	}
  };

  Fragment.prototype.resolve = function resolve ( template, callback ) {
  	if ( !this.context ) {
  		return this.parent.resolve( template, callback );
  	}

  	var resolver = new ReferenceResolver( this, template, callback );
  	this.resolvers.push( resolver );

  	return resolver; // so we can e.g. force resolution
  };

  Fragment.prototype.toHtml = function toHtml () {
  	return this.toString();
  };

  Fragment.prototype.toString = function toString$1$$ ( escape ) {
  	return this.items.map( escape ? toEscapedString : toString$1 ).join( '' );
  };

  Fragment.prototype.unbind = function unbind$1 () {
  	this.items.forEach( unbind );
  	this.bound = false;

  	return this;
  };

  Fragment.prototype.unrender = function unrender$1 ( shouldDestroy ) {
  	this.items.forEach( shouldDestroy ? unrenderAndDestroy$1 : unrender );
  	this.rendered = false;
  };

  Fragment.prototype.update = function update$1 () {
  	if ( this.dirty && !this.updating ) {
  		this.dirty = false;
  		this.updating = true;
  		this.items.forEach( update );
  		this.updating = false;
  	}
  };

  Fragment.prototype.valueOf = function valueOf () {
  	if ( this.items.length === 1 ) {
  		return this.items[0].valueOf();
  	}

  	if ( this.dirtyValue ) {
  		var values = {};
  		var source = processItems( this.items, values, this.ractive._guid );
  		var parsed = parseJSON( source, values );

  		this.value = parsed ?
  			parsed.value :
  			this.toString();

  		this.dirtyValue = false;
  	}

  	return this.value;
  };

  // TODO should resetTemplate be asynchronous? i.e. should it be a case
  // of outro, update template, intro? I reckon probably not, since that
  // could be achieved with unrender-resetTemplate-render. Also, it should
  // conceptually be similar to resetPartial, which couldn't be async

  function Ractive$resetTemplate ( template ) {
  	templateConfigurator.init( null, this, { template: template });

  	var transitionsEnabled = this.transitionsEnabled;
  	this.transitionsEnabled = false;

  	// Is this is a component, we need to set the `shouldDestroy`
  	// flag, otherwise it will assume by default that a parent node
  	// will be detached, and therefore it doesn't need to bother
  	// detaching its own nodes
  	var component = this.component;
  	if ( component ) component.shouldDestroy = true;
  	this.unrender();
  	if ( component ) component.shouldDestroy = false;

  	// remove existing fragment and create new one
  	this.fragment.unbind().unrender( true );

  	this.fragment = new Fragment({
  		template: this.template,
  		root: this,
  		owner: this
  	});

  	var docFrag = createDocumentFragment();
  	this.fragment.bind( this.viewmodel ).render( docFrag );
  	this.el.insertBefore( docFrag, this.anchor );

  	this.transitionsEnabled = transitionsEnabled;
  }

  var reverse = makeArrayMethod( 'reverse' );

  function Ractive$set ( keypath, value ) {
  	var promise = runloop.start( this, true );

  	// Set multiple keypaths in one go
  	if ( isObject( keypath ) ) {
  		var map = keypath;

  		for ( var k in map ) {
  			if ( map.hasOwnProperty( k) ) {
  				set( this, k, map[k] );
  			}
  		}
  	}
  	// Set a single keypath
  	else {
  		set( this, keypath, value );
  	}

  	runloop.end();

  	return promise;
  }


  function set ( ractive, keypath, value ) {
  	if ( typeof value === 'function' ) value = bind$1( value, ractive );

  	if ( /\*/.test( keypath ) ) {
  		ractive.viewmodel.findMatches( splitKeypathI( keypath ) ).forEach( function ( model ) {
  			model.set( value );
  		});
  	} else {
  		var model = ractive.viewmodel.joinAll( splitKeypathI( keypath ) );
  		model.set( value );
  	}
  }

  var shift = makeArrayMethod( 'shift' );

  var sort = makeArrayMethod( 'sort' );

  var splice = makeArrayMethod( 'splice' );

  function Ractive$subtract ( keypath, d ) {
  	return add( this, keypath, ( d === undefined ? -1 : -d ) );
  }

  var teardownHook$1 = new Hook( 'teardown' );

  // Teardown. This goes through the root fragment and all its children, removing observers
  // and generally cleaning up after itself

  function Ractive$teardown () {
  	var this$1 = this;

  	this.fragment.unbind();
  	this.viewmodel.teardown();

  	this._observers.forEach( cancel );

  	if ( this.fragment.rendered && this.el.__ractive_instances__ ) {
  		removeFromArray( this.el.__ractive_instances__, this );
  	}

  	this.shouldDestroy = true;
  	var promise = ( this.fragment.rendered ? this.unrender() : Promise$1.resolve() );

  	Object.keys( this._links ).forEach( function ( k ) { return this$1._links[k].unlink(); } );

  	teardownHook$1.fire( this );

  	return promise;
  }

  function Ractive$toggle ( keypath ) {
  	if ( typeof keypath !== 'string' ) {
  		throw new TypeError( badArguments );
  	}

  	var changes;

  	if ( /\*/.test( keypath ) ) {
  		changes = {};

  		this.viewmodel.findMatches( splitKeypathI( keypath ) ).forEach( function ( model ) {
  			changes[ model.getKeypath() ] = !model.get();
  		});

  		return this.set( changes );
  	}

  	return this.set( keypath, !this.get( keypath ) );
  }

  function Ractive$toCSS() {
  	var cssIds = [ this.cssId ].concat( this.findAllComponents().map( function ( c ) { return c.cssId; } ) );
  	var uniqueCssIds = Object.keys(cssIds.reduce( function ( ids, id ) { return (ids[id] = true, ids); }, {}));
  	return getCSS( uniqueCssIds );
  }

  function Ractive$toHTML () {
  	return this.fragment.toString( true );
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

  	if ( !node ) {
  		fatal( ("No node was supplied for transition " + name) );
  	}

  	var transition = new Transition( this, node, name, params );
  	var promise = runloop.start( this, true );
  	runloop.registerTransition( transition );
  	runloop.end();
  	return promise;
  }

  function unlink( here ) {
  	var ln = this._links[ here ];

  	if ( ln ) {
  		ln.unlink();
  		delete this._links[ here ];
  		return this.set( here, ln.intialValue );
  	} else {
  		return Promise$1.resolve( true );
  	}
  }

  var unrenderHook$1 = new Hook( 'unrender' );

  function Ractive$unrender () {
  	if ( !this.fragment.rendered ) {
  		warnIfDebug( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
  		return Promise$1.resolve();
  	}

  	var promise = runloop.start( this, true );

  	// If this is a component, and the component isn't marked for destruction,
  	// don't detach nodes from the DOM unnecessarily
  	var shouldDestroy = !this.component || this.component.shouldDestroy || this.shouldDestroy;
  	this.fragment.unrender( shouldDestroy );

  	removeFromArray( this.el.__ractive_instances__, this );

  	unrenderHook$1.fire( this );

  	runloop.end();
  	return promise;
  }

  var unshift = makeArrayMethod( 'unshift' );

  var updateHook = new Hook( 'update' );

  function Ractive$update ( keypath ) {
  	if ( keypath ) keypath = splitKeypathI( keypath );

  	var model = keypath ?
  		this.viewmodel.joinAll( keypath ) :
  		this.viewmodel;

  	if ( model.parent && model.parent.wrapper ) return this.update( model.parent.getKeypath( this ) );

  	var promise = runloop.start( this, true );

  	model.mark();
  	model.registerChange( model.getKeypath(), model.get() );

  	if ( keypath ) {
  		// there may be unresolved refs that are now resolvable up the context tree
  		var parent = model.parent;
  		while ( keypath.length && parent ) {
  			if ( parent.clearUnresolveds ) parent.clearUnresolveds( keypath.pop() );
  			parent = parent.parent;
  		}
  	}

  	// notify upstream of changes
  	model.notifyUpstream();

  	runloop.end();

  	updateHook.fire( this, model );

  	return promise;
  }

  function Ractive$updateModel ( keypath, cascade ) {
  	var promise = runloop.start( this, true );

  	if ( !keypath ) {
  		this.viewmodel.updateFromBindings( true );
  	} else {
  		this.viewmodel.joinAll( splitKeypathI( keypath ) ).updateFromBindings( cascade !== false );
  	}

  	runloop.end();

  	return promise;
  }

  var proto = {
  	add: Ractive$add,
  	animate: Ractive$animate,
  	detach: Ractive$detach,
  	find: Ractive$find,
  	findAll: Ractive$findAll,
  	findAllComponents: Ractive$findAllComponents,
  	findComponent: Ractive$findComponent,
  	findContainer: Ractive$findContainer,
  	findParent: Ractive$findParent,
  	fire: Ractive$fire,
  	get: Ractive$get,
  	insert: Ractive$insert,
  	link: link,
  	merge: Ractive$merge,
  	observe: observe,
  	observeList: observeList,
  	observeOnce: observeOnce,
  	// TODO reinstate these
  	// observeListOnce,
  	off: Ractive$off,
  	on: Ractive$on,
  	once: Ractive$once,
  	pop: pop,
  	push: push,
  	render: Ractive$render,
  	reset: Ractive$reset,
  	resetPartial: resetPartial,
  	resetTemplate: Ractive$resetTemplate,
  	reverse: reverse,
  	set: Ractive$set,
  	shift: shift,
  	sort: sort,
  	splice: splice,
  	subtract: Ractive$subtract,
  	teardown: Ractive$teardown,
  	toggle: Ractive$toggle,
  	toCSS: Ractive$toCSS,
  	toCss: Ractive$toCSS,
  	toHTML: Ractive$toHTML,
  	toHtml: Ractive$toHTML,
  	transition: Ractive$transition,
  	unlink: unlink,
  	unrender: Ractive$unrender,
  	unshift: unshift,
  	update: Ractive$update,
  	updateModel: Ractive$updateModel
  };

  function wrap$1 ( method, superMethod, force ) {

  	if ( force || needsSuper( method, superMethod ) )  {

  		return function () {

  			var hasSuper = ( '_super' in this ), _super = this._super, result;

  			this._super = superMethod;

  			result = method.apply( this, arguments );

  			if ( hasSuper ) {
  				this._super = _super;
  			}

  			return result;
  		};
  	}

  	else {
  		return method;
  	}
  }

  function needsSuper ( method, superMethod ) {
  	return typeof superMethod === 'function' && /_super/.test( method );
  }

  function unwrap ( Child ) {
  	var options = {};

  	while ( Child ) {
  		addRegistries( Child, options );
  		addOtherOptions( Child, options );

  		if ( Child._Parent !== Ractive ) {
  			Child = Child._Parent;
  		} else {
  			Child = false;
  		}
  	}

  	return options;
  }

  function addRegistries ( Child, options ) {
  	registries.forEach( function ( r ) {
  		addRegistry(
  			r.useDefaults ? Child.prototype : Child,
  			options, r.name );
  	});
  }

  function addRegistry ( target, options, name ) {
  	var registry, keys = Object.keys( target[ name ] );

  	if ( !keys.length ) { return; }

  	if ( !( registry = options[ name ] ) ) {
  		registry = options[ name ] = {};
  	}

  	keys
  		.filter( function ( key ) { return !( key in registry ); } )
  		.forEach( function ( key ) { return registry[ key ] = target[ name ][ key ]; } );
  }

  function addOtherOptions ( Child, options ) {
  	Object.keys( Child.prototype ).forEach( function ( key ) {
  		if ( key === 'computed' ) { return; }

  		var value = Child.prototype[ key ];

  		if ( !( key in options ) ) {
  			options[ key ] = value._method ? value._method : value;
  		}

  		// is it a wrapped function?
  		else if ( typeof options[ key ] === 'function'
  				&& typeof value === 'function'
  				&& options[ key ]._method ) {

  			var result, needsSuper = value._method;

  			if ( needsSuper ) { value = value._method; }

  			// rewrap bound directly to parent fn
  			result = wrap$1( options[ key ]._method, value );

  			if ( needsSuper ) { result._method = result; }

  			options[ key ] = result;
  		}
  	});
  }

  function extend () {
  	var options = [], len = arguments.length;
  	while ( len-- ) options[ len ] = arguments[ len ];

  	if( !options.length ) {
  		return extendOne( this );
  	} else {
  		return options.reduce( extendOne, this );
  	}
  }

  function extendOne ( Parent, options ) {
  	if ( options === void 0 ) options = {};

  	var Child, proto;

  	// if we're extending with another Ractive instance...
  	//
  	//   var Human = Ractive.extend(...), Spider = Ractive.extend(...);
  	//   var Spiderman = Human.extend( Spider );
  	//
  	// ...inherit prototype methods and default options as well
  	if ( options.prototype instanceof Ractive ) {
  		options = unwrap( options );
  	}

  	Child = function ( options ) {
  		if ( !( this instanceof Child ) ) return new Child( options );

  		construct( this, options || {} );
  		initialise( this, options || {}, {} );
  	};

  	proto = create( Parent.prototype );
  	proto.constructor = Child;

  	// Static properties
  	defineProperties( Child, {
  		// alias prototype as defaults
  		defaults: { value: proto },

  		// extendable
  		extend: { value: extend, writable: true, configurable: true },

  		// Parent - for IE8, can't use Object.getPrototypeOf
  		_Parent: { value: Parent }
  	});

  	// extend configuration
  	config.extend( Parent, proto, options );

  	dataConfigurator.extend( Parent, proto, options );

  	if ( options.computed ) {
  		proto.computed = extendObj( create( Parent.prototype.computed ), options.computed );
  	}

  	Child.prototype = proto;

  	return Child;
  }

  function getNodeInfo( node ) {
  	if ( !node || !node._ractive ) return {};

  	var storage = node._ractive;
  	var ractive = storage.fragment.ractive;
  	var ref = gatherRefs( storage.fragment ), key = ref.key, index = ref.index;
  	var context = storage.fragment.findContext();

  	return {
  		ractive: ractive,
  		keypath: context.getKeypath( ractive ),
  		rootpath: context.getKeypath(),
  		index: index,
  		key: key
  	};
  }

  function joinKeys () {
  	var keys = [], len = arguments.length;
  	while ( len-- ) keys[ len ] = arguments[ len ];

  	return keys.map( escapeKey ).join( '.' );
  }

  function splitKeypath ( keypath ) {
  	return splitKeypathI( keypath ).map( unescapeKey );
  }

  // Ractive.js makes liberal use of things like Array.prototype.indexOf. In
  // older browsers, these are made available via a shim - here, we do a quick
  // pre-flight check to make sure that either a) we're not in a shit browser,
  // or b) we're using a Ractive-legacy.js build
  var FUNCTION = 'function';

  if (
  	typeof Date.now !== FUNCTION                 ||
  	typeof String.prototype.trim !== FUNCTION    ||
  	typeof Object.keys !== FUNCTION              ||
  	typeof Array.prototype.indexOf !== FUNCTION  ||
  	typeof Array.prototype.forEach !== FUNCTION  ||
  	typeof Array.prototype.map !== FUNCTION      ||
  	typeof Array.prototype.filter !== FUNCTION   ||
  	( win && typeof win.addEventListener !== FUNCTION )
  ) {
  	throw new Error( 'It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.' );
  }

  function Ractive ( options ) {
  	if ( !( this instanceof Ractive ) ) return new Ractive( options );

  	construct( this, options || {} );
  	initialise( this, options || {}, {} );
  }

  extendObj( Ractive.prototype, proto, defaults );
  Ractive.prototype.constructor = Ractive;

  // alias prototype as `defaults`
  Ractive.defaults = Ractive.prototype;

  // static properties
  defineProperties( Ractive, {

  	// debug flag
  	DEBUG:          { writable: true, value: true },
  	DEBUG_PROMISES: { writable: true, value: true },

  	// static methods:
  	extend:         { value: extend },
  	escapeKey:      { value: escapeKey },
  	getNodeInfo:    { value: getNodeInfo },
  	joinKeys:       { value: joinKeys },
  	parse:          { value: parse },
  	splitKeypath:   { value: splitKeypath },
  	unescapeKey:    { value: unescapeKey },
  	getCSS:         { value: getCSS },

  	// namespaced constructors
  	Promise:        { value: Promise$1 },

  	// support
  	enhance:        { writable: true, value: false },
  	svg:            { value: svg },
  	magic:          { value: magicSupported },

  	// version
  	VERSION:        { value: '0.8.0-edge' },

  	// plugins
  	adaptors:       { writable: true, value: {} },
  	components:     { writable: true, value: {} },
  	decorators:     { writable: true, value: {} },
  	easing:         { writable: true, value: easing },
  	events:         { writable: true, value: {} },
  	interpolators:  { writable: true, value: interpolators },
  	partials:       { writable: true, value: {} },
  	transitions:    { writable: true, value: {} }
  });

  return Ractive;

}));