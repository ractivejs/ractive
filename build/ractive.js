/*
	ractive.js v0.4.0
	2014-05-01 - commit 56e1126d 

	http://ractivejs.org
	http://twitter.com/RactiveJS

	Released under the MIT License.
*/

( function( global ) {

	'use strict';

	var noConflict = global.Ractive;

	var legacy = undefined;

	var config_initOptions = function( legacy ) {

		var defaults, initOptions;
		defaults = {
			el: null,
			template: '',
			complete: null,
			preserveWhitespace: false,
			append: false,
			twoway: true,
			modifyArrays: true,
			lazy: false,
			debug: false,
			noIntro: false,
			transitionsEnabled: true,
			magic: false,
			noCssTransform: false,
			adapt: [],
			sanitize: false,
			stripComments: true,
			isolated: false,
			delimiters: [
				'{{',
				'}}'
			],
			tripleDelimiters: [
				'{{{',
				'}}}'
			],
			computed: null
		};
		initOptions = {
			keys: Object.keys( defaults ),
			defaults: defaults
		};
		return initOptions;
	}( legacy );

	var config_svg = function() {

		if ( typeof document === 'undefined' ) {
			return;
		}
		return document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );
	}();

	var config_namespaces = {
		html: 'http://www.w3.org/1999/xhtml',
		mathml: 'http://www.w3.org/1998/Math/MathML',
		svg: 'http://www.w3.org/2000/svg',
		xlink: 'http://www.w3.org/1999/xlink',
		xml: 'http://www.w3.org/XML/1998/namespace',
		xmlns: 'http://www.w3.org/2000/xmlns/'
	};

	var utils_createElement = function( svg, namespaces ) {

		if ( !svg ) {
			return function( type, ns ) {
				if ( ns && ns !== namespaces.html ) {
					throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information';
				}
				return document.createElement( type );
			};
		} else {
			return function( type, ns ) {
				if ( !ns || ns === namespaces.html ) {
					return document.createElement( type );
				}
				return document.createElementNS( ns, type );
			};
		}
	}( config_svg, config_namespaces );

	var config_isClient = typeof document === 'object';

	var utils_defineProperty = function( isClient ) {

		try {
			Object.defineProperty( {}, 'test', {
				value: 0
			} );
			if ( isClient ) {
				Object.defineProperty( document.createElement( 'div' ), 'test', {
					value: 0
				} );
			}
			return Object.defineProperty;
		} catch ( err ) {
			return function( obj, prop, desc ) {
				obj[ prop ] = desc.value;
			};
		}
	}( config_isClient );

	var utils_defineProperties = function( createElement, defineProperty, isClient ) {

		try {
			try {
				Object.defineProperties( {}, {
					test: {
						value: 0
					}
				} );
			} catch ( err ) {
				throw err;
			}
			if ( isClient ) {
				Object.defineProperties( createElement( 'div' ), {
					test: {
						value: 0
					}
				} );
			}
			return Object.defineProperties;
		} catch ( err ) {
			return function( obj, props ) {
				var prop;
				for ( prop in props ) {
					if ( props.hasOwnProperty( prop ) ) {
						defineProperty( obj, prop, props[ prop ] );
					}
				}
			};
		}
	}( utils_createElement, utils_defineProperty, config_isClient );

	var utils_isNumeric = function( thing ) {
		return !isNaN( parseFloat( thing ) ) && isFinite( thing );
	};

	var Ractive_prototype_shared_add = function( isNumeric ) {

		return function( root, keypath, d ) {
			var value;
			if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
				throw new Error( 'Bad arguments' );
			}
			value = +root.get( keypath ) || 0;
			if ( !isNumeric( value ) ) {
				throw new Error( 'Cannot add to a non-numeric value' );
			}
			return root.set( keypath, value + d );
		};
	}( utils_isNumeric );

	var Ractive_prototype_add = function( add ) {

		return function( keypath, d ) {
			return add( this, keypath, d === undefined ? 1 : +d );
		};
	}( Ractive_prototype_shared_add );

	var utils_isEqual = function( a, b ) {
		if ( a === null && b === null ) {
			return true;
		}
		if ( typeof a === 'object' || typeof b === 'object' ) {
			return false;
		}
		return a === b;
	};

	var utils_Promise = function() {

		var Promise, PENDING = {}, FULFILLED = {}, REJECTED = {};
		Promise = function( callback ) {
			var fulfilledHandlers = [],
				rejectedHandlers = [],
				state = PENDING,
				result, dispatchHandlers, makeResolver, fulfil, reject, promise;
			makeResolver = function( newState ) {
				return function( value ) {
					if ( state !== PENDING ) {
						return;
					}
					result = value;
					state = newState;
					dispatchHandlers = makeDispatcher( state === FULFILLED ? fulfilledHandlers : rejectedHandlers, result );
					wait( dispatchHandlers );
				};
			};
			fulfil = makeResolver( FULFILLED );
			reject = makeResolver( REJECTED );
			callback( fulfil, reject );
			promise = {
				then: function( onFulfilled, onRejected ) {
					var promise2 = new Promise( function( fulfil, reject ) {
						var processResolutionHandler = function( handler, handlers, forward ) {
							if ( typeof handler === 'function' ) {
								handlers.push( function( p1result ) {
									var x;
									try {
										x = handler( p1result );
										resolve( promise2, x, fulfil, reject );
									} catch ( err ) {
										reject( err );
									}
								} );
							} else {
								handlers.push( forward );
							}
						};
						processResolutionHandler( onFulfilled, fulfilledHandlers, fulfil );
						processResolutionHandler( onRejected, rejectedHandlers, reject );
						if ( state !== PENDING ) {
							wait( dispatchHandlers );
						}
					} );
					return promise2;
				}
			};
			promise[ 'catch' ] = function( onRejected ) {
				return this.then( null, onRejected );
			};
			return promise;
		};
		Promise.all = function( promises ) {
			return new Promise( function( fulfil, reject ) {
				var result = [],
					pending, i, processPromise;
				if ( !promises.length ) {
					fulfil( result );
					return;
				}
				processPromise = function( i ) {
					promises[ i ].then( function( value ) {
						result[ i ] = value;
						if ( !--pending ) {
							fulfil( result );
						}
					}, reject );
				};
				pending = i = promises.length;
				while ( i-- ) {
					processPromise( i );
				}
			} );
		};
		Promise.resolve = function( value ) {
			return new Promise( function( fulfil ) {
				fulfil( value );
			} );
		};
		Promise.reject = function( reason ) {
			return new Promise( function( fulfil, reject ) {
				reject( reason );
			} );
		};
		return Promise;

		function wait( callback ) {
			setTimeout( callback, 0 );
		}

		function makeDispatcher( handlers, result ) {
			return function() {
				var handler;
				while ( handler = handlers.shift() ) {
					handler( result );
				}
			};
		}

		function resolve( promise, x, fulfil, reject ) {
			var then;
			if ( x === promise ) {
				throw new TypeError( 'A promise\'s fulfillment handler cannot return the same promise' );
			}
			if ( x instanceof Promise ) {
				x.then( fulfil, reject );
			} else if ( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
				try {
					then = x.then;
				} catch ( e ) {
					reject( e );
					return;
				}
				if ( typeof then === 'function' ) {
					var called, resolvePromise, rejectPromise;
					resolvePromise = function( y ) {
						if ( called ) {
							return;
						}
						called = true;
						resolve( promise, y, fulfil, reject );
					};
					rejectPromise = function( r ) {
						if ( called ) {
							return;
						}
						called = true;
						reject( r );
					};
					try {
						then.call( x, resolvePromise, rejectPromise );
					} catch ( e ) {
						if ( !called ) {
							reject( e );
							called = true;
							return;
						}
					}
				} else {
					fulfil( x );
				}
			} else {
				fulfil( x );
			}
		}
	}();

	var utils_normaliseKeypath = function() {

		var regex = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
		return function normaliseKeypath( keypath ) {
			return ( keypath || '' ).replace( regex, '.$1' );
		};
	}();

	var config_vendors = [
		'o',
		'ms',
		'moz',
		'webkit'
	];

	var utils_requestAnimationFrame = function( vendors ) {

		if ( typeof window === 'undefined' ) {
			return;
		}
		( function( vendors, lastTime, window ) {
			var x, setTimeout;
			if ( window.requestAnimationFrame ) {
				return;
			}
			for ( x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
				window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
			}
			if ( !window.requestAnimationFrame ) {
				setTimeout = window.setTimeout;
				window.requestAnimationFrame = function( callback ) {
					var currTime, timeToCall, id;
					currTime = Date.now();
					timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
					id = setTimeout( function() {
						callback( currTime + timeToCall );
					}, timeToCall );
					lastTime = currTime + timeToCall;
					return id;
				};
			}
		}( vendors, 0, window ) );
		return window.requestAnimationFrame;
	}( config_vendors );

	var utils_getTime = function() {

		if ( typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function' ) {
			return function() {
				return window.performance.now();
			};
		} else {
			return function() {
				return Date.now();
			};
		}
	}();

	// This module provides a place to store a) circular dependencies and
	// b) the callback functions that require those circular dependencies
	var circular = [];

	var utils_removeFromArray = function( array, member ) {
		var index = array.indexOf( member );
		if ( index !== -1 ) {
			array.splice( index, 1 );
		}
	};

	var global_css = function( circular, isClient, removeFromArray ) {

		var runloop, styleElement, head, styleSheet, inDom, prefix = '/* Ractive.js component styles */\n',
			componentsInPage = {}, styles = [];
		if ( !isClient ) {
			return;
		}
		circular.push( function() {
			runloop = circular.runloop;
		} );
		styleElement = document.createElement( 'style' );
		styleElement.type = 'text/css';
		head = document.getElementsByTagName( 'head' )[ 0 ];
		inDom = false;
		styleSheet = styleElement.styleSheet;
		return {
			add: function( Component ) {
				if ( !Component.css ) {
					return;
				}
				if ( !componentsInPage[ Component._guid ] ) {
					componentsInPage[ Component._guid ] = 0;
					styles.push( Component.css );
					runloop.scheduleCssUpdate();
				}
				componentsInPage[ Component._guid ] += 1;
			},
			remove: function( Component ) {
				if ( !Component.css ) {
					return;
				}
				componentsInPage[ Component._guid ] -= 1;
				if ( !componentsInPage[ Component._guid ] ) {
					removeFromArray( styles, Component.css );
					runloop.scheduleCssUpdate();
				}
			},
			update: function() {
				var css;
				if ( styles.length ) {
					css = prefix + styles.join( ' ' );
					if ( styleSheet ) {
						styleSheet.cssText = css;
					} else {
						styleElement.innerHTML = css;
					}
					if ( !inDom ) {
						head.appendChild( styleElement );
					}
				} else if ( inDom ) {
					head.removeChild( styleElement );
				}
			}
		};
	}( circular, config_isClient, utils_removeFromArray );

	var shared_getValueFromCheckboxes = function( ractive, keypath ) {
		var value, checkboxes, checkbox, len, i, rootEl;
		value = [];
		rootEl = ractive._rendering ? ractive.fragment.docFrag : ractive.el;
		checkboxes = rootEl.querySelectorAll( 'input[type="checkbox"][name="{{' + keypath + '}}"]' );
		len = checkboxes.length;
		for ( i = 0; i < len; i += 1 ) {
			checkbox = checkboxes[ i ];
			if ( checkbox.hasAttribute( 'checked' ) || checkbox.checked ) {
				value.push( checkbox._ractive.value );
			}
		}
		return value;
	};

	var utils_hasOwnProperty = Object.prototype.hasOwnProperty;

	var shared_getInnerContext = function( fragment ) {
		do {
			if ( fragment.context ) {
				return fragment.context;
			}
		} while ( fragment = fragment.parent );
		return '';
	};

	var shared_resolveRef = function( circular, normaliseKeypath, hasOwnProperty, getInnerContext ) {

		var get, ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';
		circular.push( function() {
			get = circular.get;
		} );
		return function resolveRef( ractive, ref, fragment ) {
			var context, contextKeys, keys, lastKey, postfix, parentKeypath, parentValue, wrapped, hasContextChain;
			ref = normaliseKeypath( ref );
			if ( ref === '.' ) {
				return getInnerContext( fragment );
			}
			if ( ref.charAt( 0 ) === '.' ) {
				context = getInnerContext( fragment );
				contextKeys = context ? context.split( '.' ) : [];
				if ( ref.substr( 0, 3 ) === '../' ) {
					while ( ref.substr( 0, 3 ) === '../' ) {
						if ( !contextKeys.length ) {
							throw new Error( ancestorErrorMessage );
						}
						contextKeys.pop();
						ref = ref.substring( 3 );
					}
					contextKeys.push( ref );
					return contextKeys.join( '.' );
				}
				if ( !context ) {
					return ref.substring( 1 );
				}
				return context + ref;
			}
			keys = ref.split( '.' );
			lastKey = keys.pop();
			postfix = keys.length ? '.' + keys.join( '.' ) : '';
			do {
				context = fragment.context;
				if ( !context ) {
					continue;
				}
				hasContextChain = true;
				parentKeypath = context + postfix;
				parentValue = get( ractive, parentKeypath );
				if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
					parentValue = wrapped.get();
				}
				if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && lastKey in parentValue ) {
					return context + '.' + ref;
				}
			} while ( fragment = fragment.parent );
			if ( !hasContextChain && ( !ractive._parent || ractive.isolated ) ) {
				return ref;
			}
			if ( hasOwnProperty.call( ractive.data, keys[ 0 ] ) ) {
				return ref;
			} else if ( get( ractive, ref ) !== undefined ) {
				return ref;
			}
		};
	}( circular, utils_normaliseKeypath, utils_hasOwnProperty, shared_getInnerContext );

	var shared_getUpstreamChanges = function getUpstreamChanges( changes ) {
		var upstreamChanges = [ '' ],
			i, keypath, keys, upstreamKeypath;
		i = changes.length;
		while ( i-- ) {
			keypath = changes[ i ];
			keys = keypath.split( '.' );
			while ( keys.length > 1 ) {
				keys.pop();
				upstreamKeypath = keys.join( '.' );
				if ( upstreamChanges[ upstreamKeypath ] !== true ) {
					upstreamChanges.push( upstreamKeypath );
					upstreamChanges[ upstreamKeypath ] = true;
				}
			}
		}
		return upstreamChanges;
	};

	var shared_notifyDependants = function() {

		var lastKey, starMaps = {};
		lastKey = /[^\.]+$/;

		function notifyDependants( ractive, keypath, onlyDirect ) {
			var i;
			if ( ractive._patternObservers.length ) {
				notifyPatternObservers( ractive, keypath, keypath, onlyDirect, true );
			}
			for ( i = 0; i < ractive._deps.length; i += 1 ) {
				notifyDependantsAtPriority( ractive, keypath, i, onlyDirect );
			}
		}
		notifyDependants.multiple = function notifyMultipleDependants( ractive, keypaths, onlyDirect ) {
			var i, j, len;
			len = keypaths.length;
			if ( ractive._patternObservers.length ) {
				i = len;
				while ( i-- ) {
					notifyPatternObservers( ractive, keypaths[ i ], keypaths[ i ], onlyDirect, true );
				}
			}
			for ( i = 0; i < ractive._deps.length; i += 1 ) {
				if ( ractive._deps[ i ] ) {
					j = len;
					while ( j-- ) {
						notifyDependantsAtPriority( ractive, keypaths[ j ], i, onlyDirect );
					}
				}
			}
		};
		return notifyDependants;

		function notifyDependantsAtPriority( ractive, keypath, priority, onlyDirect ) {
			var depsByKeypath = ractive._deps[ priority ];
			if ( !depsByKeypath ) {
				return;
			}
			updateAll( depsByKeypath[ keypath ] );
			if ( onlyDirect ) {
				return;
			}
			cascade( ractive._depsMap[ keypath ], ractive, priority );
		}

		function updateAll( deps ) {
			var i, len;
			if ( deps ) {
				len = deps.length;
				for ( i = 0; i < len; i += 1 ) {
					deps[ i ].update();
				}
			}
		}

		function cascade( childDeps, ractive, priority, onlyDirect ) {
			var i;
			if ( childDeps ) {
				i = childDeps.length;
				while ( i-- ) {
					notifyDependantsAtPriority( ractive, childDeps[ i ], priority, onlyDirect );
				}
			}
		}

		function notifyPatternObservers( ractive, registeredKeypath, actualKeypath, isParentOfChangedKeypath, isTopLevelCall ) {
			var i, patternObserver, children, child, key, childActualKeypath, potentialWildcardMatches, cascade;
			i = ractive._patternObservers.length;
			while ( i-- ) {
				patternObserver = ractive._patternObservers[ i ];
				if ( patternObserver.regex.test( actualKeypath ) ) {
					patternObserver.update( actualKeypath );
				}
			}
			if ( isParentOfChangedKeypath ) {
				return;
			}
			cascade = function( keypath ) {
				if ( children = ractive._depsMap[ keypath ] ) {
					i = children.length;
					while ( i-- ) {
						child = children[ i ];
						key = lastKey.exec( child )[ 0 ];
						childActualKeypath = actualKeypath ? actualKeypath + '.' + key : key;
						notifyPatternObservers( ractive, child, childActualKeypath );
					}
				}
			};
			if ( isTopLevelCall ) {
				potentialWildcardMatches = getPotentialWildcardMatches( actualKeypath );
				potentialWildcardMatches.forEach( cascade );
			} else {
				cascade( registeredKeypath );
			}
		}

		function getPotentialWildcardMatches( keypath ) {
			var keys, starMap, mapper, i, result, wildcardKeypath;
			keys = keypath.split( '.' );
			starMap = getStarMap( keys.length );
			result = [];
			mapper = function( star, i ) {
				return star ? '*' : keys[ i ];
			};
			i = starMap.length;
			while ( i-- ) {
				wildcardKeypath = starMap[ i ].map( mapper ).join( '.' );
				if ( !result[ wildcardKeypath ] ) {
					result.push( wildcardKeypath );
					result[ wildcardKeypath ] = true;
				}
			}
			return result;
		}

		function getStarMap( num ) {
			var ones = '',
				max, binary, starMap, mapper, i;
			if ( !starMaps[ num ] ) {
				starMap = [];
				while ( ones.length < num ) {
					ones += 1;
				}
				max = parseInt( ones, 2 );
				mapper = function( digit ) {
					return digit === '1';
				};
				for ( i = 0; i <= max; i += 1 ) {
					binary = i.toString( 2 );
					while ( binary.length < num ) {
						binary = '0' + binary;
					}
					starMap[ i ] = Array.prototype.map.call( binary, mapper );
				}
				starMaps[ num ] = starMap;
			}
			return starMaps[ num ];
		}
	}();

	var shared_makeTransitionManager = function( removeFromArray ) {

		var makeTransitionManager, checkComplete, remove, init;
		makeTransitionManager = function( callback, previous ) {
			var transitionManager = [];
			transitionManager.detachQueue = [];
			transitionManager.remove = remove;
			transitionManager.init = init;
			transitionManager._check = checkComplete;
			transitionManager._callback = callback;
			transitionManager._previous = previous;
			if ( previous ) {
				previous.push( transitionManager );
			}
			return transitionManager;
		};
		checkComplete = function() {
			var element;
			if ( this._ready && !this.length ) {
				while ( element = this.detachQueue.pop() ) {
					element.detach();
				}
				if ( typeof this._callback === 'function' ) {
					this._callback();
				}
				if ( this._previous ) {
					this._previous.remove( this );
				}
			}
		};
		remove = function( transition ) {
			removeFromArray( this, transition );
			this._check();
		};
		init = function() {
			this._ready = true;
			this._check();
		};
		return makeTransitionManager;
	}( utils_removeFromArray );

	var global_runloop = function( circular, css, removeFromArray, getValueFromCheckboxes, resolveRef, getUpstreamChanges, notifyDependants, makeTransitionManager ) {

		circular.push( function() {
			get = circular.get;
			set = circular.set;
		} );
		var runloop, get, set, dirty = false,
			flushing = false,
			pendingCssChanges, toFocus = null,
			liveQueries = [],
			decorators = [],
			transitions = [],
			observers = [],
			attributes = [],
			activeBindings = [],
			evaluators = [],
			computations = [],
			selectValues = [],
			checkboxKeypaths = {}, checkboxes = [],
			radios = [],
			unresolved = [],
			instances = [],
			transitionManager;
		runloop = {
			start: function( instance, callback ) {
				this.addInstance( instance );
				if ( !flushing ) {
					transitionManager = makeTransitionManager( callback, transitionManager );
				}
			},
			end: function() {
				if ( flushing ) {
					attemptKeypathResolution();
					return;
				}
				flushing = true;
				flushChanges();
				flushing = false;
				transitionManager.init();
				transitionManager = transitionManager._previous;
			},
			trigger: function() {
				if ( flushing ) {
					attemptKeypathResolution();
					return;
				}
				flushing = true;
				flushChanges();
				flushing = false;
			},
			focus: function( node ) {
				toFocus = node;
			},
			addInstance: function( instance ) {
				if ( instance && !instances[ instance._guid ] ) {
					instances.push( instance );
					instances[ instances._guid ] = true;
				}
			},
			addLiveQuery: function( query ) {
				liveQueries.push( query );
			},
			addDecorator: function( decorator ) {
				decorators.push( decorator );
			},
			addTransition: function( transition ) {
				transition._manager = transitionManager;
				transitionManager.push( transition );
				transitions.push( transition );
			},
			addObserver: function( observer ) {
				observers.push( observer );
			},
			addAttribute: function( attribute ) {
				attributes.push( attribute );
			},
			addBinding: function( binding ) {
				binding.active = true;
				activeBindings.push( binding );
			},
			scheduleCssUpdate: function() {
				if ( !flushing ) {
					css.update();
				} else {
					pendingCssChanges = true;
				}
			},
			addEvaluator: function( evaluator ) {
				dirty = true;
				evaluators.push( evaluator );
			},
			addComputation: function( thing ) {
				dirty = true;
				computations.push( thing );
			},
			addSelectValue: function( selectValue ) {
				dirty = true;
				selectValues.push( selectValue );
			},
			addCheckbox: function( checkbox ) {
				if ( !checkboxKeypaths[ checkbox.keypath ] ) {
					dirty = true;
					checkboxes.push( checkbox );
				}
			},
			addRadio: function( radio ) {
				dirty = true;
				radios.push( radio );
			},
			addUnresolved: function( thing ) {
				dirty = true;
				unresolved.push( thing );
			},
			removeUnresolved: function( thing ) {
				removeFromArray( unresolved, thing );
			},
			detachWhenReady: function( thing ) {
				transitionManager.detachQueue.push( thing );
			}
		};
		circular.runloop = runloop;
		return runloop;

		function flushChanges() {
			var thing, upstreamChanges, i, changeHash, changedKeypath;
			i = instances.length;
			while ( i-- ) {
				thing = instances[ i ];
				if ( thing._changes.length ) {
					upstreamChanges = getUpstreamChanges( thing._changes );
					notifyDependants.multiple( thing, upstreamChanges, true );
				}
			}
			attemptKeypathResolution();
			while ( dirty ) {
				dirty = false;
				while ( thing = computations.pop() ) {
					thing.update();
				}
				while ( thing = evaluators.pop() ) {
					thing.update().deferred = false;
				}
				while ( thing = selectValues.pop() ) {
					thing.deferredUpdate();
				}
				while ( thing = checkboxes.pop() ) {
					set( thing.root, thing.keypath, getValueFromCheckboxes( thing.root, thing.keypath ) );
				}
				while ( thing = radios.pop() ) {
					thing.update();
				}
			}
			if ( toFocus ) {
				toFocus.focus();
				toFocus = null;
			}
			while ( thing = attributes.pop() ) {
				thing.update().deferred = false;
			}
			while ( thing = liveQueries.pop() ) {
				thing._sort();
			}
			while ( thing = decorators.pop() ) {
				thing.init();
			}
			while ( thing = transitions.pop() ) {
				thing.init();
			}
			while ( thing = observers.pop() ) {
				thing.update();
			}
			while ( thing = activeBindings.pop() ) {
				thing.active = false;
			}
			while ( thing = instances.pop() ) {
				instances[ thing._guid ] = false;
				if ( thing._changes.length ) {
					changeHash = {};
					while ( changedKeypath = thing._changes.pop() ) {
						changeHash[ changedKeypath ] = get( thing, changedKeypath );
					}
					thing.fire( 'change', changeHash );
				}
			}
			if ( pendingCssChanges ) {
				css.update();
				pendingCssChanges = false;
			}
		}

		function attemptKeypathResolution() {
			var array, thing, keypath;
			if ( !unresolved.length ) {
				return;
			}
			array = unresolved.splice( 0, unresolved.length );
			while ( thing = array.pop() ) {
				if ( thing.keypath ) {
					continue;
				}
				keypath = resolveRef( thing.root, thing.ref, thing.parentFragment );
				if ( keypath !== undefined ) {
					thing.resolve( keypath );
				} else {
					unresolved.push( thing );
				}
			}
		}
	}( circular, global_css, utils_removeFromArray, shared_getValueFromCheckboxes, shared_resolveRef, shared_getUpstreamChanges, shared_notifyDependants, shared_makeTransitionManager );

	var shared_animations = function( rAF, getTime, runloop ) {

		var queue = [];
		var animations = {
			tick: function() {
				var i, animation, now;
				now = getTime();
				runloop.start();
				for ( i = 0; i < queue.length; i += 1 ) {
					animation = queue[ i ];
					if ( !animation.tick( now ) ) {
						queue.splice( i--, 1 );
					}
				}
				runloop.end();
				if ( queue.length ) {
					rAF( animations.tick );
				} else {
					animations.running = false;
				}
			},
			add: function( animation ) {
				queue.push( animation );
				if ( !animations.running ) {
					animations.running = true;
					rAF( animations.tick );
				}
			},
			abort: function( keypath, root ) {
				var i = queue.length,
					animation;
				while ( i-- ) {
					animation = queue[ i ];
					if ( animation.root === root && animation.keypath === keypath ) {
						animation.stop();
					}
				}
			}
		};
		return animations;
	}( utils_requestAnimationFrame, utils_getTime, global_runloop );

	var utils_isArray = function() {

		var toString = Object.prototype.toString;
		return function( thing ) {
			return toString.call( thing ) === '[object Array]';
		};
	}();

	var utils_clone = function( isArray ) {

		return function( source ) {
			var target, key;
			if ( !source || typeof source !== 'object' ) {
				return source;
			}
			if ( isArray( source ) ) {
				return source.slice();
			}
			target = {};
			for ( key in source ) {
				if ( source.hasOwnProperty( key ) ) {
					target[ key ] = source[ key ];
				}
			}
			return target;
		};
	}( utils_isArray );

	var registries_adaptors = {};

	var shared_get_arrayAdaptor_getSpliceEquivalent = function( array, methodName, args ) {
		switch ( methodName ) {
			case 'splice':
				return args;
			case 'sort':
			case 'reverse':
				return null;
			case 'pop':
				if ( array.length ) {
					return [ -1 ];
				}
				return null;
			case 'push':
				return [
					array.length,
					0
				].concat( args );
			case 'shift':
				return [
					0,
					1
				];
			case 'unshift':
				return [
					0,
					0
				].concat( args );
		}
	};

	var shared_get_arrayAdaptor_summariseSpliceOperation = function( array, args ) {
		var start, addedItems, removedItems, balance;
		if ( !args ) {
			return null;
		}
		start = +( args[ 0 ] < 0 ? array.length + args[ 0 ] : args[ 0 ] );
		addedItems = Math.max( 0, args.length - 2 );
		removedItems = args[ 1 ] !== undefined ? args[ 1 ] : array.length - start;
		removedItems = Math.min( removedItems, array.length - start );
		balance = addedItems - removedItems;
		return {
			start: start,
			balance: balance,
			added: addedItems,
			removed: removedItems
		};
	};

	var config_types = {
		TEXT: 1,
		INTERPOLATOR: 2,
		TRIPLE: 3,
		SECTION: 4,
		INVERTED: 5,
		CLOSING: 6,
		ELEMENT: 7,
		PARTIAL: 8,
		COMMENT: 9,
		DELIMCHANGE: 10,
		MUSTACHE: 11,
		TAG: 12,
		ATTRIBUTE: 13,
		CLOSING_TAG: 14,
		COMPONENT: 15,
		NUMBER_LITERAL: 20,
		STRING_LITERAL: 21,
		ARRAY_LITERAL: 22,
		OBJECT_LITERAL: 23,
		BOOLEAN_LITERAL: 24,
		GLOBAL: 26,
		KEY_VALUE_PAIR: 27,
		REFERENCE: 30,
		REFINEMENT: 31,
		MEMBER: 32,
		PREFIX_OPERATOR: 33,
		BRACKETED: 34,
		CONDITIONAL: 35,
		INFIX_OPERATOR: 36,
		INVOCATION: 40
	};

	var shared_clearCache = function clearCache( ractive, keypath, dontTeardownWrapper ) {
		var cacheMap, wrappedProperty;
		if ( !dontTeardownWrapper ) {
			if ( wrappedProperty = ractive._wrapped[ keypath ] ) {
				if ( wrappedProperty.teardown() !== false ) {
					ractive._wrapped[ keypath ] = null;
				}
			}
		}
		ractive._cache[ keypath ] = undefined;
		if ( cacheMap = ractive._cacheMap[ keypath ] ) {
			while ( cacheMap.length ) {
				clearCache( ractive, cacheMap.pop() );
			}
		}
	};

	var utils_createBranch = function() {

		var numeric = /^\s*[0-9]+\s*$/;
		return function( key ) {
			return numeric.test( key ) ? [] : {};
		};
	}();

	var shared_set = function( circular, isEqual, createBranch, clearCache, notifyDependants ) {

		var get;
		circular.push( function() {
			get = circular.get;
		} );

		function set( ractive, keypath, value, silent ) {
			var keys, lastKey, parentKeypath, parentValue, computation, wrapper, evaluator, dontTeardownWrapper;
			if ( isEqual( ractive._cache[ keypath ], value ) ) {
				return;
			}
			computation = ractive._computations[ keypath ];
			wrapper = ractive._wrapped[ keypath ];
			evaluator = ractive._evaluators[ keypath ];
			if ( computation && !computation.setting ) {
				computation.set( value );
			}
			if ( wrapper && wrapper.reset ) {
				dontTeardownWrapper = wrapper.reset( value ) !== false;
				if ( dontTeardownWrapper ) {
					value = wrapper.get();
				}
			}
			if ( evaluator ) {
				evaluator.value = value;
			}
			if ( !computation && !evaluator && !dontTeardownWrapper ) {
				keys = keypath.split( '.' );
				lastKey = keys.pop();
				parentKeypath = keys.join( '.' );
				wrapper = ractive._wrapped[ parentKeypath ];
				if ( wrapper && wrapper.set ) {
					wrapper.set( lastKey, value );
				} else {
					parentValue = wrapper ? wrapper.get() : get( ractive, parentKeypath );
					if ( !parentValue ) {
						parentValue = createBranch( lastKey );
						set( ractive, parentKeypath, parentValue, true );
					}
					parentValue[ lastKey ] = value;
				}
			}
			clearCache( ractive, keypath, dontTeardownWrapper );
			if ( !silent ) {
				ractive._changes.push( keypath );
				notifyDependants( ractive, keypath );
			}
		}
		circular.set = set;
		return set;
	}( circular, utils_isEqual, utils_createBranch, shared_clearCache, shared_notifyDependants );

	var shared_get_arrayAdaptor_processWrapper = function( types, clearCache, notifyDependants, set ) {

		return function( wrapper, array, methodName, spliceSummary ) {
			var root, keypath, clearEnd, updateDependant, i, changed, start, end, childKeypath, lengthUnchanged;
			root = wrapper.root;
			keypath = wrapper.keypath;
			root._changes.push( keypath );
			if ( methodName === 'sort' || methodName === 'reverse' ) {
				set( root, keypath, array );
				return;
			}
			if ( !spliceSummary ) {
				return;
			}
			clearEnd = !spliceSummary.balance ? spliceSummary.added : array.length - Math.min( spliceSummary.balance, 0 );
			for ( i = spliceSummary.start; i < clearEnd; i += 1 ) {
				clearCache( root, keypath + '.' + i );
			}
			updateDependant = function( dependant ) {
				if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.docFrag ) {
					dependant.splice( spliceSummary );
				} else {
					dependant.update();
				}
			};
			root._deps.forEach( function( depsByKeypath ) {
				var dependants = depsByKeypath[ keypath ];
				if ( dependants ) {
					dependants.forEach( updateDependant );
				}
			} );
			if ( spliceSummary.added && spliceSummary.removed ) {
				changed = Math.max( spliceSummary.added, spliceSummary.removed );
				start = spliceSummary.start;
				end = start + changed;
				lengthUnchanged = spliceSummary.added === spliceSummary.removed;
				for ( i = start; i < end; i += 1 ) {
					childKeypath = keypath + '.' + i;
					notifyDependants( root, childKeypath );
				}
			}
			if ( !lengthUnchanged ) {
				clearCache( root, keypath + '.length' );
				notifyDependants( root, keypath + '.length', true );
			}
		};
	}( config_types, shared_clearCache, shared_notifyDependants, shared_set );

	var shared_get_arrayAdaptor_patch = function( runloop, defineProperty, getSpliceEquivalent, summariseSpliceOperation, processWrapper ) {

		var patchedArrayProto = [],
			mutatorMethods = [
				'pop',
				'push',
				'reverse',
				'shift',
				'sort',
				'splice',
				'unshift'
			],
			testObj, patchArrayMethods, unpatchArrayMethods;
		mutatorMethods.forEach( function( methodName ) {
			var method = function() {
				var spliceEquivalent, spliceSummary, result, wrapper, i;
				spliceEquivalent = getSpliceEquivalent( this, methodName, Array.prototype.slice.call( arguments ) );
				spliceSummary = summariseSpliceOperation( this, spliceEquivalent );
				result = Array.prototype[ methodName ].apply( this, arguments );
				this._ractive.setting = true;
				i = this._ractive.wrappers.length;
				while ( i-- ) {
					wrapper = this._ractive.wrappers[ i ];
					runloop.start( wrapper.root );
					processWrapper( wrapper, this, methodName, spliceSummary );
					runloop.end();
				}
				this._ractive.setting = false;
				return result;
			};
			defineProperty( patchedArrayProto, methodName, {
				value: method
			} );
		} );
		testObj = {};
		if ( testObj.__proto__ ) {
			patchArrayMethods = function( array ) {
				array.__proto__ = patchedArrayProto;
			};
			unpatchArrayMethods = function( array ) {
				array.__proto__ = Array.prototype;
			};
		} else {
			patchArrayMethods = function( array ) {
				var i, methodName;
				i = mutatorMethods.length;
				while ( i-- ) {
					methodName = mutatorMethods[ i ];
					defineProperty( array, methodName, {
						value: patchedArrayProto[ methodName ],
						configurable: true
					} );
				}
			};
			unpatchArrayMethods = function( array ) {
				var i;
				i = mutatorMethods.length;
				while ( i-- ) {
					delete array[ mutatorMethods[ i ] ];
				}
			};
		}
		patchArrayMethods.unpatch = unpatchArrayMethods;
		return patchArrayMethods;
	}( global_runloop, utils_defineProperty, shared_get_arrayAdaptor_getSpliceEquivalent, shared_get_arrayAdaptor_summariseSpliceOperation, shared_get_arrayAdaptor_processWrapper );

	var shared_get_arrayAdaptor__arrayAdaptor = function( defineProperty, isArray, patch ) {

		var arrayAdaptor, ArrayWrapper, errorMessage;
		arrayAdaptor = {
			filter: function( object ) {
				return isArray( object ) && ( !object._ractive || !object._ractive.setting );
			},
			wrap: function( ractive, array, keypath ) {
				return new ArrayWrapper( ractive, array, keypath );
			}
		};
		ArrayWrapper = function( ractive, array, keypath ) {
			this.root = ractive;
			this.value = array;
			this.keypath = keypath;
			if ( !array._ractive ) {
				defineProperty( array, '_ractive', {
					value: {
						wrappers: [],
						instances: [],
						setting: false
					},
					configurable: true
				} );
				patch( array );
			}
			if ( !array._ractive.instances[ ractive._guid ] ) {
				array._ractive.instances[ ractive._guid ] = 0;
				array._ractive.instances.push( ractive );
			}
			array._ractive.instances[ ractive._guid ] += 1;
			array._ractive.wrappers.push( this );
		};
		ArrayWrapper.prototype = {
			get: function() {
				return this.value;
			},
			teardown: function() {
				var array, storage, wrappers, instances, index;
				array = this.value;
				storage = array._ractive;
				wrappers = storage.wrappers;
				instances = storage.instances;
				if ( storage.setting ) {
					return false;
				}
				index = wrappers.indexOf( this );
				if ( index === -1 ) {
					throw new Error( errorMessage );
				}
				wrappers.splice( index, 1 );
				if ( !wrappers.length ) {
					delete array._ractive;
					patch.unpatch( this.value );
				} else {
					instances[ this.root._guid ] -= 1;
					if ( !instances[ this.root._guid ] ) {
						index = instances.indexOf( this.root );
						if ( index === -1 ) {
							throw new Error( errorMessage );
						}
						instances.splice( index, 1 );
					}
				}
			}
		};
		errorMessage = 'Something went wrong in a rather interesting way';
		return arrayAdaptor;
	}( utils_defineProperty, utils_isArray, shared_get_arrayAdaptor_patch );

	var shared_get_magicAdaptor = function( runloop, createBranch, isArray, clearCache, notifyDependants ) {

		var magicAdaptor, MagicWrapper;
		try {
			Object.defineProperty( {}, 'test', {
				value: 0
			} );
		} catch ( err ) {
			return false;
		}
		magicAdaptor = {
			filter: function( object, keypath, ractive ) {
				var keys, key, parentKeypath, parentWrapper, parentValue;
				if ( !keypath ) {
					return false;
				}
				keys = keypath.split( '.' );
				key = keys.pop();
				parentKeypath = keys.join( '.' );
				if ( ( parentWrapper = ractive._wrapped[ parentKeypath ] ) && !parentWrapper.magic ) {
					return false;
				}
				parentValue = ractive.get( parentKeypath );
				if ( isArray( parentValue ) && /^[0-9]+$/.test( key ) ) {
					return false;
				}
				return parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' );
			},
			wrap: function( ractive, property, keypath ) {
				return new MagicWrapper( ractive, property, keypath );
			}
		};
		MagicWrapper = function( ractive, value, keypath ) {
			var keys, objKeypath, descriptor, siblings;
			this.magic = true;
			this.ractive = ractive;
			this.keypath = keypath;
			this.value = value;
			keys = keypath.split( '.' );
			this.prop = keys.pop();
			objKeypath = keys.join( '.' );
			this.obj = objKeypath ? ractive.get( objKeypath ) : ractive.data;
			descriptor = this.originalDescriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );
			if ( descriptor && descriptor.set && ( siblings = descriptor.set._ractiveWrappers ) ) {
				if ( siblings.indexOf( this ) === -1 ) {
					siblings.push( this );
				}
				return;
			}
			createAccessors( this, value, descriptor );
		};
		MagicWrapper.prototype = {
			get: function() {
				return this.value;
			},
			reset: function( value ) {
				if ( this.updating ) {
					return;
				}
				this.updating = true;
				this.obj[ this.prop ] = value;
				clearCache( this.ractive, this.keypath );
				this.updating = false;
			},
			set: function( key, value ) {
				if ( this.updating ) {
					return;
				}
				if ( !this.obj[ this.prop ] ) {
					this.updating = true;
					this.obj[ this.prop ] = createBranch( key );
					this.updating = false;
				}
				this.obj[ this.prop ][ key ] = value;
			},
			teardown: function() {
				var descriptor, set, value, wrappers, index;
				if ( this.updating ) {
					return false;
				}
				descriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );
				set = descriptor && descriptor.set;
				if ( !set ) {
					return;
				}
				wrappers = set._ractiveWrappers;
				index = wrappers.indexOf( this );
				if ( index !== -1 ) {
					wrappers.splice( index, 1 );
				}
				if ( !wrappers.length ) {
					value = this.obj[ this.prop ];
					Object.defineProperty( this.obj, this.prop, this.originalDescriptor || {
						writable: true,
						enumerable: true,
						configurable: true
					} );
					this.obj[ this.prop ] = value;
				}
			}
		};

		function createAccessors( originalWrapper, value, descriptor ) {
			var object, property, oldGet, oldSet, get, set;
			object = originalWrapper.obj;
			property = originalWrapper.prop;
			if ( descriptor && !descriptor.configurable ) {
				if ( property === 'length' ) {
					return;
				}
				throw new Error( 'Cannot use magic mode with property "' + property + '" - object is not configurable' );
			}
			if ( descriptor ) {
				oldGet = descriptor.get;
				oldSet = descriptor.set;
			}
			get = oldGet || function() {
				return value;
			};
			set = function( v ) {
				if ( oldSet ) {
					oldSet( v );
				}
				value = oldGet ? oldGet() : v;
				set._ractiveWrappers.forEach( updateWrapper );
			};

			function updateWrapper( wrapper ) {
				var keypath, ractive;
				wrapper.value = value;
				if ( wrapper.updating ) {
					return;
				}
				ractive = wrapper.ractive;
				keypath = wrapper.keypath;
				wrapper.updating = true;
				runloop.start( ractive );
				ractive._changes.push( keypath );
				clearCache( ractive, keypath );
				notifyDependants( ractive, keypath );
				runloop.end();
				wrapper.updating = false;
			}
			set._ractiveWrappers = [ originalWrapper ];
			Object.defineProperty( object, property, {
				get: get,
				set: set,
				enumerable: true,
				configurable: true
			} );
		}
		return magicAdaptor;
	}( global_runloop, utils_createBranch, utils_isArray, shared_clearCache, shared_notifyDependants );

	var shared_get_magicArrayAdaptor = function( magicAdaptor, arrayAdaptor ) {

		if ( !magicAdaptor ) {
			return false;
		}
		var magicArrayAdaptor, MagicArrayWrapper;
		magicArrayAdaptor = {
			filter: function( object, keypath, ractive ) {
				return magicAdaptor.filter( object, keypath, ractive ) && arrayAdaptor.filter( object );
			},
			wrap: function( ractive, array, keypath ) {
				return new MagicArrayWrapper( ractive, array, keypath );
			}
		};
		MagicArrayWrapper = function( ractive, array, keypath ) {
			this.value = array;
			this.magic = true;
			this.magicWrapper = magicAdaptor.wrap( ractive, array, keypath );
			this.arrayWrapper = arrayAdaptor.wrap( ractive, array, keypath );
		};
		MagicArrayWrapper.prototype = {
			get: function() {
				return this.value;
			},
			teardown: function() {
				this.arrayWrapper.teardown();
				this.magicWrapper.teardown();
			},
			reset: function( value ) {
				return this.magicWrapper.reset( value );
			}
		};
		return magicArrayAdaptor;
	}( shared_get_magicAdaptor, shared_get_arrayAdaptor__arrayAdaptor );

	var shared_adaptIfNecessary = function( adaptorRegistry, arrayAdaptor, magicAdaptor, magicArrayAdaptor ) {

		var prefixers = {};
		return function adaptIfNecessary( ractive, keypath, value, isExpressionResult ) {
			var len, i, adaptor, wrapped;
			len = ractive.adapt.length;
			for ( i = 0; i < len; i += 1 ) {
				adaptor = ractive.adapt[ i ];
				if ( typeof adaptor === 'string' ) {
					if ( !adaptorRegistry[ adaptor ] ) {
						throw new Error( 'Missing adaptor "' + adaptor + '"' );
					}
					adaptor = ractive.adapt[ i ] = adaptorRegistry[ adaptor ];
				}
				if ( adaptor.filter( value, keypath, ractive ) ) {
					wrapped = ractive._wrapped[ keypath ] = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
					wrapped.value = value;
					return value;
				}
			}
			if ( !isExpressionResult ) {
				if ( ractive.magic ) {
					if ( magicArrayAdaptor.filter( value, keypath, ractive ) ) {
						ractive._wrapped[ keypath ] = magicArrayAdaptor.wrap( ractive, value, keypath );
					} else if ( magicAdaptor.filter( value, keypath, ractive ) ) {
						ractive._wrapped[ keypath ] = magicAdaptor.wrap( ractive, value, keypath );
					}
				} else if ( ractive.modifyArrays && arrayAdaptor.filter( value, keypath, ractive ) ) {
					ractive._wrapped[ keypath ] = arrayAdaptor.wrap( ractive, value, keypath );
				}
			}
			return value;
		};

		function prefixKeypath( obj, prefix ) {
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

		function getPrefixer( rootKeypath ) {
			var rootDot;
			if ( !prefixers[ rootKeypath ] ) {
				rootDot = rootKeypath ? rootKeypath + '.' : '';
				prefixers[ rootKeypath ] = function( relativeKeypath, value ) {
					var obj;
					if ( typeof relativeKeypath === 'string' ) {
						obj = {};
						obj[ rootDot + relativeKeypath ] = value;
						return obj;
					}
					if ( typeof relativeKeypath === 'object' ) {
						return rootDot ? prefixKeypath( relativeKeypath, rootKeypath ) : relativeKeypath;
					}
				};
			}
			return prefixers[ rootKeypath ];
		}
	}( registries_adaptors, shared_get_arrayAdaptor__arrayAdaptor, shared_get_magicAdaptor, shared_get_magicArrayAdaptor );

	var shared_registerDependant = function() {

		return function registerDependant( dependant ) {
			var depsByKeypath, deps, ractive, keypath, priority;
			ractive = dependant.root;
			keypath = dependant.keypath;
			priority = dependant.priority;
			depsByKeypath = ractive._deps[ priority ] || ( ractive._deps[ priority ] = {} );
			deps = depsByKeypath[ keypath ] || ( depsByKeypath[ keypath ] = [] );
			deps.push( dependant );
			dependant.registered = true;
			if ( !keypath ) {
				return;
			}
			updateDependantsMap( ractive, keypath );
		};

		function updateDependantsMap( ractive, keypath ) {
			var keys, parentKeypath, map;
			keys = keypath.split( '.' );
			while ( keys.length ) {
				keys.pop();
				parentKeypath = keys.join( '.' );
				map = ractive._depsMap[ parentKeypath ] || ( ractive._depsMap[ parentKeypath ] = [] );
				if ( map[ keypath ] === undefined ) {
					map[ keypath ] = 0;
					map[ map.length ] = keypath;
				}
				map[ keypath ] += 1;
				keypath = parentKeypath;
			}
		}
	}();

	var shared_unregisterDependant = function() {

		return function unregisterDependant( dependant ) {
			var deps, index, ractive, keypath, priority;
			ractive = dependant.root;
			keypath = dependant.keypath;
			priority = dependant.priority;
			deps = ractive._deps[ priority ][ keypath ];
			index = deps.indexOf( dependant );
			if ( index === -1 || !dependant.registered ) {
				throw new Error( 'Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks' );
			}
			deps.splice( index, 1 );
			dependant.registered = false;
			if ( !keypath ) {
				return;
			}
			updateDependantsMap( ractive, keypath );
		};

		function updateDependantsMap( ractive, keypath ) {
			var keys, parentKeypath, map;
			keys = keypath.split( '.' );
			while ( keys.length ) {
				keys.pop();
				parentKeypath = keys.join( '.' );
				map = ractive._depsMap[ parentKeypath ];
				map[ keypath ] -= 1;
				if ( !map[ keypath ] ) {
					map.splice( map.indexOf( keypath ), 1 );
					map[ keypath ] = undefined;
				}
				keypath = parentKeypath;
			}
		}
	}();

	var shared_createComponentBinding = function( circular, runloop, isArray, isEqual, registerDependant, unregisterDependant ) {

		var get, set;
		circular.push( function() {
			get = circular.get;
			set = circular.set;
		} );
		var Binding = function( ractive, keypath, otherInstance, otherKeypath, priority ) {
			this.root = ractive;
			this.keypath = keypath;
			this.priority = priority;
			this.otherInstance = otherInstance;
			this.otherKeypath = otherKeypath;
			registerDependant( this );
			this.value = get( this.root, this.keypath );
		};
		Binding.prototype = {
			update: function() {
				var value;
				if ( this.updating || this.counterpart && this.counterpart.updating ) {
					return;
				}
				value = get( this.root, this.keypath );
				if ( isArray( value ) && value._ractive && value._ractive.setting ) {
					return;
				}
				if ( !isEqual( value, this.value ) ) {
					this.updating = true;
					runloop.addInstance( this.otherInstance );
					set( this.otherInstance, this.otherKeypath, value );
					this.value = value;
					this.updating = false;
				}
			},
			reassign: function( newKeypath ) {
				unregisterDependant( this );
				unregisterDependant( this.counterpart );
				this.keypath = newKeypath;
				this.counterpart.otherKeypath = newKeypath;
				registerDependant( this );
				registerDependant( this.counterpart );
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return function createComponentBinding( component, parentInstance, parentKeypath, childKeypath ) {
			var hash, childInstance, bindings, priority, parentToChildBinding, childToParentBinding;
			hash = parentKeypath + '=' + childKeypath;
			bindings = component.bindings;
			if ( bindings[ hash ] ) {
				return;
			}
			bindings[ hash ] = true;
			childInstance = component.instance;
			priority = component.parentFragment.priority;
			parentToChildBinding = new Binding( parentInstance, parentKeypath, childInstance, childKeypath, priority );
			bindings.push( parentToChildBinding );
			if ( childInstance.twoway ) {
				childToParentBinding = new Binding( childInstance, childKeypath, parentInstance, parentKeypath, 1 );
				bindings.push( childToParentBinding );
				parentToChildBinding.counterpart = childToParentBinding;
				childToParentBinding.counterpart = parentToChildBinding;
			}
		};
	}( circular, global_runloop, utils_isArray, utils_isEqual, shared_registerDependant, shared_unregisterDependant );

	var shared_get_getFromParent = function( circular, createComponentBinding, set ) {

		var get;
		circular.push( function() {
			get = circular.get;
		} );
		return function getFromParent( child, keypath ) {
			var parent, fragment, keypathToTest, value, index;
			parent = child._parent;
			fragment = child.component.parentFragment;
			if ( fragment.indexRefs && ( index = fragment.indexRefs[ keypath ] ) !== undefined ) {
				child.component.indexRefBindings[ keypath ] = keypath;
				return index;
			}
			do {
				if ( !fragment.context ) {
					continue;
				}
				keypathToTest = fragment.context + '.' + keypath;
				value = get( parent, keypathToTest );
				if ( value !== undefined ) {
					createLateComponentBinding( parent, child, keypathToTest, keypath, value );
					return value;
				}
			} while ( fragment = fragment.parent );
			value = get( parent, keypath );
			if ( value !== undefined ) {
				createLateComponentBinding( parent, child, keypath, keypath, value );
				return value;
			}
		};

		function createLateComponentBinding( parent, child, parentKeypath, childKeypath, value ) {
			set( child, childKeypath, value, true );
			createComponentBinding( child.component, parent, parentKeypath, childKeypath );
		}
	}( circular, shared_createComponentBinding, shared_set );

	var shared_get_FAILED_LOOKUP = {
		FAILED_LOOKUP: true
	};

	var shared_get__get = function( circular, hasOwnProperty, clone, adaptIfNecessary, getFromParent, FAILED_LOOKUP ) {

		function get( ractive, keypath, options ) {
			var cache = ractive._cache,
				value, computation, wrapped, evaluator;
			if ( cache[ keypath ] === undefined ) {
				if ( computation = ractive._computations[ keypath ] ) {
					value = computation.value;
				} else if ( wrapped = ractive._wrapped[ keypath ] ) {
					value = wrapped.value;
				} else if ( !keypath ) {
					adaptIfNecessary( ractive, '', ractive.data );
					value = ractive.data;
				} else if ( evaluator = ractive._evaluators[ keypath ] ) {
					value = evaluator.value;
				} else {
					value = retrieve( ractive, keypath );
				}
				cache[ keypath ] = value;
			} else {
				value = cache[ keypath ];
			}
			if ( value === FAILED_LOOKUP ) {
				if ( ractive._parent && !ractive.isolated ) {
					value = getFromParent( ractive, keypath, options );
				} else {
					value = undefined;
				}
			}
			if ( options && options.evaluateWrapped && ( wrapped = ractive._wrapped[ keypath ] ) ) {
				value = wrapped.get();
			}
			return value;
		}
		circular.get = get;
		return get;

		function retrieve( ractive, keypath ) {
			var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped, shouldClone;
			keys = keypath.split( '.' );
			key = keys.pop();
			parentKeypath = keys.join( '.' );
			parentValue = get( ractive, parentKeypath );
			if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
				parentValue = wrapped.get();
			}
			if ( parentValue === null || parentValue === undefined ) {
				return;
			}
			if ( !( cacheMap = ractive._cacheMap[ parentKeypath ] ) ) {
				ractive._cacheMap[ parentKeypath ] = [ keypath ];
			} else {
				if ( cacheMap.indexOf( keypath ) === -1 ) {
					cacheMap.push( keypath );
				}
			}
			if ( typeof parentValue === 'object' && !( key in parentValue ) ) {
				return ractive._cache[ keypath ] = FAILED_LOOKUP;
			}
			shouldClone = !hasOwnProperty.call( parentValue, key );
			value = shouldClone ? clone( parentValue[ key ] ) : parentValue[ key ];
			value = adaptIfNecessary( ractive, keypath, value, false );
			ractive._cache[ keypath ] = value;
			return value;
		}
	}( circular, utils_hasOwnProperty, utils_clone, shared_adaptIfNecessary, shared_get_getFromParent, shared_get_FAILED_LOOKUP );

	/* global console */
	var utils_warn = function() {

		if ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' ) {
			return function() {
				console.warn.apply( console, arguments );
			};
		}
		return function() {};
	}();

	var utils_isObject = function() {

		var toString = Object.prototype.toString;
		return function( thing ) {
			return thing && toString.call( thing ) === '[object Object]';
		};
	}();

	var registries_interpolators = function( circular, hasOwnProperty, isArray, isObject, isNumeric ) {

		var interpolators, interpolate, cssLengthPattern;
		circular.push( function() {
			interpolate = circular.interpolate;
		} );
		cssLengthPattern = /^([+-]?[0-9]+\.?(?:[0-9]+)?)(px|em|ex|%|in|cm|mm|pt|pc)$/;
		interpolators = {
			number: function( from, to ) {
				var delta;
				if ( !isNumeric( from ) || !isNumeric( to ) ) {
					return null;
				}
				from = +from;
				to = +to;
				delta = to - from;
				if ( !delta ) {
					return function() {
						return from;
					};
				}
				return function( t ) {
					return from + t * delta;
				};
			},
			array: function( from, to ) {
				var intermediate, interpolators, len, i;
				if ( !isArray( from ) || !isArray( to ) ) {
					return null;
				}
				intermediate = [];
				interpolators = [];
				i = len = Math.min( from.length, to.length );
				while ( i-- ) {
					interpolators[ i ] = interpolate( from[ i ], to[ i ] );
				}
				for ( i = len; i < from.length; i += 1 ) {
					intermediate[ i ] = from[ i ];
				}
				for ( i = len; i < to.length; i += 1 ) {
					intermediate[ i ] = to[ i ];
				}
				return function( t ) {
					var i = len;
					while ( i-- ) {
						intermediate[ i ] = interpolators[ i ]( t );
					}
					return intermediate;
				};
			},
			object: function( from, to ) {
				var properties, len, interpolators, intermediate, prop;
				if ( !isObject( from ) || !isObject( to ) ) {
					return null;
				}
				properties = [];
				intermediate = {};
				interpolators = {};
				for ( prop in from ) {
					if ( hasOwnProperty.call( from, prop ) ) {
						if ( hasOwnProperty.call( to, prop ) ) {
							properties.push( prop );
							interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] );
						} else {
							intermediate[ prop ] = from[ prop ];
						}
					}
				}
				for ( prop in to ) {
					if ( hasOwnProperty.call( to, prop ) && !hasOwnProperty.call( from, prop ) ) {
						intermediate[ prop ] = to[ prop ];
					}
				}
				len = properties.length;
				return function( t ) {
					var i = len,
						prop;
					while ( i-- ) {
						prop = properties[ i ];
						intermediate[ prop ] = interpolators[ prop ]( t );
					}
					return intermediate;
				};
			},
			cssLength: function( from, to ) {
				var fromMatch, toMatch, fromUnit, toUnit, fromValue, toValue, unit, delta;
				if ( from !== 0 && typeof from !== 'string' || to !== 0 && typeof to !== 'string' ) {
					return null;
				}
				fromMatch = cssLengthPattern.exec( from );
				toMatch = cssLengthPattern.exec( to );
				fromUnit = fromMatch ? fromMatch[ 2 ] : '';
				toUnit = toMatch ? toMatch[ 2 ] : '';
				if ( fromUnit && toUnit && fromUnit !== toUnit ) {
					return null;
				}
				unit = fromUnit || toUnit;
				fromValue = fromMatch ? +fromMatch[ 1 ] : 0;
				toValue = toMatch ? +toMatch[ 1 ] : 0;
				delta = toValue - fromValue;
				if ( !delta ) {
					return function() {
						return fromValue + unit;
					};
				}
				return function( t ) {
					return fromValue + t * delta + unit;
				};
			}
		};
		return interpolators;
	}( circular, utils_hasOwnProperty, utils_isArray, utils_isObject, utils_isNumeric );

	var shared_interpolate = function( circular, warn, interpolators ) {

		var interpolate = function( from, to, ractive, type ) {
			if ( from === to ) {
				return snap( to );
			}
			if ( type ) {
				if ( ractive.interpolators[ type ] ) {
					return ractive.interpolators[ type ]( from, to ) || snap( to );
				}
				warn( 'Missing "' + type + '" interpolator. You may need to download a plugin from [TODO]' );
			}
			return interpolators.number( from, to ) || interpolators.array( from, to ) || interpolators.object( from, to ) || interpolators.cssLength( from, to ) || snap( to );
		};
		circular.interpolate = interpolate;
		return interpolate;

		function snap( to ) {
			return function() {
				return to;
			};
		}
	}( circular, utils_warn, registries_interpolators );

	var Ractive_prototype_animate_Animation = function( warn, runloop, interpolate, set ) {

		var Animation = function( options ) {
			var key;
			this.startTime = Date.now();
			for ( key in options ) {
				if ( options.hasOwnProperty( key ) ) {
					this[ key ] = options[ key ];
				}
			}
			this.interpolator = interpolate( this.from, this.to, this.root, this.interpolator );
			this.running = true;
		};
		Animation.prototype = {
			tick: function() {
				var elapsed, t, value, timeNow, index, keypath;
				keypath = this.keypath;
				if ( this.running ) {
					timeNow = Date.now();
					elapsed = timeNow - this.startTime;
					if ( elapsed >= this.duration ) {
						if ( keypath !== null ) {
							runloop.start( this.root );
							set( this.root, keypath, this.to );
							runloop.end();
						}
						if ( this.step ) {
							this.step( 1, this.to );
						}
						this.complete( this.to );
						index = this.root._animations.indexOf( this );
						if ( index === -1 ) {
							warn( 'Animation was not found' );
						}
						this.root._animations.splice( index, 1 );
						this.running = false;
						return false;
					}
					t = this.easing ? this.easing( elapsed / this.duration ) : elapsed / this.duration;
					if ( keypath !== null ) {
						value = this.interpolator( t );
						runloop.start( this.root );
						set( this.root, keypath, value );
						runloop.end();
					}
					if ( this.step ) {
						this.step( t, value );
					}
					return true;
				}
				return false;
			},
			stop: function() {
				var index;
				this.running = false;
				index = this.root._animations.indexOf( this );
				if ( index === -1 ) {
					warn( 'Animation was not found' );
				}
				this.root._animations.splice( index, 1 );
			}
		};
		return Animation;
	}( utils_warn, global_runloop, shared_interpolate, shared_set );

	var Ractive_prototype_animate__animate = function( isEqual, Promise, normaliseKeypath, animations, get, Animation ) {

		var noop = function() {}, noAnimation = {
				stop: noop
			};
		return function( keypath, to, options ) {
			var promise, fulfilPromise, k, animation, animations, easing, duration, step, complete, makeValueCollector, currentValues, collectValue, dummy, dummyOptions;
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			if ( typeof keypath === 'object' ) {
				options = to || {};
				easing = options.easing;
				duration = options.duration;
				animations = [];
				step = options.step;
				complete = options.complete;
				if ( step || complete ) {
					currentValues = {};
					options.step = null;
					options.complete = null;
					makeValueCollector = function( keypath ) {
						return function( t, value ) {
							currentValues[ keypath ] = value;
						};
					};
				}
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						if ( step || complete ) {
							collectValue = makeValueCollector( k );
							options = {
								easing: easing,
								duration: duration
							};
							if ( step ) {
								options.step = collectValue;
							}
						}
						options.complete = complete ? collectValue : noop;
						animations.push( animate( this, k, keypath[ k ], options ) );
					}
				}
				if ( step || complete ) {
					dummyOptions = {
						easing: easing,
						duration: duration
					};
					if ( step ) {
						dummyOptions.step = function( t ) {
							step( t, currentValues );
						};
					}
					if ( complete ) {
						promise.then( function( t ) {
							complete( t, currentValues );
						} );
					}
					dummyOptions.complete = fulfilPromise;
					dummy = animate( this, null, null, dummyOptions );
					animations.push( dummy );
				}
				return {
					stop: function() {
						var animation;
						while ( animation = animations.pop() ) {
							animation.stop();
						}
						if ( dummy ) {
							dummy.stop();
						}
					}
				};
			}
			options = options || {};
			if ( options.complete ) {
				promise.then( options.complete );
			}
			options.complete = fulfilPromise;
			animation = animate( this, keypath, to, options );
			promise.stop = function() {
				animation.stop();
			};
			return promise;
		};

		function animate( root, keypath, to, options ) {
			var easing, duration, animation, from;
			if ( keypath ) {
				keypath = normaliseKeypath( keypath );
			}
			if ( keypath !== null ) {
				from = get( root, keypath );
			}
			animations.abort( keypath, root );
			if ( isEqual( from, to ) ) {
				if ( options.complete ) {
					options.complete( options.to );
				}
				return noAnimation;
			}
			if ( options.easing ) {
				if ( typeof options.easing === 'function' ) {
					easing = options.easing;
				} else {
					easing = root.easing[ options.easing ];
				}
				if ( typeof easing !== 'function' ) {
					easing = null;
				}
			}
			duration = options.duration === undefined ? 400 : options.duration;
			animation = new Animation( {
				keypath: keypath,
				from: from,
				to: to,
				root: root,
				duration: duration,
				easing: easing,
				interpolator: options.interpolator,
				step: options.step,
				complete: options.complete
			} );
			animations.add( animation );
			root._animations.push( animation );
			return animation;
		}
	}( utils_isEqual, utils_Promise, utils_normaliseKeypath, shared_animations, shared_get__get, Ractive_prototype_animate_Animation );

	var Ractive_prototype_detach = function() {
		return this.fragment.detach();
	};

	var Ractive_prototype_find = function( selector ) {
		if ( !this.el ) {
			return null;
		}
		return this.fragment.find( selector );
	};

	var utils_matches = function( isClient, vendors, createElement ) {

		var div, methodNames, unprefixed, prefixed, i, j, makeFunction;
		if ( !isClient ) {
			return;
		}
		div = createElement( 'div' );
		methodNames = [
			'matches',
			'matchesSelector'
		];
		makeFunction = function( methodName ) {
			return function( node, selector ) {
				return node[ methodName ]( selector );
			};
		};
		i = methodNames.length;
		while ( i-- ) {
			unprefixed = methodNames[ i ];
			if ( div[ unprefixed ] ) {
				return makeFunction( unprefixed );
			}
			j = vendors.length;
			while ( j-- ) {
				prefixed = vendors[ i ] + unprefixed.substr( 0, 1 ).toUpperCase() + unprefixed.substring( 1 );
				if ( div[ prefixed ] ) {
					return makeFunction( prefixed );
				}
			}
		}
		return function( node, selector ) {
			var nodes, i;
			nodes = ( node.parentNode || node.document ).querySelectorAll( selector );
			i = nodes.length;
			while ( i-- ) {
				if ( nodes[ i ] === node ) {
					return true;
				}
			}
			return false;
		};
	}( config_isClient, config_vendors, utils_createElement );

	var Ractive_prototype_shared_makeQuery_test = function( matches ) {

		return function( item, noDirty ) {
			var itemMatches = this._isComponentQuery ? !this.selector || item.name === this.selector : matches( item.node, this.selector );
			if ( itemMatches ) {
				this.push( item.node || item.instance );
				if ( !noDirty ) {
					this._makeDirty();
				}
				return true;
			}
		};
	}( utils_matches );

	var Ractive_prototype_shared_makeQuery_cancel = function() {
		var liveQueries, selector, index;
		liveQueries = this._root[ this._isComponentQuery ? 'liveComponentQueries' : 'liveQueries' ];
		selector = this.selector;
		index = liveQueries.indexOf( selector );
		if ( index !== -1 ) {
			liveQueries.splice( index, 1 );
			liveQueries[ selector ] = null;
		}
	};

	var Ractive_prototype_shared_makeQuery_sortByItemPosition = function() {

		return function( a, b ) {
			var ancestryA, ancestryB, oldestA, oldestB, mutualAncestor, indexA, indexB, fragments, fragmentA, fragmentB;
			ancestryA = getAncestry( a.component || a._ractive.proxy );
			ancestryB = getAncestry( b.component || b._ractive.proxy );
			oldestA = ancestryA[ ancestryA.length - 1 ];
			oldestB = ancestryB[ ancestryB.length - 1 ];
			while ( oldestA && oldestA === oldestB ) {
				ancestryA.pop();
				ancestryB.pop();
				mutualAncestor = oldestA;
				oldestA = ancestryA[ ancestryA.length - 1 ];
				oldestB = ancestryB[ ancestryB.length - 1 ];
			}
			oldestA = oldestA.component || oldestA;
			oldestB = oldestB.component || oldestB;
			fragmentA = oldestA.parentFragment;
			fragmentB = oldestB.parentFragment;
			if ( fragmentA === fragmentB ) {
				indexA = fragmentA.items.indexOf( oldestA );
				indexB = fragmentB.items.indexOf( oldestB );
				return indexA - indexB || ancestryA.length - ancestryB.length;
			}
			if ( fragments = mutualAncestor.fragments ) {
				indexA = fragments.indexOf( fragmentA );
				indexB = fragments.indexOf( fragmentB );
				return indexA - indexB || ancestryA.length - ancestryB.length;
			}
			throw new Error( 'An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/RactiveJS/Ractive/issues - thanks!' );
		};

		function getParent( item ) {
			var parentFragment;
			if ( parentFragment = item.parentFragment ) {
				return parentFragment.owner;
			}
			if ( item.component && ( parentFragment = item.component.parentFragment ) ) {
				return parentFragment.owner;
			}
		}

		function getAncestry( item ) {
			var ancestry, ancestor;
			ancestry = [ item ];
			ancestor = getParent( item );
			while ( ancestor ) {
				ancestry.push( ancestor );
				ancestor = getParent( ancestor );
			}
			return ancestry;
		}
	}();

	var Ractive_prototype_shared_makeQuery_sortByDocumentPosition = function( sortByItemPosition ) {

		return function( node, otherNode ) {
			var bitmask;
			if ( node.compareDocumentPosition ) {
				bitmask = node.compareDocumentPosition( otherNode );
				return bitmask & 2 ? 1 : -1;
			}
			return sortByItemPosition( node, otherNode );
		};
	}( Ractive_prototype_shared_makeQuery_sortByItemPosition );

	var Ractive_prototype_shared_makeQuery_sort = function( sortByDocumentPosition, sortByItemPosition ) {

		return function() {
			this.sort( this._isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
			this._dirty = false;
		};
	}( Ractive_prototype_shared_makeQuery_sortByDocumentPosition, Ractive_prototype_shared_makeQuery_sortByItemPosition );

	var Ractive_prototype_shared_makeQuery_dirty = function( runloop ) {

		return function() {
			if ( !this._dirty ) {
				runloop.addLiveQuery( this );
				this._dirty = true;
			}
		};
	}( global_runloop );

	var Ractive_prototype_shared_makeQuery_remove = function( nodeOrComponent ) {
		var index = this.indexOf( this._isComponentQuery ? nodeOrComponent.instance : nodeOrComponent );
		if ( index !== -1 ) {
			this.splice( index, 1 );
		}
	};

	var Ractive_prototype_shared_makeQuery__makeQuery = function( defineProperties, test, cancel, sort, dirty, remove ) {

		return function( ractive, selector, live, isComponentQuery ) {
			var query = [];
			defineProperties( query, {
				selector: {
					value: selector
				},
				live: {
					value: live
				},
				_isComponentQuery: {
					value: isComponentQuery
				},
				_test: {
					value: test
				}
			} );
			if ( !live ) {
				return query;
			}
			defineProperties( query, {
				cancel: {
					value: cancel
				},
				_root: {
					value: ractive
				},
				_sort: {
					value: sort
				},
				_makeDirty: {
					value: dirty
				},
				_remove: {
					value: remove
				},
				_dirty: {
					value: false,
					writable: true
				}
			} );
			return query;
		};
	}( utils_defineProperties, Ractive_prototype_shared_makeQuery_test, Ractive_prototype_shared_makeQuery_cancel, Ractive_prototype_shared_makeQuery_sort, Ractive_prototype_shared_makeQuery_dirty, Ractive_prototype_shared_makeQuery_remove );

	var Ractive_prototype_findAll = function( makeQuery ) {

		return function( selector, options ) {
			var liveQueries, query;
			if ( !this.el ) {
				return [];
			}
			options = options || {};
			liveQueries = this._liveQueries;
			if ( query = liveQueries[ selector ] ) {
				return options && options.live ? query : query.slice();
			}
			query = makeQuery( this, selector, !! options.live, false );
			if ( query.live ) {
				liveQueries.push( selector );
				liveQueries[ '_' + selector ] = query;
			}
			this.fragment.findAll( selector, query );
			return query;
		};
	}( Ractive_prototype_shared_makeQuery__makeQuery );

	var Ractive_prototype_findAllComponents = function( makeQuery ) {

		return function( selector, options ) {
			var liveQueries, query;
			options = options || {};
			liveQueries = this._liveComponentQueries;
			if ( query = liveQueries[ selector ] ) {
				return options && options.live ? query : query.slice();
			}
			query = makeQuery( this, selector, !! options.live, true );
			if ( query.live ) {
				liveQueries.push( selector );
				liveQueries[ '_' + selector ] = query;
			}
			this.fragment.findAllComponents( selector, query );
			return query;
		};
	}( Ractive_prototype_shared_makeQuery__makeQuery );

	var Ractive_prototype_findComponent = function( selector ) {
		return this.fragment.findComponent( selector );
	};

	var Ractive_prototype_fire = function( eventName ) {
		var args, i, len, subscribers = this._subs[ eventName ];
		if ( !subscribers ) {
			return;
		}
		args = Array.prototype.slice.call( arguments, 1 );
		for ( i = 0, len = subscribers.length; i < len; i += 1 ) {
			subscribers[ i ].apply( this, args );
		}
	};

	var shared_get_UnresolvedImplicitDependency = function( circular, removeFromArray, runloop, notifyDependants ) {

		var get, empty = {};
		circular.push( function() {
			get = circular.get;
		} );
		var UnresolvedImplicitDependency = function( ractive, keypath ) {
			this.root = ractive;
			this.ref = keypath;
			this.parentFragment = empty;
			ractive._unresolvedImplicitDependencies[ keypath ] = true;
			ractive._unresolvedImplicitDependencies.push( this );
			runloop.addUnresolved( this );
		};
		UnresolvedImplicitDependency.prototype = {
			resolve: function() {
				var ractive = this.root;
				notifyDependants( ractive, this.ref );
				ractive._unresolvedImplicitDependencies[ this.ref ] = false;
				removeFromArray( ractive._unresolvedImplicitDependencies, this );
			},
			teardown: function() {
				runloop.removeUnresolved( this );
			}
		};
		return UnresolvedImplicitDependency;
	}( circular, utils_removeFromArray, global_runloop, shared_notifyDependants );

	var Ractive_prototype_get = function( normaliseKeypath, get, UnresolvedImplicitDependency ) {

		var options = {
			isTopLevel: true
		};
		return function Ractive_prototype_get( keypath ) {
			var value;
			keypath = normaliseKeypath( keypath );
			value = get( this, keypath, options );
			if ( this._captured && this._captured[ keypath ] !== true ) {
				this._captured.push( keypath );
				this._captured[ keypath ] = true;
				if ( value === undefined && this._unresolvedImplicitDependencies[ keypath ] !== true ) {
					new UnresolvedImplicitDependency( this, keypath );
				}
			}
			return value;
		};
	}( utils_normaliseKeypath, shared_get__get, shared_get_UnresolvedImplicitDependency );

	var utils_getElement = function getElement( input ) {
		var output;
		if ( !input || typeof input === 'boolean' ) {
			return;
		}
		if ( typeof window === 'undefined' || !document || !input ) {
			return null;
		}
		if ( input.nodeType ) {
			return input;
		}
		if ( typeof input === 'string' ) {
			output = document.getElementById( input );
			if ( !output && document.querySelector ) {
				output = document.querySelector( input );
			}
			if ( output && output.nodeType ) {
				return output;
			}
		}
		if ( input[ 0 ] && input[ 0 ].nodeType ) {
			return input[ 0 ];
		}
		return null;
	};

	var Ractive_prototype_insert = function( getElement ) {

		return function( target, anchor ) {
			target = getElement( target );
			anchor = getElement( anchor ) || null;
			if ( !target ) {
				throw new Error( 'You must specify a valid target to insert into' );
			}
			target.insertBefore( this.detach(), anchor );
			this.fragment.pNode = this.el = target;
		};
	}( utils_getElement );

	var Ractive_prototype_merge_mapOldToNewIndex = function( oldArray, newArray ) {
		var usedIndices, firstUnusedIndex, newIndices, changed;
		usedIndices = {};
		firstUnusedIndex = 0;
		newIndices = oldArray.map( function( item, i ) {
			var index, start, len;
			start = firstUnusedIndex;
			len = newArray.length;
			do {
				index = newArray.indexOf( item, start );
				if ( index === -1 ) {
					changed = true;
					return -1;
				}
				start = index + 1;
			} while ( usedIndices[ index ] && start < len );
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}
			if ( index !== i ) {
				changed = true;
			}
			usedIndices[ index ] = true;
			return index;
		} );
		newIndices.unchanged = !changed;
		return newIndices;
	};

	var Ractive_prototype_merge_propagateChanges = function( types, notifyDependants ) {

		return function( ractive, keypath, newIndices, lengthUnchanged ) {
			var updateDependant;
			ractive._changes.push( keypath );
			updateDependant = function( dependant ) {
				if ( dependant.type === types.REFERENCE ) {
					dependant.update();
				} else if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.docFrag ) {
					dependant.merge( newIndices );
				} else {
					dependant.update();
				}
			};
			ractive._deps.forEach( function( depsByKeypath ) {
				var dependants = depsByKeypath[ keypath ];
				if ( dependants ) {
					dependants.forEach( updateDependant );
				}
			} );
			if ( !lengthUnchanged ) {
				notifyDependants( ractive, keypath + '.length', true );
			}
		};
	}( config_types, shared_notifyDependants );

	var Ractive_prototype_merge__merge = function( runloop, warn, isArray, Promise, set, mapOldToNewIndex, propagateChanges ) {

		var comparators = {};
		return function merge( keypath, array, options ) {
			var currentArray, oldArray, newArray, comparator, lengthUnchanged, newIndices, promise, fulfilPromise;
			currentArray = this.get( keypath );
			if ( !isArray( currentArray ) || !isArray( array ) ) {
				return this.set( keypath, array, options && options.complete );
			}
			lengthUnchanged = currentArray.length === array.length;
			if ( options && options.compare ) {
				comparator = getComparatorFunction( options.compare );
				try {
					oldArray = currentArray.map( comparator );
					newArray = array.map( comparator );
				} catch ( err ) {
					if ( this.debug ) {
						throw err;
					} else {
						warn( 'Merge operation: comparison failed. Falling back to identity checking' );
					}
					oldArray = currentArray;
					newArray = array;
				}
			} else {
				oldArray = currentArray;
				newArray = array;
			}
			newIndices = mapOldToNewIndex( oldArray, newArray );
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			set( this, keypath, array, true );
			propagateChanges( this, keypath, newIndices, lengthUnchanged );
			runloop.end();
			if ( options && options.complete ) {
				promise.then( options.complete );
			}
			return promise;
		};

		function stringify( item ) {
			return JSON.stringify( item );
		}

		function getComparatorFunction( comparator ) {
			if ( comparator === true ) {
				return stringify;
			}
			if ( typeof comparator === 'string' ) {
				if ( !comparators[ comparator ] ) {
					comparators[ comparator ] = function( item ) {
						return item[ comparator ];
					};
				}
				return comparators[ comparator ];
			}
			if ( typeof comparator === 'function' ) {
				return comparator;
			}
			throw new Error( 'The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)' );
		}
	}( global_runloop, utils_warn, utils_isArray, utils_Promise, shared_set, Ractive_prototype_merge_mapOldToNewIndex, Ractive_prototype_merge_propagateChanges );

	var Ractive_prototype_observe_Observer = function( runloop, isEqual, get ) {

		var Observer = function( ractive, keypath, callback, options ) {
			var self = this;
			this.root = ractive;
			this.keypath = keypath;
			this.callback = callback;
			this.defer = options.defer;
			this.debug = options.debug;
			this.proxy = {
				update: function() {
					self.reallyUpdate();
				}
			};
			this.priority = 0;
			this.context = options && options.context ? options.context : ractive;
		};
		Observer.prototype = {
			init: function( immediate ) {
				if ( immediate !== false ) {
					this.update();
				} else {
					this.value = get( this.root, this.keypath );
				}
			},
			update: function() {
				if ( this.defer && this.ready ) {
					runloop.addObserver( this.proxy );
					return;
				}
				this.reallyUpdate();
			},
			reallyUpdate: function() {
				var oldValue, newValue;
				oldValue = this.value;
				newValue = get( this.root, this.keypath );
				this.value = newValue;
				if ( this.updating ) {
					return;
				}
				this.updating = true;
				if ( !isEqual( newValue, oldValue ) || !this.ready ) {
					try {
						this.callback.call( this.context, newValue, oldValue, this.keypath );
					} catch ( err ) {
						if ( this.debug || this.root.debug ) {
							throw err;
						}
					}
				}
				this.updating = false;
			}
		};
		return Observer;
	}( global_runloop, utils_isEqual, shared_get__get );

	var Ractive_prototype_observe_getPattern = function( isArray ) {

		return function( ractive, pattern ) {
			var keys, key, values, toGet, newToGet, expand, concatenate;
			keys = pattern.split( '.' );
			toGet = [ '' ];
			expand = function( keypath ) {
				var value, key, childKeypath;
				value = ractive._wrapped[ keypath ] ? ractive._wrapped[ keypath ].get() : ractive.get( keypath );
				for ( key in value ) {
					if ( value.hasOwnProperty( key ) && ( key !== '_ractive' || !isArray( value ) ) ) {
						childKeypath = keypath ? keypath + '.' + key : key;
						newToGet.push( childKeypath );
					}
				}
			};
			concatenate = function( keypath ) {
				return keypath + '.' + key;
			};
			while ( key = keys.shift() ) {
				if ( key === '*' ) {
					newToGet = [];
					toGet.forEach( expand );
					toGet = newToGet;
				} else {
					if ( !toGet[ 0 ] ) {
						toGet[ 0 ] = key;
					} else {
						toGet = toGet.map( concatenate );
					}
				}
			}
			values = {};
			toGet.forEach( function( keypath ) {
				values[ keypath ] = ractive.get( keypath );
			} );
			return values;
		};
	}( utils_isArray );

	var Ractive_prototype_observe_PatternObserver = function( runloop, isEqual, get, getPattern ) {

		var PatternObserver, wildcard = /\*/;
		PatternObserver = function( ractive, keypath, callback, options ) {
			this.root = ractive;
			this.callback = callback;
			this.defer = options.defer;
			this.debug = options.debug;
			this.keypath = keypath;
			this.regex = new RegExp( '^' + keypath.replace( /\./g, '\\.' ).replace( /\*/g, '[^\\.]+' ) + '$' );
			this.values = {};
			if ( this.defer ) {
				this.proxies = [];
			}
			this.priority = 'pattern';
			this.context = options && options.context ? options.context : ractive;
		};
		PatternObserver.prototype = {
			init: function( immediate ) {
				var values, keypath;
				values = getPattern( this.root, this.keypath );
				if ( immediate !== false ) {
					for ( keypath in values ) {
						if ( values.hasOwnProperty( keypath ) ) {
							this.update( keypath );
						}
					}
				} else {
					this.values = values;
				}
			},
			update: function( keypath ) {
				var values;
				if ( wildcard.test( keypath ) ) {
					values = getPattern( this.root, keypath );
					for ( keypath in values ) {
						if ( values.hasOwnProperty( keypath ) ) {
							this.update( keypath );
						}
					}
					return;
				}
				if ( this.defer && this.ready ) {
					runloop.addObserver( this.getProxy( keypath ) );
					return;
				}
				this.reallyUpdate( keypath );
			},
			reallyUpdate: function( keypath ) {
				var value = get( this.root, keypath );
				if ( this.updating ) {
					this.values[ keypath ] = value;
					return;
				}
				this.updating = true;
				if ( !isEqual( value, this.values[ keypath ] ) || !this.ready ) {
					try {
						this.callback.call( this.context, value, this.values[ keypath ], keypath );
					} catch ( err ) {
						if ( this.debug || this.root.debug ) {
							throw err;
						}
					}
					this.values[ keypath ] = value;
				}
				this.updating = false;
			},
			getProxy: function( keypath ) {
				var self = this;
				if ( !this.proxies[ keypath ] ) {
					this.proxies[ keypath ] = {
						update: function() {
							self.reallyUpdate( keypath );
						}
					};
				}
				return this.proxies[ keypath ];
			}
		};
		return PatternObserver;
	}( global_runloop, utils_isEqual, shared_get__get, Ractive_prototype_observe_getPattern );

	var Ractive_prototype_observe_getObserverFacade = function( normaliseKeypath, registerDependant, unregisterDependant, Observer, PatternObserver ) {

		var wildcard = /\*/,
			emptyObject = {};
		return function getObserverFacade( ractive, keypath, callback, options ) {
			var observer, isPatternObserver;
			keypath = normaliseKeypath( keypath );
			options = options || emptyObject;
			if ( wildcard.test( keypath ) ) {
				observer = new PatternObserver( ractive, keypath, callback, options );
				ractive._patternObservers.push( observer );
				isPatternObserver = true;
			} else {
				observer = new Observer( ractive, keypath, callback, options );
			}
			registerDependant( observer );
			observer.init( options.init );
			observer.ready = true;
			return {
				cancel: function() {
					var index;
					if ( isPatternObserver ) {
						index = ractive._patternObservers.indexOf( observer );
						if ( index !== -1 ) {
							ractive._patternObservers.splice( index, 1 );
						}
					}
					unregisterDependant( observer );
				}
			};
		};
	}( utils_normaliseKeypath, shared_registerDependant, shared_unregisterDependant, Ractive_prototype_observe_Observer, Ractive_prototype_observe_PatternObserver );

	var Ractive_prototype_observe__observe = function( isObject, getObserverFacade ) {

		return function observe( keypath, callback, options ) {
			var observers, map, keypaths, i;
			if ( isObject( keypath ) ) {
				options = callback;
				map = keypath;
				observers = [];
				for ( keypath in map ) {
					if ( map.hasOwnProperty( keypath ) ) {
						callback = map[ keypath ];
						observers.push( this.observe( keypath, callback, options ) );
					}
				}
				return {
					cancel: function() {
						while ( observers.length ) {
							observers.pop().cancel();
						}
					}
				};
			}
			if ( typeof keypath === 'function' ) {
				options = callback;
				callback = keypath;
				keypath = '';
				return getObserverFacade( this, keypath, callback, options );
			}
			keypaths = keypath.split( ' ' );
			if ( keypaths.length === 1 ) {
				return getObserverFacade( this, keypath, callback, options );
			}
			observers = [];
			i = keypaths.length;
			while ( i-- ) {
				keypath = keypaths[ i ];
				if ( keypath ) {
					observers.push( getObserverFacade( this, keypath, callback, options ) );
				}
			}
			return {
				cancel: function() {
					while ( observers.length ) {
						observers.pop().cancel();
					}
				}
			};
		};
	}( utils_isObject, Ractive_prototype_observe_getObserverFacade );

	var Ractive_prototype_off = function( eventName, callback ) {
		var subscribers, index;
		if ( !callback ) {
			if ( !eventName ) {
				for ( eventName in this._subs ) {
					delete this._subs[ eventName ];
				}
			} else {
				this._subs[ eventName ] = [];
			}
		}
		subscribers = this._subs[ eventName ];
		if ( subscribers ) {
			index = subscribers.indexOf( callback );
			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}
		}
	};

	var Ractive_prototype_on = function( eventName, callback ) {
		var self = this,
			listeners, n;
		if ( typeof eventName === 'object' ) {
			listeners = [];
			for ( n in eventName ) {
				if ( eventName.hasOwnProperty( n ) ) {
					listeners.push( this.on( n, eventName[ n ] ) );
				}
			}
			return {
				cancel: function() {
					var listener;
					while ( listener = listeners.pop() ) {
						listener.cancel();
					}
				}
			};
		}
		if ( !this._subs[ eventName ] ) {
			this._subs[ eventName ] = [ callback ];
		} else {
			this._subs[ eventName ].push( callback );
		}
		return {
			cancel: function() {
				self.off( eventName, callback );
			}
		};
	};

	var utils_create = function() {

		var create;
		try {
			Object.create( null );
			create = Object.create;
		} catch ( err ) {
			create = function() {
				var F = function() {};
				return function( proto, props ) {
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
			}();
		}
		return create;
	}();

	var render_shared_Fragment_initialise = function( types, create ) {

		return function initFragment( fragment, options ) {
			var numItems, i, parentFragment, parentRefs, ref;
			fragment.owner = options.owner;
			parentFragment = fragment.parent = fragment.owner.parentFragment;
			fragment.root = options.root;
			fragment.pNode = options.pNode;
			fragment.pElement = options.pElement;
			fragment.context = options.context;
			if ( fragment.owner.type === types.SECTION ) {
				fragment.index = options.index;
			}
			if ( parentFragment ) {
				parentRefs = parentFragment.indexRefs;
				if ( parentRefs ) {
					fragment.indexRefs = create( null );
					for ( ref in parentRefs ) {
						fragment.indexRefs[ ref ] = parentRefs[ ref ];
					}
				}
			}
			fragment.priority = parentFragment ? parentFragment.priority + 1 : 1;
			if ( options.indexRef ) {
				if ( !fragment.indexRefs ) {
					fragment.indexRefs = {};
				}
				fragment.indexRefs[ options.indexRef ] = options.index;
			}
			fragment.items = [];
			numItems = options.descriptor ? options.descriptor.length : 0;
			for ( i = 0; i < numItems; i += 1 ) {
				fragment.items[ fragment.items.length ] = fragment.createItem( {
					parentFragment: fragment,
					pElement: options.pElement,
					descriptor: options.descriptor[ i ],
					index: i
				} );
			}
		};
	}( config_types, utils_create );

	var render_shared_utils_startsWithKeypath = function startsWithKeypath( target, keypath ) {
		return target.substr( 0, keypath.length + 1 ) === keypath + '.';
	};

	var render_shared_utils_startsWith = function( startsWithKeypath ) {

		return function startsWith( target, keypath ) {
			return target === keypath || startsWithKeypath( target, keypath );
		};
	}( render_shared_utils_startsWithKeypath );

	var render_shared_utils_getNewKeypath = function( startsWithKeypath ) {

		return function getNewKeypath( targetKeypath, oldKeypath, newKeypath ) {
			if ( targetKeypath === oldKeypath ) {
				return newKeypath;
			}
			if ( startsWithKeypath( targetKeypath, oldKeypath ) ) {
				return targetKeypath.replace( oldKeypath + '.', newKeypath + '.' );
			}
		};
	}( render_shared_utils_startsWithKeypath );

	var render_shared_utils_assignNewKeypath = function( startsWith, getNewKeypath ) {

		return function assignNewKeypath( target, property, oldKeypath, newKeypath ) {
			if ( !target[ property ] || startsWith( target[ property ], newKeypath ) ) {
				return;
			}
			target[ property ] = getNewKeypath( target[ property ], oldKeypath, newKeypath );
		};
	}( render_shared_utils_startsWith, render_shared_utils_getNewKeypath );

	var render_shared_Fragment_reassign = function( assignNewKeypath ) {

		return function reassignFragment( indexRef, newIndex, oldKeypath, newKeypath ) {
			assignNewKeypath( this, 'context', oldKeypath, newKeypath );
			if ( this.indexRefs && this.indexRefs[ indexRef ] !== undefined && this.indexRefs[ indexRef ] !== newIndex ) {
				this.indexRefs[ indexRef ] = newIndex;
			}
			this.items.forEach( function( item ) {
				item.reassign( indexRef, newIndex, oldKeypath, newKeypath );
			} );
		};
	}( render_shared_utils_assignNewKeypath );

	var render_shared_Fragment__Fragment = function( init, reassign ) {

		return {
			init: init,
			reassign: reassign
		};
	}( render_shared_Fragment_initialise, render_shared_Fragment_reassign );

	var render_DomFragment_shared_detach = function() {
		var node = this.node,
			parentNode;
		if ( node && ( parentNode = node.parentNode ) ) {
			parentNode.removeChild( node );
			return node;
		}
	};

	var render_DomFragment_Text = function( types, detach ) {

		var DomText, lessThan, greaterThan;
		lessThan = /</g;
		greaterThan = />/g;
		DomText = function( options, docFrag ) {
			this.type = types.TEXT;
			this.descriptor = options.descriptor;
			if ( docFrag ) {
				this.node = document.createTextNode( options.descriptor );
				docFrag.appendChild( this.node );
			}
		};
		DomText.prototype = {
			detach: detach,
			reassign: function() {},
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
				}
			},
			firstNode: function() {
				return this.node;
			},
			toString: function() {
				return ( '' + this.descriptor ).replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
			}
		};
		return DomText;
	}( config_types, render_DomFragment_shared_detach );

	var shared_teardown = function( runloop, unregisterDependant ) {

		return function( thing ) {
			if ( !thing.keypath ) {
				runloop.removeUnresolved( thing );
			} else {
				unregisterDependant( thing );
			}
		};
	}( global_runloop, shared_unregisterDependant );

	var shared_Unresolved = function( runloop ) {

		var Unresolved = function( ractive, ref, parentFragment, callback ) {
			this.root = ractive;
			this.ref = ref;
			this.parentFragment = parentFragment;
			this.resolve = callback;
			runloop.addUnresolved( this );
		};
		Unresolved.prototype = {
			teardown: function() {
				runloop.removeUnresolved( this );
			}
		};
		return Unresolved;
	}( global_runloop );

	var render_shared_Evaluator_Reference = function( types, isEqual, defineProperty, registerDependant, unregisterDependant ) {

		var Reference, thisPattern;
		thisPattern = /this/;
		Reference = function( root, keypath, evaluator, argNum, priority ) {
			var value;
			this.evaluator = evaluator;
			this.keypath = keypath;
			this.root = root;
			this.argNum = argNum;
			this.type = types.REFERENCE;
			this.priority = priority;
			value = root.get( keypath );
			if ( typeof value === 'function' && !value._nowrap ) {
				value = wrapFunction( value, root, evaluator );
			}
			this.value = evaluator.values[ argNum ] = value;
			registerDependant( this );
		};
		Reference.prototype = {
			update: function() {
				var value = this.root.get( this.keypath );
				if ( typeof value === 'function' && !value._nowrap ) {
					value = wrapFunction( value, this.root, this.evaluator );
				}
				if ( !isEqual( value, this.value ) ) {
					this.evaluator.values[ this.argNum ] = value;
					this.evaluator.bubble();
					this.value = value;
				}
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return Reference;

		function wrapFunction( fn, ractive, evaluator ) {
			var prop, evaluators, index;
			if ( !thisPattern.test( fn.toString() ) ) {
				defineProperty( fn, '_nowrap', {
					value: true
				} );
				return fn;
			}
			if ( !fn[ '_' + ractive._guid ] ) {
				defineProperty( fn, '_' + ractive._guid, {
					value: function() {
						var originalCaptured, result, i, evaluator;
						originalCaptured = ractive._captured;
						if ( !originalCaptured ) {
							ractive._captured = [];
						}
						result = fn.apply( ractive, arguments );
						if ( ractive._captured.length ) {
							i = evaluators.length;
							while ( i-- ) {
								evaluator = evaluators[ i ];
								evaluator.updateSoftDependencies( ractive._captured );
							}
						}
						ractive._captured = originalCaptured;
						return result;
					},
					writable: true
				} );
				for ( prop in fn ) {
					if ( fn.hasOwnProperty( prop ) ) {
						fn[ '_' + ractive._guid ][ prop ] = fn[ prop ];
					}
				}
				fn[ '_' + ractive._guid + '_evaluators' ] = [];
			}
			evaluators = fn[ '_' + ractive._guid + '_evaluators' ];
			index = evaluators.indexOf( evaluator );
			if ( index === -1 ) {
				evaluators.push( evaluator );
			}
			return fn[ '_' + ractive._guid ];
		}
	}( config_types, utils_isEqual, utils_defineProperty, shared_registerDependant, shared_unregisterDependant );

	var render_shared_Evaluator_SoftReference = function( isEqual, registerDependant, unregisterDependant ) {

		var SoftReference = function( root, keypath, evaluator ) {
			this.root = root;
			this.keypath = keypath;
			this.priority = evaluator.priority;
			this.evaluator = evaluator;
			registerDependant( this );
		};
		SoftReference.prototype = {
			update: function() {
				var value = this.root.get( this.keypath );
				if ( !isEqual( value, this.value ) ) {
					this.evaluator.bubble();
					this.value = value;
				}
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return SoftReference;
	}( utils_isEqual, shared_registerDependant, shared_unregisterDependant );

	var render_shared_Evaluator__Evaluator = function( runloop, warn, isEqual, clearCache, notifyDependants, adaptIfNecessary, Reference, SoftReference ) {

		var Evaluator, cache = {};
		Evaluator = function( root, keypath, uniqueString, functionStr, args, priority ) {
			var evaluator = this;
			evaluator.root = root;
			evaluator.uniqueString = uniqueString;
			evaluator.keypath = keypath;
			evaluator.priority = priority;
			evaluator.fn = getFunctionFromString( functionStr, args.length );
			evaluator.values = [];
			evaluator.refs = [];
			args.forEach( function( arg, i ) {
				if ( !arg ) {
					return;
				}
				if ( arg.indexRef ) {
					evaluator.values[ i ] = arg.value;
				} else {
					evaluator.refs.push( new Reference( root, arg.keypath, evaluator, i, priority ) );
				}
			} );
			evaluator.selfUpdating = evaluator.refs.length <= 1;
		};
		Evaluator.prototype = {
			bubble: function() {
				if ( this.selfUpdating ) {
					this.update();
				} else if ( !this.deferred ) {
					runloop.addEvaluator( this );
					this.deferred = true;
				}
			},
			update: function() {
				var value;
				if ( this.evaluating ) {
					return this;
				}
				this.evaluating = true;
				try {
					value = this.fn.apply( null, this.values );
				} catch ( err ) {
					if ( this.root.debug ) {
						warn( 'Error evaluating "' + this.uniqueString + '": ' + err.message || err );
					}
					value = undefined;
				}
				if ( !isEqual( value, this.value ) ) {
					this.value = value;
					clearCache( this.root, this.keypath );
					adaptIfNecessary( this.root, this.keypath, value, true );
					notifyDependants( this.root, this.keypath );
				}
				this.evaluating = false;
				return this;
			},
			teardown: function() {
				while ( this.refs.length ) {
					this.refs.pop().teardown();
				}
				clearCache( this.root, this.keypath );
				this.root._evaluators[ this.keypath ] = null;
			},
			refresh: function() {
				if ( !this.selfUpdating ) {
					this.deferred = true;
				}
				var i = this.refs.length;
				while ( i-- ) {
					this.refs[ i ].update();
				}
				if ( this.deferred ) {
					this.update();
					this.deferred = false;
				}
			},
			updateSoftDependencies: function( softDeps ) {
				var i, keypath, ref;
				if ( !this.softRefs ) {
					this.softRefs = [];
				}
				i = this.softRefs.length;
				while ( i-- ) {
					ref = this.softRefs[ i ];
					if ( !softDeps[ ref.keypath ] ) {
						this.softRefs.splice( i, 1 );
						this.softRefs[ ref.keypath ] = false;
						ref.teardown();
					}
				}
				i = softDeps.length;
				while ( i-- ) {
					keypath = softDeps[ i ];
					if ( !this.softRefs[ keypath ] ) {
						ref = new SoftReference( this.root, keypath, this );
						this.softRefs.push( ref );
						this.softRefs[ keypath ] = true;
					}
				}
				this.selfUpdating = this.refs.length + this.softRefs.length <= 1;
			}
		};
		return Evaluator;

		function getFunctionFromString( str, i ) {
			var fn, args;
			str = str.replace( /\$\{([0-9]+)\}/g, '_$1' );
			if ( cache[ str ] ) {
				return cache[ str ];
			}
			args = [];
			while ( i-- ) {
				args[ i ] = '_' + i;
			}
			fn = new Function( args.join( ',' ), 'return(' + str + ')' );
			cache[ str ] = fn;
			return fn;
		}
	}( global_runloop, utils_warn, utils_isEqual, shared_clearCache, shared_notifyDependants, shared_adaptIfNecessary, render_shared_Evaluator_Reference, render_shared_Evaluator_SoftReference );

	var render_shared_Resolvers_ExpressionResolver = function( removeFromArray, resolveRef, Unresolved, Evaluator, getNewKeypath ) {

		var ExpressionResolver = function( owner, parentFragment, expression, callback ) {
			var expressionResolver = this,
				ractive, indexRefs, args;
			ractive = owner.root;
			this.root = ractive;
			this.callback = callback;
			this.owner = owner;
			this.str = expression.s;
			this.args = args = [];
			this.unresolved = [];
			this.pending = 0;
			indexRefs = parentFragment.indexRefs;
			if ( !expression.r || !expression.r.length ) {
				this.resolved = this.ready = true;
				this.bubble();
				return;
			}
			expression.r.forEach( function( reference, i ) {
				var index, keypath, unresolved;
				if ( indexRefs && ( index = indexRefs[ reference ] ) !== undefined ) {
					args[ i ] = {
						indexRef: reference,
						value: index
					};
					return;
				}
				if ( keypath = resolveRef( ractive, reference, parentFragment ) ) {
					args[ i ] = {
						keypath: keypath
					};
					return;
				}
				args[ i ] = null;
				expressionResolver.pending += 1;
				unresolved = new Unresolved( ractive, reference, parentFragment, function( keypath ) {
					expressionResolver.resolve( i, keypath );
					removeFromArray( expressionResolver.unresolved, unresolved );
				} );
				expressionResolver.unresolved.push( unresolved );
			} );
			this.ready = true;
			this.bubble();
		};
		ExpressionResolver.prototype = {
			bubble: function() {
				if ( !this.ready ) {
					return;
				}
				this.uniqueString = getUniqueString( this.str, this.args );
				this.keypath = getKeypath( this.uniqueString );
				this.createEvaluator();
				this.callback( this.keypath );
			},
			teardown: function() {
				var unresolved;
				while ( unresolved = this.unresolved.pop() ) {
					unresolved.teardown();
				}
			},
			resolve: function( index, keypath ) {
				this.args[ index ] = {
					keypath: keypath
				};
				this.bubble();
				this.resolved = !--this.pending;
			},
			createEvaluator: function() {
				var evaluator;
				if ( !this.root._evaluators[ this.keypath ] ) {
					evaluator = new Evaluator( this.root, this.keypath, this.uniqueString, this.str, this.args, this.owner.priority );
					this.root._evaluators[ this.keypath ] = evaluator;
					evaluator.update();
				} else {
					this.root._evaluators[ this.keypath ].refresh();
				}
			},
			reassign: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				var changed;
				this.args.forEach( function( arg ) {
					var changedKeypath;
					if ( !arg )
						return;
					if ( arg.keypath && ( changedKeypath = getNewKeypath( arg.keypath, oldKeypath, newKeypath ) ) ) {
						arg.keypath = changedKeypath;
						changed = true;
					} else if ( arg.indexRef === indexRef ) {
						arg.value = newIndex;
						changed = true;
					}
				} );
				if ( changed ) {
					this.bubble();
				}
			}
		};
		return ExpressionResolver;

		function getUniqueString( str, args ) {
			return str.replace( /\$\{([0-9]+)\}/g, function( match, $1 ) {
				return args[ $1 ] ? args[ $1 ].value || args[ $1 ].keypath : 'undefined';
			} );
		}

		function getKeypath( uniqueString ) {
			return '${' + uniqueString.replace( /[\.\[\]]/g, '-' ) + '}';
		}
	}( utils_removeFromArray, shared_resolveRef, shared_Unresolved, render_shared_Evaluator__Evaluator, render_shared_utils_getNewKeypath );

	var render_shared_Resolvers_KeypathExpressionResolver = function( types, removeFromArray, resolveRef, Unresolved, registerDependant, unregisterDependant, ExpressionResolver ) {

		var KeypathExpressionResolver = function( mustache, descriptor, callback ) {
			var resolver = this,
				ractive, parentFragment, keypath, dynamic, members;
			ractive = mustache.root;
			parentFragment = mustache.parentFragment;
			this.ref = descriptor.r;
			this.root = mustache.root;
			this.mustache = mustache;
			this.callback = callback;
			this.pending = 0;
			this.unresolved = [];
			members = this.members = [];
			this.indexRefMembers = [];
			this.keypathObservers = [];
			this.expressionResolvers = [];
			descriptor.m.forEach( function( member, i ) {
				var ref, indexRefs, index, keypathObserver, unresolved, expressionResolver;
				if ( typeof member === 'string' ) {
					resolver.members[ i ] = member;
					return;
				}
				if ( member.t === types.REFERENCE ) {
					ref = member.n;
					indexRefs = parentFragment.indexRefs;
					if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
						members[ i ] = index;
						resolver.indexRefMembers.push( {
							ref: ref,
							index: i
						} );
						return;
					}
					dynamic = true;
					if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
						keypathObserver = new KeypathObserver( ractive, keypath, mustache.priority, resolver, i );
						resolver.keypathObservers.push( keypathObserver );
						return;
					}
					members[ i ] = undefined;
					resolver.pending += 1;
					unresolved = new Unresolved( ractive, ref, parentFragment, function( keypath ) {
						resolver.resolve( i, keypath );
						removeFromArray( resolver.unresolved, unresolved );
					} );
					resolver.unresolved.push( unresolved );
					return null;
				}
				dynamic = true;
				resolver.pending += 1;
				expressionResolver = new ExpressionResolver( resolver, parentFragment, member, function( keypath ) {
					resolver.resolve( i, keypath );
					removeFromArray( resolver.unresolved, expressionResolver );
				} );
				resolver.unresolved.push( expressionResolver );
			} );
			if ( !dynamic ) {
				keypath = this.getKeypath();
				callback( keypath );
				return;
			}
			this.ready = true;
			this.bubble();
		};
		KeypathExpressionResolver.prototype = {
			getKeypath: function() {
				return this.ref + '.' + this.members.join( '.' );
			},
			bubble: function() {
				if ( !this.ready || this.pending ) {
					return;
				}
				this.callback( this.getKeypath() );
			},
			resolve: function( index, keypath ) {
				var keypathObserver = new KeypathObserver( this.root, keypath, this.mustache.priority, this, index );
				keypathObserver.update();
				this.keypathObservers.push( keypathObserver );
				this.resolved = !--this.pending;
				this.bubble();
			},
			teardown: function() {
				var unresolved;
				while ( unresolved = this.unresolved.pop() ) {
					unresolved.teardown();
				}
			},
			reassign: function( indexRef, newIndex ) {
				var changed, i, member;
				i = this.indexRefMembers.length;
				while ( i-- ) {
					member = this.indexRefMembers[ i ];
					if ( member.ref === indexRef ) {
						changed = true;
						this.members[ member.index ] = newIndex;
					}
				}
				if ( changed ) {
					this.bubble();
				}
			}
		};
		var KeypathObserver = function( ractive, keypath, priority, resolver, index ) {
			this.root = ractive;
			this.keypath = keypath;
			this.priority = priority;
			this.resolver = resolver;
			this.index = index;
			registerDependant( this );
			this.update();
		};
		KeypathObserver.prototype = {
			update: function() {
				var resolver = this.resolver;
				resolver.members[ this.index ] = this.root.get( this.keypath );
				resolver.bubble();
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return KeypathExpressionResolver;
	}( config_types, utils_removeFromArray, shared_resolveRef, shared_Unresolved, shared_registerDependant, shared_unregisterDependant, render_shared_Resolvers_ExpressionResolver );

	var render_shared_Mustache_initialise = function( runloop, resolveRef, KeypathExpressionResolver, ExpressionResolver ) {

		return function initMustache( mustache, options ) {
			var ref, indexRefs, index, parentFragment, descriptor;
			parentFragment = options.parentFragment;
			descriptor = options.descriptor;
			mustache.root = parentFragment.root;
			mustache.parentFragment = parentFragment;
			mustache.descriptor = options.descriptor;
			mustache.index = options.index || 0;
			mustache.priority = parentFragment.priority;
			mustache.type = options.descriptor.t;

			function resolve( keypath ) {
				mustache.resolve( keypath );
			}

			function resolveWithRef( ref ) {
				var keypath = resolveRef( mustache.root, ref, mustache.parentFragment );
				if ( keypath !== undefined ) {
					resolve( keypath );
				} else {
					mustache.ref = ref;
					runloop.addUnresolved( mustache );
				}
			}
			if ( ref = descriptor.r ) {
				indexRefs = parentFragment.indexRefs;
				if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
					mustache.indexRef = ref;
					mustache.value = index;
					mustache.render( mustache.value );
				} else {
					resolveWithRef( ref );
				}
			}
			if ( options.descriptor.x ) {
				mustache.resolver = new ExpressionResolver( mustache, parentFragment, options.descriptor.x, resolve );
			}
			if ( options.descriptor.kx ) {
				mustache.resolver = new KeypathExpressionResolver( mustache, options.descriptor.kx, resolveWithRef );
			}
			if ( mustache.descriptor.n && !mustache.hasOwnProperty( 'value' ) ) {
				mustache.render( undefined );
			}
		};
	}( global_runloop, shared_resolveRef, render_shared_Resolvers_KeypathExpressionResolver, render_shared_Resolvers_ExpressionResolver );

	var render_shared_Mustache_update = function( isEqual, get ) {

		var options = {
			evaluateWrapped: true
		};
		return function updateMustache() {
			var value = get( this.root, this.keypath, options );
			if ( !isEqual( value, this.value ) ) {
				this.render( value );
				this.value = value;
			}
		};
	}( utils_isEqual, shared_get__get );

	var render_shared_Mustache_resolve = function( types, registerDependant, unregisterDependant ) {

		return function resolveMustache( keypath ) {
			var reassignTarget;
			if ( keypath === this.keypath ) {
				return;
			}
			if ( this.registered ) {
				unregisterDependant( this );
				if ( this.parentFragment && this.parentFragment.owner && this.parentFragment.owner.element ) {
					reassignTarget = this.parentFragment.owner.element;
				} else {
					reassignTarget = this;
				}
				reassignTarget.reassign( null, null, this.keypath, keypath );
				if ( keypath === this.keypath ) {
					return;
				}
			}
			this.keypath = keypath;
			registerDependant( this );
			this.update();
		};
	}( config_types, shared_registerDependant, shared_unregisterDependant );

	var render_shared_Mustache_reassign = function( getNewKeypath ) {

		return function reassignMustache( indexRef, newIndex, oldKeypath, newKeypath ) {
			var updated, i;
			if ( this.resolver ) {
				this.resolver.reassign( indexRef, newIndex, oldKeypath, newKeypath );
			}
			if ( this.keypath ) {
				updated = getNewKeypath( this.keypath, oldKeypath, newKeypath );
				if ( updated ) {
					this.resolve( updated );
				}
			} else if ( indexRef !== undefined && this.indexRef === indexRef ) {
				this.value = newIndex;
				this.render( newIndex );
			}
			if ( this.fragments ) {
				i = this.fragments.length;
				while ( i-- ) {
					this.fragments[ i ].reassign( indexRef, newIndex, oldKeypath, newKeypath );
				}
			}
		};
	}( render_shared_utils_getNewKeypath );

	var render_shared_Mustache__Mustache = function( init, update, resolve, reassign ) {

		return {
			init: init,
			update: update,
			resolve: resolve,
			reassign: reassign
		};
	}( render_shared_Mustache_initialise, render_shared_Mustache_update, render_shared_Mustache_resolve, render_shared_Mustache_reassign );

	var render_DomFragment_Interpolator = function( types, teardown, Mustache, detach ) {

		var DomInterpolator, lessThan, greaterThan;
		lessThan = /</g;
		greaterThan = />/g;
		DomInterpolator = function( options, docFrag ) {
			this.type = types.INTERPOLATOR;
			if ( docFrag ) {
				this.node = document.createTextNode( '' );
				docFrag.appendChild( this.node );
			}
			Mustache.init( this, options );
		};
		DomInterpolator.prototype = {
			update: Mustache.update,
			resolve: Mustache.resolve,
			reassign: Mustache.reassign,
			detach: detach,
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
				}
				teardown( this );
			},
			render: function( value ) {
				if ( this.node ) {
					this.node.data = value == undefined ? '' : value;
				}
			},
			firstNode: function() {
				return this.node;
			},
			toString: function() {
				var value = this.value != undefined ? '' + this.value : '';
				return value.replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
			}
		};
		return DomInterpolator;
	}( config_types, shared_teardown, render_shared_Mustache__Mustache, render_DomFragment_shared_detach );

	var render_DomFragment_Section_prototype_merge = function sectionMerge( newIndices ) {
		var section = this,
			parentFragment, firstChange, i, newLength, reassignedFragments, fragmentOptions, fragment, nextNode;
		parentFragment = this.parentFragment;
		reassignedFragments = [];
		newIndices.forEach( function reassignIfNecessary( newIndex, oldIndex ) {
			var fragment, by, oldKeypath, newKeypath;
			if ( newIndex === oldIndex ) {
				reassignedFragments[ newIndex ] = section.fragments[ oldIndex ];
				return;
			}
			if ( firstChange === undefined ) {
				firstChange = oldIndex;
			}
			if ( newIndex === -1 ) {
				section.fragments[ oldIndex ].teardown( true );
				return;
			}
			fragment = section.fragments[ oldIndex ];
			by = newIndex - oldIndex;
			oldKeypath = section.keypath + '.' + oldIndex;
			newKeypath = section.keypath + '.' + newIndex;
			fragment.reassign( section.descriptor.i, newIndex, oldKeypath, newKeypath );
			reassignedFragments[ newIndex ] = fragment;
		} );
		if ( firstChange === undefined ) {
			firstChange = this.length;
		}
		this.length = newLength = this.root.get( this.keypath ).length;
		if ( newLength === firstChange ) {
			return;
		}
		fragmentOptions = {
			descriptor: this.descriptor.f,
			root: this.root,
			pNode: parentFragment.pNode,
			owner: this
		};
		if ( this.descriptor.i ) {
			fragmentOptions.indexRef = this.descriptor.i;
		}
		for ( i = firstChange; i < newLength; i += 1 ) {
			if ( fragment = reassignedFragments[ i ] ) {
				this.docFrag.appendChild( fragment.detach( false ) );
			} else {
				fragmentOptions.context = this.keypath + '.' + i;
				fragmentOptions.index = i;
				fragment = this.createFragment( fragmentOptions );
			}
			this.fragments[ i ] = fragment;
		}
		nextNode = parentFragment.findNextNode( this );
		parentFragment.pNode.insertBefore( this.docFrag, nextNode );
	};

	var render_shared_updateSection = function( isArray, isObject ) {

		return function updateSection( section, value ) {
			var fragmentOptions = {
				descriptor: section.descriptor.f,
				root: section.root,
				pNode: section.parentFragment.pNode,
				pElement: section.parentFragment.pElement,
				owner: section
			};
			if ( section.descriptor.n ) {
				updateConditionalSection( section, value, true, fragmentOptions );
				return;
			}
			if ( isArray( value ) ) {
				updateListSection( section, value, fragmentOptions );
			} else if ( isObject( value ) || typeof value === 'function' ) {
				if ( section.descriptor.i ) {
					updateListObjectSection( section, value, fragmentOptions );
				} else {
					updateContextSection( section, fragmentOptions );
				}
			} else {
				updateConditionalSection( section, value, false, fragmentOptions );
			}
		};

		function updateListSection( section, value, fragmentOptions ) {
			var i, length, fragmentsToRemove;
			length = value.length;
			if ( length < section.length ) {
				fragmentsToRemove = section.fragments.splice( length, section.length - length );
				while ( fragmentsToRemove.length ) {
					fragmentsToRemove.pop().teardown( true );
				}
			} else {
				if ( length > section.length ) {
					for ( i = section.length; i < length; i += 1 ) {
						fragmentOptions.context = section.keypath + '.' + i;
						fragmentOptions.index = i;
						if ( section.descriptor.i ) {
							fragmentOptions.indexRef = section.descriptor.i;
						}
						section.fragments[ i ] = section.createFragment( fragmentOptions );
					}
				}
			}
			section.length = length;
		}

		function updateListObjectSection( section, value, fragmentOptions ) {
			var id, i, hasKey, fragment;
			hasKey = section.hasKey || ( section.hasKey = {} );
			i = section.fragments.length;
			while ( i-- ) {
				fragment = section.fragments[ i ];
				if ( !( fragment.index in value ) ) {
					section.fragments[ i ].teardown( true );
					section.fragments.splice( i, 1 );
					hasKey[ fragment.index ] = false;
				}
			}
			for ( id in value ) {
				if ( !hasKey[ id ] ) {
					fragmentOptions.context = section.keypath + '.' + id;
					fragmentOptions.index = id;
					if ( section.descriptor.i ) {
						fragmentOptions.indexRef = section.descriptor.i;
					}
					section.fragments.push( section.createFragment( fragmentOptions ) );
					hasKey[ id ] = true;
				}
			}
			section.length = section.fragments.length;
		}

		function updateContextSection( section, fragmentOptions ) {
			if ( !section.length ) {
				fragmentOptions.context = section.keypath;
				fragmentOptions.index = 0;
				section.fragments[ 0 ] = section.createFragment( fragmentOptions );
				section.length = 1;
			}
		}

		function updateConditionalSection( section, value, inverted, fragmentOptions ) {
			var doRender, emptyArray, fragmentsToRemove, fragment;
			emptyArray = isArray( value ) && value.length === 0;
			if ( inverted ) {
				doRender = emptyArray || !value;
			} else {
				doRender = value && !emptyArray;
			}
			if ( doRender ) {
				if ( !section.length ) {
					fragmentOptions.index = 0;
					section.fragments[ 0 ] = section.createFragment( fragmentOptions );
					section.length = 1;
				}
				if ( section.length > 1 ) {
					fragmentsToRemove = section.fragments.splice( 1 );
					while ( fragment = fragmentsToRemove.pop() ) {
						fragment.teardown( true );
					}
				}
			} else if ( section.length ) {
				section.teardownFragments( true );
				section.length = 0;
			}
		}
	}( utils_isArray, utils_isObject );

	var render_DomFragment_Section_prototype_render = function( isClient, updateSection ) {

		return function DomSection_prototype_render( value ) {
			var nextNode, wrapped;
			if ( wrapped = this.root._wrapped[ this.keypath ] ) {
				value = wrapped.get();
			}
			if ( this.rendering ) {
				return;
			}
			this.rendering = true;
			updateSection( this, value );
			this.rendering = false;
			if ( this.docFrag && !this.docFrag.childNodes.length ) {
				return;
			}
			if ( !this.initialising && isClient ) {
				nextNode = this.parentFragment.findNextNode( this );
				if ( nextNode && nextNode.parentNode === this.parentFragment.pNode ) {
					this.parentFragment.pNode.insertBefore( this.docFrag, nextNode );
				} else {
					this.parentFragment.pNode.appendChild( this.docFrag );
				}
			}
		};
	}( config_isClient, render_shared_updateSection );

	var render_DomFragment_Section_reassignFragments = function( section, start, end, by ) {
		var i, fragment, indexRef, oldKeypath, newKeypath;
		indexRef = section.descriptor.i;
		for ( i = start; i < end; i += 1 ) {
			fragment = section.fragments[ i ];
			oldKeypath = section.keypath + '.' + ( i - by );
			newKeypath = section.keypath + '.' + i;
			fragment.index = i;
			fragment.reassign( indexRef, i, oldKeypath, newKeypath );
		}
	};

	var render_DomFragment_Section_prototype_splice = function( reassignFragments ) {

		return function( spliceSummary ) {
			var section = this,
				balance, start, insertStart, insertEnd, spliceArgs;
			balance = spliceSummary.balance;
			if ( !balance ) {
				return;
			}
			start = spliceSummary.start;
			section.length += balance;
			if ( balance < 0 ) {
				section.fragments.splice( start, -balance ).forEach( teardown );
				reassignFragments( section, start, section.length, balance );
				return;
			}
			insertStart = start + spliceSummary.removed;
			insertEnd = start + spliceSummary.added;
			spliceArgs = [
				insertStart,
				0
			];
			spliceArgs.length += balance;
			section.fragments.splice.apply( section.fragments, spliceArgs );
			reassignFragments( section, insertEnd, section.length, balance );
			renderNewFragments( section, insertStart, insertEnd );
		};

		function teardown( fragment ) {
			fragment.teardown( true );
		}

		function renderNewFragments( section, start, end ) {
			var fragmentOptions, i, insertionPoint;
			section.rendering = true;
			fragmentOptions = {
				descriptor: section.descriptor.f,
				root: section.root,
				pNode: section.parentFragment.pNode,
				pElement: section.pElement,
				owner: section,
				indexRef: section.descriptor.i
			};
			for ( i = start; i < end; i += 1 ) {
				fragmentOptions.context = section.keypath + '.' + i;
				fragmentOptions.index = i;
				section.fragments[ i ] = section.createFragment( fragmentOptions );
			}
			insertionPoint = section.fragments[ end ] ? section.fragments[ end ].firstNode() : section.parentFragment.findNextNode( section );
			section.parentFragment.pNode.insertBefore( section.docFrag, insertionPoint );
			section.rendering = false;
		}
	}( render_DomFragment_Section_reassignFragments );

	var render_DomFragment_Section__Section = function( types, Mustache, merge, render, splice, teardown, circular ) {

		var DomSection, DomFragment;
		circular.push( function() {
			DomFragment = circular.DomFragment;
		} );
		DomSection = function( options, docFrag ) {
			this.type = types.SECTION;
			this.inverted = !! options.descriptor.n;
			this.pElement = options.pElement;
			this.fragments = [];
			this.length = 0;
			if ( docFrag ) {
				this.docFrag = document.createDocumentFragment();
			}
			this.initialising = true;
			Mustache.init( this, options );
			if ( docFrag ) {
				docFrag.appendChild( this.docFrag );
			}
			this.initialising = false;
		};
		DomSection.prototype = {
			update: Mustache.update,
			resolve: Mustache.resolve,
			reassign: Mustache.reassign,
			splice: splice,
			merge: merge,
			detach: function() {
				var i, len;
				if ( this.docFrag ) {
					len = this.fragments.length;
					for ( i = 0; i < len; i += 1 ) {
						this.docFrag.appendChild( this.fragments[ i ].detach() );
					}
					return this.docFrag;
				}
			},
			teardown: function( destroy ) {
				this.teardownFragments( destroy );
				teardown( this );
			},
			firstNode: function() {
				if ( this.fragments[ 0 ] ) {
					return this.fragments[ 0 ].firstNode();
				}
				return this.parentFragment.findNextNode( this );
			},
			findNextNode: function( fragment ) {
				if ( this.fragments[ fragment.index + 1 ] ) {
					return this.fragments[ fragment.index + 1 ].firstNode();
				}
				return this.parentFragment.findNextNode( this );
			},
			teardownFragments: function( destroy ) {
				var fragment;
				while ( fragment = this.fragments.shift() ) {
					fragment.teardown( destroy );
				}
			},
			render: render,
			createFragment: function( options ) {
				var fragment = new DomFragment( options );
				if ( this.docFrag ) {
					this.docFrag.appendChild( fragment.docFrag );
				}
				return fragment;
			},
			toString: function() {
				var str, i, len;
				str = '';
				i = 0;
				len = this.length;
				for ( i = 0; i < len; i += 1 ) {
					str += this.fragments[ i ].toString();
				}
				return str;
			},
			find: function( selector ) {
				var i, len, queryResult;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					if ( queryResult = this.fragments[ i ].find( selector ) ) {
						return queryResult;
					}
				}
				return null;
			},
			findAll: function( selector, query ) {
				var i, len;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					this.fragments[ i ].findAll( selector, query );
				}
			},
			findComponent: function( selector ) {
				var i, len, queryResult;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					if ( queryResult = this.fragments[ i ].findComponent( selector ) ) {
						return queryResult;
					}
				}
				return null;
			},
			findAllComponents: function( selector, query ) {
				var i, len;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					this.fragments[ i ].findAllComponents( selector, query );
				}
			}
		};
		return DomSection;
	}( config_types, render_shared_Mustache__Mustache, render_DomFragment_Section_prototype_merge, render_DomFragment_Section_prototype_render, render_DomFragment_Section_prototype_splice, shared_teardown, circular );

	var render_DomFragment_shared_insertHtml = function( namespaces, createElement ) {

		var elementCache = {}, ieBug, ieBlacklist;
		try {
			createElement( 'table' ).innerHTML = 'foo';
		} catch ( err ) {
			ieBug = true;
			ieBlacklist = {
				TABLE: [
					'<table class="x">',
					'</table>'
				],
				THEAD: [
					'<table><thead class="x">',
					'</thead></table>'
				],
				TBODY: [
					'<table><tbody class="x">',
					'</tbody></table>'
				],
				TR: [
					'<table><tr class="x">',
					'</tr></table>'
				],
				SELECT: [
					'<select class="x">',
					'</select>'
				]
			};
		}
		return function( html, tagName, namespace, docFrag ) {
			var container, nodes = [],
				wrapper;
			if ( html ) {
				if ( ieBug && ( wrapper = ieBlacklist[ tagName ] ) ) {
					container = element( 'DIV' );
					container.innerHTML = wrapper[ 0 ] + html + wrapper[ 1 ];
					container = container.querySelector( '.x' );
				} else if ( namespace === namespaces.svg ) {
					container = element( 'DIV' );
					container.innerHTML = '<svg class="x">' + html + '</svg>';
					container = container.querySelector( '.x' );
				} else {
					container = element( tagName );
					container.innerHTML = html;
				}
				while ( container.firstChild ) {
					nodes.push( container.firstChild );
					docFrag.appendChild( container.firstChild );
				}
			}
			return nodes;
		};

		function element( tagName ) {
			return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
		}
	}( config_namespaces, utils_createElement );

	var render_DomFragment_Triple = function( types, matches, Mustache, insertHtml, teardown ) {

		var DomTriple = function( options, docFrag ) {
			this.type = types.TRIPLE;
			if ( docFrag ) {
				this.nodes = [];
				this.docFrag = document.createDocumentFragment();
			}
			this.initialising = true;
			Mustache.init( this, options );
			if ( docFrag ) {
				docFrag.appendChild( this.docFrag );
			}
			this.initialising = false;
		};
		DomTriple.prototype = {
			update: Mustache.update,
			resolve: Mustache.resolve,
			reassign: Mustache.reassign,
			detach: function() {
				var len, i;
				if ( this.docFrag ) {
					len = this.nodes.length;
					for ( i = 0; i < len; i += 1 ) {
						this.docFrag.appendChild( this.nodes[ i ] );
					}
					return this.docFrag;
				}
			},
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
					this.docFrag = this.nodes = null;
				}
				teardown( this );
			},
			firstNode: function() {
				if ( this.nodes[ 0 ] ) {
					return this.nodes[ 0 ];
				}
				return this.parentFragment.findNextNode( this );
			},
			render: function( html ) {
				var node, pNode;
				if ( !this.nodes ) {
					return;
				}
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				if ( !html ) {
					this.nodes = [];
					return;
				}
				pNode = this.parentFragment.pNode;
				this.nodes = insertHtml( html, pNode.tagName, pNode.namespaceURI, this.docFrag );
				if ( !this.initialising ) {
					pNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
				}
				if ( pNode.tagName === 'SELECT' && pNode._ractive && pNode._ractive.binding ) {
					pNode._ractive.binding.update();
				}
			},
			toString: function() {
				return this.value != undefined ? this.value : '';
			},
			find: function( selector ) {
				var i, len, node, queryResult;
				len = this.nodes.length;
				for ( i = 0; i < len; i += 1 ) {
					node = this.nodes[ i ];
					if ( node.nodeType !== 1 ) {
						continue;
					}
					if ( matches( node, selector ) ) {
						return node;
					}
					if ( queryResult = node.querySelector( selector ) ) {
						return queryResult;
					}
				}
				return null;
			},
			findAll: function( selector, queryResult ) {
				var i, len, node, queryAllResult, numNodes, j;
				len = this.nodes.length;
				for ( i = 0; i < len; i += 1 ) {
					node = this.nodes[ i ];
					if ( node.nodeType !== 1 ) {
						continue;
					}
					if ( matches( node, selector ) ) {
						queryResult.push( node );
					}
					if ( queryAllResult = node.querySelectorAll( selector ) ) {
						numNodes = queryAllResult.length;
						for ( j = 0; j < numNodes; j += 1 ) {
							queryResult.push( queryAllResult[ j ] );
						}
					}
				}
			}
		};
		return DomTriple;
	}( config_types, utils_matches, render_shared_Mustache__Mustache, render_DomFragment_shared_insertHtml, shared_teardown );

	var render_DomFragment_Element_initialise_getElementNamespace = function( namespaces ) {

		return function( descriptor, parentNode ) {
			if ( descriptor.a && descriptor.a.xmlns ) {
				return descriptor.a.xmlns;
			}
			return descriptor.e === 'svg' ? namespaces.svg : parentNode.namespaceURI || namespaces.html;
		};
	}( config_namespaces );

	var render_DomFragment_shared_enforceCase = function() {

		var svgCamelCaseElements, svgCamelCaseAttributes, createMap, map;
		svgCamelCaseElements = 'altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath vkern'.split( ' ' );
		svgCamelCaseAttributes = 'attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan'.split( ' ' );
		createMap = function( items ) {
			var map = {}, i = items.length;
			while ( i-- ) {
				map[ items[ i ].toLowerCase() ] = items[ i ];
			}
			return map;
		};
		map = createMap( svgCamelCaseElements.concat( svgCamelCaseAttributes ) );
		return function( elementName ) {
			var lowerCaseElementName = elementName.toLowerCase();
			return map[ lowerCaseElementName ] || lowerCaseElementName;
		};
	}();

	var render_DomFragment_Attribute_helpers_determineNameAndNamespace = function( namespaces, enforceCase ) {

		return function( attribute, name ) {
			var colonIndex, namespacePrefix;
			colonIndex = name.indexOf( ':' );
			if ( colonIndex !== -1 ) {
				namespacePrefix = name.substr( 0, colonIndex );
				if ( namespacePrefix !== 'xmlns' ) {
					name = name.substring( colonIndex + 1 );
					attribute.name = enforceCase( name );
					attribute.lcName = attribute.name.toLowerCase();
					attribute.namespace = namespaces[ namespacePrefix.toLowerCase() ];
					if ( !attribute.namespace ) {
						throw 'Unknown namespace ("' + namespacePrefix + '")';
					}
					return;
				}
			}
			attribute.name = attribute.element.namespace !== namespaces.html ? enforceCase( name ) : name;
			attribute.lcName = attribute.name.toLowerCase();
		};
	}( config_namespaces, render_DomFragment_shared_enforceCase );

	var render_DomFragment_Attribute_helpers_setStaticAttribute = function( namespaces ) {

		return function setStaticAttribute( attribute, options ) {
			var node, value = options.value || '';
			if ( node = options.pNode ) {
				if ( attribute.namespace ) {
					node.setAttributeNS( attribute.namespace, options.name, value );
				} else {
					if ( options.name === 'style' && node.style.setAttribute ) {
						node.style.setAttribute( 'cssText', value );
					} else if ( options.name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
						node.className = value;
					} else {
						node.setAttribute( options.name, value );
					}
				}
				if ( attribute.name === 'id' ) {
					options.root.nodes[ options.value ] = node;
				}
				if ( attribute.name === 'value' ) {
					node._ractive.value = options.value;
				}
			}
			attribute.value = options.value || null;
		};
	}( config_namespaces );

	var render_DomFragment_Attribute_helpers_determinePropertyName = function( namespaces ) {

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
		return function( attribute, options ) {
			var propertyName;
			if ( attribute.pNode && !attribute.namespace && ( !options.pNode.namespaceURI || options.pNode.namespaceURI === namespaces.html ) ) {
				propertyName = propertyNames[ attribute.name ] || attribute.name;
				if ( options.pNode[ propertyName ] !== undefined ) {
					attribute.propertyName = propertyName;
				}
				if ( typeof options.pNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
					attribute.useProperty = true;
				}
			}
		};
	}( config_namespaces );

	var render_DomFragment_Attribute_helpers_getInterpolator = function( types ) {

		return function getInterpolator( attribute ) {
			var items, item;
			items = attribute.fragment.items;
			if ( items.length !== 1 ) {
				return;
			}
			item = items[ 0 ];
			if ( item.type !== types.INTERPOLATOR || !item.keypath && !item.ref ) {
				return;
			}
			return item;
		};
	}( config_types );

	var utils_arrayContentsMatch = function( isArray ) {

		return function( a, b ) {
			var i;
			if ( !isArray( a ) || !isArray( b ) ) {
				return false;
			}
			if ( a.length !== b.length ) {
				return false;
			}
			i = a.length;
			while ( i-- ) {
				if ( a[ i ] !== b[ i ] ) {
					return false;
				}
			}
			return true;
		};
	}( utils_isArray );

	var render_DomFragment_Attribute_prototype_bind = function( runloop, warn, arrayContentsMatch, getValueFromCheckboxes, get, set ) {

		var singleMustacheError = 'For two-way binding to work, attribute value must be a single interpolator (e.g. value="{{foo}}")',
			expressionError = 'You cannot set up two-way binding against an expression ',
			bindAttribute, updateModel, getOptions, update, getBinding, inheritProperties, MultipleSelectBinding, SelectBinding, RadioNameBinding, CheckboxNameBinding, CheckedBinding, FileListBinding, ContentEditableBinding, GenericBinding;
		bindAttribute = function() {
			var node = this.pNode,
				interpolator, binding, bindings;
			interpolator = this.interpolator;
			if ( !interpolator ) {
				warn( singleMustacheError );
				return false;
			}
			if ( interpolator.keypath && interpolator.keypath.substr === '${' ) {
				warn( expressionError + interpolator.keypath );
				return false;
			}
			if ( !interpolator.keypath ) {
				interpolator.resolve( interpolator.descriptor.r );
			}
			this.keypath = interpolator.keypath;
			binding = getBinding( this );
			if ( !binding ) {
				return false;
			}
			node._ractive.binding = this.element.binding = binding;
			this.twoway = true;
			bindings = this.root._twowayBindings[ this.keypath ] || ( this.root._twowayBindings[ this.keypath ] = [] );
			bindings.push( binding );
			return true;
		};
		updateModel = function() {
			runloop.start( this._ractive.root );
			this._ractive.binding.update();
			runloop.end();
		};
		getOptions = {
			evaluateWrapped: true
		};
		update = function() {
			var value = get( this._ractive.root, this._ractive.binding.keypath, getOptions );
			this.value = value == undefined ? '' : value;
		};
		getBinding = function( attribute ) {
			var node = attribute.pNode;
			if ( node.tagName === 'SELECT' ) {
				return node.multiple ? new MultipleSelectBinding( attribute, node ) : new SelectBinding( attribute, node );
			}
			if ( node.type === 'checkbox' || node.type === 'radio' ) {
				if ( attribute.propertyName === 'name' ) {
					if ( node.type === 'checkbox' ) {
						return new CheckboxNameBinding( attribute, node );
					}
					if ( node.type === 'radio' ) {
						return new RadioNameBinding( attribute, node );
					}
				}
				if ( attribute.propertyName === 'checked' ) {
					return new CheckedBinding( attribute, node );
				}
				return null;
			}
			if ( attribute.lcName !== 'value' ) {
				throw new Error( 'Attempted to set up an illegal two-way binding. This error is unexpected - if you can, please file an issue at https://github.com/RactiveJS/Ractive, or contact @RactiveJS on Twitter. Thanks!' );
			}
			if ( node.type === 'file' ) {
				return new FileListBinding( attribute, node );
			}
			if ( node.getAttribute( 'contenteditable' ) ) {
				return new ContentEditableBinding( attribute, node );
			}
			return new GenericBinding( attribute, node );
		};
		MultipleSelectBinding = function( attribute, node ) {
			var valueFromModel;
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel === undefined ) {
				this.update();
			}
		};
		MultipleSelectBinding.prototype = {
			value: function() {
				var selectedValues, options, i, len, option, optionValue;
				selectedValues = [];
				options = this.node.options;
				len = options.length;
				for ( i = 0; i < len; i += 1 ) {
					option = options[ i ];
					if ( option.selected ) {
						optionValue = option._ractive ? option._ractive.value : option.value;
						selectedValues.push( optionValue );
					}
				}
				return selectedValues;
			},
			update: function() {
				var attribute, previousValue, value;
				attribute = this.attr;
				previousValue = attribute.value;
				value = this.value();
				if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
					runloop.addBinding( attribute );
					attribute.value = value;
					set( this.root, this.keypath, value );
					runloop.trigger();
				}
				return this;
			},
			deferUpdate: function() {
				if ( this.deferred === true ) {
					return;
				}
				runloop.addAttribute( this );
				this.deferred = true;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
			}
		};
		SelectBinding = function( attribute, node ) {
			var valueFromModel;
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel === undefined ) {
				this.update();
			}
		};
		SelectBinding.prototype = {
			value: function() {
				var options, i, len, option, optionValue;
				options = this.node.options;
				len = options.length;
				for ( i = 0; i < len; i += 1 ) {
					option = options[ i ];
					if ( options[ i ].selected ) {
						optionValue = option._ractive ? option._ractive.value : option.value;
						return optionValue;
					}
				}
			},
			update: function() {
				var value = this.value();
				runloop.addBinding( this.attr );
				this.attr.value = value;
				set( this.root, this.keypath, value );
				runloop.trigger();
				return this;
			},
			deferUpdate: function() {
				if ( this.deferred === true ) {
					return;
				}
				runloop.addAttribute( this );
				this.deferred = true;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
			}
		};
		RadioNameBinding = function( attribute, node ) {
			var valueFromModel;
			this.radioName = true;
			inheritProperties( this, attribute, node );
			node.name = '{{' + attribute.keypath + '}}';
			node.addEventListener( 'change', updateModel, false );
			if ( node.attachEvent ) {
				node.addEventListener( 'click', updateModel, false );
			}
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel !== undefined ) {
				node.checked = valueFromModel == node._ractive.value;
			} else {
				runloop.addRadio( this );
			}
		};
		RadioNameBinding.prototype = {
			value: function() {
				return this.node._ractive ? this.node._ractive.value : this.node.value;
			},
			update: function() {
				var node = this.node;
				if ( node.checked ) {
					runloop.addBinding( this.attr );
					set( this.root, this.keypath, this.value() );
					runloop.trigger();
				}
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'click', updateModel, false );
			}
		};
		CheckboxNameBinding = function( attribute, node ) {
			var valueFromModel, checked;
			this.checkboxName = true;
			inheritProperties( this, attribute, node );
			node.name = '{{' + this.keypath + '}}';
			node.addEventListener( 'change', updateModel, false );
			if ( node.attachEvent ) {
				node.addEventListener( 'click', updateModel, false );
			}
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel !== undefined ) {
				checked = valueFromModel.indexOf( node._ractive.value ) !== -1;
				node.checked = checked;
			} else {
				runloop.addCheckbox( this );
			}
		};
		CheckboxNameBinding.prototype = {
			changed: function() {
				return this.node.checked !== !! this.checked;
			},
			update: function() {
				this.checked = this.node.checked;
				runloop.addBinding( this.attr );
				set( this.root, this.keypath, getValueFromCheckboxes( this.root, this.keypath ) );
				runloop.trigger();
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'click', updateModel, false );
			}
		};
		CheckedBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			if ( node.attachEvent ) {
				node.addEventListener( 'click', updateModel, false );
			}
		};
		CheckedBinding.prototype = {
			value: function() {
				return this.node.checked;
			},
			update: function() {
				runloop.addBinding( this.attr );
				set( this.root, this.keypath, this.value() );
				runloop.trigger();
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'click', updateModel, false );
			}
		};
		FileListBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
		};
		FileListBinding.prototype = {
			value: function() {
				return this.attr.pNode.files;
			},
			update: function() {
				set( this.attr.root, this.attr.keypath, this.value() );
				runloop.trigger();
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
			}
		};
		ContentEditableBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			if ( !this.root.lazy ) {
				node.addEventListener( 'input', updateModel, false );
				if ( node.attachEvent ) {
					node.addEventListener( 'keyup', updateModel, false );
				}
			}
		};
		ContentEditableBinding.prototype = {
			update: function() {
				runloop.addBinding( this.attr );
				set( this.root, this.keypath, this.node.innerHTML );
				runloop.trigger();
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'input', updateModel, false );
				this.node.removeEventListener( 'keyup', updateModel, false );
			}
		};
		GenericBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			if ( !this.root.lazy ) {
				node.addEventListener( 'input', updateModel, false );
				if ( node.attachEvent ) {
					node.addEventListener( 'keyup', updateModel, false );
				}
			}
			this.node.addEventListener( 'blur', update, false );
		};
		GenericBinding.prototype = {
			value: function() {
				var value = this.attr.pNode.value;
				if ( +value + '' === value && value.indexOf( 'e' ) === -1 ) {
					value = +value;
				}
				return value;
			},
			update: function() {
				var attribute = this.attr,
					value = this.value();
				runloop.addBinding( attribute );
				set( attribute.root, attribute.keypath, value );
				runloop.trigger();
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'input', updateModel, false );
				this.node.removeEventListener( 'keyup', updateModel, false );
				this.node.removeEventListener( 'blur', update, false );
			}
		};
		inheritProperties = function( binding, attribute, node ) {
			binding.attr = attribute;
			binding.node = node;
			binding.root = attribute.root;
			binding.keypath = attribute.keypath;
		};
		return bindAttribute;
	}( global_runloop, utils_warn, utils_arrayContentsMatch, shared_getValueFromCheckboxes, shared_get__get, shared_set );

	var render_DomFragment_Attribute_prototype_update = function( runloop, namespaces, isArray ) {

		var updateAttribute, updateFileInputValue, deferSelect, initSelect, updateSelect, updateMultipleSelect, updateRadioName, updateCheckboxName, updateIEStyleAttribute, updateClassName, updateContentEditableValue, updateEverythingElse;
		updateAttribute = function() {
			var node;
			if ( !this.ready ) {
				return this;
			}
			node = this.pNode;
			if ( node.tagName === 'SELECT' && this.lcName === 'value' ) {
				this.update = deferSelect;
				this.deferredUpdate = initSelect;
				return this.update();
			}
			if ( this.isFileInputValue ) {
				this.update = updateFileInputValue;
				return this;
			}
			if ( this.twoway && this.lcName === 'name' ) {
				if ( node.type === 'radio' ) {
					this.update = updateRadioName;
					return this.update();
				}
				if ( node.type === 'checkbox' ) {
					this.update = updateCheckboxName;
					return this.update();
				}
			}
			if ( this.lcName === 'style' && node.style.setAttribute ) {
				this.update = updateIEStyleAttribute;
				return this.update();
			}
			if ( this.lcName === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
				this.update = updateClassName;
				return this.update();
			}
			if ( node.getAttribute( 'contenteditable' ) && this.lcName === 'value' ) {
				this.update = updateContentEditableValue;
				return this.update();
			}
			this.update = updateEverythingElse;
			return this.update();
		};
		updateFileInputValue = function() {
			return this;
		};
		initSelect = function() {
			this.deferredUpdate = this.pNode.multiple ? updateMultipleSelect : updateSelect;
			this.deferredUpdate();
		};
		deferSelect = function() {
			runloop.addSelectValue( this );
			return this;
		};
		updateSelect = function() {
			var value = this.fragment.getValue(),
				options, option, optionValue, i;
			this.value = this.pNode._ractive.value = value;
			options = this.pNode.options;
			i = options.length;
			while ( i-- ) {
				option = options[ i ];
				optionValue = option._ractive ? option._ractive.value : option.value;
				if ( optionValue == value ) {
					option.selected = true;
					return this;
				}
			}
			return this;
		};
		updateMultipleSelect = function() {
			var value = this.fragment.getValue(),
				options, i, option, optionValue;
			if ( !isArray( value ) ) {
				value = [ value ];
			}
			options = this.pNode.options;
			i = options.length;
			while ( i-- ) {
				option = options[ i ];
				optionValue = option._ractive ? option._ractive.value : option.value;
				option.selected = value.indexOf( optionValue ) !== -1;
			}
			this.value = value;
			return this;
		};
		updateRadioName = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			node.checked = value == node._ractive.value;
			return this;
		};
		updateCheckboxName = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( !isArray( value ) ) {
				node.checked = value == node._ractive.value;
				return this;
			}
			node.checked = value.indexOf( node._ractive.value ) !== -1;
			return this;
		};
		updateIEStyleAttribute = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( value === undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				node.style.setAttribute( 'cssText', value );
				this.value = value;
			}
			return this;
		};
		updateClassName = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( value === undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				node.className = value;
				this.value = value;
			}
			return this;
		};
		updateContentEditableValue = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( value === undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				if ( !this.active ) {
					node.innerHTML = value;
				}
				this.value = value;
			}
			return this;
		};
		updateEverythingElse = function() {
			var node, value, binding;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( this.isValueAttribute ) {
				node._ractive.value = value;
			}
			if ( value == undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				if ( this.useProperty ) {
					if ( !this.active ) {
						node[ this.propertyName ] = value;
					}
					if ( node.tagName === 'OPTION' && node.selected && ( binding = this.element.select.binding ) ) {
						binding.update();
					}
					this.value = value;
					return this;
				}
				if ( this.namespace ) {
					node.setAttributeNS( this.namespace, this.name, value );
					this.value = value;
					return this;
				}
				if ( this.lcName === 'id' ) {
					if ( this.value !== undefined ) {
						this.root.nodes[ this.value ] = undefined;
					}
					this.root.nodes[ value ] = node;
				}
				node.setAttribute( this.name, value );
				this.value = value;
			}
			return this;
		};
		return updateAttribute;
	}( global_runloop, config_namespaces, utils_isArray );

	var parse_Parser_expressions_primary_literal_numberLiteral = function( types ) {

		var numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
		return function( parser ) {
			var result;
			if ( result = parser.matchPattern( numberPattern ) ) {
				return {
					t: types.NUMBER_LITERAL,
					v: result
				};
			}
			return null;
		};
	}( config_types );

	var parse_Parser_expressions_primary_literal_booleanLiteral = function( types ) {

		return function( tokenizer ) {
			var remaining = tokenizer.remaining();
			if ( remaining.substr( 0, 4 ) === 'true' ) {
				tokenizer.pos += 4;
				return {
					t: types.BOOLEAN_LITERAL,
					v: 'true'
				};
			}
			if ( remaining.substr( 0, 5 ) === 'false' ) {
				tokenizer.pos += 5;
				return {
					t: types.BOOLEAN_LITERAL,
					v: 'false'
				};
			}
			return null;
		};
	}( config_types );

	var parse_Parser_expressions_primary_literal_stringLiteral_makeQuotedStringMatcher = function() {

		var stringMiddlePattern, escapeSequencePattern, lineContinuationPattern;
		stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;
		escapeSequencePattern = /^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;
		lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;
		return function( okQuote ) {
			return function( parser ) {
				var start, literal, done, next;
				start = parser.pos;
				literal = '"';
				done = false;
				while ( !done ) {
					next = parser.matchPattern( stringMiddlePattern ) || parser.matchPattern( escapeSequencePattern ) || parser.matchString( okQuote );
					if ( next ) {
						if ( next === '"' ) {
							literal += '\\"';
						} else if ( next === '\\\'' ) {
							literal += '\'';
						} else {
							literal += next;
						}
					} else {
						next = parser.matchPattern( lineContinuationPattern );
						if ( next ) {
							literal += '\\u' + ( '000' + next.charCodeAt( 1 ).toString( 16 ) ).slice( -4 );
						} else {
							done = true;
						}
					}
				}
				literal += '"';
				return JSON.parse( literal );
			};
		};
	}();

	var parse_Parser_expressions_primary_literal_stringLiteral_singleQuotedString = function( makeQuotedStringMatcher ) {

		return makeQuotedStringMatcher( '"' );
	}( parse_Parser_expressions_primary_literal_stringLiteral_makeQuotedStringMatcher );

	var parse_Parser_expressions_primary_literal_stringLiteral_doubleQuotedString = function( makeQuotedStringMatcher ) {

		return makeQuotedStringMatcher( '\'' );
	}( parse_Parser_expressions_primary_literal_stringLiteral_makeQuotedStringMatcher );

	var parse_Parser_expressions_primary_literal_stringLiteral__stringLiteral = function( types, getSingleQuotedString, getDoubleQuotedString ) {

		return function( parser ) {
			var start, string;
			start = parser.pos;
			if ( parser.matchString( '"' ) ) {
				string = getDoubleQuotedString( parser );
				if ( !parser.matchString( '"' ) ) {
					parser.pos = start;
					return null;
				}
				return {
					t: types.STRING_LITERAL,
					v: string
				};
			}
			if ( parser.matchString( '\'' ) ) {
				string = getSingleQuotedString( parser );
				if ( !parser.matchString( '\'' ) ) {
					parser.pos = start;
					return null;
				}
				return {
					t: types.STRING_LITERAL,
					v: string
				};
			}
			return null;
		};
	}( config_types, parse_Parser_expressions_primary_literal_stringLiteral_singleQuotedString, parse_Parser_expressions_primary_literal_stringLiteral_doubleQuotedString );

	var parse_Parser_expressions_patterns = {
		name: /^[a-zA-Z_$][a-zA-Z_$0-9]*/
	};

	var parse_Parser_expressions_shared_key = function( getStringLiteral, getNumberLiteral, patterns ) {

		var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
		return function( parser ) {
			var token;
			if ( token = getStringLiteral( parser ) ) {
				return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
			}
			if ( token = getNumberLiteral( parser ) ) {
				return token.v;
			}
			if ( token = parser.matchPattern( patterns.name ) ) {
				return token;
			}
		};
	}( parse_Parser_expressions_primary_literal_stringLiteral__stringLiteral, parse_Parser_expressions_primary_literal_numberLiteral, parse_Parser_expressions_patterns );

	var parse_Parser_expressions_primary_literal_objectLiteral_keyValuePair = function( types, getKey ) {

		return function( parser ) {
			var start, key, value;
			start = parser.pos;
			parser.allowWhitespace();
			key = getKey( parser );
			if ( key === null ) {
				parser.pos = start;
				return null;
			}
			parser.allowWhitespace();
			if ( !parser.matchString( ':' ) ) {
				parser.pos = start;
				return null;
			}
			parser.allowWhitespace();
			value = parser.readExpression();
			if ( value === null ) {
				parser.pos = start;
				return null;
			}
			return {
				t: types.KEY_VALUE_PAIR,
				k: key,
				v: value
			};
		};
	}( config_types, parse_Parser_expressions_shared_key );

	var parse_Parser_expressions_primary_literal_objectLiteral_keyValuePairs = function( getKeyValuePair ) {

		return function getKeyValuePairs( parser ) {
			var start, pairs, pair, keyValuePairs;
			start = parser.pos;
			pair = getKeyValuePair( parser );
			if ( pair === null ) {
				return null;
			}
			pairs = [ pair ];
			if ( parser.matchString( ',' ) ) {
				keyValuePairs = getKeyValuePairs( parser );
				if ( !keyValuePairs ) {
					parser.pos = start;
					return null;
				}
				return pairs.concat( keyValuePairs );
			}
			return pairs;
		};
	}( parse_Parser_expressions_primary_literal_objectLiteral_keyValuePair );

	var parse_Parser_expressions_primary_literal_objectLiteral__objectLiteral = function( types, getKeyValuePairs ) {

		return function( parser ) {
			var start, keyValuePairs;
			start = parser.pos;
			parser.allowWhitespace();
			if ( !parser.matchString( '{' ) ) {
				parser.pos = start;
				return null;
			}
			keyValuePairs = getKeyValuePairs( parser );
			parser.allowWhitespace();
			if ( !parser.matchString( '}' ) ) {
				parser.pos = start;
				return null;
			}
			return {
				t: types.OBJECT_LITERAL,
				m: keyValuePairs
			};
		};
	}( config_types, parse_Parser_expressions_primary_literal_objectLiteral_keyValuePairs );

	var parse_Parser_expressions_shared_expressionList = function getExpressionList( tokenizer ) {
		var start, expressions, expr, next;
		start = tokenizer.pos;
		tokenizer.allowWhitespace();
		expr = tokenizer.readExpression();
		if ( expr === null ) {
			return null;
		}
		expressions = [ expr ];
		tokenizer.allowWhitespace();
		if ( tokenizer.matchString( ',' ) ) {
			next = getExpressionList( tokenizer );
			if ( next === null ) {
				tokenizer.pos = start;
				return null;
			}
			next.forEach( append );
		}

		function append( expression ) {
			expressions.push( expression );
		}
		return expressions;
	};

	var parse_Parser_expressions_primary_literal_arrayLiteral = function( types, getExpressionList ) {

		return function( parser ) {
			var start, expressionList;
			start = parser.pos;
			parser.allowWhitespace();
			if ( !parser.matchString( '[' ) ) {
				parser.pos = start;
				return null;
			}
			expressionList = getExpressionList( parser );
			if ( !parser.matchString( ']' ) ) {
				parser.pos = start;
				return null;
			}
			return {
				t: types.ARRAY_LITERAL,
				m: expressionList
			};
		};
	}( config_types, parse_Parser_expressions_shared_expressionList );

	var parse_Parser_expressions_primary_literal__literal = function( getNumberLiteral, getBooleanLiteral, getStringLiteral, getObjectLiteral, getArrayLiteral ) {

		return function( tokenizer ) {
			var literal = getNumberLiteral( tokenizer ) || getBooleanLiteral( tokenizer ) || getStringLiteral( tokenizer ) || getObjectLiteral( tokenizer ) || getArrayLiteral( tokenizer );
			return literal;
		};
	}( parse_Parser_expressions_primary_literal_numberLiteral, parse_Parser_expressions_primary_literal_booleanLiteral, parse_Parser_expressions_primary_literal_stringLiteral__stringLiteral, parse_Parser_expressions_primary_literal_objectLiteral__objectLiteral, parse_Parser_expressions_primary_literal_arrayLiteral );

	var parse_Parser_expressions_primary_reference = function( types, patterns ) {

		var dotRefinementPattern, arrayMemberPattern, getArrayRefinement, globals;
		dotRefinementPattern = /^\.[a-zA-Z_$0-9]+/;
		getArrayRefinement = function( parser ) {
			var num = parser.matchPattern( arrayMemberPattern );
			if ( num ) {
				return '.' + num;
			}
			return null;
		};
		arrayMemberPattern = /^\[(0|[1-9][0-9]*)\]/;
		globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;
		return function( parser ) {
			var startPos, ancestor, name, dot, combo, refinement, lastDotIndex;
			startPos = parser.pos;
			ancestor = '';
			while ( parser.matchString( '../' ) ) {
				ancestor += '../';
			}
			if ( !ancestor ) {
				dot = parser.matchString( '.' ) || '';
			}
			name = parser.matchPattern( patterns.name ) || '';
			if ( !ancestor && !dot && globals.test( name ) ) {
				return {
					t: types.GLOBAL,
					v: name
				};
			}
			if ( name === 'this' && !ancestor && !dot ) {
				name = '.';
				startPos += 3;
			}
			combo = ( ancestor || dot ) + name;
			if ( !combo ) {
				return null;
			}
			while ( refinement = parser.matchPattern( dotRefinementPattern ) || getArrayRefinement( parser ) ) {
				combo += refinement;
			}
			if ( parser.matchString( '(' ) ) {
				lastDotIndex = combo.lastIndexOf( '.' );
				if ( lastDotIndex !== -1 ) {
					combo = combo.substr( 0, lastDotIndex );
					parser.pos = startPos + combo.length;
				} else {
					parser.pos -= 1;
				}
			}
			return {
				t: types.REFERENCE,
				n: combo
			};
		};
	}( config_types, parse_Parser_expressions_patterns );

	var parse_Parser_expressions_primary_bracketedExpression = function( types ) {

		return function( parser ) {
			var start, expr;
			start = parser.pos;
			if ( !parser.matchString( '(' ) ) {
				return null;
			}
			parser.allowWhitespace();
			expr = parser.readExpression();
			if ( !expr ) {
				parser.pos = start;
				return null;
			}
			parser.allowWhitespace();
			if ( !parser.matchString( ')' ) ) {
				parser.pos = start;
				return null;
			}
			return {
				t: types.BRACKETED,
				x: expr
			};
		};
	}( config_types );

	var parse_Parser_expressions_primary__primary = function( getLiteral, getReference, getBracketedExpression ) {

		return function( tokenizer ) {
			return getLiteral( tokenizer ) || getReference( tokenizer ) || getBracketedExpression( tokenizer );
		};
	}( parse_Parser_expressions_primary_literal__literal, parse_Parser_expressions_primary_reference, parse_Parser_expressions_primary_bracketedExpression );

	var parse_Parser_expressions_shared_refinement = function( types, patterns ) {

		return function getRefinement( parser ) {
			var start, name, expr;
			start = parser.pos;
			parser.allowWhitespace();
			if ( parser.matchString( '.' ) ) {
				parser.allowWhitespace();
				if ( name = parser.matchPattern( patterns.name ) ) {
					return {
						t: types.REFINEMENT,
						n: name
					};
				}
				parser.error( 'Expected a property name' );
			}
			if ( parser.matchString( '[' ) ) {
				parser.allowWhitespace();
				expr = parser.readExpression();
				if ( !expr ) {
					parser.error( 'an expression' );
				}
				parser.allowWhitespace();
				if ( !parser.matchString( ']' ) ) {
					parser.error( 'Expected \']\'' );
				}
				return {
					t: types.REFINEMENT,
					x: expr
				};
			}
			return null;
		};
	}( config_types, parse_Parser_expressions_patterns );

	var parse_Parser_expressions_memberOrInvocation = function( types, getPrimary, getExpressionList, getRefinement ) {

		return function( parser ) {
			var current, expression, refinement, expressionList;
			expression = getPrimary( parser );
			if ( !expression ) {
				return null;
			}
			while ( expression ) {
				current = parser.pos;
				if ( refinement = getRefinement( parser ) ) {
					expression = {
						t: types.MEMBER,
						x: expression,
						r: refinement
					};
				} else if ( parser.matchString( '(' ) ) {
					parser.allowWhitespace();
					expressionList = getExpressionList( parser );
					parser.allowWhitespace();
					if ( !parser.matchString( ')' ) ) {
						parser.pos = current;
						break;
					}
					expression = {
						t: types.INVOCATION,
						x: expression
					};
					if ( expressionList ) {
						expression.o = expressionList;
					}
				} else {
					break;
				}
			}
			return expression;
		};
	}( config_types, parse_Parser_expressions_primary__primary, parse_Parser_expressions_shared_expressionList, parse_Parser_expressions_shared_refinement );

	var parse_Parser_expressions_typeof = function( types, getMemberOrInvocation ) {

		var getTypeof, makePrefixSequenceMatcher;
		makePrefixSequenceMatcher = function( symbol, fallthrough ) {
			return function( parser ) {
				var start, expression;
				if ( !parser.matchString( symbol ) ) {
					return fallthrough( parser );
				}
				start = parser.pos;
				parser.allowWhitespace();
				expression = parser.readExpression();
				if ( !expression ) {
					parser.error( 'Expected a JavaScript expression' );
				}
				return {
					s: symbol,
					o: expression,
					t: types.PREFIX_OPERATOR
				};
			};
		};
		( function() {
			var i, len, matcher, prefixOperators, fallthrough;
			prefixOperators = '! ~ + - typeof'.split( ' ' );
			fallthrough = getMemberOrInvocation;
			for ( i = 0, len = prefixOperators.length; i < len; i += 1 ) {
				matcher = makePrefixSequenceMatcher( prefixOperators[ i ], fallthrough );
				fallthrough = matcher;
			}
			getTypeof = fallthrough;
		}() );
		return getTypeof;
	}( config_types, parse_Parser_expressions_memberOrInvocation );

	var parse_Parser_expressions_logicalOr = function( types, getTypeof ) {

		var getLogicalOr, makeInfixSequenceMatcher;
		makeInfixSequenceMatcher = function( symbol, fallthrough ) {
			return function( parser ) {
				var start, left, right;
				left = fallthrough( parser );
				if ( !left ) {
					return null;
				}
				while ( true ) {
					start = parser.pos;
					parser.allowWhitespace();
					if ( !parser.matchString( symbol ) ) {
						parser.pos = start;
						return left;
					}
					if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( parser.remaining().charAt( 0 ) ) ) {
						parser.pos = start;
						return left;
					}
					parser.allowWhitespace();
					right = fallthrough( parser );
					if ( !right ) {
						parser.pos = start;
						return left;
					}
					left = {
						t: types.INFIX_OPERATOR,
						s: symbol,
						o: [
							left,
							right
						]
					};
				}
			};
		};
		( function() {
			var i, len, matcher, infixOperators, fallthrough;
			infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );
			fallthrough = getTypeof;
			for ( i = 0, len = infixOperators.length; i < len; i += 1 ) {
				matcher = makeInfixSequenceMatcher( infixOperators[ i ], fallthrough );
				fallthrough = matcher;
			}
			getLogicalOr = fallthrough;
		}() );
		return getLogicalOr;
	}( config_types, parse_Parser_expressions_typeof );

	var parse_Parser_expressions_conditional = function( types, getLogicalOr ) {

		return function( parser ) {
			var start, expression, ifTrue, ifFalse;
			expression = getLogicalOr( parser );
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
			ifTrue = parser.readExpression();
			if ( !ifTrue ) {
				parser.pos = start;
				return expression;
			}
			parser.allowWhitespace();
			if ( !parser.matchString( ':' ) ) {
				parser.pos = start;
				return expression;
			}
			parser.allowWhitespace();
			ifFalse = parser.readExpression();
			if ( !ifFalse ) {
				parser.pos = start;
				return expression;
			}
			return {
				t: types.CONDITIONAL,
				o: [
					expression,
					ifTrue,
					ifFalse
				]
			};
		};
	}( config_types, parse_Parser_expressions_logicalOr );

	var parse_Parser_utils_flattenExpression = function( types, isObject ) {

		return function( expression ) {
			var refs = [],
				flattened;
			extractRefs( expression, refs );
			flattened = {
				r: refs,
				s: stringify( this, expression, refs )
			};
			return flattened;
		};

		function quoteStringLiteral( str ) {
			return JSON.stringify( String( str ) );
		}

		function extractRefs( node, refs ) {
			var i, list;
			if ( node.t === types.REFERENCE ) {
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
						extractRefs( list[ i ], refs );
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

		function stringify( parser, node, refs ) {
			var stringifyAll = function( item ) {
				return stringify( parser, item, refs );
			};
			switch ( node.t ) {
				case types.BOOLEAN_LITERAL:
				case types.GLOBAL:
				case types.NUMBER_LITERAL:
					return node.v;
				case types.STRING_LITERAL:
					return quoteStringLiteral( node.v );
				case types.ARRAY_LITERAL:
					return '[' + ( node.m ? node.m.map( stringifyAll ).join( ',' ) : '' ) + ']';
				case types.OBJECT_LITERAL:
					return '{' + ( node.m ? node.m.map( stringifyAll ).join( ',' ) : '' ) + '}';
				case types.KEY_VALUE_PAIR:
					return node.k + ':' + stringify( parser, node.v, refs );
				case types.PREFIX_OPERATOR:
					return ( node.s === 'typeof' ? 'typeof ' : node.s ) + stringify( parser, node.o, refs );
				case types.INFIX_OPERATOR:
					return stringify( parser, node.o[ 0 ], refs ) + ( node.s.substr( 0, 2 ) === 'in' ? ' ' + node.s + ' ' : node.s ) + stringify( parser, node.o[ 1 ], refs );
				case types.INVOCATION:
					return stringify( parser, node.x, refs ) + '(' + ( node.o ? node.o.map( stringifyAll ).join( ',' ) : '' ) + ')';
				case types.BRACKETED:
					return '(' + stringify( parser, node.x, refs ) + ')';
				case types.MEMBER:
					return stringify( parser, node.x, refs ) + stringify( parser, node.r, refs );
				case types.REFINEMENT:
					return node.n ? '.' + node.n : '[' + stringify( parser, node.x, refs ) + ']';
				case types.CONDITIONAL:
					return stringify( parser, node.o[ 0 ], refs ) + '?' + stringify( parser, node.o[ 1 ], refs ) + ':' + stringify( parser, node.o[ 2 ], refs );
				case types.REFERENCE:
					return '${' + refs.indexOf( node.n ) + '}';
				default:
					parser.error( 'foo' );
			}
		}
	}( config_types, utils_isObject );

	var parse_Parser__Parser = function( circular, types, create, hasOwnProperty, getConditional, flattenExpression ) {

		var Parser, ParseError, leadingWhitespace = /^\s+/;
		ParseError = function( message ) {
			this.name = 'ParseError';
			this.message = message;
		};
		ParseError.prototype = Error.prototype;
		Parser = function( str, options ) {
			var items, item;
			this.str = str;
			this.options = options || {};
			this.pos = 0;
			if ( this.init )
				this.init( str, options );
			items = [];
			while ( this.pos < this.str.length && ( item = this.read() ) ) {
				items.push( item );
			}
			this.leftover = this.remaining();
			this.result = this.postProcess ? this.postProcess( items, options ) : items;
		};
		Parser.prototype = {
			read: function( converters ) {
				var pos, i, len, item;
				if ( !converters )
					converters = this.converters;
				pos = this.pos;
				len = converters.length;
				for ( i = 0; i < len; i += 1 ) {
					this.pos = pos;
					if ( item = converters[ i ]( this ) ) {
						return item;
					}
				}
				return null;
			},
			readExpression: function() {
				return getConditional( this );
			},
			flattenExpression: flattenExpression,
			error: function( err ) {
				var lines, currentLine, currentLineEnd, nextLineEnd, lineNum, columnNum, message;
				lines = this.str.split( '\n' );
				lineNum = -1;
				nextLineEnd = 0;
				do {
					currentLineEnd = nextLineEnd;
					currentLine = lines[ lineNum+++1 ];
					nextLineEnd = currentLine.length + 1;
				} while ( nextLineEnd < this.pos );
				columnNum = this.pos - currentLineEnd;
				message = err + ' at line ' + ( lineNum + 1 ) + ' character ' + ( columnNum + 1 ) + ':\n' + currentLine + '\n' + new Array( columnNum + 1 ).join( ' ' ) + '^----';
				throw new ParseError( message );
			},
			matchString: function( string ) {
				if ( this.str.substr( this.pos, string.length ) === string ) {
					this.pos += string.length;
					return string;
				}
			},
			matchPattern: function( pattern ) {
				var match;
				if ( match = pattern.exec( this.remaining() ) ) {
					this.pos += match[ 0 ].length;
					return match[ 1 ] || match[ 0 ];
				}
			},
			allowWhitespace: function() {
				this.matchPattern( leadingWhitespace );
			},
			remaining: function() {
				return this.str.substring( this.pos );
			},
			nextChar: function() {
				return this.str.charAt( this.pos );
			}
		};
		Parser.extend = function( proto ) {
			var Parent = this,
				Child, key;
			Child = function( str, options ) {
				Parser.call( this, str, options );
			};
			Child.prototype = create( Parent.prototype );
			for ( key in proto ) {
				if ( hasOwnProperty.call( proto, key ) ) {
					Child.prototype[ key ] = proto[ key ];
				}
			}
			Child.extend = Parser.extend;
			return Child;
		};
		circular.Parser = Parser;
		return Parser;
	}( circular, config_types, utils_create, utils_hasOwnProperty, parse_Parser_expressions_conditional, parse_Parser_utils_flattenExpression );

	var utils_parseJSON = function( Parser, getStringLiteral, getKey ) {

		var JsonParser, specials, specialsPattern, numberPattern, placeholderPattern, placeholderAtStartPattern, onlyWhitespace;
		specials = {
			'true': true,
			'false': false,
			'undefined': undefined,
			'null': null
		};
		specialsPattern = new RegExp( '^(?:' + Object.keys( specials ).join( '|' ) + ')' );
		numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
		placeholderPattern = /\$\{([^\}]+)\}/g;
		placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
		onlyWhitespace = /^\s*$/;
		JsonParser = Parser.extend( {
			init: function( str, options ) {
				this.values = options.values;
			},
			postProcess: function( result ) {
				if ( result.length !== 1 || !onlyWhitespace.test( this.leftover ) ) {
					return null;
				}
				return {
					value: result[ 0 ].v
				};
			},
			converters: [

				function getPlaceholder( parser ) {
					var placeholder;
					if ( !parser.values ) {
						return null;
					}
					placeholder = parser.matchPattern( placeholderAtStartPattern );
					if ( placeholder && parser.values.hasOwnProperty( placeholder ) ) {
						return {
							v: parser.values[ placeholder ]
						};
					}
				},
				function getSpecial( parser ) {
					var special;
					if ( special = parser.matchPattern( specialsPattern ) ) {
						return {
							v: specials[ special ]
						};
					}
				},
				function getNumber( parser ) {
					var number;
					if ( number = parser.matchPattern( numberPattern ) ) {
						return {
							v: +number
						};
					}
				},
				function getString( parser ) {
					var stringLiteral = getStringLiteral( parser ),
						values;
					if ( stringLiteral && ( values = parser.values ) ) {
						return {
							v: stringLiteral.v.replace( placeholderPattern, function( match, $1 ) {
								return $1 in values ? values[ $1 ] : $1;
							} )
						};
					}
					return stringLiteral;
				},
				function getObject( parser ) {
					var result, pair;
					if ( !parser.matchString( '{' ) ) {
						return null;
					}
					result = {};
					while ( pair = getKeyValuePair( parser ) ) {
						result[ pair.key ] = pair.value;
						parser.allowWhitespace();
						if ( parser.matchString( '}' ) ) {
							return {
								v: result
							};
						}
						if ( !parser.matchString( ',' ) ) {
							return null;
						}
					}
					return null;
				},
				function getArray( parser ) {
					var result, valueToken;
					if ( !parser.matchString( '[' ) ) {
						return null;
					}
					result = [];
					parser.allowWhitespace();
					while ( valueToken = parser.read() ) {
						result.push( valueToken.v );
						parser.allowWhitespace();
						if ( parser.matchString( ']' ) ) {
							return {
								v: result
							};
						}
						if ( !parser.matchString( ',' ) ) {
							return null;
						}
						parser.allowWhitespace();
					}
					return null;
				}
			]
		} );

		function getKeyValuePair( parser ) {
			var key, valueToken, pair;
			parser.allowWhitespace();
			key = getKey( parser );
			if ( !key ) {
				return null;
			}
			pair = {
				key: key
			};
			parser.allowWhitespace();
			if ( !parser.matchString( ':' ) ) {
				return null;
			}
			parser.allowWhitespace();
			valueToken = parser.read();
			if ( !valueToken ) {
				return null;
			}
			pair.value = valueToken.v;
			return pair;
		}
		return function( str, values ) {
			var parser = new JsonParser( str, {
				values: values
			} );
			return parser.result;
		};
	}( parse_Parser__Parser, parse_Parser_expressions_primary_literal_stringLiteral__stringLiteral, parse_Parser_expressions_shared_key );

	var render_StringFragment_Interpolator = function( types, teardown, Mustache ) {

		var StringInterpolator = function( options ) {
			this.type = types.INTERPOLATOR;
			Mustache.init( this, options );
		};
		StringInterpolator.prototype = {
			update: Mustache.update,
			resolve: Mustache.resolve,
			reassign: Mustache.reassign,
			render: function( value ) {
				this.value = value;
				this.parentFragment.bubble();
			},
			teardown: function() {
				teardown( this );
			},
			toString: function() {
				if ( this.value == undefined ) {
					return '';
				}
				return stringify( this.value );
			}
		};
		return StringInterpolator;

		function stringify( value ) {
			if ( typeof value === 'string' ) {
				return value;
			}
			return JSON.stringify( value );
		}
	}( config_types, shared_teardown, render_shared_Mustache__Mustache );

	var render_StringFragment_Section = function( types, Mustache, updateSection, teardown, circular ) {

		var StringSection, StringFragment;
		circular.push( function() {
			StringFragment = circular.StringFragment;
		} );
		StringSection = function( options ) {
			this.type = types.SECTION;
			this.fragments = [];
			this.length = 0;
			Mustache.init( this, options );
		};
		StringSection.prototype = {
			update: Mustache.update,
			resolve: Mustache.resolve,
			reassign: Mustache.reassign,
			teardown: function() {
				this.teardownFragments();
				teardown( this );
			},
			teardownFragments: function() {
				while ( this.fragments.length ) {
					this.fragments.shift().teardown();
				}
				this.length = 0;
			},
			bubble: function() {
				this.value = this.fragments.join( '' );
				this.parentFragment.bubble();
			},
			render: function( value ) {
				var wrapped;
				if ( wrapped = this.root._wrapped[ this.keypath ] ) {
					value = wrapped.get();
				}
				updateSection( this, value );
				this.parentFragment.bubble();
			},
			createFragment: function( options ) {
				return new StringFragment( options );
			},
			toString: function() {
				return this.fragments.join( '' );
			}
		};
		return StringSection;
	}( config_types, render_shared_Mustache__Mustache, render_shared_updateSection, shared_teardown, circular );

	var render_StringFragment_Text = function( types ) {

		var StringText = function( text ) {
			this.type = types.TEXT;
			this.text = text;
		};
		StringText.prototype = {
			toString: function() {
				return this.text;
			},
			reassign: function() {},
			teardown: function() {}
		};
		return StringText;
	}( config_types );

	var render_StringFragment_prototype_getValue = function( types, warn, parseJSON ) {

		var empty = {};
		return function StringFragment$getValue( options ) {
			var asArgs, parse, value, values, jsonesque, parsed, cache, dirtyFlag, result;
			options = options || empty;
			asArgs = options.args;
			parse = asArgs || options.parse;
			cache = asArgs ? 'argsList' : 'value';
			dirtyFlag = asArgs ? 'dirtyArgs' : 'dirtyValue';
			if ( this[ dirtyFlag ] || !this.hasOwnProperty( cache ) ) {
				if ( this.items.length === 1 && this.items[ 0 ].type === types.INTERPOLATOR ) {
					value = this.items[ 0 ].value;
					if ( value !== undefined ) {
						result = asArgs ? [ value ] : value;
					}
				} else {
					if ( parse ) {
						values = {};
						jsonesque = processItems( this.items, values, this.root._guid );
						parsed = parseJSON( asArgs ? '[' + jsonesque + ']' : jsonesque, values );
					}
					if ( !parsed ) {
						result = asArgs ? [ this.toString() ] : this.toString();
					} else {
						result = parsed.value;
					}
				}
				this[ cache ] = result;
				this[ dirtyFlag ] = false;
			}
			return this[ cache ];
		};

		function processItems( items, values, guid, counter ) {
			counter = counter || 0;
			return items.map( function( item ) {
				var placeholderId, wrapped, value;
				if ( item.text ) {
					return item.text;
				}
				if ( item.fragments ) {
					return item.fragments.map( function( fragment ) {
						return processItems( fragment.items, values, guid, counter );
					} ).join( '' );
				}
				placeholderId = guid + '-' + counter++;
				if ( wrapped = item.root._wrapped[ item.keypath ] ) {
					value = wrapped.value;
				} else {
					value = item.value;
				}
				values[ placeholderId ] = value;
				return '${' + placeholderId + '}';
			} ).join( '' );
		}
	}( config_types, utils_warn, utils_parseJSON );

	var render_StringFragment__StringFragment = function( types, parseJSON, Fragment, Interpolator, Section, Text, getValue, circular ) {

		var StringFragment = function( options ) {
			Fragment.init( this, options );
		};
		StringFragment.prototype = {
			reassign: Fragment.reassign,
			createItem: function( options ) {
				if ( typeof options.descriptor === 'string' ) {
					return new Text( options.descriptor );
				}
				switch ( options.descriptor.t ) {
					case types.INTERPOLATOR:
						return new Interpolator( options );
					case types.TRIPLE:
						return new Interpolator( options );
					case types.SECTION:
						return new Section( options );
					default:
						throw 'Something went wrong in a rather interesting way';
				}
			},
			bubble: function() {
				this.dirtyValue = this.dirtyArgs = true;
				this.owner.bubble();
			},
			teardown: function() {
				var numItems, i;
				numItems = this.items.length;
				for ( i = 0; i < numItems; i += 1 ) {
					this.items[ i ].teardown();
				}
			},
			getValue: getValue,
			isSimple: function() {
				var i, item, containsInterpolator;
				if ( this.simple !== undefined ) {
					return this.simple;
				}
				i = this.items.length;
				while ( i-- ) {
					item = this.items[ i ];
					if ( item.type === types.TEXT ) {
						continue;
					}
					if ( item.type === types.INTERPOLATOR ) {
						if ( containsInterpolator ) {
							return false;
						} else {
							containsInterpolator = true;
							continue;
						}
					}
					return this.simple = false;
				}
				return this.simple = true;
			},
			toString: function() {
				return this.items.join( '' );
			},
			toJSON: function() {
				var value = this.getValue(),
					parsed;
				if ( typeof value === 'string' ) {
					parsed = parseJSON( value );
					value = parsed ? parsed.value : value;
				}
				return value;
			}
		};
		circular.StringFragment = StringFragment;
		return StringFragment;
	}( config_types, utils_parseJSON, render_shared_Fragment__Fragment, render_StringFragment_Interpolator, render_StringFragment_Section, render_StringFragment_Text, render_StringFragment_prototype_getValue, circular );

	var render_DomFragment_Attribute__Attribute = function( runloop, types, determineNameAndNamespace, setStaticAttribute, determinePropertyName, getInterpolator, bind, update, StringFragment ) {

		var DomAttribute, booleanAttributes;
		booleanAttributes = /allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|draggable|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|spellcheck|translate|trueSpeed|typeMustMatch|visible/;
		DomAttribute = function( options ) {
			this.type = types.ATTRIBUTE;
			this.element = options.element;
			determineNameAndNamespace( this, options.name );
			if ( !options.value || typeof options.value === 'string' ) {
				setStaticAttribute( this, options );
				return;
			}
			this.root = options.root;
			this.pNode = options.pNode;
			this.parentFragment = this.element.parentFragment;
			this.fragment = new StringFragment( {
				descriptor: options.value,
				root: this.root,
				owner: this
			} );
			this.interpolator = getInterpolator( this );
			if ( !this.pNode ) {
				return;
			}
			if ( this.name === 'value' ) {
				this.isValueAttribute = true;
				if ( this.pNode.tagName === 'INPUT' && this.pNode.type === 'file' ) {
					this.isFileInputValue = true;
				}
			}
			determinePropertyName( this, options );
			this.selfUpdating = this.fragment.isSimple();
			this.ready = true;
		};
		DomAttribute.prototype = {
			bind: bind,
			update: update,
			updateBindings: function() {
				this.keypath = this.interpolator.keypath || this.interpolator.ref;
				if ( this.propertyName === 'name' ) {
					this.pNode.name = '{{' + this.keypath + '}}';
				}
			},
			reassign: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				if ( this.fragment ) {
					this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );
					if ( this.twoway ) {
						this.updateBindings();
					}
				}
			},
			teardown: function() {
				var i;
				if ( this.boundEvents ) {
					i = this.boundEvents.length;
					while ( i-- ) {
						this.pNode.removeEventListener( this.boundEvents[ i ], this.updateModel, false );
					}
				}
				if ( this.fragment ) {
					this.fragment.teardown();
				}
			},
			bubble: function() {
				if ( this.selfUpdating ) {
					this.update();
				} else if ( !this.deferred && this.ready ) {
					runloop.addAttribute( this );
					this.deferred = true;
				}
			},
			toString: function() {
				var escaped, interpolator;
				if ( this.value === null ) {
					return this.name;
				}
				if ( this.name === 'value' && this.element.lcName === 'select' ) {
					return;
				}
				if ( this.name === 'name' && this.element.lcName === 'input' && ( interpolator = this.interpolator ) ) {
					return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
				}
				if ( this.fragment && booleanAttributes.test( this.name ) ) {
					return this.fragment.getValue() ? this.name : null;
				}
				if ( this.fragment ) {
					escaped = escape( this.fragment.toString() );
				} else {
					escaped = escape( this.value );
				}
				return this.name + ( escaped ? '="' + escaped + '"' : '' );
			}
		};

		function escape( string ) {
			return string.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /'/g, '&#39;' );
		}
		return DomAttribute;
	}( global_runloop, config_types, render_DomFragment_Attribute_helpers_determineNameAndNamespace, render_DomFragment_Attribute_helpers_setStaticAttribute, render_DomFragment_Attribute_helpers_determinePropertyName, render_DomFragment_Attribute_helpers_getInterpolator, render_DomFragment_Attribute_prototype_bind, render_DomFragment_Attribute_prototype_update, render_StringFragment__StringFragment );

	var render_DomFragment_Element_initialise_createElementAttribute = function( Attribute ) {

		return function createElementAttribute( element, name, fragment ) {
			var attr = new Attribute( {
				element: element,
				name: name,
				value: fragment,
				root: element.root,
				pNode: element.node
			} );
			element.attributes.push( element.attributes[ name ] = attr );
			if ( name !== 'name' ) {
				attr.update();
			}
		};
	}( render_DomFragment_Attribute__Attribute );

	var render_DomFragment_Element_initialise_createElementAttributes = function( createElementAttribute ) {

		return function( element, attributes ) {
			var attrName;
			element.attributes = [];
			for ( attrName in attributes ) {
				if ( attributes.hasOwnProperty( attrName ) ) {
					createElementAttribute( element, attrName, attributes[ attrName ] );
				}
			}
			return element.attributes;
		};
	}( render_DomFragment_Element_initialise_createElementAttribute );

	var render_DomFragment_Element_initialise_appendElementChildren = function( circular, warn, namespaces, StringFragment ) {

		var DomFragment, updateCss, updateScript;
		circular.push( function() {
			DomFragment = circular.DomFragment;
		} );
		updateCss = function() {
			var node = this.node,
				content = this.fragment.toString();
			if ( node.styleSheet ) {
				node.styleSheet.cssText = content;
			} else {
				while ( node.hasChildNodes() ) {
					node.removeChild( node.firstChild );
				}
				node.appendChild( document.createTextNode( content ) );
			}
		};
		updateScript = function() {
			if ( !this.node.type || this.node.type === 'text/javascript' ) {
				warn( 'Script tag was updated. This does not cause the code to be re-evaluated!' );
			}
			this.node.text = this.fragment.toString();
		};
		return function appendElementChildren( element, node, descriptor, docFrag ) {
			if ( element.lcName === 'script' || element.lcName === 'style' ) {
				element.fragment = new StringFragment( {
					descriptor: descriptor.f,
					root: element.root,
					owner: element
				} );
				if ( docFrag ) {
					if ( element.lcName === 'script' ) {
						element.bubble = updateScript;
						element.node.text = element.fragment.toString();
					} else {
						element.bubble = updateCss;
						element.bubble();
					}
				}
				return;
			}
			element.fragment = new DomFragment( {
				descriptor: descriptor.f,
				root: element.root,
				pNode: node,
				owner: element,
				pElement: element
			} );
			if ( docFrag ) {
				node.appendChild( element.fragment.docFrag );
			}
		};
	}( circular, utils_warn, config_namespaces, render_StringFragment__StringFragment );

	var render_DomFragment_Element_initialise_decorate_Decorator = function( warn, StringFragment ) {

		var getValueOptions, Decorator;
		getValueOptions = {
			args: true
		};
		Decorator = function( descriptor, ractive, owner ) {
			var decorator = this,
				name, fragment, errorMessage;
			decorator.root = ractive;
			decorator.node = owner.node;
			name = descriptor.n || descriptor;
			if ( typeof name !== 'string' ) {
				fragment = new StringFragment( {
					descriptor: name,
					root: ractive,
					owner: owner
				} );
				name = fragment.toString();
				fragment.teardown();
			}
			if ( descriptor.a ) {
				decorator.params = descriptor.a;
			} else if ( descriptor.d ) {
				decorator.fragment = new StringFragment( {
					descriptor: descriptor.d,
					root: ractive,
					owner: owner
				} );
				decorator.params = decorator.fragment.getValue( getValueOptions );
				decorator.fragment.bubble = function() {
					this.dirtyArgs = this.dirtyValue = true;
					decorator.params = this.getValue( getValueOptions );
					if ( decorator.ready ) {
						decorator.update();
					}
				};
			}
			decorator.fn = ractive.decorators[ name ];
			if ( !decorator.fn ) {
				errorMessage = 'Missing "' + name + '" decorator. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#decorators';
				if ( ractive.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
				}
			}
		};
		Decorator.prototype = {
			init: function() {
				var result, args;
				if ( this.params ) {
					args = [ this.node ].concat( this.params );
					result = this.fn.apply( this.root, args );
				} else {
					result = this.fn.call( this.root, this.node );
				}
				if ( !result || !result.teardown ) {
					throw new Error( 'Decorator definition must return an object with a teardown method' );
				}
				this.actual = result;
				this.ready = true;
			},
			update: function() {
				if ( this.actual.update ) {
					this.actual.update.apply( this.root, this.params );
				} else {
					this.actual.teardown( true );
					this.init();
				}
			},
			teardown: function( updating ) {
				this.actual.teardown();
				if ( !updating && this.fragment ) {
					this.fragment.teardown();
				}
			}
		};
		return Decorator;
	}( utils_warn, render_StringFragment__StringFragment );

	var render_DomFragment_Element_initialise_decorate__decorate = function( runloop, Decorator ) {

		return function( descriptor, root, owner ) {
			var decorator = new Decorator( descriptor, root, owner );
			if ( decorator.fn ) {
				owner.decorator = decorator;
				runloop.addDecorator( owner.decorator );
			}
		};
	}( global_runloop, render_DomFragment_Element_initialise_decorate_Decorator );

	var render_DomFragment_Element_initialise_addEventProxies_addEventProxy = function( warn, StringFragment ) {

		var addEventProxy, getValueOptions = {
				args: true
			}, MasterEventHandler, ProxyEvent, firePlainEvent, fireEventWithArgs, fireEventWithDynamicArgs, customHandlers, genericHandler, getCustomHandler;
		addEventProxy = function( element, triggerEventName, proxyDescriptor, indexRefs ) {
			var events, master;
			events = element.node._ractive.events;
			master = events[ triggerEventName ] || ( events[ triggerEventName ] = new MasterEventHandler( element, triggerEventName, indexRefs ) );
			master.add( proxyDescriptor );
		};
		MasterEventHandler = function( element, eventName ) {
			var definition;
			this.element = element;
			this.root = element.root;
			this.node = element.node;
			this.name = eventName;
			this.proxies = [];
			if ( definition = this.root.events[ eventName ] ) {
				this.custom = definition( this.node, getCustomHandler( eventName ) );
			} else {
				if ( !( 'on' + eventName in this.node ) ) {
					warn( 'Missing "' + this.name + '" event. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#events' );
				}
				this.node.addEventListener( eventName, genericHandler, false );
			}
		};
		MasterEventHandler.prototype = {
			add: function( proxy ) {
				this.proxies.push( new ProxyEvent( this.element, this.root, proxy ) );
			},
			teardown: function() {
				var i;
				if ( this.custom ) {
					this.custom.teardown();
				} else {
					this.node.removeEventListener( this.name, genericHandler, false );
				}
				i = this.proxies.length;
				while ( i-- ) {
					this.proxies[ i ].teardown();
				}
			},
			fire: function( event ) {
				var i = this.proxies.length;
				while ( i-- ) {
					this.proxies[ i ].fire( event );
				}
			}
		};
		ProxyEvent = function( element, ractive, descriptor ) {
			var name;
			this.root = ractive;
			name = descriptor.n || descriptor;
			if ( typeof name === 'string' ) {
				this.n = name;
			} else {
				this.n = new StringFragment( {
					descriptor: descriptor.n,
					root: this.root,
					owner: element
				} );
			}
			if ( descriptor.a ) {
				this.a = descriptor.a;
				this.fire = fireEventWithArgs;
				return;
			}
			if ( descriptor.d ) {
				this.d = new StringFragment( {
					descriptor: descriptor.d,
					root: this.root,
					owner: element
				} );
				this.fire = fireEventWithDynamicArgs;
				return;
			}
			this.fire = firePlainEvent;
		};
		ProxyEvent.prototype = {
			teardown: function() {
				if ( this.n.teardown ) {
					this.n.teardown();
				}
				if ( this.d ) {
					this.d.teardown();
				}
			},
			bubble: function() {}
		};
		firePlainEvent = function( event ) {
			this.root.fire( this.n.toString(), event );
		};
		fireEventWithArgs = function( event ) {
			this.root.fire.apply( this.root, [
				this.n.toString(),
				event
			].concat( this.a ) );
		};
		fireEventWithDynamicArgs = function( event ) {
			var args = this.d.getValue( getValueOptions );
			if ( typeof args === 'string' ) {
				args = args.substr( 1, args.length - 2 );
			}
			this.root.fire.apply( this.root, [
				this.n.toString(),
				event
			].concat( args ) );
		};
		genericHandler = function( event ) {
			var storage = this._ractive;
			storage.events[ event.type ].fire( {
				node: this,
				original: event,
				index: storage.index,
				keypath: storage.keypath,
				context: storage.root.get( storage.keypath )
			} );
		};
		customHandlers = {};
		getCustomHandler = function( eventName ) {
			if ( customHandlers[ eventName ] ) {
				return customHandlers[ eventName ];
			}
			return customHandlers[ eventName ] = function( event ) {
				var storage = event.node._ractive;
				event.index = storage.index;
				event.keypath = storage.keypath;
				event.context = storage.root.get( storage.keypath );
				storage.events[ eventName ].fire( event );
			};
		};
		return addEventProxy;
	}( utils_warn, render_StringFragment__StringFragment );

	var render_DomFragment_Element_initialise_addEventProxies__addEventProxies = function( addEventProxy ) {

		return function( element, proxies ) {
			var i, eventName, eventNames;
			for ( eventName in proxies ) {
				if ( proxies.hasOwnProperty( eventName ) ) {
					eventNames = eventName.split( '-' );
					i = eventNames.length;
					while ( i-- ) {
						addEventProxy( element, eventNames[ i ], proxies[ eventName ] );
					}
				}
			}
		};
	}( render_DomFragment_Element_initialise_addEventProxies_addEventProxy );

	var render_DomFragment_Element_initialise_updateLiveQueries = function( element ) {
		var instance, liveQueries, i, selector, query;
		instance = element.root;
		do {
			liveQueries = instance._liveQueries;
			i = liveQueries.length;
			while ( i-- ) {
				selector = liveQueries[ i ];
				query = liveQueries[ '_' + selector ];
				if ( query._test( element ) ) {
					( element.liveQueries || ( element.liveQueries = [] ) ).push( query );
				}
			}
		} while ( instance = instance._parent );
	};

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_init = function() {
		if ( this._inited ) {
			throw new Error( 'Cannot initialize a transition more than once' );
		}
		this._inited = true;
		this._fn.apply( this.root, [ this ].concat( this.params ) );
	};

	var render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix = function( isClient, vendors, createElement ) {

		var prefixCache, testStyle;
		if ( !isClient ) {
			return;
		}
		prefixCache = {};
		testStyle = createElement( 'div' ).style;
		return function( prop ) {
			var i, vendor, capped;
			if ( !prefixCache[ prop ] ) {
				if ( testStyle[ prop ] !== undefined ) {
					prefixCache[ prop ] = prop;
				} else {
					capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );
					i = vendors.length;
					while ( i-- ) {
						vendor = vendors[ i ];
						if ( testStyle[ vendor + capped ] !== undefined ) {
							prefixCache[ prop ] = vendor + capped;
							break;
						}
					}
				}
			}
			return prefixCache[ prop ];
		};
	}( config_isClient, config_vendors, utils_createElement );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_getStyle = function( legacy, isClient, isArray, prefix ) {

		var getComputedStyle;
		if ( !isClient ) {
			return;
		}
		getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
		return function( props ) {
			var computedStyle, styles, i, prop, value;
			computedStyle = window.getComputedStyle( this.node );
			if ( typeof props === 'string' ) {
				value = computedStyle[ prefix( props ) ];
				if ( value === '0px' ) {
					value = 0;
				}
				return value;
			}
			if ( !isArray( props ) ) {
				throw new Error( 'Transition#getStyle must be passed a string, or an array of strings representing CSS properties' );
			}
			styles = {};
			i = props.length;
			while ( i-- ) {
				prop = props[ i ];
				value = computedStyle[ prefix( prop ) ];
				if ( value === '0px' ) {
					value = 0;
				}
				styles[ prop ] = value;
			}
			return styles;
		};
	}( legacy, config_isClient, utils_isArray, render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_setStyle = function( prefix ) {

		return function( style, value ) {
			var prop;
			if ( typeof style === 'string' ) {
				this.node.style[ prefix( style ) ] = value;
			} else {
				for ( prop in style ) {
					if ( style.hasOwnProperty( prop ) ) {
						this.node.style[ prefix( prop ) ] = style[ prop ];
					}
				}
			}
			return this;
		};
	}( render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix );

	var utils_camelCase = function( hyphenatedStr ) {
		return hyphenatedStr.replace( /-([a-zA-Z])/g, function( match, $1 ) {
			return $1.toUpperCase();
		} );
	};

	var shared_Ticker = function( warn, getTime, animations ) {

		var Ticker = function( options ) {
			var easing;
			this.duration = options.duration;
			this.step = options.step;
			this.complete = options.complete;
			if ( typeof options.easing === 'string' ) {
				easing = options.root.easing[ options.easing ];
				if ( !easing ) {
					warn( 'Missing easing function ("' + options.easing + '"). You may need to download a plugin from [TODO]' );
					easing = linear;
				}
			} else if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			} else {
				easing = linear;
			}
			this.easing = easing;
			this.start = getTime();
			this.end = this.start + this.duration;
			this.running = true;
			animations.add( this );
		};
		Ticker.prototype = {
			tick: function( now ) {
				var elapsed, eased;
				if ( !this.running ) {
					return false;
				}
				if ( now > this.end ) {
					if ( this.step ) {
						this.step( 1 );
					}
					if ( this.complete ) {
						this.complete( 1 );
					}
					return false;
				}
				elapsed = now - this.start;
				eased = this.easing( elapsed / this.duration );
				if ( this.step ) {
					this.step( eased );
				}
				return true;
			},
			stop: function() {
				if ( this.abort ) {
					this.abort();
				}
				this.running = false;
			}
		};
		return Ticker;

		function linear( t ) {
			return t;
		}
	}( utils_warn, utils_getTime, shared_animations );

	var render_DomFragment_Element_shared_executeTransition_Transition_helpers_unprefix = function( vendors ) {

		var unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );
		return function( prop ) {
			return prop.replace( unprefixPattern, '' );
		};
	}( config_vendors );

	var render_DomFragment_Element_shared_executeTransition_Transition_helpers_hyphenate = function( vendors ) {

		var vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );
		return function( str ) {
			var hyphenated;
			if ( !str ) {
				return '';
			}
			if ( vendorPattern.test( str ) ) {
				str = '-' + str;
			}
			hyphenated = str.replace( /[A-Z]/g, function( match ) {
				return '-' + match.toLowerCase();
			} );
			return hyphenated;
		};
	}( config_vendors );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle_createTransitions = function( isClient, warn, createElement, camelCase, interpolate, Ticker, prefix, unprefix, hyphenate ) {

		var testStyle, TRANSITION, TRANSITIONEND, CSS_TRANSITIONS_ENABLED, TRANSITION_DURATION, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNCTION, canUseCssTransitions = {}, cannotUseCssTransitions = {};
		if ( !isClient ) {
			return;
		}
		testStyle = createElement( 'div' ).style;
		( function() {
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
		}() );
		if ( TRANSITION ) {
			TRANSITION_DURATION = TRANSITION + 'Duration';
			TRANSITION_PROPERTY = TRANSITION + 'Property';
			TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
		}
		return function( t, to, options, changedProperties, transitionEndHandler, resolve ) {
			setTimeout( function() {
				var hashPrefix, jsTransitionsComplete, cssTransitionsComplete, checkComplete;
				checkComplete = function() {
					if ( jsTransitionsComplete && cssTransitionsComplete ) {
						resolve();
					}
				};
				hashPrefix = t.node.namespaceURI + t.node.tagName;
				t.node.style[ TRANSITION_PROPERTY ] = changedProperties.map( prefix ).map( hyphenate ).join( ',' );
				t.node.style[ TRANSITION_TIMING_FUNCTION ] = hyphenate( options.easing || 'linear' );
				t.node.style[ TRANSITION_DURATION ] = options.duration / 1000 + 's';
				transitionEndHandler = function( event ) {
					var index;
					index = changedProperties.indexOf( camelCase( unprefix( event.propertyName ) ) );
					if ( index !== -1 ) {
						changedProperties.splice( index, 1 );
					}
					if ( changedProperties.length ) {
						return;
					}
					t.root.fire( t.name + ':end' );
					t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
					cssTransitionsComplete = true;
					checkComplete();
				};
				t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );
				setTimeout( function() {
					var i = changedProperties.length,
						hash, originalValue, index, propertiesToTransitionInJs = [],
						prop;
					while ( i-- ) {
						prop = changedProperties[ i ];
						hash = hashPrefix + prop;
						if ( canUseCssTransitions[ hash ] ) {
							t.node.style[ prefix( prop ) ] = to[ prop ];
						} else {
							originalValue = t.getStyle( prop );
						}
						if ( canUseCssTransitions[ hash ] === undefined ) {
							t.node.style[ prefix( prop ) ] = to[ prop ];
							canUseCssTransitions[ hash ] = t.getStyle( prop ) != to[ prop ];
							cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];
						}
						if ( cannotUseCssTransitions[ hash ] ) {
							index = changedProperties.indexOf( prop );
							if ( index === -1 ) {
								warn( 'Something very strange happened with transitions. If you see this message, please let @RactiveJS know. Thanks!' );
							} else {
								changedProperties.splice( index, 1 );
							}
							t.node.style[ prefix( prop ) ] = originalValue;
							propertiesToTransitionInJs.push( {
								name: prefix( prop ),
								interpolator: interpolate( originalValue, to[ prop ] )
							} );
						}
					}
					if ( propertiesToTransitionInJs.length ) {
						new Ticker( {
							root: t.root,
							duration: options.duration,
							easing: camelCase( options.easing ),
							step: function( pos ) {
								var prop, i;
								i = propertiesToTransitionInJs.length;
								while ( i-- ) {
									prop = propertiesToTransitionInJs[ i ];
									t.node.style[ prop.name ] = prop.interpolator( pos );
								}
							},
							complete: function() {
								jsTransitionsComplete = true;
								checkComplete();
							}
						} );
					} else {
						jsTransitionsComplete = true;
					}
					if ( !changedProperties.length ) {
						t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
						cssTransitionsComplete = true;
						checkComplete();
					}
				}, 0 );
			}, options.delay || 0 );
		};
	}( config_isClient, utils_warn, utils_createElement, utils_camelCase, shared_interpolate, shared_Ticker, render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix, render_DomFragment_Element_shared_executeTransition_Transition_helpers_unprefix, render_DomFragment_Element_shared_executeTransition_Transition_helpers_hyphenate );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle__animateStyle = function( legacy, isClient, warn, Promise, prefix, createTransitions ) {

		var getComputedStyle;
		if ( !isClient ) {
			return;
		}
		getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
		return function( style, value, options, complete ) {
			var t = this,
				to;
			if ( typeof style === 'string' ) {
				to = {};
				to[ style ] = value;
			} else {
				to = style;
				complete = options;
				options = value;
			}
			if ( !options ) {
				warn( 'The "' + t.name + '" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340' );
				options = t;
				complete = t.complete;
			}
			var promise = new Promise( function( resolve ) {
				var propertyNames, changedProperties, computedStyle, current, from, transitionEndHandler, i, prop;
				if ( !options.duration ) {
					t.setStyle( to );
					resolve();
					return;
				}
				propertyNames = Object.keys( to );
				changedProperties = [];
				computedStyle = window.getComputedStyle( t.node );
				from = {};
				i = propertyNames.length;
				while ( i-- ) {
					prop = propertyNames[ i ];
					current = computedStyle[ prefix( prop ) ];
					if ( current === '0px' ) {
						current = 0;
					}
					if ( current != to[ prop ] ) {
						changedProperties.push( prop );
						t.node.style[ prefix( prop ) ] = current;
					}
				}
				if ( !changedProperties.length ) {
					resolve();
					return;
				}
				createTransitions( t, to, options, changedProperties, transitionEndHandler, resolve );
			} );
			if ( complete ) {
				warn( 't.animateStyle returns a Promise as of 0.4.0. Transition authors should do t.animateStyle(...).then(callback)' );
				promise.then( complete );
			}
			return promise;
		};
	}( legacy, config_isClient, utils_warn, utils_Promise, render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix, render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle_createTransitions );

	var utils_fillGaps = function( target, source ) {
		var key;
		for ( key in source ) {
			if ( source.hasOwnProperty( key ) && !( key in target ) ) {
				target[ key ] = source[ key ];
			}
		}
		return target;
	};

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_processParams = function( fillGaps ) {

		return function( params, defaults ) {
			if ( typeof params === 'number' ) {
				params = {
					duration: params
				};
			} else if ( typeof params === 'string' ) {
				if ( params === 'slow' ) {
					params = {
						duration: 600
					};
				} else if ( params === 'fast' ) {
					params = {
						duration: 200
					};
				} else {
					params = {
						duration: 400
					};
				}
			} else if ( !params ) {
				params = {};
			}
			return fillGaps( params, defaults );
		};
	}( utils_fillGaps );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_resetStyle = function() {
		if ( this.originalStyle ) {
			this.node.setAttribute( 'style', this.originalStyle );
		} else {
			this.node.getAttribute( 'style' );
			this.node.removeAttribute( 'style' );
		}
	};

	var render_DomFragment_Element_shared_executeTransition_Transition__Transition = function( warn, StringFragment, init, getStyle, setStyle, animateStyle, processParams, resetStyle ) {

		var getValueOptions, Transition;
		getValueOptions = {
			args: true
		};
		Transition = function( descriptor, root, owner, isIntro ) {
			var t = this,
				name, fragment, errorMessage;
			this.root = root;
			this.node = owner.node;
			this.isIntro = isIntro;
			this.originalStyle = this.node.getAttribute( 'style' );
			t.complete = function( noReset ) {
				if ( !noReset && t.isIntro ) {
					t.resetStyle();
				}
				t.node._ractive.transition = null;
				t._manager.remove( t );
			};
			name = descriptor.n || descriptor;
			if ( typeof name !== 'string' ) {
				fragment = new StringFragment( {
					descriptor: name,
					root: this.root,
					owner: owner
				} );
				name = fragment.toString();
				fragment.teardown();
			}
			this.name = name;
			if ( descriptor.a ) {
				this.params = descriptor.a;
			} else if ( descriptor.d ) {
				fragment = new StringFragment( {
					descriptor: descriptor.d,
					root: this.root,
					owner: owner
				} );
				this.params = fragment.getValue( getValueOptions );
				fragment.teardown();
			}
			this._fn = root.transitions[ name ];
			if ( !this._fn ) {
				errorMessage = 'Missing "' + name + '" transition. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#transitions';
				if ( root.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
				}
				return;
			}
		};
		Transition.prototype = {
			init: init,
			getStyle: getStyle,
			setStyle: setStyle,
			animateStyle: animateStyle,
			processParams: processParams,
			resetStyle: resetStyle
		};
		return Transition;
	}( utils_warn, render_StringFragment__StringFragment, render_DomFragment_Element_shared_executeTransition_Transition_prototype_init, render_DomFragment_Element_shared_executeTransition_Transition_prototype_getStyle, render_DomFragment_Element_shared_executeTransition_Transition_prototype_setStyle, render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle__animateStyle, render_DomFragment_Element_shared_executeTransition_Transition_prototype_processParams, render_DomFragment_Element_shared_executeTransition_Transition_prototype_resetStyle );

	var render_DomFragment_Element_shared_executeTransition__executeTransition = function( runloop, Transition ) {

		return function( descriptor, ractive, owner, isIntro ) {
			var transition, node, oldTransition;
			if ( !ractive.transitionsEnabled || ractive._parent && !ractive._parent.transitionsEnabled ) {
				return;
			}
			transition = new Transition( descriptor, ractive, owner, isIntro );
			if ( transition._fn ) {
				node = transition.node;
				if ( oldTransition = node._ractive.transition ) {
					oldTransition.complete();
				}
				node._ractive.transition = transition;
				runloop.addTransition( transition );
			}
		};
	}( global_runloop, render_DomFragment_Element_shared_executeTransition_Transition__Transition );

	var render_DomFragment_Element_initialise__initialise = function( runloop, types, namespaces, create, defineProperty, warn, createElement, getInnerContext, getElementNamespace, createElementAttribute, createElementAttributes, appendElementChildren, decorate, addEventProxies, updateLiveQueries, executeTransition, enforceCase ) {

		return function initialiseElement( element, options, docFrag ) {
			var parentFragment, pNode, descriptor, namespace, name, attributes, width, height, loadHandler, root, selectBinding, errorMessage;
			element.type = types.ELEMENT;
			parentFragment = element.parentFragment = options.parentFragment;
			pNode = parentFragment.pNode;
			descriptor = element.descriptor = options.descriptor;
			element.parent = options.pElement || parentFragment.pElement;
			element.root = root = parentFragment.root;
			element.index = options.index;
			element.lcName = descriptor.e.toLowerCase();
			element.eventListeners = [];
			element.customEventListeners = [];
			element.cssDetachQueue = [];
			if ( element.lcName === 'option' ) {
				element.select = findParentSelect( element.parent );
			}
			if ( pNode ) {
				namespace = element.namespace = getElementNamespace( descriptor, pNode );
				name = namespace !== namespaces.html ? enforceCase( descriptor.e ) : descriptor.e;
				element.node = createElement( name, namespace );
				if ( root.css && pNode === root.el ) {
					element.node.setAttribute( 'data-rvcguid', root.constructor._guid || root._guid );
				}
				defineProperty( element.node, '_ractive', {
					value: {
						proxy: element,
						keypath: getInnerContext( parentFragment ),
						index: parentFragment.indexRefs,
						events: create( null ),
						root: root
					}
				} );
			}
			attributes = createElementAttributes( element, descriptor.a );
			if ( descriptor.f ) {
				if ( element.node && element.node.getAttribute( 'contenteditable' ) ) {
					if ( element.node.innerHTML ) {
						errorMessage = 'A pre-populated contenteditable element should not have children';
						if ( root.debug ) {
							throw new Error( errorMessage );
						} else {
							warn( errorMessage );
						}
					}
				}
				appendElementChildren( element, element.node, descriptor, docFrag );
			}
			if ( docFrag && descriptor.v ) {
				addEventProxies( element, descriptor.v );
			}
			if ( docFrag ) {
				if ( root.twoway ) {
					element.bind();
					if ( element.node.getAttribute( 'contenteditable' ) && element.node._ractive.binding ) {
						element.node._ractive.binding.update();
					}
				}
				if ( attributes.name && !attributes.name.twoway ) {
					attributes.name.update();
				}
				if ( element.node.tagName === 'IMG' && ( ( width = element.attributes.width ) || ( height = element.attributes.height ) ) ) {
					element.node.addEventListener( 'load', loadHandler = function() {
						if ( width ) {
							element.node.width = width.value;
						}
						if ( height ) {
							element.node.height = height.value;
						}
						element.node.removeEventListener( 'load', loadHandler, false );
					}, false );
				}
				docFrag.appendChild( element.node );
				if ( descriptor.o ) {
					decorate( descriptor.o, root, element );
				}
				if ( descriptor.t0 || descriptor.t1 ) {
					executeTransition( descriptor.t0 || descriptor.t1, root, element, true );
				}
				if ( element.node.tagName === 'OPTION' ) {
					if ( pNode.tagName === 'SELECT' && ( selectBinding = pNode._ractive.binding ) ) {
						selectBinding.deferUpdate();
					}
					if ( !attributes.value ) {
						createElementAttribute( element, 'value', descriptor.f );
					}
					if ( element.node._ractive.value == pNode._ractive.value ) {
						element.node.selected = true;
					}
				}
				if ( element.node.autofocus ) {
					runloop.focus( element.node );
				}
			}
			updateLiveQueries( element );
		};

		function findParentSelect( element ) {
			do {
				if ( element.lcName === 'select' ) {
					return element;
				}
			} while ( element = element.parent );
		}
	}( global_runloop, config_types, config_namespaces, utils_create, utils_defineProperty, utils_warn, utils_createElement, shared_getInnerContext, render_DomFragment_Element_initialise_getElementNamespace, render_DomFragment_Element_initialise_createElementAttribute, render_DomFragment_Element_initialise_createElementAttributes, render_DomFragment_Element_initialise_appendElementChildren, render_DomFragment_Element_initialise_decorate__decorate, render_DomFragment_Element_initialise_addEventProxies__addEventProxies, render_DomFragment_Element_initialise_updateLiveQueries, render_DomFragment_Element_shared_executeTransition__executeTransition, render_DomFragment_shared_enforceCase );

	var render_DomFragment_Element_prototype_teardown = function( runloop, executeTransition ) {

		return function Element_prototype_teardown( destroy ) {
			var eventName, binding, bindings;
			if ( destroy ) {
				this.willDetach = true;
				runloop.detachWhenReady( this );
			}
			if ( this.fragment ) {
				this.fragment.teardown( false );
			}
			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}
			if ( this.node ) {
				for ( eventName in this.node._ractive.events ) {
					this.node._ractive.events[ eventName ].teardown();
				}
				if ( binding = this.node._ractive.binding ) {
					binding.teardown();
					bindings = this.root._twowayBindings[ binding.attr.keypath ];
					bindings.splice( bindings.indexOf( binding ), 1 );
				}
			}
			if ( this.decorator ) {
				this.decorator.teardown();
			}
			if ( this.descriptor.t0 || this.descriptor.t2 ) {
				executeTransition( this.descriptor.t0 || this.descriptor.t2, this.root, this, false );
			}
			if ( this.liveQueries ) {
				removeFromLiveQueries( this );
			}
		};

		function removeFromLiveQueries( element ) {
			var query, selector, i;
			i = element.liveQueries.length;
			while ( i-- ) {
				query = element.liveQueries[ i ];
				selector = query.selector;
				query._remove( element.node );
			}
		}
	}( global_runloop, render_DomFragment_Element_shared_executeTransition__executeTransition );

	var render_DomFragment_Element_prototype_reassign = function( assignNewKeypath ) {

		return function reassignElement( indexRef, newIndex, oldKeypath, newKeypath ) {
			var i, storage, masterEventName, proxies, proxy, binding, bindings, liveQueries, ractive;
			i = this.attributes.length;
			while ( i-- ) {
				this.attributes[ i ].reassign( indexRef, newIndex, oldKeypath, newKeypath );
			}
			if ( storage = this.node._ractive ) {
				assignNewKeypath( storage, 'keypath', oldKeypath, newKeypath );
				if ( indexRef != undefined ) {
					storage.index[ indexRef ] = newIndex;
				}
				for ( masterEventName in storage.events ) {
					proxies = storage.events[ masterEventName ].proxies;
					i = proxies.length;
					while ( i-- ) {
						proxy = proxies[ i ];
						if ( typeof proxy.n === 'object' ) {
							proxy.a.reassign( indexRef, newIndex, oldKeypath, newKeypath );
						}
						if ( proxy.d ) {
							proxy.d.reassign( indexRef, newIndex, oldKeypath, newKeypath );
						}
					}
				}
				if ( binding = storage.binding ) {
					if ( binding.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
						bindings = storage.root._twowayBindings[ binding.keypath ];
						bindings.splice( bindings.indexOf( binding ), 1 );
						binding.keypath = binding.keypath.replace( oldKeypath, newKeypath );
						bindings = storage.root._twowayBindings[ binding.keypath ] || ( storage.root._twowayBindings[ binding.keypath ] = [] );
						bindings.push( binding );
					}
				}
			}
			if ( this.fragment ) {
				this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );
			}
			if ( liveQueries = this.liveQueries ) {
				ractive = this.root;
				i = liveQueries.length;
				while ( i-- ) {
					liveQueries[ i ]._makeDirty();
				}
			}
		};
	}( render_shared_utils_assignNewKeypath );

	var config_voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;

	var render_DomFragment_Element_prototype_toString = function( voidElementNames, isArray ) {

		return function() {
			var str;
			str = '<' + ( this.descriptor.y ? '!doctype' : this.descriptor.e );
			str += this.attributes.map( stringifyAttribute ).join( '' );
			if ( this.lcName === 'option' && optionIsSelected( this ) ) {
				str += ' selected';
			}
			if ( this.lcName === 'input' && inputIsCheckedRadio( this ) ) {
				str += ' checked';
			}
			str += '>';
			if ( this.fragment ) {
				str += this.fragment.toString();
			}
			if ( !voidElementNames.test( this.descriptor.e ) ) {
				str += '</' + this.descriptor.e + '>';
			}
			this.stringifying = false;
			return str;
		};

		function optionIsSelected( element ) {
			var optionValue, optionValueAttribute, optionValueInterpolator, selectValueAttribute, selectValueInterpolator, selectValue, i;
			optionValueAttribute = element.attributes.value;
			if ( optionValueAttribute.value ) {
				optionValue = optionValueAttribute.value;
			} else {
				optionValueInterpolator = optionValueAttribute.interpolator;
				if ( !optionValueInterpolator ) {
					return;
				}
				optionValue = element.root.get( optionValueInterpolator.keypath || optionValueInterpolator.ref );
			}
			selectValueAttribute = element.select.attributes.value;
			selectValueInterpolator = selectValueAttribute.interpolator;
			if ( !selectValueInterpolator ) {
				return;
			}
			selectValue = element.root.get( selectValueInterpolator.keypath || selectValueInterpolator.ref );
			if ( selectValue == optionValue ) {
				return true;
			}
			if ( element.select.attributes.multiple && isArray( selectValue ) ) {
				i = selectValue.length;
				while ( i-- ) {
					if ( selectValue[ i ] == optionValue ) {
						return true;
					}
				}
			}
		}

		function inputIsCheckedRadio( element ) {
			var attributes, typeAttribute, valueAttribute, nameAttribute;
			attributes = element.attributes;
			typeAttribute = attributes.type;
			valueAttribute = attributes.value;
			nameAttribute = attributes.name;
			if ( !typeAttribute || typeAttribute.value !== 'radio' || !valueAttribute || !nameAttribute.interpolator ) {
				return;
			}
			if ( valueAttribute.value === nameAttribute.interpolator.value ) {
				return true;
			}
		}

		function stringifyAttribute( attribute ) {
			var str = attribute.toString();
			return str ? ' ' + str : '';
		}
	}( config_voidElementNames, utils_isArray );

	var render_DomFragment_Element_prototype_find = function( matches ) {

		return function( selector ) {
			if ( matches( this.node, selector ) ) {
				return this.node;
			}
			if ( this.fragment && this.fragment.find ) {
				return this.fragment.find( selector );
			}
		};
	}( utils_matches );

	var render_DomFragment_Element_prototype_findAll = function( selector, query ) {
		if ( query._test( this, true ) && query.live ) {
			( this.liveQueries || ( this.liveQueries = [] ) ).push( query );
		}
		if ( this.fragment ) {
			this.fragment.findAll( selector, query );
		}
	};

	var render_DomFragment_Element_prototype_findComponent = function( selector ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( selector );
		}
	};

	var render_DomFragment_Element_prototype_findAllComponents = function( selector, query ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( selector, query );
		}
	};

	var render_DomFragment_Element_prototype_bind = function() {
		var attributes = this.attributes;
		if ( !this.node ) {
			return;
		}
		if ( this.binding ) {
			this.binding.teardown();
			this.binding = null;
		}
		if ( this.node.getAttribute( 'contenteditable' ) && attributes.value && attributes.value.bind() ) {
			return;
		}
		switch ( this.lcName ) {
			case 'select':
			case 'textarea':
				if ( attributes.value ) {
					attributes.value.bind();
				}
				return;
			case 'input':
				if ( this.node.type === 'radio' || this.node.type === 'checkbox' ) {
					if ( attributes.name && attributes.name.bind() ) {
						return;
					}
					if ( attributes.checked && attributes.checked.bind() ) {
						return;
					}
				}
				if ( attributes.value && attributes.value.bind() ) {
					return;
				}
		}
	};

	var render_DomFragment_Element__Element = function( runloop, css, initialise, teardown, reassign, toString, find, findAll, findComponent, findAllComponents, bind ) {

		var DomElement = function( options, docFrag ) {
			initialise( this, options, docFrag );
		};
		DomElement.prototype = {
			detach: function() {
				var Component;
				if ( this.node ) {
					if ( this.node.parentNode ) {
						this.node.parentNode.removeChild( this.node );
					}
					return this.node;
				}
				if ( this.cssDetachQueue.length ) {
					runloop.start();
					while ( Component === this.cssDetachQueue.pop() ) {
						css.remove( Component );
					}
					runloop.end();
				}
			},
			teardown: teardown,
			reassign: reassign,
			firstNode: function() {
				return this.node;
			},
			findNextNode: function() {
				return null;
			},
			bubble: function() {},
			toString: toString,
			find: find,
			findAll: findAll,
			findComponent: findComponent,
			findAllComponents: findAllComponents,
			bind: bind
		};
		return DomElement;
	}( global_runloop, global_css, render_DomFragment_Element_initialise__initialise, render_DomFragment_Element_prototype_teardown, render_DomFragment_Element_prototype_reassign, render_DomFragment_Element_prototype_toString, render_DomFragment_Element_prototype_find, render_DomFragment_Element_prototype_findAll, render_DomFragment_Element_prototype_findComponent, render_DomFragment_Element_prototype_findAllComponents, render_DomFragment_Element_prototype_bind );

	var config_errors = {
		missingParser: 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser'
	};

	var registries_partials = {};

	var parse_converters_mustache_delimiterChange = function() {

		var delimiterChangePattern = /^[^\s=]+/,
			whitespacePattern = /^\s+/;
		return function( parser ) {
			var start, opening, closing;
			if ( !parser.matchString( '=' ) ) {
				return null;
			}
			start = parser.pos;
			parser.allowWhitespace();
			opening = parser.matchPattern( delimiterChangePattern );
			if ( !opening ) {
				parser.pos = start;
				return null;
			}
			if ( !parser.matchPattern( whitespacePattern ) ) {
				return null;
			}
			closing = parser.matchPattern( delimiterChangePattern );
			if ( !closing ) {
				parser.pos = start;
				return null;
			}
			parser.allowWhitespace();
			if ( !parser.matchString( '=' ) ) {
				parser.pos = start;
				return null;
			}
			return [
				opening,
				closing
			];
		};
	}();

	var parse_converters_mustache_type = function( types ) {

		var mustacheTypes = {
			'#': types.SECTION,
			'^': types.INVERTED,
			'/': types.CLOSING,
			'>': types.PARTIAL,
			'!': types.COMMENT,
			'&': types.TRIPLE
		};
		return function( parser ) {
			var type = mustacheTypes[ parser.str.charAt( parser.pos ) ];
			if ( !type ) {
				return null;
			}
			parser.pos += 1;
			return type;
		};
	}( config_types );

	var parse_converters_mustache_content = function( types, mustacheType ) {

		var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
			arrayMemberPattern = /^[0-9][1-9]*$/;
		return function( parser, isTriple ) {
			var start, pos, mustache, type, expression, i, remaining, index, delimiter, keypathExpression;
			start = parser.pos;
			mustache = {};
			if ( isTriple ) {
				mustache.t = types.TRIPLE;
			} else {
				if ( expression = parser.readExpression() ) {
					mustache.t = types.INTERPOLATOR;
					parser.allowWhitespace();
					if ( parser.matchString( parser.delimiters[ 1 ] ) ) {
						parser.pos -= parser.delimiters[ 1 ].length;
					} else {
						parser.pos = start;
						expression = null;
					}
				}
				if ( !expression ) {
					type = mustacheType( parser );
					mustache.t = type || types.INTERPOLATOR;
					if ( mustache.t === types.INVERTED ) {
						mustache.t = types.SECTION;
						mustache.n = 1;
					}
					if ( type === types.COMMENT || type === types.CLOSING ) {
						remaining = parser.remaining();
						index = remaining.indexOf( parser.delimiters[ 1 ] );
						if ( index !== -1 ) {
							mustache.r = remaining.substr( 0, index );
							parser.pos += index;
							return mustache;
						}
					}
				}
			}
			if ( !expression ) {
				parser.allowWhitespace();
				expression = parser.readExpression();
				remaining = parser.remaining();
				delimiter = isTriple ? parser.tripleDelimiters[ 1 ] : parser.delimiters[ 1 ];
				if ( remaining.substr( 0, delimiter.length ) !== delimiter && remaining.charAt( 0 ) !== ':' ) {
					pos = parser.pos;
					parser.pos = start;
					remaining = parser.remaining();
					index = remaining.indexOf( parser.delimiters[ 1 ] );
					if ( index !== -1 ) {
						mustache.r = remaining.substr( 0, index ).trim();
						parser.pos += index;
						return mustache;
					}
					parser.pos = pos;
				}
			}
			while ( expression.t === types.BRACKETED && expression.x ) {
				expression = expression.x;
			}
			if ( expression.t === types.REFERENCE ) {
				mustache.r = expression.n;
			} else {
				if ( expression.t === types.NUMBER_LITERAL && arrayMemberPattern.test( expression.v ) ) {
					mustache.r = expression.v;
				} else if ( keypathExpression = getKeypathExpression( parser, expression ) ) {
					mustache.kx = keypathExpression;
				} else {
					mustache.x = parser.flattenExpression( expression );
				}
			}
			if ( i = parser.matchPattern( indexRefPattern ) ) {
				mustache.i = i;
			}
			return mustache;
		};

		function getKeypathExpression( parser, expression ) {
			var members = [],
				refinement;
			while ( expression.t === types.MEMBER && expression.r.t === types.REFINEMENT ) {
				refinement = expression.r;
				if ( refinement.x ) {
					if ( refinement.x.t === types.REFERENCE ) {
						members.unshift( refinement.x );
					} else {
						members.unshift( parser.flattenExpression( refinement.x ) );
					}
				} else {
					members.unshift( refinement.n );
				}
				expression = expression.x;
			}
			if ( expression.t !== types.REFERENCE ) {
				return null;
			}
			return {
				r: expression.n,
				m: members
			};
		}
	}( config_types, parse_converters_mustache_type );

	var parse_converters_mustache = function( types, delimiterChange, mustacheContent ) {

		var delimiterChangeToken = {
			t: types.DELIMCHANGE,
			exclude: true
		};
		return getMustache;

		function getMustache( parser ) {
			var seekTripleFirst = parser.tripleDelimiters[ 0 ].length > parser.delimiters[ 0 ].length;
			return getMustacheOrTriple( parser, seekTripleFirst ) || getMustacheOrTriple( parser, !seekTripleFirst );
		}

		function getMustacheOrTriple( parser, seekTriple ) {
			var start = parser.pos,
				mustache, delimiters, children, child;
			delimiters = seekTriple ? parser.tripleDelimiters : parser.delimiters;
			if ( !parser.matchString( delimiters[ 0 ] ) ) {
				return null;
			}
			if ( mustache = delimiterChange( parser ) ) {
				if ( !parser.matchString( delimiters[ 1 ] ) ) {
					return null;
				}
				parser[ seekTriple ? 'tripleDelimiters' : 'delimiters' ] = mustache;
				return delimiterChangeToken;
			}
			parser.allowWhitespace();
			mustache = mustacheContent( parser, seekTriple );
			if ( mustache === null ) {
				parser.pos = start;
				return null;
			}
			parser.allowWhitespace();
			if ( !parser.matchString( delimiters[ 1 ] ) ) {
				parser.error( 'Expected closing delimiter \'' + delimiters[ 1 ] + '\' after reference' );
			}
			if ( mustache.t === types.COMMENT ) {
				mustache.exclude = true;
			}
			if ( mustache.t === types.SECTION || mustache.t === types.INVERTED ) {
				children = [];
				while ( child = parser.read() ) {
					if ( child.t === types.CLOSING ) {
						break;
					}
					children.push( child );
				}
				if ( children.length ) {
					mustache.f = children;
				}
			}
			return mustache;
		}
	}( config_types, parse_converters_mustache_delimiterChange, parse_converters_mustache_content );

	var parse_converters_comment = function( types ) {

		var OPEN_COMMENT = '<!--',
			CLOSE_COMMENT = '-->';
		return function( parser ) {
			var content, remaining, endIndex;
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
			return {
				t: types.COMMENT,
				c: content
			};
		};
	}( config_types );

	var parse_converters_utils_getLowestIndex = function( haystack, needles ) {
		var i, index, lowest;
		i = needles.length;
		while ( i-- ) {
			index = haystack.indexOf( needles[ i ] );
			if ( !index ) {
				return 0;
			}
			if ( index === -1 ) {
				continue;
			}
			if ( !lowest || index < lowest ) {
				lowest = index;
			}
		}
		return lowest || -1;
	};

	var parse_converters_utils_decodeCharacterReferences = function() {

		var htmlEntities, controlCharacters, namedEntityPattern, hexEntityPattern, decimalEntityPattern;
		htmlEntities = {
			quot: 34,
			amp: 38,
			apos: 39,
			lt: 60,
			gt: 62,
			nbsp: 160,
			iexcl: 161,
			cent: 162,
			pound: 163,
			curren: 164,
			yen: 165,
			brvbar: 166,
			sect: 167,
			uml: 168,
			copy: 169,
			ordf: 170,
			laquo: 171,
			not: 172,
			shy: 173,
			reg: 174,
			macr: 175,
			deg: 176,
			plusmn: 177,
			sup2: 178,
			sup3: 179,
			acute: 180,
			micro: 181,
			para: 182,
			middot: 183,
			cedil: 184,
			sup1: 185,
			ordm: 186,
			raquo: 187,
			frac14: 188,
			frac12: 189,
			frac34: 190,
			iquest: 191,
			Agrave: 192,
			Aacute: 193,
			Acirc: 194,
			Atilde: 195,
			Auml: 196,
			Aring: 197,
			AElig: 198,
			Ccedil: 199,
			Egrave: 200,
			Eacute: 201,
			Ecirc: 202,
			Euml: 203,
			Igrave: 204,
			Iacute: 205,
			Icirc: 206,
			Iuml: 207,
			ETH: 208,
			Ntilde: 209,
			Ograve: 210,
			Oacute: 211,
			Ocirc: 212,
			Otilde: 213,
			Ouml: 214,
			times: 215,
			Oslash: 216,
			Ugrave: 217,
			Uacute: 218,
			Ucirc: 219,
			Uuml: 220,
			Yacute: 221,
			THORN: 222,
			szlig: 223,
			agrave: 224,
			aacute: 225,
			acirc: 226,
			atilde: 227,
			auml: 228,
			aring: 229,
			aelig: 230,
			ccedil: 231,
			egrave: 232,
			eacute: 233,
			ecirc: 234,
			euml: 235,
			igrave: 236,
			iacute: 237,
			icirc: 238,
			iuml: 239,
			eth: 240,
			ntilde: 241,
			ograve: 242,
			oacute: 243,
			ocirc: 244,
			otilde: 245,
			ouml: 246,
			divide: 247,
			oslash: 248,
			ugrave: 249,
			uacute: 250,
			ucirc: 251,
			uuml: 252,
			yacute: 253,
			thorn: 254,
			yuml: 255,
			OElig: 338,
			oelig: 339,
			Scaron: 352,
			scaron: 353,
			Yuml: 376,
			fnof: 402,
			circ: 710,
			tilde: 732,
			Alpha: 913,
			Beta: 914,
			Gamma: 915,
			Delta: 916,
			Epsilon: 917,
			Zeta: 918,
			Eta: 919,
			Theta: 920,
			Iota: 921,
			Kappa: 922,
			Lambda: 923,
			Mu: 924,
			Nu: 925,
			Xi: 926,
			Omicron: 927,
			Pi: 928,
			Rho: 929,
			Sigma: 931,
			Tau: 932,
			Upsilon: 933,
			Phi: 934,
			Chi: 935,
			Psi: 936,
			Omega: 937,
			alpha: 945,
			beta: 946,
			gamma: 947,
			delta: 948,
			epsilon: 949,
			zeta: 950,
			eta: 951,
			theta: 952,
			iota: 953,
			kappa: 954,
			lambda: 955,
			mu: 956,
			nu: 957,
			xi: 958,
			omicron: 959,
			pi: 960,
			rho: 961,
			sigmaf: 962,
			sigma: 963,
			tau: 964,
			upsilon: 965,
			phi: 966,
			chi: 967,
			psi: 968,
			omega: 969,
			thetasym: 977,
			upsih: 978,
			piv: 982,
			ensp: 8194,
			emsp: 8195,
			thinsp: 8201,
			zwnj: 8204,
			zwj: 8205,
			lrm: 8206,
			rlm: 8207,
			ndash: 8211,
			mdash: 8212,
			lsquo: 8216,
			rsquo: 8217,
			sbquo: 8218,
			ldquo: 8220,
			rdquo: 8221,
			bdquo: 8222,
			dagger: 8224,
			Dagger: 8225,
			bull: 8226,
			hellip: 8230,
			permil: 8240,
			prime: 8242,
			Prime: 8243,
			lsaquo: 8249,
			rsaquo: 8250,
			oline: 8254,
			frasl: 8260,
			euro: 8364,
			image: 8465,
			weierp: 8472,
			real: 8476,
			trade: 8482,
			alefsym: 8501,
			larr: 8592,
			uarr: 8593,
			rarr: 8594,
			darr: 8595,
			harr: 8596,
			crarr: 8629,
			lArr: 8656,
			uArr: 8657,
			rArr: 8658,
			dArr: 8659,
			hArr: 8660,
			forall: 8704,
			part: 8706,
			exist: 8707,
			empty: 8709,
			nabla: 8711,
			isin: 8712,
			notin: 8713,
			ni: 8715,
			prod: 8719,
			sum: 8721,
			minus: 8722,
			lowast: 8727,
			radic: 8730,
			prop: 8733,
			infin: 8734,
			ang: 8736,
			and: 8743,
			or: 8744,
			cap: 8745,
			cup: 8746,
			'int': 8747,
			there4: 8756,
			sim: 8764,
			cong: 8773,
			asymp: 8776,
			ne: 8800,
			equiv: 8801,
			le: 8804,
			ge: 8805,
			sub: 8834,
			sup: 8835,
			nsub: 8836,
			sube: 8838,
			supe: 8839,
			oplus: 8853,
			otimes: 8855,
			perp: 8869,
			sdot: 8901,
			lceil: 8968,
			rceil: 8969,
			lfloor: 8970,
			rfloor: 8971,
			lang: 9001,
			rang: 9002,
			loz: 9674,
			spades: 9824,
			clubs: 9827,
			hearts: 9829,
			diams: 9830
		};
		controlCharacters = [
			8364,
			129,
			8218,
			402,
			8222,
			8230,
			8224,
			8225,
			710,
			8240,
			352,
			8249,
			338,
			141,
			381,
			143,
			144,
			8216,
			8217,
			8220,
			8221,
			8226,
			8211,
			8212,
			732,
			8482,
			353,
			8250,
			339,
			157,
			382,
			376
		];
		namedEntityPattern = new RegExp( '&(' + Object.keys( htmlEntities ).join( '|' ) + ');?', 'g' );
		hexEntityPattern = /&#x([0-9]+);?/g;
		decimalEntityPattern = /&#([0-9]+);?/g;
		return function decodeCharacterReferences( html ) {
			var result;
			result = html.replace( namedEntityPattern, function( match, name ) {
				if ( htmlEntities[ name ] ) {
					return String.fromCharCode( htmlEntities[ name ] );
				}
				return match;
			} );
			result = result.replace( hexEntityPattern, function( match, hex ) {
				return String.fromCharCode( validateCode( parseInt( hex, 16 ) ) );
			} );
			result = result.replace( decimalEntityPattern, function( match, charCode ) {
				return String.fromCharCode( validateCode( charCode ) );
			} );
			return result;
		};

		function validateCode( code ) {
			if ( !code ) {
				return 65533;
			}
			if ( code === 10 ) {
				return 32;
			}
			if ( code < 128 ) {
				return code;
			}
			if ( code <= 159 ) {
				return controlCharacters[ code - 128 ];
			}
			if ( code < 55296 ) {
				return code;
			}
			if ( code <= 57343 ) {
				return 65533;
			}
			if ( code <= 65535 ) {
				return code;
			}
			return 65533;
		}
	}();

	var parse_converters_text = function( types, getLowestIndex, decodeCharacterReferences ) {

		return function( parser ) {
			var index, remaining, barrier;
			remaining = parser.remaining();
			barrier = parser.inside ? '</' + parser.inside : '<';
			if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
				index = remaining.indexOf( barrier );
			} else {
				index = getLowestIndex( remaining, [
					barrier,
					parser.delimiters[ 0 ],
					parser.tripleDelimiters[ 0 ]
				] );
			}
			if ( !index ) {
				return null;
			}
			if ( index === -1 ) {
				index = remaining.length;
			}
			parser.pos += index;
			return decodeCharacterReferences( remaining.substr( 0, index ) );
		};
	}( config_types, parse_converters_utils_getLowestIndex, parse_converters_utils_decodeCharacterReferences );

	var parse_converters_element_closingTag = function( types ) {

		var closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;
		return function( parser ) {
			var tag;
			if ( !parser.matchString( '</' ) ) {
				return null;
			}
			if ( tag = parser.matchPattern( closingTagPattern ) ) {
				return {
					t: types.CLOSING_TAG,
					e: tag
				};
			}
			parser.pos -= 2;
			parser.error( 'Illegal closing tag' );
		};
	}( config_types );

	var parse_converters_element_attribute = function( getLowestIndex, getMustache ) {

		var attributeNamePattern = /^[^\s"'>\/=]+/,
			unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/;
		return getAttribute;

		function getAttribute( parser ) {
			var attr, name, value;
			parser.allowWhitespace();
			name = parser.matchPattern( attributeNamePattern );
			if ( !name ) {
				return null;
			}
			attr = {
				name: name
			};
			value = getAttributeValue( parser );
			if ( value ) {
				attr.value = value;
			}
			return attr;
		}

		function getAttributeValue( parser ) {
			var start, value;
			start = parser.pos;
			parser.allowWhitespace();
			if ( !parser.matchString( '=' ) ) {
				parser.pos = start;
				return null;
			}
			parser.allowWhitespace();
			value = getQuotedAttributeValue( parser, '\'' ) || getQuotedAttributeValue( parser, '"' ) || getUnquotedAttributeValue( parser );
			if ( value === null ) {
				parser.pos = start;
				return null;
			}
			if ( value.length === 1 && typeof value[ 0 ] === 'string' ) {
				return value[ 0 ];
			}
			return value;
		}

		function getUnquotedAttributeValueToken( parser ) {
			var start, text, index;
			start = parser.pos;
			text = parser.matchPattern( unquotedAttributeValueTextPattern );
			if ( !text ) {
				return null;
			}
			if ( ( index = text.indexOf( parser.delimiters[ 0 ] ) ) !== -1 ) {
				text = text.substr( 0, index );
				parser.pos = start + text.length;
			}
			return text;
		}

		function getUnquotedAttributeValue( parser ) {
			var tokens, token;
			tokens = [];
			token = getMustache( parser ) || getUnquotedAttributeValueToken( parser );
			while ( token !== null ) {
				tokens.push( token );
				token = getMustache( parser ) || getUnquotedAttributeValueToken( parser );
			}
			if ( !tokens.length ) {
				return null;
			}
			return tokens;
		}

		function getQuotedAttributeValue( parser, quoteMark ) {
			var start, tokens, token;
			start = parser.pos;
			if ( !parser.matchString( quoteMark ) ) {
				return null;
			}
			tokens = [];
			token = getMustache( parser ) || getQuotedStringToken( parser, quoteMark );
			while ( token !== null ) {
				tokens.push( token );
				token = getMustache( parser ) || getQuotedStringToken( parser, quoteMark );
			}
			if ( !parser.matchString( quoteMark ) ) {
				parser.pos = start;
				return null;
			}
			return tokens;
		}

		function getQuotedStringToken( parser, quoteMark ) {
			var start, index, remaining;
			start = parser.pos;
			remaining = parser.remaining();
			index = getLowestIndex( remaining, [
				quoteMark,
				parser.delimiters[ 0 ],
				parser.delimiters[ 1 ]
			] );
			if ( index === -1 ) {
				parser.error( 'Quoted attribute value must have a closing quote' );
			}
			if ( !index ) {
				return null;
			}
			parser.pos += index;
			return remaining.substr( 0, index );
		}
	}( parse_converters_utils_getLowestIndex, parse_converters_mustache );

	var parse_converters_element_processDirective = function( types, parseJSON ) {

		return function( tokens ) {
			var result, token, colonIndex, directiveName, directiveArgs, parsed;
			if ( typeof tokens === 'string' ) {
				if ( tokens.indexOf( ':' ) === -1 ) {
					return tokens;
				}
				tokens = [ tokens ];
			}
			result = {};
			directiveName = [];
			directiveArgs = [];
			while ( tokens.length ) {
				token = tokens.shift();
				if ( typeof token === 'string' ) {
					colonIndex = token.indexOf( ':' );
					if ( colonIndex === -1 ) {
						directiveName.push( token );
					} else {
						if ( colonIndex ) {
							directiveName.push( token.substr( 0, colonIndex ) );
						}
						if ( token.length > colonIndex + 1 ) {
							directiveArgs[ 0 ] = token.substring( colonIndex + 1 );
						}
						break;
					}
				} else {
					directiveName.push( token );
				}
			}
			directiveArgs = directiveArgs.concat( tokens );
			if ( directiveArgs.length || typeof directiveName !== 'string' ) {
				result = {
					n: directiveName.length === 1 && typeof directiveName[ 0 ] === 'string' ? directiveName[ 0 ] : directiveName
				};
				if ( directiveArgs.length === 1 && typeof directiveArgs[ 0 ] === 'string' ) {
					parsed = parseJSON( '[' + directiveArgs[ 0 ] + ']' );
					result.a = parsed ? parsed.value : directiveArgs[ 0 ];
				} else {
					result.d = directiveArgs;
				}
			} else {
				result = directiveName;
			}
			return result;
		};
	}( config_types, utils_parseJSON );

	var parse_converters_element = function( types, voidElementNames, getMustache, getComment, getText, getClosingTag, getAttribute, processDirective ) {

		var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/,
			validTagNameFollower = /^[\s\n\/>]/,
			onPattern = /^on/,
			proxyEventPattern = /^on-([a-zA-Z$_][a-zA-Z$_0-9]+)/,
			directives = {
				'intro-outro': 't0',
				intro: 't1',
				outro: 't2',
				decorator: 'o'
			}, exclude = {
				exclude: true
			}, converters;
		converters = [
			getMustache,
			getComment,
			getElement,
			getText,
			getClosingTag
		];
		return getElement;

		function getElement( parser ) {
			var start, element, lowerCaseName, directiveName, match, attribute, selfClosing, children, child;
			start = parser.pos;
			if ( parser.inside ) {
				return null;
			}
			if ( !parser.matchString( '<' ) ) {
				return null;
			}
			if ( parser.nextChar() === '/' ) {
				return null;
			}
			element = {
				t: types.ELEMENT
			};
			if ( parser.matchString( '!' ) ) {
				element.y = 1;
			}
			element.e = parser.matchPattern( tagNamePattern );
			if ( !element.e ) {
				return null;
			}
			if ( !validTagNameFollower.test( parser.nextChar() ) ) {
				parser.error( 'Illegal tag name' );
			}
			while ( attribute = getAttribute( parser ) ) {
				if ( directiveName = directives[ attribute.name ] ) {
					element[ directiveName ] = processDirective( attribute.value );
				} else if ( match = proxyEventPattern.exec( attribute.name ) ) {
					if ( !element.v )
						element.v = {};
					element.v[ match[ 1 ] ] = processDirective( attribute.value );
				} else {
					if ( !parser.sanitizeEventAttributes || !onPattern.test( attribute.name ) ) {
						if ( !element.a )
							element.a = {};
						element.a[ attribute.name ] = attribute.value || 0;
					}
				}
			}
			parser.allowWhitespace();
			if ( parser.matchString( '/' ) ) {
				selfClosing = true;
			}
			if ( !parser.matchString( '>' ) ) {
				return null;
			}
			lowerCaseName = element.e.toLowerCase();
			if ( !selfClosing && !voidElementNames.test( element.e ) ) {
				if ( lowerCaseName === 'script' || lowerCaseName === 'style' ) {
					parser.inside = lowerCaseName;
				}
				children = [];
				while ( child = parser.read( converters ) ) {
					if ( child.t === types.CLOSING ) {
						break;
					}
					if ( child.t === types.CLOSING_TAG ) {
						break;
					}
					children.push( child );
				}
				if ( children.length ) {
					element.f = children;
				}
			}
			parser.inside = null;
			if ( parser.sanitizeElements && parser.sanitizeElements.indexOf( lowerCaseName ) !== -1 ) {
				return exclude;
			}
			return element;
		}
	}( config_types, config_voidElementNames, parse_converters_mustache, parse_converters_comment, parse_converters_text, parse_converters_element_closingTag, parse_converters_element_attribute, parse_converters_element_processDirective );

	var parse_utils_trimWhitespace = function() {

		var leadingWhitespace = /^[ \n]+/,
			trailingWhitespace = /[ \n]+$/;
		return function( items ) {
			var item;
			item = items[ 0 ];
			if ( typeof item === 'string' ) {
				item = item.replace( leadingWhitespace, '' );
				if ( !item ) {
					items.shift();
				} else {
					items[ 0 ] = item;
				}
			}
			item = items[ items.length - 1 ];
			if ( typeof item === 'string' ) {
				item = item.replace( trailingWhitespace, '' );
				if ( !item ) {
					items.pop();
				} else {
					items[ items.length - 1 ] = item;
				}
			}
		};
	}();

	var parse_utils_stripStandalones = function( types ) {

		var leadingLinebreak = /^\s*\r?\n/,
			trailingLinebreak = /\r?\n\s*$/;
		return function( items ) {
			var i, current, backOne, backTwo, lastSectionItem;
			for ( i = 1; i < items.length; i += 1 ) {
				current = items[ i ];
				backOne = items[ i - 1 ];
				backTwo = items[ i - 2 ];
				if ( isString( current ) && isComment( backOne ) && isString( backTwo ) ) {
					if ( trailingLinebreak.test( backTwo ) && leadingLinebreak.test( current ) ) {
						items[ i - 2 ] = backTwo.replace( trailingLinebreak, '\n' );
						items[ i ] = current.replace( leadingLinebreak, '' );
					}
				}
				if ( isSection( current ) && isString( backOne ) ) {
					if ( trailingLinebreak.test( backOne ) && isString( current.f[ 0 ] ) && leadingLinebreak.test( current.f[ 0 ] ) ) {
						items[ i - 1 ] = backOne.replace( trailingLinebreak, '\n' );
						current.f[ 0 ] = current.f[ 0 ].replace( leadingLinebreak, '' );
					}
				}
				if ( isString( current ) && isSection( backOne ) ) {
					lastSectionItem = backOne.f[ backOne.f.length - 1 ];
					if ( isString( lastSectionItem ) && trailingLinebreak.test( lastSectionItem ) && leadingLinebreak.test( current ) ) {
						backOne.f[ backOne.f.length - 1 ] = lastSectionItem.replace( trailingLinebreak, '\n' );
						items[ i ] = current.replace( leadingLinebreak, '' );
					}
				}
			}
			return items;
		};

		function isString( item ) {
			return typeof item === 'string';
		}

		function isComment( item ) {
			return item.t === types.COMMENT || item.t === types.DELIMCHANGE;
		}

		function isSection( item ) {
			return ( item.t === types.SECTION || item.t === types.INVERTED ) && item.f;
		}
	}( config_types );

	// Ractive.parse
	// ===============
	//
	// Takes in a string, and returns an object representing the parsed template.
	// A parsed template is an array of 1 or more 'descriptors', which in some
	// cases have children.
	//
	// The format is optimised for size, not readability, however for reference the
	// keys for each descriptor are as follows:
	//
	// * r - Reference, e.g. 'mustache' in {{mustache}}
	// * t - Type code (e.g. 1 is text, 2 is interpolator...)
	// * f - Fragment. Contains a descriptor's children
	// * e - Element name
	// * a - map of element Attributes, or proxy event/transition Arguments
	// * d - Dynamic proxy event/transition arguments
	// * n - indicates an iNverted section
	// * i - Index reference, e.g. 'num' in {{#section:num}}content{{/section}}
	// * v - eVent proxies (i.e. when user e.g. clicks on a node, fire proxy event)
	// * x - eXpressions
	// * s - String representation of an expression function
	// * t0 - intro/outro Transition
	// * t1 - intro Transition
	// * t2 - outro Transition
	// * o - decOrator
	// * y - is doctYpe
	// * c - is Content (e.g. of a comment node)
	var parse__parse = function( types, Parser, mustache, comment, element, text, trimWhitespace, stripStandalones ) {

		var StandardParser, parse, onlyWhitespace, inlinePartialStart, inlinePartialEnd, parseCompoundTemplate;
		onlyWhitespace = /^\s*$/;
		inlinePartialStart = /<!--\s*\{\{\s*>\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/;
		inlinePartialEnd = /<!--\s*\{\{\s*\/\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/;
		StandardParser = Parser.extend( {
			init: function( str, options ) {
				this.delimiters = options.delimiters || [
					'{{',
					'}}'
				];
				this.tripleDelimiters = options.tripleDelimiters || [
					'{{{',
					'}}}'
				];
				this.interpolate = {
					script: !options.interpolate || options.interpolate.script !== false,
					style: !options.interpolate || options.interpolate.style !== false
				};
				if ( options.sanitize === true ) {
					options.sanitize = {
						elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
						eventAttributes: true
					};
				}
				this.sanitizeElements = options.sanitize && options.sanitize.elements;
				this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
			},
			postProcess: function( items, options ) {
				cleanup( items, options.stripComments !== false, options.preserveWhitespace );
				if ( !options.preserveWhitespace ) {
					trimWhitespace( items );
				}
				return items;
			},
			converters: [
				mustache,
				comment,
				element,
				text
			]
		} );
		parse = function( template, options ) {
			var parser;
			options = options || {};
			if ( inlinePartialStart.test( template ) ) {
				return parseCompoundTemplate( template, options );
			}
			if ( options.sanitize === true ) {
				options.sanitize = {
					elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
					eventAttributes: true
				};
			}
			parser = new StandardParser( template, options );
			if ( parser.leftover ) {
				parser.error( 'Unexpected character' );
			}
			return parser.result;
		};
		parseCompoundTemplate = function( template, options ) {
			var mainTemplate, remaining, partials, name, startMatch, endMatch;
			partials = {};
			mainTemplate = '';
			remaining = template;
			while ( startMatch = inlinePartialStart.exec( remaining ) ) {
				name = startMatch[ 1 ];
				mainTemplate += remaining.substr( 0, startMatch.index );
				remaining = remaining.substring( startMatch.index + startMatch[ 0 ].length );
				endMatch = inlinePartialEnd.exec( remaining );
				if ( !endMatch || endMatch[ 1 ] !== name ) {
					throw new Error( 'Inline partials must have a closing delimiter, and cannot be nested' );
				}
				partials[ name ] = parse( remaining.substr( 0, endMatch.index ), options );
				remaining = remaining.substring( endMatch.index + endMatch[ 0 ].length );
			}
			return {
				main: parse( mainTemplate, options ),
				partials: partials
			};
		};
		return parse;

		function cleanup( items, stripComments, preserveWhitespace ) {
			var i, item;
			stripStandalones( items );
			i = items.length;
			while ( i-- ) {
				item = items[ i ];
				if ( item.exclude ) {
					items.splice( i, 1 );
				} else if ( stripComments && item.t === types.COMMENT ) {
					items.splice( i, 1 );
				}
				if ( item.f ) {
					cleanup( item.f, stripComments, preserveWhitespace );
					if ( !preserveWhitespace && item.t === types.ELEMENT ) {
						trimWhitespace( item.f );
					}
				}
			}
			i = items.length;
			while ( i-- ) {
				if ( typeof items[ i ] === 'string' && typeof items[ i + 1 ] === 'string' ) {
					items[ i ] = items[ i ] + items[ i + 1 ];
					items.splice( i + 1, 1 );
				}
			}
		}
	}( config_types, parse_Parser__Parser, parse_converters_mustache, parse_converters_comment, parse_converters_element, parse_converters_text, parse_utils_trimWhitespace, parse_utils_stripStandalones );

	var render_DomFragment_Partial_deIndent = function() {

		var empty = /^\s*$/,
			leadingWhitespace = /^\s*/;
		return function( str ) {
			var lines, firstLine, lastLine, minIndent;
			lines = str.split( '\n' );
			firstLine = lines[ 0 ];
			if ( firstLine !== undefined && empty.test( firstLine ) ) {
				lines.shift();
			}
			lastLine = lines[ lines.length - 1 ];
			if ( lastLine !== undefined && empty.test( lastLine ) ) {
				lines.pop();
			}
			minIndent = lines.reduce( reducer, null );
			if ( minIndent ) {
				str = lines.map( function( line ) {
					return line.replace( minIndent, '' );
				} ).join( '\n' );
			}
			return str;
		};

		function reducer( previous, line ) {
			var lineIndent = leadingWhitespace.exec( line )[ 0 ];
			if ( previous === null || lineIndent.length < previous.length ) {
				return lineIndent;
			}
			return previous;
		}
	}();

	var render_DomFragment_Partial_getPartialDescriptor = function( errors, isClient, warn, isObject, partials, parse, deIndent ) {

		return function getPartialDescriptor( ractive, name ) {
			var el, partial, errorMessage;
			if ( partial = getPartialFromRegistry( ractive, name ) ) {
				return partial;
			}
			if ( isClient ) {
				el = document.getElementById( name );
				if ( el && el.tagName === 'SCRIPT' ) {
					if ( !parse ) {
						throw new Error( errors.missingParser );
					}
					registerPartial( parse( deIndent( el.text ), ractive.parseOptions ), name, partials );
				}
			}
			partial = partials[ name ];
			if ( !partial ) {
				errorMessage = 'Could not find descriptor for partial "' + name + '"';
				if ( ractive.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
				}
				return [];
			}
			return partial;
		};

		function getPartialFromRegistry( ractive, name ) {
			var partial;
			if ( ractive.partials[ name ] ) {
				if ( typeof ractive.partials[ name ] === 'string' ) {
					if ( !parse ) {
						throw new Error( errors.missingParser );
					}
					partial = parse( ractive.partials[ name ], ractive.parseOptions );
					registerPartial( partial, name, ractive.partials );
				}
				return ractive.partials[ name ];
			}
		}

		function registerPartial( partial, name, registry ) {
			var key;
			if ( isObject( partial ) ) {
				registry[ name ] = partial.main;
				for ( key in partial.partials ) {
					if ( partial.partials.hasOwnProperty( key ) ) {
						registry[ key ] = partial.partials[ key ];
					}
				}
			} else {
				registry[ name ] = partial;
			}
		}
	}( config_errors, config_isClient, utils_warn, utils_isObject, registries_partials, parse__parse, render_DomFragment_Partial_deIndent );

	var render_DomFragment_Partial_applyIndent = function( string, indent ) {
		var indented;
		if ( !indent ) {
			return string;
		}
		indented = string.split( '\n' ).map( function( line, notFirstLine ) {
			return notFirstLine ? indent + line : line;
		} ).join( '\n' );
		return indented;
	};

	var render_DomFragment_Partial__Partial = function( types, getPartialDescriptor, applyIndent, circular ) {

		var DomPartial, DomFragment;
		circular.push( function() {
			DomFragment = circular.DomFragment;
		} );
		DomPartial = function( options, docFrag ) {
			var parentFragment = this.parentFragment = options.parentFragment,
				descriptor;
			this.type = types.PARTIAL;
			this.name = options.descriptor.r;
			this.index = options.index;
			if ( !options.descriptor.r ) {
				throw new Error( 'Partials must have a static reference (no expressions). This may change in a future version of Ractive.' );
			}
			descriptor = getPartialDescriptor( parentFragment.root, options.descriptor.r );
			this.fragment = new DomFragment( {
				descriptor: descriptor,
				root: parentFragment.root,
				pNode: parentFragment.pNode,
				owner: this
			} );
			if ( docFrag ) {
				docFrag.appendChild( this.fragment.docFrag );
			}
		};
		DomPartial.prototype = {
			firstNode: function() {
				return this.fragment.firstNode();
			},
			findNextNode: function() {
				return this.parentFragment.findNextNode( this );
			},
			detach: function() {
				return this.fragment.detach();
			},
			reassign: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				return this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );
			},
			teardown: function( destroy ) {
				this.fragment.teardown( destroy );
			},
			toString: function() {
				var string, previousItem, lastLine, match;
				string = this.fragment.toString();
				previousItem = this.parentFragment.items[ this.index - 1 ];
				if ( !previousItem || previousItem.type !== types.TEXT ) {
					return string;
				}
				lastLine = previousItem.descriptor.split( '\n' ).pop();
				if ( match = /^\s+$/.exec( lastLine ) ) {
					return applyIndent( string, match[ 0 ] );
				}
				return string;
			},
			find: function( selector ) {
				return this.fragment.find( selector );
			},
			findAll: function( selector, query ) {
				return this.fragment.findAll( selector, query );
			},
			findComponent: function( selector ) {
				return this.fragment.findComponent( selector );
			},
			findAllComponents: function( selector, query ) {
				return this.fragment.findAllComponents( selector, query );
			}
		};
		return DomPartial;
	}( config_types, render_DomFragment_Partial_getPartialDescriptor, render_DomFragment_Partial_applyIndent, circular );

	var render_DomFragment_Component_initialise_createModel_ComponentParameter = function( runloop, StringFragment ) {

		var getValueOptions, ComponentParameter;
		getValueOptions = {
			parse: true
		};
		ComponentParameter = function( component, key, value ) {
			this.parentFragment = component.parentFragment;
			this.component = component;
			this.key = key;
			this.fragment = new StringFragment( {
				descriptor: value,
				root: component.root,
				owner: this
			} );
			this.selfUpdating = this.fragment.isSimple();
			this.value = this.fragment.getValue( getValueOptions );
		};
		ComponentParameter.prototype = {
			bubble: function() {
				if ( this.selfUpdating ) {
					this.update();
				} else if ( !this.deferred && this.ready ) {
					runloop.addAttribute( this );
					this.deferred = true;
				}
			},
			update: function() {
				var value = this.fragment.getValue( getValueOptions );
				this.component.instance.set( this.key, value );
				this.value = value;
			},
			teardown: function() {
				this.fragment.teardown();
			}
		};
		return ComponentParameter;
	}( global_runloop, render_StringFragment__StringFragment );

	var render_DomFragment_Component_initialise_createModel__createModel = function( types, parseJSON, resolveRef, get, ComponentParameter ) {

		return function( component, defaultData, attributes, toBind ) {
			var data = {}, key, value;
			component.complexParameters = [];
			for ( key in attributes ) {
				if ( attributes.hasOwnProperty( key ) ) {
					value = getValue( component, key, attributes[ key ], toBind );
					if ( value !== undefined || defaultData[ key ] === undefined ) {
						data[ key ] = value;
					}
				}
			}
			return data;
		};

		function getValue( component, key, descriptor, toBind ) {
			var parameter, parsed, parentInstance, parentFragment, keypath, indexRef;
			parentInstance = component.root;
			parentFragment = component.parentFragment;
			if ( typeof descriptor === 'string' ) {
				parsed = parseJSON( descriptor );
				if ( !parsed ) {
					return descriptor;
				}
				return parsed.value;
			}
			if ( descriptor === null ) {
				return true;
			}
			if ( descriptor.length === 1 && descriptor[ 0 ].t === types.INTERPOLATOR && descriptor[ 0 ].r ) {
				if ( parentFragment.indexRefs && parentFragment.indexRefs[ indexRef = descriptor[ 0 ].r ] !== undefined ) {
					component.indexRefBindings[ indexRef ] = key;
					return parentFragment.indexRefs[ indexRef ];
				}
				keypath = resolveRef( parentInstance, descriptor[ 0 ].r, parentFragment ) || descriptor[ 0 ].r;
				toBind.push( {
					childKeypath: key,
					parentKeypath: keypath
				} );
				return get( parentInstance, keypath );
			}
			parameter = new ComponentParameter( component, key, descriptor );
			component.complexParameters.push( parameter );
			return parameter.value;
		}
	}( config_types, utils_parseJSON, shared_resolveRef, shared_get__get, render_DomFragment_Component_initialise_createModel_ComponentParameter );

	var render_DomFragment_Component_initialise_createInstance = function() {

		return function( component, Component, data, docFrag, contentDescriptor ) {
			var instance, parentFragment, partials, root, adapt;
			parentFragment = component.parentFragment;
			root = component.root;
			partials = {
				content: contentDescriptor || []
			};
			adapt = combineAdaptors( root, Component.defaults.adapt, Component.adaptors );
			instance = new Component( {
				el: parentFragment.pNode,
				append: true,
				data: data,
				partials: partials,
				magic: root.magic || Component.defaults.magic,
				modifyArrays: root.modifyArrays,
				_parent: root,
				_component: component,
				adapt: adapt
			} );
			if ( docFrag ) {
				instance.insert( docFrag );
				instance.fragment.pNode = instance.el = parentFragment.pNode;
			}
			return instance;
		};

		function combineAdaptors( root, defaultAdapt ) {
			var adapt, len, i;
			if ( root.adapt.length ) {
				adapt = root.adapt.map( function( stringOrObject ) {
					if ( typeof stringOrObject === 'object' ) {
						return stringOrObject;
					}
					return root.adaptors[ stringOrObject ] || stringOrObject;
				} );
			} else {
				adapt = [];
			}
			if ( len = defaultAdapt.length ) {
				for ( i = 0; i < len; i += 1 ) {
					if ( adapt.indexOf( defaultAdapt[ i ] ) === -1 ) {
						adapt.push( defaultAdapt[ i ] );
					}
				}
			}
			return adapt;
		}
	}();

	var render_DomFragment_Component_initialise_createBindings = function( createComponentBinding, get, set ) {

		return function createInitialComponentBindings( component, toBind ) {
			toBind.forEach( function createInitialComponentBinding( pair ) {
				var childValue, parentValue;
				createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );
				childValue = get( component.instance, pair.childKeypath );
				parentValue = get( component.root, pair.parentKeypath );
				if ( childValue !== undefined && parentValue === undefined ) {
					set( component.root, pair.parentKeypath, childValue );
				}
			} );
		};
	}( shared_createComponentBinding, shared_get__get, shared_set );

	var render_DomFragment_Component_initialise_propagateEvents = function( warn ) {

		var errorMessage = 'Components currently only support simple events - you cannot include arguments. Sorry!';
		return function( component, eventsDescriptor ) {
			var eventName;
			for ( eventName in eventsDescriptor ) {
				if ( eventsDescriptor.hasOwnProperty( eventName ) ) {
					propagateEvent( component.instance, component.root, eventName, eventsDescriptor[ eventName ] );
				}
			}
		};

		function propagateEvent( childInstance, parentInstance, eventName, proxyEventName ) {
			if ( typeof proxyEventName !== 'string' ) {
				if ( parentInstance.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
					return;
				}
			}
			childInstance.on( eventName, function() {
				var args = Array.prototype.slice.call( arguments );
				args.unshift( proxyEventName );
				parentInstance.fire.apply( parentInstance, args );
			} );
		}
	}( utils_warn );

	var render_DomFragment_Component_initialise_updateLiveQueries = function( component ) {
		var ancestor, query;
		ancestor = component.root;
		while ( ancestor ) {
			if ( query = ancestor._liveComponentQueries[ '_' + component.name ] ) {
				query.push( component.instance );
			}
			ancestor = ancestor._parent;
		}
	};

	var render_DomFragment_Component_initialise__initialise = function( types, warn, createModel, createInstance, createBindings, propagateEvents, updateLiveQueries ) {

		return function initialiseComponent( component, options, docFrag ) {
			var parentFragment, root, Component, data, toBind;
			parentFragment = component.parentFragment = options.parentFragment;
			root = parentFragment.root;
			component.root = root;
			component.type = types.COMPONENT;
			component.name = options.descriptor.e;
			component.index = options.index;
			component.indexRefBindings = {};
			component.bindings = [];
			Component = root.components[ options.descriptor.e ];
			if ( !Component ) {
				throw new Error( 'Component "' + options.descriptor.e + '" not found' );
			}
			toBind = [];
			data = createModel( component, Component.data || {}, options.descriptor.a, toBind );
			createInstance( component, Component, data, docFrag, options.descriptor.f );
			createBindings( component, toBind );
			propagateEvents( component, options.descriptor.v );
			if ( options.descriptor.t1 || options.descriptor.t2 || options.descriptor.o ) {
				warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
			}
			updateLiveQueries( component );
		};
	}( config_types, utils_warn, render_DomFragment_Component_initialise_createModel__createModel, render_DomFragment_Component_initialise_createInstance, render_DomFragment_Component_initialise_createBindings, render_DomFragment_Component_initialise_propagateEvents, render_DomFragment_Component_initialise_updateLiveQueries );

	var render_DomFragment_Component__Component = function( initialise, getNewKeypath ) {

		var DomComponent = function( options, docFrag ) {
			initialise( this, options, docFrag );
		};
		DomComponent.prototype = {
			firstNode: function() {
				return this.instance.fragment.firstNode();
			},
			findNextNode: function() {
				return this.parentFragment.findNextNode( this );
			},
			detach: function() {
				return this.instance.fragment.detach();
			},
			teardown: function( destroy ) {
				while ( this.complexParameters.length ) {
					this.complexParameters.pop().teardown();
				}
				while ( this.bindings.length ) {
					this.bindings.pop().teardown();
				}
				removeFromLiveComponentQueries( this );
				this.shouldDestroy = destroy;
				this.instance.teardown();
			},
			reassign: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				var childInstance = this.instance,
					parentInstance = childInstance._parent,
					indexRefAlias, query;
				this.bindings.forEach( function( binding ) {
					var updated;
					if ( binding.root !== parentInstance ) {
						return;
					}
					if ( binding.keypath === indexRef ) {
						childInstance.set( binding.otherKeypath, newIndex );
					}
					if ( updated = getNewKeypath( binding.keypath, oldKeypath, newKeypath ) ) {
						binding.reassign( updated );
					}
				} );
				if ( indexRefAlias = this.indexRefBindings[ indexRef ] ) {
					childInstance.set( indexRefAlias, newIndex );
				}
				if ( query = this.root._liveComponentQueries[ '_' + this.name ] ) {
					query._makeDirty();
				}
			},
			toString: function() {
				return this.instance.fragment.toString();
			},
			find: function( selector ) {
				return this.instance.fragment.find( selector );
			},
			findAll: function( selector, query ) {
				return this.instance.fragment.findAll( selector, query );
			},
			findComponent: function( selector ) {
				if ( !selector || selector === this.name ) {
					return this.instance;
				}
				if ( this.instance.fragment ) {
					return this.instance.fragment.findComponent( selector );
				}
				return null;
			},
			findAllComponents: function( selector, query ) {
				query._test( this, true );
				if ( this.instance.fragment ) {
					this.instance.fragment.findAllComponents( selector, query );
				}
			}
		};
		return DomComponent;

		function removeFromLiveComponentQueries( component ) {
			var instance, query;
			instance = component.root;
			do {
				if ( query = instance._liveComponentQueries[ '_' + component.name ] ) {
					query._remove( component );
				}
			} while ( instance = instance._parent );
		}
	}( render_DomFragment_Component_initialise__initialise, render_shared_utils_getNewKeypath );

	var render_DomFragment_Comment = function( types, detach ) {

		var DomComment = function( options, docFrag ) {
			this.type = types.COMMENT;
			this.descriptor = options.descriptor;
			if ( docFrag ) {
				this.node = document.createComment( options.descriptor.c );
				docFrag.appendChild( this.node );
			}
		};
		DomComment.prototype = {
			detach: detach,
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
				}
			},
			firstNode: function() {
				return this.node;
			},
			toString: function() {
				return '<!--' + this.descriptor.c + '-->';
			}
		};
		return DomComment;
	}( config_types, render_DomFragment_shared_detach );

	var render_DomFragment__DomFragment = function( types, matches, Fragment, Text, Interpolator, Section, Triple, Element, Partial, Component, Comment, circular ) {

		var DomFragment = function( options ) {
			if ( options.pNode ) {
				this.docFrag = document.createDocumentFragment();
			}
			Fragment.init( this, options );
		};
		DomFragment.prototype = {
			reassign: Fragment.reassign,
			detach: function() {
				var len, i;
				if ( this.docFrag ) {
					if ( this.nodes ) {
						len = this.nodes.length;
						for ( i = 0; i < len; i += 1 ) {
							this.docFrag.appendChild( this.nodes[ i ] );
						}
					} else if ( this.items ) {
						len = this.items.length;
						for ( i = 0; i < len; i += 1 ) {
							this.docFrag.appendChild( this.items[ i ].detach() );
						}
					}
					return this.docFrag;
				}
			},
			createItem: function( options ) {
				if ( typeof options.descriptor === 'string' ) {
					return new Text( options, this.docFrag );
				}
				switch ( options.descriptor.t ) {
					case types.INTERPOLATOR:
						return new Interpolator( options, this.docFrag );
					case types.SECTION:
						return new Section( options, this.docFrag );
					case types.TRIPLE:
						return new Triple( options, this.docFrag );
					case types.ELEMENT:
						if ( this.root.components[ options.descriptor.e ] ) {
							return new Component( options, this.docFrag );
						}
						return new Element( options, this.docFrag );
					case types.PARTIAL:
						return new Partial( options, this.docFrag );
					case types.COMMENT:
						return new Comment( options, this.docFrag );
					default:
						throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
				}
			},
			teardown: function( destroy ) {
				var node;
				if ( this.nodes && destroy ) {
					while ( node = this.nodes.pop() ) {
						node.parentNode.removeChild( node );
					}
				} else if ( this.items ) {
					while ( this.items.length ) {
						this.items.pop().teardown( destroy );
					}
				}
				this.nodes = this.items = this.docFrag = null;
			},
			firstNode: function() {
				if ( this.items && this.items[ 0 ] ) {
					return this.items[ 0 ].firstNode();
				} else if ( this.nodes ) {
					return this.nodes[ 0 ] || null;
				}
				return null;
			},
			findNextNode: function( item ) {
				var index = item.index;
				if ( this.items[ index + 1 ] ) {
					return this.items[ index + 1 ].firstNode();
				}
				if ( this.owner === this.root ) {
					if ( !this.owner.component ) {
						return null;
					}
					return this.owner.component.findNextNode();
				}
				return this.owner.findNextNode( this );
			},
			toString: function() {
				if ( !this.items ) {
					return '';
				}
				return this.items.join( '' );
			},
			find: function( selector ) {
				var i, len, item, node, queryResult;
				if ( this.nodes ) {
					len = this.nodes.length;
					for ( i = 0; i < len; i += 1 ) {
						node = this.nodes[ i ];
						if ( node.nodeType !== 1 ) {
							continue;
						}
						if ( matches( node, selector ) ) {
							return node;
						}
						if ( queryResult = node.querySelector( selector ) ) {
							return queryResult;
						}
					}
					return null;
				}
				if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.find && ( queryResult = item.find( selector ) ) ) {
							return queryResult;
						}
					}
					return null;
				}
			},
			findAll: function( selector, query ) {
				var i, len, item, node, queryAllResult, numNodes, j;
				if ( this.nodes ) {
					len = this.nodes.length;
					for ( i = 0; i < len; i += 1 ) {
						node = this.nodes[ i ];
						if ( node.nodeType !== 1 ) {
							continue;
						}
						if ( matches( node, selector ) ) {
							query.push( node );
						}
						if ( queryAllResult = node.querySelectorAll( selector ) ) {
							numNodes = queryAllResult.length;
							for ( j = 0; j < numNodes; j += 1 ) {
								query.push( queryAllResult[ j ] );
							}
						}
					}
				} else if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.findAll ) {
							item.findAll( selector, query );
						}
					}
				}
				return query;
			},
			findComponent: function( selector ) {
				var len, i, item, queryResult;
				if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.findComponent && ( queryResult = item.findComponent( selector ) ) ) {
							return queryResult;
						}
					}
					return null;
				}
			},
			findAllComponents: function( selector, query ) {
				var i, len, item;
				if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.findAllComponents ) {
							item.findAllComponents( selector, query );
						}
					}
				}
				return query;
			}
		};
		circular.DomFragment = DomFragment;
		return DomFragment;
	}( config_types, utils_matches, render_shared_Fragment__Fragment, render_DomFragment_Text, render_DomFragment_Interpolator, render_DomFragment_Section__Section, render_DomFragment_Triple, render_DomFragment_Element__Element, render_DomFragment_Partial__Partial, render_DomFragment_Component__Component, render_DomFragment_Comment, circular );

	var Ractive_prototype_render = function( runloop, css, DomFragment ) {

		return function Ractive_prototype_render( target, anchor, callback ) {
			this._rendering = true;
			runloop.start( this, callback );
			if ( !this._initing ) {
				throw new Error( 'You cannot call ractive.render() directly!' );
			}
			if ( this.constructor.css ) {
				css.add( this.constructor );
			}
			this.fragment = new DomFragment( {
				descriptor: this.template,
				root: this,
				owner: this,
				pNode: target
			} );
			if ( target ) {
				if ( anchor ) {
					target.insertBefore( this.fragment.docFrag, anchor );
				} else {
					target.appendChild( this.fragment.docFrag );
				}
			}
			if ( !this._parent || !this._parent._rendering ) {
				initChildren( this );
			}
			delete this._rendering;
			runloop.end();
		};

		function initChildren( instance ) {
			var child;
			while ( child = instance._childInitQueue.shift() ) {
				if ( child.instance.init ) {
					child.instance.init( child.options );
				}
				initChildren( child.instance );
			}
		}
	}( global_runloop, global_css, render_DomFragment__DomFragment );

	var Ractive_prototype_renderHTML = function( warn ) {

		return function() {
			warn( 'renderHTML() has been deprecated and will be removed in a future version. Please use toHTML() instead' );
			return this.toHTML();
		};
	}( utils_warn );

	var config_registries = [ ,
		'data',
		'computed',
		'adaptors',
		'components',
		'decorators',
		'easing',
		'events',
		'interpolators',
		'partials',
		'transitions'
	];

	var utils_extend = function( target ) {
		var prop, source, sources = Array.prototype.slice.call( arguments, 1 );
		while ( source = sources.shift() ) {
			for ( prop in source ) {
				if ( source.hasOwnProperty( prop ) ) {
					target[ prop ] = source[ prop ];
				}
			}
		}
		return target;
	};

	var Ractive_initialise_computations_getComputationSignature = function() {

		var pattern = /\$\{([^\}]+)\}/g;
		return function( signature ) {
			if ( typeof signature === 'function' ) {
				return {
					get: signature
				};
			}
			if ( typeof signature === 'string' ) {
				return {
					get: createFunctionFromString( signature )
				};
			}
			if ( typeof signature === 'object' && typeof signature.get === 'string' ) {
				signature = {
					get: createFunctionFromString( signature.get ),
					set: signature.set
				};
			}
			return signature;
		};

		function createFunctionFromString( signature ) {
			var functionBody = 'var __ractive=this;return(' + signature.replace( pattern, function( match, keypath ) {
				return '__ractive.get("' + keypath + '")';
			} ) + ')';
			return new Function( functionBody );
		}
	}();

	var Ractive_initialise_computations_Watcher = function( isEqual, registerDependant, unregisterDependant ) {

		var Watcher = function( computation, keypath ) {
			this.root = computation.ractive;
			this.keypath = keypath;
			this.priority = 0;
			this.computation = computation;
			registerDependant( this );
		};
		Watcher.prototype = {
			update: function() {
				var value;
				value = this.root.get( this.keypath );
				if ( !isEqual( value, this.value ) ) {
					this.computation.bubble();
				}
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return Watcher;
	}( utils_isEqual, shared_registerDependant, shared_unregisterDependant );

	var Ractive_initialise_computations_Computation = function( warn, runloop, set, Watcher ) {

		var Computation = function( ractive, key, signature ) {
			this.ractive = ractive;
			this.key = key;
			this.getter = signature.get;
			this.setter = signature.set;
			this.watchers = [];
			this.update();
		};
		Computation.prototype = {
			set: function( value ) {
				if ( this.setting ) {
					this.value = value;
					return;
				}
				if ( !this.setter ) {
					throw new Error( 'Computed properties without setters are read-only in the current version' );
				}
				this.setter.call( this.ractive, value );
			},
			update: function() {
				var ractive, originalCaptured, result, errored;
				ractive = this.ractive;
				originalCaptured = ractive._captured;
				if ( !originalCaptured ) {
					ractive._captured = [];
				}
				try {
					result = this.getter.call( ractive );
				} catch ( err ) {
					if ( ractive.debug ) {
						warn( 'Failed to compute "' + this.key + '": ' + err.message || err );
					}
					errored = true;
				}
				diff( this, this.watchers, ractive._captured );
				ractive._captured = originalCaptured;
				if ( !errored ) {
					this.setting = true;
					this.value = result;
					set( ractive, this.key, result );
					this.setting = false;
				}
				this.deferred = false;
			},
			bubble: function() {
				if ( this.watchers.length <= 1 ) {
					this.update();
				} else if ( !this.deferred ) {
					runloop.addComputation( this );
					this.deferred = true;
				}
			}
		};

		function diff( computation, watchers, newDependencies ) {
			var i, watcher, keypath;
			i = watchers.length;
			while ( i-- ) {
				watcher = watchers[ i ];
				if ( !newDependencies[ watcher.keypath ] ) {
					watchers.splice( i, 1 );
					watchers[ watcher.keypath ] = null;
					watcher.teardown();
				}
			}
			i = newDependencies.length;
			while ( i-- ) {
				keypath = newDependencies[ i ];
				if ( !watchers[ keypath ] ) {
					watcher = new Watcher( computation, keypath );
					watchers.push( watchers[ keypath ] = watcher );
				}
			}
		}
		return Computation;
	}( utils_warn, global_runloop, shared_set, Ractive_initialise_computations_Watcher );

	var Ractive_initialise_computations_createComputations = function( getComputationSignature, Computation ) {

		return function createComputations( ractive, computed ) {
			var key, signature;
			for ( key in computed ) {
				signature = getComputationSignature( computed[ key ] );
				ractive._computations[ key ] = new Computation( ractive, key, signature );
			}
		};
	}( Ractive_initialise_computations_getComputationSignature, Ractive_initialise_computations_Computation );

	var Ractive_initialise_templateParser = function( errors, isClient, parse ) {

		return function( options ) {
			return {
				fromId: function( id ) {
					var template;
					if ( !isClient ) {
						throw new Error( 'Cannot retieve template #' + id + 'as Ractive is not running in the client.' );
					}
					if ( id.charAt( 0 ) === '#' ) {
						id = id.substring( 1 );
					}
					if ( !( template = document.getElementById( id ) ) ) {
						throw new Error( 'Could not find template element with id #' + id );
					}
					return template.innerHTML;
				},
				parse: function( template, parseOptions ) {
					if ( !parse ) {
						throw new Error( errors.missingParser );
					}
					return parse( template, parseOptions || options );
				},
				isParsed: function( template ) {
					return !( typeof template === 'string' );
				}
			};
		};
	}( config_errors, config_isClient, parse__parse );

	var Ractive_initialise_initialiseTemplate = function( isClient, extend, fillGaps, isObject, TemplateParser ) {

		return function( ractive, defaults, options ) {
			var template = ractive.template,
				templateParser, parsedTemplate;
			templateParser = new TemplateParser( ractive.parseOptions );
			if ( !templateParser.isParsed( template ) ) {
				if ( template.charAt( 0 ) === '#' ) {
					template = templateParser.fromId( template );
				}
				parsedTemplate = templateParser.parse( template );
			} else {
				parsedTemplate = template;
			}
			if ( isObject( parsedTemplate ) ) {
				fillGaps( ractive.partials, parsedTemplate.partials );
				parsedTemplate = parsedTemplate.main;
			}
			if ( parsedTemplate && parsedTemplate.length === 1 && typeof parsedTemplate[ 0 ] === 'string' ) {
				parsedTemplate = parsedTemplate[ 0 ];
			}
			ractive.template = parsedTemplate;
			extend( ractive.partials, options.partials );
		};
	}( config_isClient, utils_extend, utils_fillGaps, utils_isObject, Ractive_initialise_templateParser );

	var Ractive_initialise_initialiseRegistries = function( registries, create, extend, isArray, isObject, createComputations, initialiseTemplate, TemplateParser ) {

		registries = registries.concat( [ 'template' ] );
		return initialiseRegisties;

		function getExtendOptions( ractive, options ) {
			var templateParser;
			return {
				'default': {
					getArg: function() {
						return;
					},
					extend: function( defaultValue, optionsValue ) {
						return extend( create( defaultValue ), optionsValue );
					},
					initialValue: function( registry ) {
						return ractive[ registry ];
					}
				},
				template: {
					getArg: function() {
						if ( !templateParser ) {
							templateParser = new TemplateParser( ractive.parseOptions );
						}
						return templateParser;
					},
					extend: function( defaultValue, optionsValue ) {
						return optionsValue;
					},
					initialValue: function( registry ) {
						return options[ registry ];
					}
				}
			};
		}

		function initialiseRegisties( ractive, defaults, options, initOptions ) {
			var extendOptions = getExtendOptions( ractive, options ),
				registryKeys, changes;
			initOptions = initOptions || {};
			initOptions.newValues = initOptions.newValues || {};
			if ( initOptions.registries ) {
				registryKeys = initOptions.registries.filter( function( key ) {
					return registries.indexOf( key ) > -1;
				} );
			} else {
				registryKeys = registries;
			}
			changes = initialise();
			if ( shouldUpdate( 'computed' ) ) {
				createComputations( ractive, ractive.computed );
			}
			if ( shouldUpdate( 'template' ) ) {
				initialiseTemplate( ractive, defaults, options );
			}
			return changes;

			function shouldUpdate( registry ) {
				return !initOptions.updatesOnly && ractive[ registry ] || initOptions.updatesOnly && changes.indexOf( registry ) > -1;
			}

			function initialise() {
				initialiseRegistry( 'data' );
				if ( !ractive.data ) {
					ractive.data = {};
				}
				return registryKeys.filter( function( registry ) {
					return registry !== 'data';
				} ).filter( initialiseRegistry );
			}

			function initialiseRegistry( registry ) {
				var optionsValue = initOptions.newValues[ registry ] || options[ registry ],
					defaultValue = ractive.constructor[ registry ] || defaults[ registry ],
					firstArg = registry === 'data' ? optionsValue : ractive.data,
					regOpt = extendOptions[ registry ] || extendOptions[ 'default' ],
					initialValue = regOpt.initialValue( registry );
				if ( typeof optionsValue === 'function' ) {
					ractive[ registry ] = optionsValue( firstArg, options, regOpt.getArg() );
				} else if ( defaultValue ) {
					ractive[ registry ] = typeof defaultValue === 'function' ? defaultValue( firstArg, options, regOpt.getArg() ) || options[ registry ] : regOpt.extend( defaultValue, optionsValue );
				} else if ( optionsValue ) {
					ractive[ registry ] = optionsValue;
				} else {
					ractive[ registry ] = void 0;
				}
				return isChanged( ractive[ registry ], initialValue );
			}

			function isChanged( initial, current ) {
				if ( !initial && !current ) {
					return false;
				}
				if ( isEmptyObject( initial ) && isEmptyObject( current ) ) {
					return false;
				}
				if ( isEmptyArray( initial ) && isEmptyArray( current ) ) {
					return false;
				}
				return initial !== current;
			}

			function isEmptyObject( obj ) {
				return isObject( obj ) && !Object.keys( obj ).length;
			}

			function isEmptyArray( arr ) {
				return isArray( arr ) && !arr.length;
			}
		}
	}( config_registries, utils_create, utils_extend, utils_isArray, utils_isObject, Ractive_initialise_computations_createComputations, Ractive_initialise_initialiseTemplate, Ractive_initialise_templateParser );

	var Ractive_initialise_renderInstance = function( isClient, Promise ) {

		return function renderInstance( ractive, options ) {
			var promise, fulfilPromise;
			ractive.transitionsEnabled = options.noIntro ? false : options.transitionsEnabled;
			if ( isClient && !ractive.el ) {
				ractive.el = document.createDocumentFragment();
			} else if ( ractive.el && !options.append ) {
				ractive.el.innerHTML = '';
			}
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			ractive.render( ractive.el, ractive.anchor, fulfilPromise );
			if ( options.complete ) {
				promise = promise.then( options.complete.bind( ractive ) );
			}
			ractive.transitionsEnabled = options.transitionsEnabled;
			return promise;
		};
	}( config_isClient, utils_Promise );

	var Ractive_prototype_reset = function( Promise, runloop, clearCache, notifyDependants, initialiseRegistries, renderInstance ) {

		var shouldRerender = [
			'template',
			'partials',
			'components',
			'decorators',
			'events'
		].join();
		return function( data, callback ) {
			var promise, fulfilPromise, wrapper, changes, rerender, i;
			if ( typeof data === 'function' && !callback ) {
				callback = data;
				data = {};
			} else {
				data = data || {};
			}
			if ( typeof data !== 'object' ) {
				throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
			}
			if ( ( wrapper = this._wrapped[ '' ] ) && wrapper.reset ) {
				if ( wrapper.reset( data ) === false ) {
					this.data = data;
				}
			} else {
				this.data = data;
			}
			this.initOptions.data = this.data;
			changes = initialiseRegistries( this, this.constructor.defaults, this.initOptions, {
				updatesOnly: true
			} );
			i = changes.length;
			while ( i-- ) {
				if ( shouldRerender.indexOf( changes[ i ] > -1 ) ) {
					rerender = true;
					break;
				}
			}
			if ( rerender ) {
				this.teardown();
				this._initing = true;
				promise = renderInstance( this, this.initOptions );
				this._initing = false;
			} else {
				promise = new Promise( function( fulfil ) {
					fulfilPromise = fulfil;
				} );
				runloop.start( this, fulfilPromise );
				clearCache( this, '' );
				notifyDependants( this, '' );
				runloop.end();
				this.fire( 'reset', data );
			}
			if ( callback ) {
				promise.then( callback );
			}
			return promise;
		};
	}( utils_Promise, global_runloop, shared_clearCache, shared_notifyDependants, Ractive_initialise_initialiseRegistries, Ractive_initialise_renderInstance );

	var Ractive_prototype_resetTemplate = function( Promise, initialiseRegistries, renderInstance ) {

		return function( template, callback ) {
			var promise, changes, options = {
					updatesOnly: true,
					registries: [
						'template',
						'partials'
					]
				};
			if ( typeof template === 'function' && !callback ) {
				callback = template;
				template = void 0;
			}
			if ( template ) {
				options.newValues = {
					template: template
				};
			}
			changes = initialiseRegistries( this, this.constructor.defaults, this.initOptions, options );
			if ( changes.length ) {
				this.teardown();
				this._initing = true;
				promise = renderInstance( this, this.initOptions );
				this._initing = false;
			} else {
				promise = Promise.resolve();
			}
			if ( callback ) {
				promise.then( callback );
			}
			return promise;
		};
	}( utils_Promise, Ractive_initialise_initialiseRegistries, Ractive_initialise_renderInstance );

	var Ractive_prototype_set = function( runloop, isObject, normaliseKeypath, Promise, set ) {

		return function Ractive_prototype_set( keypath, value, callback ) {
			var map, promise, fulfilPromise;
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			if ( isObject( keypath ) ) {
				map = keypath;
				callback = value;
				for ( keypath in map ) {
					if ( map.hasOwnProperty( keypath ) ) {
						value = map[ keypath ];
						keypath = normaliseKeypath( keypath );
						set( this, keypath, value );
					}
				}
			} else {
				keypath = normaliseKeypath( keypath );
				set( this, keypath, value );
			}
			runloop.end();
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( global_runloop, utils_isObject, utils_normaliseKeypath, utils_Promise, shared_set );

	var Ractive_prototype_subtract = function( add ) {

		return function( keypath, d ) {
			return add( this, keypath, d === undefined ? -1 : -d );
		};
	}( Ractive_prototype_shared_add );

	// Teardown. This goes through the root fragment and all its children, removing observers
	// and generally cleaning up after itself
	var Ractive_prototype_teardown = function( types, css, runloop, Promise, clearCache ) {

		return function( callback ) {
			var keypath, promise, fulfilPromise, shouldDestroy, originalCallback, fragment, nearestDetachingElement, unresolvedImplicitDependency;
			this.fire( 'teardown' );
			shouldDestroy = !this.component || this.component.shouldDestroy;
			if ( this.constructor.css ) {
				if ( shouldDestroy ) {
					originalCallback = callback;
					callback = function() {
						if ( originalCallback ) {
							originalCallback.call( this );
						}
						css.remove( this.constructor );
					};
				} else {
					fragment = this.component.parentFragment;
					do {
						if ( fragment.owner.type !== types.ELEMENT ) {
							continue;
						}
						if ( fragment.owner.willDetach ) {
							nearestDetachingElement = fragment.owner;
						}
					} while ( !nearestDetachingElement && ( fragment = fragment.parent ) );
					if ( !nearestDetachingElement ) {
						throw new Error( 'A component is being torn down but doesn\'t have a nearest detaching element... this shouldn\'t happen!' );
					}
					nearestDetachingElement.cssDetachQueue.push( this.constructor );
				}
			}
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			this.fragment.teardown( shouldDestroy );
			while ( this._animations[ 0 ] ) {
				this._animations[ 0 ].stop();
			}
			for ( keypath in this._cache ) {
				clearCache( this, keypath );
			}
			while ( unresolvedImplicitDependency = this._unresolvedImplicitDependencies.pop() ) {
				unresolvedImplicitDependency.teardown();
			}
			runloop.end();
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( config_types, global_css, global_runloop, utils_Promise, shared_clearCache );

	var Ractive_prototype_toHTML = function() {
		return this.fragment.toString();
	};

	var Ractive_prototype_toggle = function( keypath, callback ) {
		var value;
		if ( typeof keypath !== 'string' ) {
			if ( this.debug ) {
				throw new Error( 'Bad arguments' );
			}
			return;
		}
		value = this.get( keypath );
		return this.set( keypath, !value, callback );
	};

	var Ractive_prototype_update = function( runloop, Promise, clearCache, notifyDependants ) {

		return function( keypath, callback ) {
			var promise, fulfilPromise;
			if ( typeof keypath === 'function' ) {
				callback = keypath;
				keypath = '';
			} else {
				keypath = keypath || '';
			}
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			clearCache( this, keypath );
			notifyDependants( this, keypath );
			runloop.end();
			this.fire( 'update', keypath );
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( global_runloop, utils_Promise, shared_clearCache, shared_notifyDependants );

	var Ractive_prototype_updateModel = function( getValueFromCheckboxes, arrayContentsMatch, isEqual ) {

		return function Ractive_prototype_updateModel( keypath, cascade ) {
			var values, deferredCheckboxes, i;
			if ( typeof keypath !== 'string' ) {
				keypath = '';
				cascade = true;
			}
			consolidateChangedValues( this, keypath, values = {}, deferredCheckboxes = [], cascade );
			if ( i = deferredCheckboxes.length ) {
				while ( i-- ) {
					keypath = deferredCheckboxes[ i ];
					values[ keypath ] = getValueFromCheckboxes( this, keypath );
				}
			}
			this.set( values );
		};

		function consolidateChangedValues( ractive, keypath, values, deferredCheckboxes, cascade ) {
			var bindings, childDeps, i, binding, oldValue, newValue;
			bindings = ractive._twowayBindings[ keypath ];
			if ( bindings ) {
				i = bindings.length;
				while ( i-- ) {
					binding = bindings[ i ];
					if ( binding.radioName && !binding.node.checked ) {
						continue;
					}
					if ( binding.checkboxName ) {
						if ( binding.changed() && deferredCheckboxes[ keypath ] !== true ) {
							deferredCheckboxes[ keypath ] = true;
							deferredCheckboxes.push( keypath );
						}
						continue;
					}
					oldValue = binding.attr.value;
					newValue = binding.value();
					if ( arrayContentsMatch( oldValue, newValue ) ) {
						continue;
					}
					if ( !isEqual( oldValue, newValue ) ) {
						values[ keypath ] = newValue;
					}
				}
			}
			if ( !cascade ) {
				return;
			}
			childDeps = ractive._depsMap[ keypath ];
			if ( childDeps ) {
				i = childDeps.length;
				while ( i-- ) {
					consolidateChangedValues( ractive, childDeps[ i ], values, deferredCheckboxes, cascade );
				}
			}
		}
	}( shared_getValueFromCheckboxes, utils_arrayContentsMatch, utils_isEqual );

	var Ractive_prototype__prototype = function( add, animate, detach, find, findAll, findAllComponents, findComponent, fire, get, insert, merge, observe, off, on, render, renderHTML, reset, resetTemplate, set, subtract, teardown, toHTML, toggle, update, updateModel ) {

		return {
			add: add,
			animate: animate,
			detach: detach,
			find: find,
			findAll: findAll,
			findAllComponents: findAllComponents,
			findComponent: findComponent,
			fire: fire,
			get: get,
			insert: insert,
			merge: merge,
			observe: observe,
			off: off,
			on: on,
			render: render,
			renderHTML: renderHTML,
			reset: reset,
			resetTemplate: resetTemplate,
			set: set,
			subtract: subtract,
			teardown: teardown,
			toHTML: toHTML,
			toggle: toggle,
			update: update,
			updateModel: updateModel
		};
	}( Ractive_prototype_add, Ractive_prototype_animate__animate, Ractive_prototype_detach, Ractive_prototype_find, Ractive_prototype_findAll, Ractive_prototype_findAllComponents, Ractive_prototype_findComponent, Ractive_prototype_fire, Ractive_prototype_get, Ractive_prototype_insert, Ractive_prototype_merge__merge, Ractive_prototype_observe__observe, Ractive_prototype_off, Ractive_prototype_on, Ractive_prototype_render, Ractive_prototype_renderHTML, Ractive_prototype_reset, Ractive_prototype_resetTemplate, Ractive_prototype_set, Ractive_prototype_subtract, Ractive_prototype_teardown, Ractive_prototype_toHTML, Ractive_prototype_toggle, Ractive_prototype_update, Ractive_prototype_updateModel );

	var registries_components = {};

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
	var registries_easing = {
		linear: function( pos ) {
			return pos;
		},
		easeIn: function( pos ) {
			return Math.pow( pos, 3 );
		},
		easeOut: function( pos ) {
			return Math.pow( pos - 1, 3 ) + 1;
		},
		easeInOut: function( pos ) {
			if ( ( pos /= 0.5 ) < 1 ) {
				return 0.5 * Math.pow( pos, 3 );
			}
			return 0.5 * ( Math.pow( pos - 2, 3 ) + 2 );
		}
	};

	var utils_getGuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
			var r, v;
			r = Math.random() * 16 | 0;
			v = c == 'x' ? r : r & 3 | 8;
			return v.toString( 16 );
		} );
	};

	var extend_utils_transformCss = function() {

		var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g,
			commentsPattern = /\/\*.*?\*\//g,
			selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>\~:]))+)((?::[^\s\+\>\~]+)?\s*[\s\+\>\~]?)\s*/g;
		return function transformCss( css, guid ) {
			var transformed, addGuid;
			addGuid = function( selector ) {
				var selectorUnits, match, unit, dataAttr, base, prepended, appended, i, transformed = [];
				selectorUnits = [];
				while ( match = selectorUnitPattern.exec( selector ) ) {
					selectorUnits.push( {
						str: match[ 0 ],
						base: match[ 1 ],
						modifiers: match[ 2 ]
					} );
				}
				dataAttr = '[data-rvcguid="' + guid + '"]';
				base = selectorUnits.map( extractString );
				i = selectorUnits.length;
				while ( i-- ) {
					appended = base.slice();
					unit = selectorUnits[ i ];
					appended[ i ] = unit.base + dataAttr + unit.modifiers || '';
					prepended = base.slice();
					prepended[ i ] = dataAttr + ' ' + prepended[ i ];
					transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
				}
				return transformed.join( ', ' );
			};
			transformed = css.replace( commentsPattern, '' ).replace( selectorsPattern, function( match, $1 ) {
				var selectors, transformed;
				selectors = $1.split( ',' ).map( trim );
				transformed = selectors.map( addGuid ).join( ', ' ) + ' ';
				return match.replace( $1, transformed );
			} );
			return transformed;
		};

		function trim( str ) {
			if ( str.trim ) {
				return str.trim();
			}
			return str.replace( /^\s+/, '' ).replace( /\s+$/, '' );
		}

		function extractString( unit ) {
			return unit.str;
		}
	}();

	var extend_inheritFromParent = function( registries, create, defineProperty, transformCss ) {

		return function( Child, Parent ) {
			registries.forEach( function( property ) {
				if ( Parent[ property ] ) {
					Child[ property ] = create( Parent[ property ] );
				}
			} );
			defineProperty( Child, 'defaults', {
				value: create( Parent.defaults )
			} );
			if ( Parent.css ) {
				defineProperty( Child, 'css', {
					value: Parent.defaults.noCssTransform ? Parent.css : transformCss( Parent.css, Child._guid )
				} );
			}
		};
	}( config_registries, utils_create, utils_defineProperty, extend_utils_transformCss );

	var extend_wrapMethod = function( method, superMethod ) {
		if ( /_super/.test( method ) ) {
			return function() {
				var _super = this._super,
					result;
				this._super = superMethod;
				result = method.apply( this, arguments );
				this._super = _super;
				return result;
			};
		} else {
			return method;
		}
	};

	var extend_utils_augment = function( target, source ) {
		var key;
		for ( key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = source[ key ];
			}
		}
		return target;
	};

	var extend_inheritFromChildProps = function( initOptions, registries, defineProperty, wrapMethod, augment, transformCss ) {

		var blacklisted = {};
		registries.concat( initOptions.keys ).forEach( function( property ) {
			blacklisted[ property ] = true;
		} );
		return function( Child, childProps ) {
			var key, member;
			registries.forEach( function( property ) {
				var value = childProps[ property ];
				if ( value ) {
					if ( Child[ property ] ) {
						augment( Child[ property ], value );
					} else {
						Child[ property ] = value;
					}
				}
			} );
			initOptions.keys.forEach( function( key ) {
				var value = childProps[ key ];
				if ( value !== undefined ) {
					if ( typeof value === 'function' && typeof Child[ key ] === 'function' ) {
						Child.defaults[ key ] = wrapMethod( value, Child[ key ] );
					} else {
						Child.defaults[ key ] = childProps[ key ];
					}
				}
			} );
			for ( key in childProps ) {
				if ( !blacklisted[ key ] && childProps.hasOwnProperty( key ) ) {
					member = childProps[ key ];
					if ( typeof member === 'function' && typeof Child.prototype[ key ] === 'function' ) {
						Child.prototype[ key ] = wrapMethod( member, Child.prototype[ key ] );
					} else {
						Child.prototype[ key ] = member;
					}
				}
			}
			if ( childProps.css ) {
				defineProperty( Child, 'css', {
					value: Child.defaults.noCssTransform ? childProps.css : transformCss( childProps.css, Child._guid )
				} );
			}
		};
	}( config_initOptions, config_registries, utils_defineProperty, extend_wrapMethod, extend_utils_augment, extend_utils_transformCss );

	var extend_extractInlinePartials = function( isObject, augment ) {

		return function( Child, childProps ) {
			if ( isObject( Child.defaults.template ) ) {
				if ( !Child.partials ) {
					Child.partials = {};
				}
				augment( Child.partials, Child.defaults.template.partials );
				if ( childProps.partials ) {
					augment( Child.partials, childProps.partials );
				}
				Child.defaults.template = Child.defaults.template.main;
			}
		};
	}( utils_isObject, extend_utils_augment );

	var extend_conditionallyParseTemplate = function( errors, isClient, parse ) {

		return function( Child ) {
			var templateEl;
			if ( typeof Child.defaults.template === 'string' ) {
				if ( !parse ) {
					throw new Error( errors.missingParser );
				}
				if ( Child.defaults.template.charAt( 0 ) === '#' && isClient ) {
					templateEl = document.getElementById( Child.defaults.template.substring( 1 ) );
					if ( templateEl && templateEl.tagName === 'SCRIPT' ) {
						Child.defaults.template = parse( templateEl.innerHTML, Child );
					} else {
						throw new Error( 'Could not find template element (' + Child.defaults.template + ')' );
					}
				} else {
					Child.defaults.template = parse( Child.defaults.template, Child.defaults );
				}
			}
		};
	}( config_errors, config_isClient, parse__parse );

	var extend_conditionallyParsePartials = function( errors, parse ) {

		return function( Child ) {
			var key;
			if ( Child.partials ) {
				for ( key in Child.partials ) {
					if ( Child.partials.hasOwnProperty( key ) && typeof Child.partials[ key ] === 'string' ) {
						if ( !parse ) {
							throw new Error( errors.missingParser );
						}
						Child.partials[ key ] = parse( Child.partials[ key ], Child );
					}
				}
			}
		};
	}( config_errors, parse__parse );

	var Ractive_initialise = function( initOptions, warn, create, extend, defineProperties, getElement, isArray, getGuid, magicAdaptor, initialiseRegistries, renderInstance ) {

		var flags = [
			'adapt',
			'modifyArrays',
			'magic',
			'twoway',
			'lazy',
			'debug',
			'isolated'
		];
		return function initialiseRactiveInstance( ractive, options ) {
			var defaults = ractive.constructor.defaults;
			ractive.initOptions = options = options || {};
			setOptionsAndFlags( ractive, defaults, options );
			initialiseProperties( ractive, options );
			initialiseRegistries( ractive, defaults, options );
			renderInstance( ractive, options );
			ractive._initing = false;
		};

		function setOptionsAndFlags( ractive, defaults, options ) {
			deprecate( defaults );
			deprecate( options );
			initOptions.keys.forEach( function( key ) {
				if ( options[ key ] === undefined ) {
					options[ key ] = defaults[ key ];
				}
			} );
			flags.forEach( function( flag ) {
				ractive[ flag ] = options[ flag ];
			} );
			if ( typeof ractive.adapt === 'string' ) {
				ractive.adapt = [ ractive.adapt ];
			}
			validate( ractive, options );
		}

		function deprecate( options ) {
			if ( isArray( options.adaptors ) ) {
				warn( 'The `adaptors` option, to indicate which adaptors should be used with a given Ractive instance, has been deprecated in favour of `adapt`. See [TODO] for more information' );
				options.adapt = options.adaptors;
				delete options.adaptors;
			}
			if ( options.eventDefinitions ) {
				warn( 'ractive.eventDefinitions has been deprecated in favour of ractive.events. Support will be removed in future versions' );
				options.events = options.eventDefinitions;
			}
		}

		function validate( ractive, options ) {
			var anchor;
			if ( ractive.magic && !magicAdaptor ) {
				throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
			}
			if ( options.el ) {
				ractive.el = getElement( options.el );
				if ( !ractive.el && ractive.debug ) {
					throw new Error( 'Could not find container element' );
				}
				if ( anchor = getElement( options.append ) ) {
					ractive.anchor = anchor;
				}
			}
		}

		function initialiseProperties( ractive, options ) {
			defineProperties( ractive, {
				_initing: {
					value: true,
					writable: true
				},
				_guid: {
					value: getGuid()
				},
				_subs: {
					value: create( null ),
					configurable: true
				},
				_cache: {
					value: {}
				},
				_cacheMap: {
					value: create( null )
				},
				_deps: {
					value: []
				},
				_depsMap: {
					value: create( null )
				},
				_patternObservers: {
					value: []
				},
				_evaluators: {
					value: create( null )
				},
				_computations: {
					value: create( null )
				},
				_twowayBindings: {
					value: {}
				},
				_animations: {
					value: []
				},
				nodes: {
					value: {}
				},
				_wrapped: {
					value: create( null )
				},
				_liveQueries: {
					value: []
				},
				_liveComponentQueries: {
					value: []
				},
				_childInitQueue: {
					value: []
				},
				_changes: {
					value: []
				},
				_unresolvedImplicitDependencies: {
					value: []
				}
			} );
			ractive.parseOptions = {
				preserveWhitespace: options.preserveWhitespace,
				sanitize: options.sanitize,
				stripComments: options.stripComments,
				delimiters: options.delimiters,
				tripleDelimiters: options.tripleDelimiters
			};
			if ( options._parent && options._component ) {
				defineProperties( ractive, {
					_parent: {
						value: options._parent
					},
					component: {
						value: options._component
					}
				} );
				options._component.instance = ractive;
			}
		}
	}( config_initOptions, utils_warn, utils_create, utils_extend, utils_defineProperties, utils_getElement, utils_isArray, utils_getGuid, shared_get_magicAdaptor, Ractive_initialise_initialiseRegistries, Ractive_initialise_renderInstance );

	var extend_initChildInstance = function( initOptions, wrapMethod, initialise ) {

		return function initChildInstance( child, Child, options ) {
			initOptions.keys.forEach( function( key ) {
				var value = options[ key ],
					defaultValue = Child.defaults[ key ];
				if ( typeof value === 'function' && typeof defaultValue === 'function' ) {
					options[ key ] = wrapMethod( value, defaultValue );
				}
			} );
			if ( child.beforeInit ) {
				child.beforeInit( options );
			}
			initialise( child, options );
			if ( options._parent && options._parent._rendering ) {
				options._parent._childInitQueue.push( {
					instance: child,
					options: options
				} );
			} else if ( child.init ) {
				child.init( options );
			}
		};
	}( config_initOptions, extend_wrapMethod, Ractive_initialise );

	var extend__extend = function( create, defineProperty, getGuid, extendObject, inheritFromParent, inheritFromChildProps, extractInlinePartials, conditionallyParseTemplate, conditionallyParsePartials, initChildInstance, circular ) {

		var Ractive;
		circular.push( function() {
			Ractive = circular.Ractive;
		} );
		return function extend( childProps ) {
			var Parent = this,
				Child, adaptor, i;
			if ( childProps.prototype instanceof Ractive ) {
				childProps = extendObject( {}, childProps, childProps.prototype, childProps.defaults );
			}
			Child = function( options ) {
				initChildInstance( this, Child, options || {} );
			};
			Child.prototype = create( Parent.prototype );
			Child.prototype.constructor = Child;
			Child.extend = extend;
			defineProperty( Child, '_guid', {
				value: getGuid()
			} );
			inheritFromParent( Child, Parent );
			inheritFromChildProps( Child, childProps );
			if ( Child.adaptors && ( i = Child.defaults.adapt.length ) ) {
				while ( i-- ) {
					adaptor = Child.defaults.adapt[ i ];
					if ( typeof adaptor === 'string' ) {
						Child.defaults.adapt[ i ] = Child.adaptors[ adaptor ] || adaptor;
					}
				}
			}
			if ( childProps.template ) {
				conditionallyParseTemplate( Child );
				extractInlinePartials( Child, childProps );
				conditionallyParsePartials( Child );
			}
			return Child;
		};
	}( utils_create, utils_defineProperty, utils_getGuid, utils_extend, extend_inheritFromParent, extend_inheritFromChildProps, extend_extractInlinePartials, extend_conditionallyParseTemplate, extend_conditionallyParsePartials, extend_initChildInstance, circular );

	var Ractive__Ractive = function( initOptions, svg, defineProperties, proto, partialRegistry, adaptorRegistry, componentsRegistry, easingRegistry, interpolatorsRegistry, Promise, extend, parse, initialise, circular ) {

		var Ractive = function( options ) {
			initialise( this, options );
		};
		Ractive.prototype = proto;
		defineProperties( Ractive, {
			partials: {
				value: partialRegistry
			},
			adaptors: {
				value: adaptorRegistry
			},
			easing: {
				value: easingRegistry
			},
			transitions: {
				value: {}
			},
			events: {
				value: {}
			},
			components: {
				value: componentsRegistry
			},
			decorators: {
				value: {}
			},
			interpolators: {
				value: interpolatorsRegistry
			},
			defaults: {
				value: initOptions.defaults
			},
			svg: {
				value: svg
			},
			VERSION: {
				value: '0.4.0'
			}
		} );
		Ractive.eventDefinitions = Ractive.events;
		Ractive.prototype.constructor = Ractive;
		Ractive.Promise = Promise;
		Ractive.extend = extend;
		Ractive.parse = parse;
		circular.Ractive = Ractive;
		return Ractive;
	}( config_initOptions, config_svg, utils_defineProperties, Ractive_prototype__prototype, registries_partials, registries_adaptors, registries_components, registries_easing, registries_interpolators, utils_Promise, extend__extend, parse__parse, Ractive_initialise, circular );

	var Ractive = function( Ractive, circular, legacy ) {

		var FUNCTION = 'function';
		while ( circular.length ) {
			circular.pop()();
		}
		if ( typeof Date.now !== FUNCTION || typeof String.prototype.trim !== FUNCTION || typeof Object.keys !== FUNCTION || typeof Array.prototype.indexOf !== FUNCTION || typeof Array.prototype.forEach !== FUNCTION || typeof Array.prototype.map !== FUNCTION || typeof Array.prototype.filter !== FUNCTION || typeof window !== 'undefined' && typeof window.addEventListener !== FUNCTION ) {
			throw new Error( 'It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.' );
		}
		if ( typeof window !== 'undefined' && window.Node && !window.Node.prototype.contains && window.HTMLElement && window.HTMLElement.prototype.contains ) {
			window.Node.prototype.contains = window.HTMLElement.prototype.contains;
		}
		return Ractive;
	}( Ractive__Ractive, circular, legacy );


	// export as Common JS module...
	if ( typeof module !== "undefined" && module.exports ) {
		module.exports = Ractive;
	}

	// ... or as AMD module
	else if ( typeof define === "function" && define.amd ) {
		define( function() {
			return Ractive;
		} );
	}

	// ... or as browser global
	global.Ractive = Ractive;

	Ractive.noConflict = function() {
		global.Ractive = noConflict;
		return Ractive;
	};

}( typeof window !== 'undefined' ? window : this ) );
