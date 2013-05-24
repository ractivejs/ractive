/*! Ractive - v0.3.0-alpha1 - 2013-05-24
* Faster, easier, better interactive web development

* http://rich-harris.github.com/Ractive/
* Copyright (c) 2013 Rich Harris; Licensed MIT */

/*jslint eqeq: true, plusplus: true */
/*global document, HTMLElement */


(function ( global ) {

'use strict';

var Ractive,

proto = {},

// properties of the public Ractive object
adaptors = {},
eventDefinitions = {},
easing,
extend,
interpolate,
interpolators,


// internal utils
splitKeypath,
isArray,
isObject,
isNumeric,
isEqual,
getEl,


// internally used caches
keypathCache = {},


// internally used constructors
DomFragment,
TextFragment,
Evaluator,
Animation,


// internally used regexes
leadingWhitespace = /^\s+/,
trailingWhitespace = /\s+$/,


// other bits and pieces
initMustache,
updateMustache,
resolveMustache,
evaluateMustache,

initFragment,
updateSection,

animationCollection,


// array modification
registerKeypathToArray,
unregisterKeypathFromArray,


// parser and tokenizer
stripCommentTokens,
stripHtmlComments,
stripStandalones,


// constants
TEXT              = 1,
INTERPOLATOR      = 2,
TRIPLE            = 3,
SECTION           = 4,
INVERTED          = 5,
CLOSING           = 6,
ELEMENT           = 7,
PARTIAL           = 8,
COMMENT           = 9,
DELIMCHANGE       = 10,
MUSTACHE          = 11,
TAG               = 12,
ATTR_VALUE_TOKEN  = 13,
EXPRESSION        = 14,

NUMBER_LITERAL    = 20,
STRING_LITERAL    = 21,
ARRAY_LITERAL     = 22,
OBJECT_LITERAL    = 23,
BOOLEAN_LITERAL   = 24,
LITERAL           = 25,
GLOBAL            = 26,


REFERENCE         = 30,
REFINEMENT        = 31,
MEMBER            = 32,
PREFIX_OPERATOR   = 33,
BRACKETED         = 34,
CONDITIONAL       = 35,
INFIX_OPERATOR    = 36,

INVOCATION        = 40,


// namespaces
namespaces = {
	html:   'http://www.w3.org/1999/xhtml',
	mathml: 'http://www.w3.org/1998/Math/MathML',
	svg:    'http://www.w3.org/2000/svg',
	xlink:  'http://www.w3.org/1999/xlink',
	xml:    'http://www.w3.org/XML/1998/namespace',
	xmlns:  'http://www.w3.org/2000/xmlns/'
};
proto.animate = function ( keypath, to, options ) {
	var easing, duration, animation, i, keys;

	options = options || {};

	// cancel any existing animation
	// TODO what about upstream/downstream keypaths?
	i = animationCollection.animations.length;
	while ( i-- ) {
		if ( animationCollection.animations[ i ].keypath === keypath ) {
			animationCollection.animations[ i ].stop();
		}
	}

	// easing function
	if ( options.easing ) {
		if ( typeof options.easing === 'function' ) {
			easing = options.easing;
		}

		else {
			if ( this.easing && this.easing[ options.easing ] ) {
				// use instance easing function first
				easing = this.easing[ options.easing ];
			} else {
				// fallback to global easing functions
				easing = Ractive.easing[ options.easing ];
			}
		}

		if ( typeof easing !== 'function' ) {
			easing = null;
		}
	}

	// duration
	duration = ( options.duration === undefined ? 400 : options.duration );

	keys = splitKeypath( keypath );

	animation = new Animation({
		keys: keys,
		from: this.get( keys ),
		to: to,
		root: this,
		duration: duration,
		easing: easing,
		step: options.step,
		complete: options.complete
	});

	animationCollection.push( animation );
};
proto.bind = function ( adaptor ) {
	var bound = this._bound;

	if ( bound.indexOf( adaptor ) === -1 ) {
		bound[ bound.length ] = adaptor;
		adaptor.init( this );
	}
};
proto.fire = function ( eventName ) {
	var args, i, len, subscribers = this._subs[ eventName ];

	if ( !subscribers ) {
		return;
	}

	args = Array.prototype.slice.call( arguments, 1 );

	for ( i=0, len=subscribers.length; i<len; i+=1 ) {
		subscribers[i].apply( this, args );
	}
};
// TODO use dontNormalise

proto.get = function ( keypath, dontNormalise ) {
	var keys, normalised, key, parentKeypath, parentValue, value;

	if ( !keypath ) {
		return this.data;
	}

	if ( isArray( keypath ) ) {
		keys = keypath.slice(); // clone
		normalised = keys.join( '.' );
	}

	else {
		// cache hit? great
		if ( this._cache.hasOwnProperty( keypath ) ) {
			return this._cache[ keypath ];
		}

		keys = splitKeypath( keypath );
		normalised = keys.join( '.' );
	}

	// we may have a cache hit now that it's been normalised
	if ( this._cache.hasOwnProperty( normalised ) ) {
		return this._cache[ normalised ];
	}

	// otherwise it looks like we need to do some work
	key = keys.pop();
	parentValue = ( keys.length ? this.get( keys ) : this.data );

	if ( typeof parentValue !== 'object' || !parentValue.hasOwnProperty( key ) ) {
		return;
	}

	value = parentValue[ key ];

	// update map of dependants
	parentKeypath = keys.join( '.' );

	if ( !this._depsMap[ parentKeypath ] ) {
		this._depsMap[ parentKeypath ] = [];
	}

	// TODO is this check necessary each time?
	if ( this._depsMap[ parentKeypath ].indexOf( normalised ) === -1 ) {
		this._depsMap[ parentKeypath ].push( normalised );
	}

	// Is this an array that needs to be wrapped?
	if ( this.modifyArrays ) {
		if ( isArray( value ) && ( !value.ractive || !value._ractive.setting ) ) {
			registerKeypathToArray( value, normalised, this );
		}
	}

	// Update cache
	this._cache[ normalised ] = value;
	
	return value;
};
var teardown, cancelKeypathResolution, clearCache, registerDependant, unregisterDependant, notifyDependants, resolveRef;

teardown = function ( thing ) {
	if ( !thing.keypath ) {
		// this was on the 'unresolved' list, we need to remove it
		var index = thing.root._pendingResolution.indexOf( thing );

		if ( index !== -1 ) {
			thing.root._pendingResolution.splice( index, 1 );
		}

	} else {
		// this was registered as a dependency
		unregisterDependant( thing.root, thing.keypath, thing, thing.priority || 0 );
	}

	if ( thing.evaluator ) {
		thing.evaluator.teardown();
	}
};

clearCache = function ( root, keypath ) {
	var value, dependants = root._depsMap[ keypath ], i;

	// is this a modified array, which shouldn't fire set events on this keypath anymore?
	if ( root.modifyArrays ) {
		value = root._cache[ keypath ];
		if ( isArray( value ) && !value._ractive.setting ) {
			unregisterKeypathFromArray( value, keypath, root );
		}
	}
	

	delete root._cache[ keypath ];

	if ( !dependants ) {
		return;
	}

	i = dependants.length;
	while ( i-- ) {
		clearCache( root, dependants[i] );
	}
};



registerDependant = function ( root, keypath, dependant, priority ) {
	var deps;

	if ( !root._deps[ keypath ] ) {
		root._deps[ keypath ] = [];
	}

	deps = root._deps[ keypath ];
	
	if ( !deps[ priority ] ) {
		deps[ priority ] = [ dependant ];
		return;
	}

	deps = deps[ priority ];

	if ( deps.indexOf( dependant ) === -1 ) {
		deps[ deps.length ] = dependant;
	}
};


unregisterDependant = function ( root, keypath, dependant, priority ) {
	var deps, i, keep;

	deps = root._deps[ keypath ][ priority ];
	deps.splice( deps.indexOf( dependant ), 1 );

	if ( !deps.length ) {
		root._deps[ keypath ].splice( priority, 1 );
	}

	// can we forget this keypath altogether?
	// TODO should we delete it? may be better to keep it, so we don't need to
	// create again in future
	i = root._deps[ keypath ].length;
	while ( i-- ) {
		if ( root._deps[ keypath ][i] ) {
			keep = true;
			break;
		}
	}

	if ( !keep ) {
		delete root._deps[ keypath ];
	}
};

notifyDependants = function ( root, keypath ) {
	var depsByPriority, deps, i, j, len, childDeps;

	depsByPriority = root._deps[ keypath ];

	if ( depsByPriority ) {
		len = depsByPriority.length;
		for ( i=0; i<len; i+=1 ) {
			deps = depsByPriority[i];

			if ( deps ) {
				j = deps.length;
				while ( j-- ) {
					deps[j].update();
				}
			}
		}
	}

	

	// cascade
	childDeps = root._depsMap[ keypath ];
	
	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {
			notifyDependants( root, childDeps[i] );
			
			// TODO at some point, no-longer extant dependants need to be removed
			// from the map. However a keypath can have no direct dependants yet
			// still have downstream dependants, so it's not entirely straightforward
		}
	}
};


// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
resolveRef = function ( root, ref, contextStack ) {

	var keys, lastKey, innerMostContext, contextKeys, parentValue, keypath;

	// Implicit iterators - i.e. {{.}} - are a special case
	if ( ref === '.' ) {
		return contextStack[ contextStack.length - 1 ];
	}

	keys = splitKeypath( ref );
	lastKey = keys.pop();

	// Clone the context stack, so we don't mutate the original
	contextStack = contextStack.concat();

	// Take each context from the stack, working backwards from the innermost context
	while ( contextStack.length ) {

		innerMostContext = contextStack.pop();
		contextKeys = splitKeypath( innerMostContext );

		parentValue = root.get( contextKeys.concat( keys ) );

		if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
			keypath = innerMostContext + '.' + ref;
			break;
		}
	}

	if ( !keypath && root.get( ref ) !== undefined ) {
		keypath = ref;
	}

	return keypath;
};
proto.link = function ( keypath ) {
	var self = this;

	return function ( value ) {
		self.set( keypath, value );
	};
};
proto.off = function ( eventName, callback ) {
	var subscribers, index;

	// if no callback specified, remove all callbacks
	if ( !callback ) {
		// if no event name specified, remove all callbacks for all events
		if ( !eventName ) {
			this._subs = {};
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
proto.on = function ( eventName, callback ) {
	var self = this, listeners, n;

	// allow mutliple listeners to be bound in one go
	if ( typeof eventName === 'object' ) {
		listeners = [];

		for ( n in eventName ) {
			if ( eventName.hasOwnProperty( n ) ) {
				listeners[ listeners.length ] = this.on( n, eventName[ n ] );
			}
		}

		return {
			cancel: function () {
				while ( listeners.length ) {
					listeners.pop().cancel();
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
		cancel: function () {
			self.off( eventName, callback );
		}
	};
};
// Render instance to element specified here or at initialization
proto.render = function ( options ) {
	var el = ( options.el ? getEl( options.el ) : this.el );

	if ( !el ) {
		throw new Error( 'You must specify a DOM element to render to' );
	}

	// Clear the element, unless `append` is `true`
	if ( !options.append ) {
		el.innerHTML = '';
	}

	if ( options.callback ) {
		this.callback = options.callback;
	}

	// Render our *root fragment*
	this.rendered = new DomFragment({
		descriptor: this.template,
		root: this,
		owner: this, // saves doing `if ( this.parent ) { /*...*/ }` later on
		parentNode: el
	});

	el.appendChild( this.rendered.docFrag );
};
(function ( proto ) {

	var set, attemptKeypathResolution;

	// TODO fire change events as well as set events
	// (cascade at this point, so we can identify all change events, and
	// kill off the dependants map?)

	set = function ( root, keypath, keys, value, queue ) {
		var previous, key, obj;

		previous = root.get( keypath );

		// update the model, if necessary
		if ( previous !== value ) {
			// update data
			obj = root.data;
			while ( keys.length > 1 ) {
				key = keys.shift();

				// If this branch doesn't exist yet, create a new one - if the next
				// key matches /^\s*[0-9]+\s*$/, assume we want an array branch rather
				// than an object
				if ( !obj[ key ] ) {
					obj[ key ] = ( /^\s*[0-9]+\s*$/.test( keys[0] ) ? [] : {} );
				}

				obj = obj[ key ];
			}

			key = keys[0];

			obj[ key ] = value;
		}

		else {
			// if value is a primitive, we don't need to do anything else
			if ( typeof value !== 'object' ) {
				return;
			}
		}


		// Clear cache
		clearCache( root, keypath );

		// if we're queueing, add this keypath to the queue
		if ( queue ) {
			queue[ queue.length ] = keypath;
		}

		// otherwise notify dependants immediately
		else {
			notifyDependants( root, keypath );
			attemptKeypathResolution( root );
		}
		

		// TODO fire the right events at the right times
		// Fire set event
		if ( !root.setting ) {
			root.setting = true; // short-circuit any potential infinite loops
			root.fire( 'set', keypath, value );
			root.fire( 'set:' + keypath, value );
			root.setting = false;
		}
		
	};

	attemptKeypathResolution = function ( root ) {
		var i, unresolved, keypath;

		// See if we can resolve any of the unresolved keypaths (if such there be)
		i = root._pendingResolution.length;
		while ( i-- ) { // Work backwards, so we don't go in circles!
			unresolved = root._pendingResolution.splice( i, 1 )[0];

			
			if ( keypath = resolveRef( root, unresolved.ref, unresolved.contextStack ) ) {
				// If we've resolved the keypath, we can initialise this item
				unresolved.resolve( keypath );

			} else {
				// If we can't resolve the reference, add to the back of
				// the queue (this is why we're working backwards)
				root._pendingResolution[ root._pendingResolution.length ] = unresolved;
			}
		}
	};

	


	// TODO notify direct dependants of upstream keypaths
	proto.set = function ( keypath, value ) {
		var notificationQueue, k, normalised, keys, previous;

		// setting multiple values in one go
		if ( isObject( keypath ) ) {
			notificationQueue = [];

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					keys = splitKeypath( k );
					normalised = keys.join( '.' );
					value = keypath[k];

					set( this, normalised, keys, value, notificationQueue );
				}
			}

			// if anything has changed, notify dependants and attempt to resolve
			// any unresolved keypaths
			if ( notificationQueue.length ) {
				while ( notificationQueue.length ) {
					notifyDependants( this, notificationQueue.pop() );
				}

				attemptKeypathResolution( this );
			}
		}

		// setting a single value
		else {
			keys = splitKeypath( keypath );
			normalised = keys.join( '.' );

			set( this, normalised, keys, value );
		}

		// Attributes don't reflect changes automatically if there is a possibility
		// that they will need to change again before the .set() cycle is complete
		// - they defer their updates until all values have been set
		while ( this._def.length ) {
			// Update the attribute, then deflag it
			this._def.pop().update().deferred = false;
		}
	};

}( proto ));
// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself
proto.teardown = function () {
	var keypath;

	this.rendered.teardown();

	// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
	// Once with keypaths that have dependents...
	for ( keypath in this._depsMap ) {
		if ( this._depsMap.hasOwnProperty( keypath ) ) {
			clearCache( this, keypath );
		}
	}

	// Then a second time to mop up the rest
	for ( keypath in this._cache ) {
		if ( this._cache.hasOwnProperty( keypath ) ) {
			clearCache( this, keypath );
		}
	}

	// Teardown any bindings
	while ( this._bound.length ) {
		this.unbind( this._bound.pop() );
	}
};
proto.unbind = function ( adaptor ) {
	var bound = this._bound, index;

	index = bound.indexOf( adaptor );

	if ( index !== -1 ) {
		bound.splice( index, 1 );
		adaptor.teardown( this );
	}
};
proto.update = function ( keypath ) {
	clearCache( this, keypath || '' );
	notifyDependants( this, keypath || '' );

	this.fire( 'update:' + keypath );
	this.fire( 'update', keypath );

	return this;
};
adaptors.backbone = function ( model, path ) {
	var settingModel, settingView, setModel, setView, pathMatcher, pathLength, prefix;

	if ( path ) {
		path += '.';
		pathMatcher = new RegExp( '^' + path.replace( /\./g, '\\.' ) );
		pathLength = path.length;
	}


	return {
		init: function ( view ) {
			
			// if no path specified...
			if ( !path ) {
				setView = function ( model ) {
					if ( !settingModel ) {
						settingView = true;
						view.set( model.changed );
						settingView = false;
					}
				};

				setModel = function ( keypath, value ) {
					if ( !settingView ) {
						settingModel = true;
						model.set( keypath, value );
						settingModel = false;
					}
				};
			}

			else {
				prefix = function ( attrs ) {
					var attr, result;

					result = {};

					for ( attr in attrs ) {
						if ( attrs.hasOwnProperty( attr ) ) {
							result[ path + attr ] = attrs[ attr ];
						}
					}

					return result;
				};

				setView = function ( model ) {
					if ( !settingModel ) {
						settingView = true;
						view.set( prefix( model.changed ) );
						settingView = false;
					}
				};

				setModel = function ( keypath, value ) {
					if ( !settingView ) {
						if ( pathMatcher.test( keypath ) ) {
							settingModel = true;
							model.set( keypath.substring( pathLength ), value );
							settingModel = false;
						}
					}
				};
			}

			model.on( 'change', setView );
			view.on( 'set', setModel );
			
			// initialise
			view.set( path ? prefix( model.attributes ) : model.attributes );
		},

		teardown: function ( view ) {
			model.off( 'change', setView );
			view.off( 'set', setModel );
		}
	};
};
adaptors.statesman = function ( model, path ) {
	var settingModel, settingView, setModel, setView;

	path = ( path ? path + '.' : '' );

	return {
		init: function ( view ) {
			setView = function ( keypath, value ) {
				if ( !settingModel ) {
					settingView = true;
					view.set( keypath, value );
					settingView = false;
				}
			};

			setModel = function ( keypath, value ) {
				if ( !settingView ) {
					settingModel = true;
					model.set( keypath, value );
					settingModel = false;
				}
			};

			model.on( 'set', setView );
			view.on( 'set', setModel );

			// initialise
			view.set( model.get() );
		},

		teardown: function ( view ) {
			model.off( 'change', setView );
			view.off( 'set', setModel );
		}
	};
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

easing = {
	linear: function ( pos ) { return pos; },
	easeIn: function ( pos ) { return Math.pow( pos, 3 ); },
	easeOut: function ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
	easeInOut: function ( pos ) {
		if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
		return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
	}
};
eventDefinitions.tap = function ( el, fire ) {
	var mousedown, touchstart, distanceThreshold, timeThreshold;

	distanceThreshold = 5; // maximum pixels pointer can move before cancel
	timeThreshold = 400;   // maximum milliseconds between down and up before cancel

	mousedown = function ( event ) {
		var x, y, currentTarget, up, move, cancel;

		x = event.clientX;
		y = event.clientY;
		currentTarget = this;

		up = function ( event ) {
			fire.call( currentTarget, event );
			cancel();
		};

		move = function ( event ) {
			if ( ( Math.abs( event.clientX - x ) >= distanceThreshold ) || ( Math.abs( event.clientY - y ) >= distanceThreshold ) ) {
				cancel();
			}
		};

		cancel = function () {
			window.removeEventListener( 'mousemove', move );
			window.removeEventListener( 'mouseup', up );
		};

		window.addEventListener( 'mousemove', move );
		window.addEventListener( 'mouseup', up );

		setTimeout( cancel, timeThreshold );
	};

	el.addEventListener( 'mousedown', mousedown );


	touchstart = function ( event ) {
		var x, y, touch, finger, move, up, cancel;

		if ( event.touches.length !== 1 ) {
			return;
		}

		touch = event.touches[0];
		x = touch.clientX;
		y = touch.clientY;
		finger = touch.identifier;

		up = function ( event ) {
			var touch;

			touch = event.changedTouches[0];
			if ( touch.identifier !== finger ) {
				cancel();
			}

			fire.call( touch.target, event );
		};

		move = function ( event ) {
			var touch;

			if ( event.touches.length !== 1 || event.touches[0].identifier !== finger ) {
				cancel();
			}

			touch = event.touches[0];
			if ( ( Math.abs( touch.clientX - x ) >= distanceThreshold ) || ( Math.abs( touch.clientY - y ) >= distanceThreshold ) ) {
				cancel();
			}
		};

		cancel = function () {
			window.removeEventListener( 'touchmove', move );
			window.removeEventListener( 'touchend', up );
			window.removeEventListener( 'touchcancel', cancel );
		};

		window.addEventListener( 'touchmove', move );
		window.addEventListener( 'touchend', up );
		window.addEventListener( 'touchcancel', cancel );

		setTimeout( cancel, timeThreshold );
	};


	return {
		teardown: function () {
			el.removeEventListener( 'mousedown', mousedown );
			el.removeEventListener( 'touchstart', touchstart );
		}
	};
};
extend = function ( childProps ) {

	var Parent, Child, key;

	Parent = this;

	Child = function () {
		Ractive.apply( this, arguments );

		if ( this.init ) {
			this.init.apply( this, arguments );
		}
	};

	// extend child with parent methods
	for ( key in Parent.prototype ) {
		if ( Parent.prototype.hasOwnProperty( key ) ) {
			Child.prototype[ key ] = Parent.prototype[ key ];
		}
	}

	// extend child with specified methods, as long as they don't override Ractive.prototype methods
	for ( key in childProps ) {
		if ( childProps.hasOwnProperty( key ) ) {
			if ( Ractive.prototype.hasOwnProperty( key ) ) {
				throw new Error( 'Cannot override "' + key + '" method or property of Ractive prototype' );
			}

			Child.prototype[ key ] = childProps[ key ];
		}
	}

	Child.extend = Parent.extend;

	return Child;
};
interpolate = function ( from, to ) {
	if ( isNumeric( from ) && isNumeric( to ) ) {
		return Ractive.interpolators.number( +from, +to );
	}

	if ( isArray( from ) && isArray( to ) ) {
		return Ractive.interpolators.array( from, to );
	}

	if ( isObject( from ) && isObject( to ) ) {
		return Ractive.interpolators.object( from, to );
	}

	return function () { return to; };
};
interpolators = {
	number: function ( from, to ) {
		var delta = to - from;

		if ( !delta ) {
			return function () { return from; };
		}

		return function ( t ) {
			return from + ( t * delta );
		};
	},

	array: function ( from, to ) {
		var intermediate, interpolators, len, i;

		intermediate = [];
		interpolators = [];

		i = len = Math.min( from.length, to.length );
		while ( i-- ) {
			interpolators[i] = Ractive.interpolate( from[i], to[i] );
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
		var properties = [], len, interpolators, intermediate, prop;

		intermediate = {};
		interpolators = {};

		for ( prop in from ) {
			if ( from.hasOwnProperty( prop ) ) {
				if ( to.hasOwnProperty( prop ) ) {
					properties[ properties.length ] = prop;
					interpolators[ prop ] = Ractive.interpolate( from[ prop ], to[ prop ] );
				}

				else {
					intermediate[ prop ] = from[ prop ];
				}
			}
		}

		for ( prop in to ) {
			if ( to.hasOwnProperty( prop ) && !from.hasOwnProperty( prop ) ) {
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
Ractive = function ( options ) {

	var defaults, key, partial, i;

	// Options
	// -------

	if ( options ) {
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				this[ key ] = options[ key ];
			}
		}
	}

	defaults = {
		preserveWhitespace: false,
		append: false,
		twoway: true,
		modifyArrays: true,
		data: {}
	};

	for ( key in defaults ) {
		if ( defaults.hasOwnProperty( key ) && this[ key ] === undefined ) {
			this[ key ] = defaults[ key ];
		}
	}


	// Initialization
	// --------------

	if ( this.el !== undefined ) {
		this.el = getEl( this.el ); // turn ID string into DOM element
	}

	// Set up event bus
	this._subs = {};

	// Set up cache
	this._cache = {};

	// Set up dependants
	this._deps = {};
	this._depsMap = {};

	// Node registry
	this.nodes = {};

	// Set up observers
	this._observers = {};
	this._pendingResolution = [];

	// Create an array for deferred attributes
	this._def = [];

	// Cache proxy event handlers - allows efficient reuse
	this._proxies = {};

	// Set up bindings
	this._bound = [];
	if ( this.bindings ) {
		if ( isArray( this.bindings ) ) {
			for ( i=0; i<this.bindings.length; i+=1 ) {
				this.bind( this.bindings[i] );
			}
		} else {
			this.bind( this.bindings );
		}
	}

	// If we were given unparsed partials, parse them
	if ( this.partials ) {
		for ( key in this.partials ) {
			if ( this.partials.hasOwnProperty( key ) ) {
				partial = this.partials[ key ];

				if ( typeof partial === 'string' ) {
					if ( !Ractive.parse ) {
						throw new Error( 'Missing Ractive.parse - cannot parse partial "' + key + '". Either preparse or use the version that includes the parser' );
					}

					partial = Ractive.parse( partial, this ); // all parser options are present on `this`, so just passing `this`
				}

				// If the partial was an array with a single string member, that means
				// we can use innerHTML - we just need to unpack it
				if ( partial.length === 1 && typeof partial[0] === 'string' ) {
					partial = partial[0];
				}
				this.partials[ key ] = partial;
			}
		}
	}

	// Compile template, if it hasn't been parsed already
	if ( typeof this.template === 'string' ) {
		if ( !Ractive.parse ) {
			throw new Error( 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser' );
		}

		this.template = Ractive.parse( this.template, this );
	}

	// If the template was an array with a single string member, that means
	// we can use innerHTML - we just need to unpack it
	if ( this.template && ( this.template.length === 1 ) && ( typeof this.template[0] === 'string' ) ) {
		this.template = this.template[0];
	}

	// If passed an element, render immediately
	if ( this.el ) {
		this.render({ el: this.el, append: this.append });
	}
};

Animation = function ( options ) {
	var key;

	this.startTime = Date.now();

	// from and to
	for ( key in options ) {
		if ( options.hasOwnProperty( key ) ) {
			this[ key ] = options[ key ];
		}
	}

	this.interpolator = Ractive.interpolate( this.from, this.to );
	this.running = true;
};

Animation.prototype = {
	tick: function () {
		var elapsed, t, value, timeNow;

		if ( this.running ) {
			timeNow = Date.now();
			elapsed = timeNow - this.startTime;

			if ( elapsed >= this.duration ) {
				this.root.set( this.keys, this.to );

				if ( this.step ) {
					this.step( 1, this.to );
				}

				if ( this.complete ) {
					this.complete( 1, this.to );
				}

				this.running = false;
				return false;
			}

			t = this.easing ? this.easing ( elapsed / this.duration ) : ( elapsed / this.duration );
			value = this.interpolator( t );

			this.root.set( this.keys, value );

			if ( this.step ) {
				this.step( t, value );
			}

			return true;
		}

		return false;
	},

	stop: function () {
		this.running = false;
	}
};
animationCollection = {
	animations: [],

	tick: function () {
		var i, animation;

		for ( i=0; i<this.animations.length; i+=1 ) {
			animation = this.animations[i];

			if ( !animation.tick() ) {
				// animation is complete, remove it from the stack, and decrement i so we don't miss one
				this.animations.splice( i--, 1 );
			}
		}

		if ( this.animations.length ) {
			global.requestAnimationFrame( this.boundTick );
		} else {
			this.running = false;
		}
	},

	// bind method to animationCollection
	boundTick: function () {
		animationCollection.tick();
	},

	push: function ( animation ) {
		this.animations[ this.animations.length ] = animation;

		if ( !this.running ) {
			this.running = true;
			this.tick();
		}
	}
};
// https://gist.github.com/paulirish/1579671
(function( vendors, lastTime, global ) {
	
	var x;

	for ( x = 0; x < vendors.length && !global.requestAnimationFrame; ++x ) {
		global.requestAnimationFrame = global[vendors[x]+'RequestAnimationFrame'];
		global.cancelAnimationFrame = global[vendors[x]+'CancelAnimationFrame'] || global[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if ( !global.requestAnimationFrame ) {
		global.requestAnimationFrame = function(callback) {
			var currTime, timeToCall, id;
			
			currTime = Date.now();
			timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
			id = global.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
			
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if ( !global.cancelAnimationFrame ) {
		global.cancelAnimationFrame = function( id ) {
			global.clearTimeout( id );
		};
	}
}( ['ms', 'moz', 'webkit', 'o'], 0, global ));
(function () {

	var define, notifyDependents, wrapArray, unwrapArray, WrappedArrayProto, testObj, mutatorMethods;


	// just in case we don't have Object.defineProperty, we can use this - it doesn't
	// allow us to set non-enumerable properties, but if you're doing for ... in loops on 
	// an array then you deserve what's coming anyway
	if ( !Object.defineProperty ) {
		define = function ( obj, prop, desc ) {
			obj[ prop ] = desc.value;
		};
	} else {
		define = Object.defineProperty;
	}
	

	// Register a keypath to this array. When any of this array's mutator methods are called,
	// it will `set` that keypath on the given Ractive instance
	registerKeypathToArray = function ( array, keypath, root ) {
		var roots, keypathsByIndex, rootIndex, keypaths;

		// If this array hasn't been wrapped, we need to wrap it
		if ( !array._ractive ) {
			define( array, '_ractive', {
				value: {
					roots: [ root ], // there may be more than one Ractive instance depending on this
					keypathsByIndex: [ [ keypath ] ]
				},
				configurable: true
			});

			wrapArray( array );
		}

		else {
		
			roots = array._ractive.roots;
			keypathsByIndex = array._ractive.keypathsByIndex;

			// Does this Ractive instance currently depend on this array?
			rootIndex = roots.indexOf( root );

			// If not, associate them
			if ( rootIndex === -1 ) {
				rootIndex = roots.length;
				roots[ rootIndex ] = root;
			}

			// Find keypaths that reference this array, on this Ractive instance
			if ( !keypathsByIndex[ rootIndex ] ) {
				keypathsByIndex[ rootIndex ] = [];
			}

			keypaths = keypathsByIndex[ rootIndex ];

			// If the current keypath isn't among them, add it
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}
	};


	// Unregister keypath from array
	unregisterKeypathFromArray = function ( array, keypath, root ) {
		var roots, keypathsByIndex, rootIndex, keypaths, keypathIndex;

		if ( !array._ractive ) {
			throw new Error( 'Attempted to remove keypath from non-wrapped array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		roots = array._ractive.roots;
		rootIndex = roots.indexOf( root );

		if ( rootIndex === -1 ) {
			throw new Error( 'Ractive instance was not listed as a dependent of this array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		keypathsByIndex = array._ractive.keypathsByIndex;
		keypaths = keypathsByIndex[ rootIndex ];
		keypathIndex = keypaths.indexOf( keypath );

		if ( keypathIndex === -1 ) {
			throw new Error( 'Attempted to unlink non-linked keypath from array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		keypaths.splice( keypathIndex, 1 );

		if ( !keypaths.length ) {
			roots.splice( rootIndex, 1 );
		}

		if ( !roots.length ) {
			unwrapArray( array ); // It's good to clean up after ourselves
		}
	};


	// Call `set` on each dependent Ractive instance, for each dependent keypath
	notifyDependents = function ( array ) {
		var roots, keypathsByIndex, root, keypaths, i, j;

		roots = array._ractive.roots;
		keypathsByIndex = array._ractive.keypathsByIndex;

		i = roots.length;
		while ( i-- ) {
			root = roots[i];
			keypaths = keypathsByIndex[i];

			j = keypaths.length;
			while ( j-- ) {
				root.set( keypaths[j], array );
			}
		}
	};


		
	WrappedArrayProto = [];
	mutatorMethods = [ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ];

	mutatorMethods.forEach( function ( methodName ) {
		var method = function () {
			var result = Array.prototype[ methodName ].apply( this, arguments );

			this._ractive.setting = true;
			notifyDependents( this );
			this._ractive.setting = false;

			return result;
		};

		define( WrappedArrayProto, methodName, {
			value: method
		});
	});

	
	// can we use prototype chain injection?
	// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
	testObj = {};
	if ( testObj.__proto__ ) {
		// yes, we can
		wrapArray = function ( array ) {
			array.__proto__ = WrappedArrayProto;
		};

		unwrapArray = function ( array ) {
			delete array._ractive;
			array.__proto__ = Array.prototype;
		};
	}

	else {
		// no, we can't
		wrapArray = function ( array ) {
			var i, methodName;

			i = mutatorMethods.length;
			while ( i-- ) {
				methodName = mutatorMethods[i];
				define( array, methodName, {
					value: WrappedArrayProto[ methodName ]
				});
			}
		};

		unwrapArray = function ( array ) {
			var i;

			i = mutatorMethods.length;
			while ( i-- ) {
				delete array[ mutatorMethods[i] ];
			}

			delete array._ractive;
		};
	}

}());
(function ( evaluators, functionCache ) {

	var Reference, getFunctionFromString;

	getFunctionFromString = function ( functionString, i ) {
		var fn, args;

		if ( functionCache[ functionString ] ) {
			return functionCache[ functionString ];
		}

		args = [];
		while ( i-- ) {
			args[i] = '_' + i;
		}

		fn = new Function( args.join( ',' ), 'return(' + functionString + ')' );

		functionCache[ functionString ] = fn;
		return fn;
	};

	Evaluator = function ( root, mustache, contextStack, indexRefs, descriptor ) {

		var i;

		this.root = root;
		this.mustache = mustache;
		this.priority = mustache.priority;

		this.str = descriptor.s;
		this.keypaths = [];
		this.override = []; // need to override index refs when creating a keypath
		this.values = [];

		if ( !descriptor.r ) {
			// no references - we can init immediately
			this.init();
		}

		else {
			this.unresolved = descriptor.r.length;
			this.refs = descriptor.r.slice();
			this.resolvers = [];

			i = descriptor.r.length;
			while ( i-- ) {
				// index ref?
				if ( indexRefs && indexRefs.hasOwnProperty( descriptor.r[i] ) ) {
					this.values[i] = this.override[i] = indexRefs[ descriptor.r[i] ];
					this.unresolved -= 1; // because we don't need to resolve the reference
				}

				else {
					this.resolvers[ this.resolvers.length ] = new Reference( root, descriptor.r[i], contextStack, i, this );
				}
			}

			// if this only has one reference (and therefore only one dependency) it can
			// update its mustache whenever that dependency changes. Otherwise, it should
			// wait until all the information is in before re-evaluating (same principle
			// as element attributes)
			if ( this.resolvers.length <= 1 ) {
				this.selfUpdating = true;
			}

			// if we have no unresolved references, but we haven't initialised (because
			// one or more of the references were index references), initialise now
			if ( !this.unresolved && !this.resolved ) {
				this.init();
			}
		}
	};

	Evaluator.prototype = {
		// TODO teardown

		init: function () {
			var self = this, functionString;

			// we're ready!
			this.resolved = true;

			this.keypath = '(' + this.str.replace( /❖([0-9]+)/g, function ( match, $1 ) {
				if ( self.override.hasOwnProperty( $1 ) ) {
					return self.override[ $1 ];
				}

				return self.keypaths[ $1 ];
			}) + ')';

			functionString = this.str.replace( /❖([0-9]+)/g, function ( match, $1 ) {
				return '_' + $1;
			});

			this.fn = getFunctionFromString( functionString, ( this.refs ? this.refs.length : 0 ) );

			this.update();
			this.mustache.resolve( this.keypath );

			// TODO some cleanup, delete unneeded bits
		},

		teardown: function () {
			if ( this.resolvers ) {
				while ( this.resolvers.length ) {
					this.resolvers.pop().teardown();
				}
			}
		},

		resolve: function ( ref, argNum, keypath ) {
			var self = this;

			this.keypaths[ argNum ] = keypath;

			this.unresolved -= 1;
			if ( !this.unresolved ) {
				this.init();
			}
		},

		bubble: function () {
			// If we only have one reference, we can update immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// ...otherwise we want to register it as a deferred item, to be
			// updated once all the information is in, to prevent unnecessary
			// cascading
			else if ( !this.deferred ) {
				this.root._def[ this.root._def.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value;

			if ( !this.resolved ) {
				return this;
			}

			try {
				value = this.getter();
			} catch ( err ) {
				if ( this.root.debug ) {
					throw err;
				} else {
					value = undefined;
				}
			}

			if ( !isEqual( value, this._lastValue ) ) {
				this.root._cache[ this.keypath ] = value;
				notifyDependants( this.root, this.keypath );

				this._lastValue = value;
			}

			return this;
		},

		getter: function () {
			return this.fn.apply( null, this.values );
		}
	};



	Reference = function ( root, ref, contextStack, argNum, evaluator ) {
		var keypath;

		this.ref = ref;
		this.root = root;
		this.evaluator = evaluator;
		this.argNum = argNum;

		keypath = resolveRef( root, ref, contextStack );
		if ( keypath ) {
			this.resolve( keypath );
		} else {
			this.contextStack = contextStack;
			root._pendingResolution[ root._pendingResolution.length ] = this;
		}
	};

	Reference.prototype = {
		teardown: function () {
			teardown( this );
		},

		resolve: function ( keypath ) {

			this.keypath = keypath;

			registerDependant( this.root, keypath, this, this.evaluator.priority );
			this.update();
			this.evaluator.resolve( this.ref, this.argNum, keypath );
		},

		update: function () {
			var value = this.root.get( this.keypath );

			if ( !isEqual( value, this._lastValue ) ) {
				this.evaluator.values[ this.argNum ] = value;
				this.evaluator.bubble();

				this._lastValue = value;
			}
		}
	};

}({}, {}));
initFragment = function ( fragment, options ) {

	var numItems, i, itemOptions, parentRefs, ref;

	// The item that owns this fragment - an element, section, partial, or attribute
	fragment.owner = options.owner;

	// If parent item is a section, this may not be the only fragment
	// that belongs to it - we need to make a note of the index
	if ( fragment.owner.type === SECTION ) {
		fragment.index = options.index;
	}

	// index references (the 'i' in {{#section:i}}<!-- -->{{/section}}) need to cascade
	// down the tree
	if ( fragment.owner.parentFragment ) {
		parentRefs = fragment.owner.parentFragment.indexRefs;

		if ( parentRefs ) {
			fragment.indexRefs = {};

			for ( ref in parentRefs ) {
				if ( parentRefs.hasOwnProperty( ref ) ) {
					fragment.indexRefs[ ref ] = parentRefs[ ref ];
				}
			}
		}
	}

	if ( options.indexRef ) {
		if ( !fragment.indexRefs ) {
			fragment.indexRefs = {};
		}

		fragment.indexRefs[ options.indexRef ] = options.index;
	}

	// Time to create this fragment's child items;
	fragment.items = [];

	itemOptions = {
		root:           options.root,
		parentFragment: fragment,
		parentNode:     options.parentNode,
		contextStack:   options.contextStack
	};

	numItems = ( options.descriptor ? options.descriptor.length : 0 );
	for ( i=0; i<numItems; i+=1 ) {
		itemOptions.descriptor = options.descriptor[i];
		itemOptions.index = i;

		fragment.items[ fragment.items.length ] = fragment.createItem( itemOptions );
	}

};
initMustache = function ( mustache, options ) {

	var keypath, index;

	mustache.root           = options.root;
	mustache.descriptor     = options.descriptor;
	mustache.parentFragment = options.parentFragment;
	mustache.contextStack   = options.contextStack || [];
	mustache.index          = options.index || 0;
	mustache.priority       = options.descriptor.p || 0;

	// DOM only
	if ( options.parentNode || options.anchor ) {
		mustache.parentNode = options.parentNode;
		mustache.anchor = options.anchor;
	}

	mustache.type = options.descriptor.t;


	// if this is a simple mustache, with a reference, we just need to resolve
	// the reference to a keypath
	if ( options.descriptor.r ) {
		if ( mustache.parentFragment.indexRefs && mustache.parentFragment.indexRefs.hasOwnProperty( options.descriptor.r ) ) {
			index = mustache.parentFragment.indexRefs[ options.descriptor.r ];
			mustache.render( index );
		}

		else {
			keypath = resolveRef( mustache.root, options.descriptor.r, mustache.contextStack );
			if ( keypath ) {
				mustache.resolve( keypath );
			} else {
				mustache.ref = options.descriptor.r;
				mustache.root._pendingResolution[ mustache.root._pendingResolution.length ] = mustache;

				// inverted section? initialise
				if ( mustache.descriptor.n ) {
					mustache.render( false );
				}
			}
		}
	}

	// if it's an expression, we have a bit more work to do
	if ( options.descriptor.x ) {
		mustache.evaluator = new Evaluator( mustache.root, mustache, mustache.contextStack, mustache.parentFragment.indexRefs, options.descriptor.x );
	}

};


// methods to add to individual mustache prototypes
updateMustache = function () {
	var value;

	if ( this.keypath ) {
		value = this.root.get( this.keypath, true );
	} else if ( this.expression ) {
		value = this.evaluate();
	}

	if ( !isEqual( value, this._lastValue ) ) {
		this.render( value );
		this._lastValue = value;
	}
};

resolveMustache = function ( keypath ) {
	// TEMP
	this.keypath = keypath;

	registerDependant( this.root, keypath, this, this.priority );
	this.update();
};

evaluateMustache = function () {
	var args, i;

	args = [];

	i = this.refs.length;
	while ( i-- ) {
		args[i] = this.root.get( this.refs[i] );
	}

	return this.evaluator.apply( null, args );
};
updateSection = function ( section, value ) {
	var fragmentOptions, valueIsArray, emptyArray, i, itemsToRemove;

	fragmentOptions = {
		descriptor: section.descriptor.f,
		root:       section.root,
		parentNode: section.parentNode,
		owner:      section
	};

	valueIsArray = isArray( value );

	// treat empty arrays as false values
	if ( valueIsArray && value.length === 0 ) {
		emptyArray = true;
	}



	// if section is inverted, only check for truthiness/falsiness
	if ( section.descriptor.n ) {
		if ( value && !emptyArray ) {
			if ( section.length ) {
				section.unrender();
				section.length = 0;
			}
		}

		else {
			if ( !section.length ) {
				// no change to context stack in this situation
				fragmentOptions.contextStack = section.contextStack;
				fragmentOptions.index = 0;

				section.fragments[0] = section.createFragment( fragmentOptions );
				section.length = 1;
				return;
			}
		}

		return;
	}


	// otherwise we need to work out what sort of section we're dealing with

	// if value is an array, iterate through
	if ( valueIsArray ) {

		// if the array is shorter than it was previously, remove items
		if ( value.length < section.length ) {
			itemsToRemove = section.fragments.splice( value.length, section.length - value.length );

			while ( itemsToRemove.length ) {
				itemsToRemove.pop().teardown();
			}
		}

		// otherwise...
		else {

			if ( value.length > section.length ) {
				// add any new ones
				for ( i=section.length; i<value.length; i+=1 ) {
					// append list item to context stack
					fragmentOptions.contextStack = section.contextStack.concat( section.keypath + '.' + i );
					fragmentOptions.index = i;

					if ( section.descriptor.i ) {
						fragmentOptions.indexRef = section.descriptor.i;
					}

					section.fragments[i] = section.createFragment( fragmentOptions );
				}
			}
		}

		section.length = value.length;
	}


	// if value is a hash...
	else if ( isObject( value ) ) {
		// ...then if it isn't rendered, render it, adding section.keypath to the context stack
		// (if it is already rendered, then any children dependent on the context stack
		// will update themselves without any prompting)
		if ( !section.length ) {
			// append this section to the context stack
			fragmentOptions.contextStack = section.contextStack.concat( section.keypath );
			fragmentOptions.index = 0;

			section.fragments[0] = section.createFragment( fragmentOptions );
			section.length = 1;
		}
	}


	// otherwise render if value is truthy, unrender if falsy
	else {

		if ( value && !emptyArray ) {
			if ( !section.length ) {
				// no change to context stack
				fragmentOptions.contextStack = section.contextStack;
				fragmentOptions.index = 0;

				section.fragments[0] = section.createFragment( fragmentOptions );
				section.length = 1;
			}
		}

		else {
			if ( section.length ) {
				section.unrender();
				section.length = 0;
			}
		}
	}
};
(function () {

	var insertHtml, doc, propertyNames,
		Text, Element, Partial, Attribute, Interpolator, Triple, Section;

	// the property name equivalents for element attributes, where they differ
	// from the lowercased attribute name
	propertyNames = {
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

	doc = ( typeof window !== 'undefined' ? window.document : null );

	insertHtml = function ( html, docFrag ) {
		var div, nodes = [];

		div = doc.createElement( 'div' );
		div.innerHTML = html;

		while ( div.firstChild ) {
			nodes[ nodes.length ] = div.firstChild;
			docFrag.appendChild( div.firstChild );
		}

		return nodes;
	};

	DomFragment = function ( options ) {
		this.docFrag = doc.createDocumentFragment();

		// if we have an HTML string, our job is easy.
		if ( typeof options.descriptor === 'string' ) {
			this.nodes = insertHtml( options.descriptor, this.docFrag );
			return; // prevent the rest of the init sequence
		}

		// otherwise we need to make a proper fragment
		initFragment( this, options );
	};

	DomFragment.prototype = {
		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options, this.docFrag );
			}

			switch ( options.descriptor.t ) {
				case INTERPOLATOR: return new Interpolator( options, this.docFrag );
				case SECTION: return new Section( options, this.docFrag );
				case TRIPLE: return new Triple( options, this.docFrag );

				case ELEMENT: return new Element( options, this.docFrag );
				case PARTIAL: return new Partial( options, this.docFrag );

				default: throw 'WTF? not sure what happened here...';
			}
		},

		teardown: function () {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( this.nodes ) {
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				return;
			}

			// otherwise we need to do a proper teardown
			while ( this.items.length ) {
				this.items.pop().teardown();
			}
		},

		firstNode: function () {
			if ( this.items[0] ) {
				return this.items[0].firstNode();
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			}

			return null;
		}
	};


	// Partials
	Partial = function ( options, docFrag ) {
		this.parentFragment = options.parentFragment;

		this.fragment = new DomFragment({
			descriptor:   options.root.partials[ options.descriptor.r ] || [],
			root:         options.root,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			owner:        this
		});

		docFrag.appendChild( this.fragment.docFrag );
	};

	Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	Text = function ( options, docFrag ) {
		this.node = doc.createTextNode( options.descriptor );
		this.root = options.root;
		this.parentNode = options.parentNode;

		docFrag.appendChild( this.node );
	};

	Text.prototype = {
		teardown: function () {
			if ( this.root.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	Element = function ( options, docFrag ) {

		var descriptor,
			namespace,
			eventName,
			attr,
			attrName,
			attrValue,
			bindable,
			twowayNameAttr,
			parentNode;

		// stuff we'll need later
		descriptor = this.descriptor = options.descriptor;
		this.root = options.root;
		this.parentFragment = options.parentFragment;
		this.parentNode = options.parentNode;
		this.index = options.index;

		this.eventListeners = [];
		this.customEventListeners = [];

		// get namespace
		if ( descriptor.a && descriptor.a.xmlns ) {
			namespace = descriptor.a.xmlns;

			// check it's a string!
			if ( typeof namespace !== 'string' ) {
				throw new Error( 'Namespace attribute cannot contain mustaches' );
			}
		} else {
			namespace = this.parentNode.namespaceURI;
		}
		

		// create the DOM node
		this.node = doc.createElementNS( namespace, descriptor.e );


		

		// append children, if there are any
		if ( descriptor.f ) {
			if ( typeof descriptor.f === 'string' && this.node.namespaceURI === namespaces.html ) {
				// great! we can use innerHTML
				this.node.innerHTML = descriptor.f;
			}

			else {
				this.children = new DomFragment({
					descriptor:   descriptor.f,
					root:         options.root,
					parentNode:   this.node,
					contextStack: options.contextStack,
					owner:        this
				});

				this.node.appendChild( this.children.docFrag );
			}
		}


		// create event proxies
		if ( descriptor.v ) {
			for ( eventName in descriptor.v ) {
				if ( descriptor.v.hasOwnProperty( eventName ) ) {
					this.addEventProxy( eventName, descriptor.v[ eventName ], options.contextStack );
				}
			}
		}


		// set attributes
		this.attributes = [];
		bindable = []; // save these till the end

		for ( attrName in descriptor.a ) {
			if ( descriptor.a.hasOwnProperty( attrName ) ) {
				attrValue = descriptor.a[ attrName ];

				attr = new Attribute({
					element: this,
					name: attrName,
					value: ( attrValue === undefined ? null : attrValue ),
					root: options.root,
					parentNode: this.node,
					contextStack: options.contextStack
				});

				this.attributes[ this.attributes.length ] = attr;

				if ( attr.isBindable ) {
					bindable.push( attr );
				}

				if ( attr.isTwowayNameAttr ) {
					twowayNameAttr = attr;
				} else {
					attr.update();
				}
			}
		}

		while ( bindable.length ) {
			bindable.pop().bind( this.root.lazy );
		}

		if ( twowayNameAttr ) {
			twowayNameAttr.updateViewModel();
			twowayNameAttr.update();
		}

		docFrag.appendChild( this.node );
	};

	Element.prototype = {
		addEventProxy: function ( eventName, proxy, contextStack ) {
			var self = this, root = this.root, definition, listener, fragment, handler;

			if ( typeof proxy === 'string' ) {
				// If the proxy is a string (e.g. <a proxy-click='select'>{{item}}</a>) then
				// we can reuse the handler. This eliminates the need for event delegation
				if ( !root._proxies[ proxy ] ) {
					root._proxies[ proxy ] = function ( event ) {
						root.fire( proxy, event, this );
					};
				}

				handler = root._proxies[ proxy ];
			}

			else {
				// Otherwise we need to evalute the fragment each time the handler is called
				fragment = new TextFragment({
					descriptor:   proxy,
					root:         this.root,
					owner:        this,
					contextStack: contextStack
				});

				handler = function ( event ) {
					root.fire( fragment.getValue(), event, self.node );
				};
			}

			// Is this a custom event?
			if ( definition = Ractive.eventDefinitions[ eventName ] ) {
				// Use custom event. Apply definition to this node
				listener = definition( this.node, handler );
				this.customEventListeners[ this.customEventListeners.length ] = listener;
			}

			// If not, we just need to check it is a valid event for this element
			else {
				// use standard event, if it is valid
				if ( this.node[ 'on' + eventName ] !== undefined ) {
					this.eventListeners[ this.eventListeners.length ] = {
						n: eventName,
						h: handler
					};

					this.node.addEventListener( eventName, handler );
				} else {
					if ( console && console.warn ) {
						console.warn( 'Invalid event handler (' + eventName + ')' );
					}
				}
			}
		},

		teardown: function () {
			var listener;

			if ( this.root.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}

			if ( this.children ) {
				this.children.teardown();
			}

			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}

			while ( this.eventListeners.length ) {
				listener = this.eventListeners.pop();
				this.node.removeEventListener( listener.n, listener.h );
			}

			while ( this.customEventListeners.length ) {
				this.customEventListeners.pop().teardown();
			}
		},

		firstNode: function () {
			return this.node;
		},

		bubble: function () {
			// noop - just so event proxy fragments have something to call
		}
	};


	// Attribute
	Attribute = function ( options ) {

		var name, value, colonIndex, namespacePrefix, tagName, bindingCandidate, lowerCaseName, propertyName;

		name = options.name;
		value = options.value;

		this.element = options.element; // the element this belongs to

		// are we dealing with a namespaced attribute, e.g. xlink:href?
		colonIndex = name.indexOf( ':' );
		if ( colonIndex !== -1 ) {

			// looks like we are, yes...
			namespacePrefix = name.substr( 0, colonIndex );

			// ...unless it's a namespace *declaration*
			if ( namespacePrefix !== 'xmlns' ) {
				name = name.substring( colonIndex + 1 );
				this.namespace = namespaces[ namespacePrefix ];

				if ( !this.namespace ) {
					throw 'Unknown namespace ("' + namespacePrefix + '")';
				}
			}
		}

		// if it's an empty attribute, or just a straight key-value pair, with no
		// mustache shenanigans, set the attribute accordingly
		if ( value === null || typeof value === 'string' ) {
			
			if ( this.namespace ) {
				options.parentNode.setAttributeNS( this.namespace, name, value );
			} else {
				options.parentNode.setAttribute( name, value );
			}

			if ( name.toLowerCase() === 'id' ) {
				options.root.nodes[ value ] = options.parentNode;
			}
			
			return;
		}

		// otherwise we need to do some work
		this.root = options.root;
		this.parentNode = options.parentNode;
		this.name = name;
		this.lcName = name.toLowerCase();

		this.children = [];

		// can we establish this attribute's property name equivalent?
		if ( !this.namespace && options.parentNode.namespaceURI === namespaces.html ) {
			lowerCaseName = this.lcName;
			propertyName = propertyNames[ lowerCaseName ] || lowerCaseName;

			if ( options.parentNode[ propertyName ] !== undefined ) {
				this.propertyName = propertyName;
			}

			// is this a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( typeof options.parentNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
				this.useProperty = true;
			}
		}

		// share parentFragment with parent element
		this.parentFragment = this.element.parentFragment;

		this.fragment = new TextFragment({
			descriptor:   value,
			root:         this.root,
			owner:        this,
			contextStack: options.contextStack
		});

		if ( this.fragment.items.length === 1 ) {
			this.selfUpdating = true;
		}


		// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
		if ( this.root.twoway ) {
			tagName = this.element.descriptor.e.toLowerCase();
			bindingCandidate = ( ( propertyName === 'name' || propertyName === 'value' || propertyName === 'checked' ) && ( tagName === 'input' || tagName === 'textarea' || tagName === 'select' ) );
		}

		if ( bindingCandidate ) {
			this.isBindable = true;

			// name attribute is a special case - it is the only two-way attribute that updates
			// the viewmodel based on the value of another attribute. For that reason it must wait
			// until the node has been initialised, and the viewmodel has had its first two-way
			// update, before updating itself (otherwise it may disable a checkbox or radio that
			// was enabled in the template)
			if ( propertyName === 'name' ) {
				this.isTwowayNameAttr = true;
			}
		}


		// manually trigger first update
		this.ready = true;
		if ( !this.isTwowayNameAttr ) {
			this.update();
		}
	};

	Attribute.prototype = {
		bind: function ( lazy ) {
			// two-way binding logic should go here
			var self = this, node = this.parentNode, keypath, index, options, option, i, len;

			if ( !this.fragment ) {
				return false; // report failure
			}

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator
			if (
				this.fragment.items.length !== 1 ||
				this.fragment.items[0].type !== INTERPOLATOR
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator';
			}

			this.interpolator = this.fragment.items[0];

			// Hmmm. Not sure if this is the best way to handle this ambiguity...
			//
			// Let's say we were given `value="{{bar}}"`. If the context stack was
			// context stack was `["foo"]`, and `foo.bar` *wasn't* `undefined`, the
			// keypath would be `foo.bar`. Then, any user input would result in
			// `foo.bar` being updated.
			//
			// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
			// left with an unresolved partial keypath - so we are forced to make an
			// assumption. That assumption is that the input in question should
			// be forced to resolve to `bar`, and any user input would affect `bar`
			// and not `foo.bar`.
			//
			// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
			// be explicit when using two-way data-binding about what keypath you're
			// updating. Using it in lists is probably a recipe for confusion...
			keypath = this.interpolator.keypath || this.interpolator.descriptor.r;
			
			
			// select
			if ( node.tagName === 'SELECT' && this.propertyName === 'value' ) {
				// We need to know if one of the options was selected, so we
				// can initialise the viewmodel. To do that we need to jump
				// through a couple of hoops
				options = node.getElementsByTagName( 'option' );

				len = options.length;
				for ( i=0; i<len; i+=1 ) {
					option = options[i];
					if ( option.hasAttribute( 'selected' ) ) { // not option.selected - won't work here
						this.root.set( keypath, option.value );
						break;
					}
				}
			}

			// checkboxes and radio buttons
			if ( node.type === 'checkbox' || node.type === 'radio' ) {
				// We might have a situation like this: 
				//
				//     <input type='radio' name='{{colour}}' value='red'>
				//     <input type='radio' name='{{colour}}' value='blue'>
				//     <input type='radio' name='{{colour}}' value='green'>
				//
				// In this case we want to set `colour` to the value of whichever option
				// is checked. (We assume that a value attribute has been supplied.)

				if ( this.propertyName === 'name' ) {
					// replace actual name attribute
					node.name = '{{' + keypath + '}}';

					this.updateViewModel = function () {
						if ( node.checked ) {
							self.root.set( keypath, node.value );
						}
					};
				}


				// Or, we might have a situation like this:
				//
				//     <input type='checkbox' checked='{{active}}'>
				//
				// Here, we want to set `active` to true or false depending on whether
				// the input is checked.

				else if ( this.propertyName === 'checked' ) {
					this.updateViewModel = function () {
						self.root.set( keypath, node.checked );
					};
				}
			}

			else {
				// Otherwise we've probably got a situation like this:
				//
				//     <input value='{{name}}'>
				//
				// in which case we just want to set `name` whenever the user enters text.
				// The same applies to selects and textareas 
				this.updateViewModel = function () {
					var value;

					value = node.value;

					// special cases
					if ( value === '0' ) {
						value = 0;
					}

					else if ( value !== '' ) {
						value = +value || value;
					}

					// Note: we're counting on `this.root.set` recognising that `value` is
					// already what it wants it to be, and short circuiting the process.
					// Rather than triggering an infinite loop...
					self.root.set( keypath, value );
				};
			}
			

			// if we figured out how to bind changes to the viewmodel, add the event listeners
			if ( this.updateViewModel ) {
				this.twoway = true;

				node.addEventListener( 'change', this.updateViewModel );
				node.addEventListener( 'click',  this.updateViewModel );
				node.addEventListener( 'blur',   this.updateViewModel );

				if ( !lazy ) {
					node.addEventListener( 'keyup',    this.updateViewModel );
					node.addEventListener( 'keydown',  this.updateViewModel );
					node.addEventListener( 'keypress', this.updateViewModel );
					node.addEventListener( 'input',    this.updateViewModel );
				}
			}
		},

		teardown: function () {
			// remove the event listeners we added, if we added them
			if ( this.updateViewModel ) {
				this.parentNode.removeEventListener( 'change', this.updateViewModel );
				this.parentNode.removeEventListener( 'click', this.updateViewModel );
				this.parentNode.removeEventListener( 'blur', this.updateViewModel );
				this.parentNode.removeEventListener( 'keyup', this.updateViewModel );
				this.parentNode.removeEventListener( 'keydown', this.updateViewModel );
				this.parentNode.removeEventListener( 'keypress', this.updateViewModel );
				this.parentNode.removeEventListener( 'input', this.updateViewModel );
			}

			// ignore non-dynamic attributes
			if ( !this.children ) {
				return;
			}

			while ( this.children.length ) {
				this.children.pop().teardown();
			}
		},

		bubble: function () {
			// If an attribute's text fragment contains a single item, we can
			// update the DOM immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// otherwise we want to register it as a deferred attribute, to be
			// updated once all the information is in, to prevent unnecessary
			// DOM manipulation
			else if ( !this.deferred ) {
				this.root._def[ this.root._def.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value, lowerCaseName;

			if ( !this.ready ) {
				return this; // avoid items bubbling to the surface when we're still initialising
			}

			if ( this.lcName === 'id' ) {
				if ( this.id !== undefined ) {
					delete this.root.nodes[ this.id ];
				}

				this.root.nodes[ this.id ] = this.parentNode;
			}

			if ( this.twoway ) {
				// TODO compare against previous?
				
				lowerCaseName = this.lcName;
				this.value = this.interpolator.value;

				// special case - if we have an element like this:
				//
				//     <input type='radio' name='{{colour}}' value='red'>
				//
				// and `colour` has been set to 'red', we don't want to change the name attribute
				// to red, we want to indicate that this is the selected option, by setting
				// input.checked = true
				if ( lowerCaseName === 'name' && ( this.parentNode.type === 'checkbox' || this.parentNode.type === 'radio' ) ) {
					if ( this.value === this.parentNode.value ) {
						this.parentNode.checked = true;
					} else {
						this.parentNode.checked = false;
					}

					return this; 
				}

				// don't programmatically update focused element
				if ( doc.activeElement === this.parentNode ) {
					return this;
				}
			}
			
			value = this.fragment.getValue();

			if ( value === undefined ) {
				value = '';
			}

			if ( this.useProperty ) {
				this.parentNode[ this.propertyName ] = value;
				return this;
			}

			if ( this.namespace ) {
				this.parentNode.setAttributeNS( this.namespace, this.name, value );
				return this;
			}

			this.parentNode.setAttribute( this.name, value );

			return this;
		}
	};





	// Interpolator
	Interpolator = function ( options, docFrag ) {
		this.node = doc.createTextNode( '' );
		docFrag.appendChild( this.node );

		// extend Mustache
		initMustache( this, options );

		// if this initialised without a keypath, and it's a conditional,
		// we need to use the 'if false' value
		if ( this.cond && !this.keypath ) {
			this.update( false );
		}
	};

	Interpolator.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		teardown: function () {
			teardown( this );
			
			if ( this.root.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		render: function ( value ) {
			this.node.data = value;
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Triple
	Triple = function ( options, docFrag ) {
		this.nodes = [];
		this.docFrag = doc.createDocumentFragment();

		this.initialising = true;
		initMustache( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Triple.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		teardown: function () {

			// remove child nodes from DOM
			if ( this.root.el.contains( this.parentNode ) ) {
				while ( this.nodes.length ) {
					this.parentNode.removeChild( this.nodes.pop() );
				}
			}

			teardown( this );
		},

		firstNode: function () {
			if ( this.nodes[0] ) {
				return this.nodes[0];
			}

			return this.parentFragment.findNextNode( this );
		},

		render: function ( html ) {
			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			// get new nodes
			this.nodes = insertHtml( html, this.docFrag );

			if ( !this.initialising ) {
				this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			}
		}
	};



	// Section
	Section = function ( options, docFrag ) {
		this.fragments = [];
		this.length = 0; // number of times this section is rendered

		this.docFrag = doc.createDocumentFragment();
		
		this.initialising = true;
		initMustache( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Section.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		teardown: function () {
			this.unrender();

			teardown( this );
		},

		firstNode: function () {
			if ( this.fragments[0] ) {
				return this.fragments[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.fragments[ fragment.index + 1 ] ) {
				return this.fragments[ fragment.index + 1 ].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
		},

		render: function ( value ) {
			
			updateSection( this, value );

			if ( !this.initialising ) {
				// we need to insert the contents of our document fragment into the correct place
				this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			}
			
		},

		createFragment: function ( options ) {
			var fragment = new DomFragment( options );
			
			this.docFrag.appendChild( fragment.docFrag );
			return fragment;
		}
	};

}());

(function () {

	var Text, Interpolator, Triple, Section;

	TextFragment = function TextFragment ( options ) {
		initFragment( this, options );
	};

	TextFragment.prototype = {
		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options.descriptor );
			}

			switch ( options.descriptor.t ) {
				case INTERPOLATOR: return new Interpolator( options );
				case TRIPLE: return new Triple( options );
				case SECTION: return new Section( options );

				default: throw 'Something went wrong in a rather interesting way';
			}
		},


		bubble: function () {
			this.value = this.getValue();
			this.owner.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		getValue: function () {
			var value;

			if ( this.items.length === 1 ) {
				value = this.items[0].value;
				if ( value !== undefined ) {
					return value;
				}
			}

			return this.toString();
		},

		toString: function () {
			// TODO refactor this... value should already have been calculated? or maybe not. Top-level items skip the fragment and bubble straight to the attribute...
			// argh, it's confusing me
			return this.items.join( '' );
		}
	};



	// Plain text
	Text = function ( text ) {
		this.text = text;
	};

	Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	Interpolator = function ( options ) {
		initMustache( this, options );

		// if this initialised without a keypath, and it's a conditional,
		// we need to use the 'if false' value
		if ( this.cond && !this.keypath ) {
			this.update( false );
		}
	};

	Interpolator.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		render: function ( value ) {
			this.value = value;
			this.parentFragment.bubble();
		},

		teardown: function () {
			teardown( this );
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

	// Triples are the same as Interpolators in this context
	Triple = Interpolator;


	// Section
	Section = function ( options ) {
		this.fragments = [];
		this.length = 0;

		initMustache( this, options );
	};

	Section.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		teardown: function () {
			this.unrender();

			teardown( this );
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.fragments.join( '' );
			this.parentFragment.bubble();
		},

		render: function ( value ) {
			updateSection( this, value );

			//this.value = this.fragments.join( '' );
			this.parentFragment.bubble();
		},

		createFragment: function ( options ) {
			return new TextFragment( options );
		},

		toString: function () {
			return this.fragments.join( '' );
			//return ( this.value === undefined ? '' : this.value );
		}
	};

}());
splitKeypath =  function ( keypath ) {
	var index, startIndex, keys, remaining, part;

	// We should only have to do all the heavy regex stuff once... caching FTW
	if ( keypathCache[ keypath ] ) {
		return keypathCache[ keypath ].concat();
	}

	keys = [];
	remaining = keypath;
	
	startIndex = 0;

	// Split into keys
	while ( remaining.length ) {
		// Find next dot
		index = remaining.indexOf( '.', startIndex );

		// Final part?
		if ( index === -1 ) {
			part = remaining;
			remaining = '';
		}

		else {
			// If this dot is preceded by a backslash, which isn't
			// itself preceded by a backslash, we consider it escaped
			if ( remaining.charAt( index - 1) === '\\' && remaining.charAt( index - 2 ) !== '\\' ) {
				// we don't want to keep this part, we want to keep looking
				// for the separator
				startIndex = index + 1;
				continue;
			}

			// Otherwise, we have our next part
			part = remaining.substr( 0, index );
			startIndex = 0;
		}

		if ( /\[/.test( part ) ) {
			keys = keys.concat( part.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ).split( '.' ) );
		} else {
			keys[ keys.length ] = part;
		}
		
		remaining = remaining.substring( index + 1 );
	}

	
	keypathCache[ keypath ] = keys;
	return keys.concat();
};



// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
isArray = function ( obj ) {
	return Object.prototype.toString.call( obj ) === '[object Array]';
};

isEqual = function ( a, b ) {
	if ( a === null && b === null ) {
		return true;
	}

	if ( typeof a === 'object' || typeof b === 'object' ) {
		return false;
	}

	return a === b;
};

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
isNumeric = function ( n ) {
	return !isNaN( parseFloat( n ) ) && isFinite( n );
};

isObject = function ( obj ) {
	return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
};


	
getEl = function ( input ) {
	var output, doc;

	if ( typeof window === 'undefined' ) {
		return;
	}

	doc = window.document;

	if ( !input ) {
		throw new Error( 'No container element specified' );
	}

	// We already have a DOM node - no work to do
	if ( input.tagName ) {
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
		if ( output.tagName ) {
			return output;
		}
	}

	// If we've been given a collection (jQuery, Zepto etc), extract the first item
	if ( input[0] && input[0].tagName ) {
		return input[0];
	}

	throw new Error( 'Could not find container element' );
};
Ractive.prototype = proto;

Ractive.adaptors = adaptors;
Ractive.eventDefinitions = eventDefinitions;

Ractive.easing = easing;
Ractive.extend = extend;
Ractive.interpolate = interpolate;
Ractive.interpolators = interpolators;
Ractive.parse = parse;


// export as Common JS module...
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = Ractive;
}

// ... or as AMD module
else if ( typeof define === "function" && define.amd ) {
	define( function () {
		return Ractive;
	});
}

// ... or as browser global
else {
	global.Ractive = Ractive;
}

}( this ));