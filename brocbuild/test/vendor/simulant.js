(function ( global ) {

'use strict';

var simulant;


var defaults = {
	bubbles:       true,
	cancelable:    true,
	view:          global,
	detail:        null,
	screenX:       0,
	screenY:       0,
	clientX:       0,
	clientY:       0,
	ctrlKey:       false,
	altKey:        false,
	shiftKey:      false,
	metaKey:       false,
	button:        0,
	relatedTarget: null,
	locale:        '',
	oldURL:        '',
	newURL:        '',
	origin:        '',
	lastEventId:   '',
	source:        null,
	ports:         [],
	oldValue:      null,
	newValue:      null,
	url:           '',
	storageArea:   null,
	deltaX:        0,
	deltaY:        0,
	deltaZ:        0,
	deltaMode:     0
};


// TODO remove the ones that aren't supported in any browser
var eventTypesByGroup = {
	UIEvent:                     'abort error resize scroll select unload',
	Event:                       'afterprint beforeprint cached canplay canplaythrough change chargingchange chargingtimechange checking close dischargingtimechange DOMContentLoaded downloading durationchange emptied ended fullscreenchange fullscreenerror input invalid levelchange loadeddata loadedmetadata noupdate obsolete offline online open orientationchange pause pointerlockchange pointerlockerror play playing ratechange readystatechange reset seeked seeking stalled submit success suspend timeupdate updateready visibilitychange volumechange waiting',
	AnimationEvent:              'animationend animationiteration animationstart',
	AudioProcessingEvent:        'audioprocess',
	BeforeUnloadEvent:           'beforeunload',
	TimeEvent:                   'beginEvent endEvent repeatEvent',
	FocusEvent:                  'blur focus focusin focusout',
	MouseEvent:                  'click contextmenu dblclick mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup show',
	SensorEvent:                 'compassneedscalibration userproximity',
	OfflineAudioCompletionEvent: 'complete',
	CompositionEvent:            'compositionend compositionstart compositionupdate',
	ClipboardEvent:              'copy cut paste',
	DeviceLightEvent:            'devicelight',
	DeviceMotionEvent:           'devicemotion',
	DeviceOrientationEvent:      'deviceorientation',
	DeviceProximityEvent:        'deviceproximity',
	DragEvent:                   'drag dragend dragenter dragleave dragover dragstart drop',
	GamepadEvent:                'gamepadconnected gamepaddisconnected',
	HashChangeEvent:             'hashchange',
	KeyboardEvent:               'keydown keypress keyup',
	ProgressEvent:               'loadend loadstart progress timeout',
	MessageEvent:                'message',
	PageTransitionEvent:         'pagehide pageshow',
	PopStateEvent:               'popstate',
	StorageEvent:                'storage',
	SVGEvent:                    'SVGAbort SVGError SVGLoad SVGResize SVGScroll SVGUnload',
	SVGZoomEvent:                'SVGZoom',
	TouchEvent:                  'touchcancel touchend touchenter touchleave touchmove touchstart',
	TransitionEvent:             'transitionend',
	WheelEvent:                  'wheel'
};


// The parameters required by event constructors and init methods, in the order the init methods need them.

// There is no initKeyboardEvent or initKeyEvent here. Keyboard events are a goddamned mess. You can't fake them
// well in any browser - the which and keyCode properties are readonly, for example. So we don't actually use the
// KeyboardEvent constructor, or the initKeyboardEvent or initKeyEvent methods. Instead we use a bog standard
// Event and add the required parameters as expando properties.

// TODO I think in some browsers we need to use modifiersList instead of ctrlKey/shiftKey etc?
var initialiserParams = {
	initUIEvent:          'view detail',
	initMouseEvent:       'view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget',
	initCompositionEvent: 'view detail data locale',
	initHashChangeEvent:  'oldURL newURL',
	initMessageEvent:     'data origin lastEventId source ports',
	initStorageEvent:     'key oldValue newValue url storageArea',
	initWheelEvent:       'view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget deltaX deltaY deltaZ deltaMode'
};
var initialisersByGroup = {
	UIEvent:             [ global.UIEvent,             'initUIEvent'          ],
	Event:               [ global.Event,               'initEvent'            ],
	FocusEvent:          [ global.FocusEvent,          'initUIEvent'          ],
	MouseEvent:          [ global.MouseEvent,          'initMouseEvent'       ],
	CompositionEvent:    [ global.CompositionEvent,    'initCompositionEvent' ],
	HashChangeEvent:     [ global.HashChangeEvent,     'initHashChangeEvent'  ],
	KeyboardEvent:       [ global.Event,               'initEvent'            ], 
	ProgressEvent:       [ global.ProgressEvent,       'initEvent'            ],
	MessageEvent:        [ global.MessageEvent,        'initMessageEvent'     ], // TODO prefixed?
	PageTransitionEvent: [ global.PageTransitionEvent, 'initEvent'            ],
	PopStateEvent:       [ global.PopStateEvent,       'initEvent'            ],
	StorageEvent:        [ global.StorageEvent,        'initStorageEvent'     ],
	TouchEvent:          [ global.TouchEvent,          'initTouchEvent'       ],
	WheelEvent:          [ global.WheelEvent,          'initWheelEvent'       ] // TODO this differs between browsers...
};


var useAncient = function () {
	// create initialisers
	(function () {
		var methodName, makeInitialiser;

		initialisers = {};

		makeInitialiser = function ( methodName, paramsList ) {
			return function ( event, type, params ) {
				var paramName, i;

				event.type = type;

				i = paramsList.length;
				while ( i-- ) {
					paramName = paramsList[i];
					event[ paramName ] = params[ paramName ] || defaults[ paramName ];
				}
			};
		};

		for ( methodName in initialiserParams ) {
			if ( initialiserParams.hasOwnProperty( methodName ) ) {
				initialisers[ methodName ] = makeInitialiser( methodName, initialiserParams[ methodName ] );
			}
		}

		initialisers.initEvent = makeInitialiser( 'initEvent', [] );
	}());

	simulant = function ( type, params ) {
		var event, group, initialiserName, initialise, isKeyboardEvent;

		group = eventGroupByType[ type ];

		if ( group === 'KeyboardEvent' ) {
			isKeyboardEvent = true;
			group = 'Event';
		}

		initialiserName = initialisersByGroup[ group ][1];
		initialise = initialisers[ initialiserName ];

		event = document.createEventObject();
		initialise( event, type, params || {} );
		
		if ( isKeyboardEvent ) {
			extendWithKeyboardParams( event, params );
		}

		return event;
	};

	simulant.mode = 'ancient';
};


var useLegacy = function () {
	// create initialisers
	(function () {
		var methodName, makeInitialiser;

		initialisers = {};

		makeInitialiser = function ( methodName, paramsList ) {
			return function ( event, type, params ) {
				var args, paramName, i, len;

				// first two args are always bubbles, cancelable
				args = [ true, true ]; // TODO some events don't bubble?

				len = paramsList.length;
				for ( i=0; i<len; i+=1 ) {
					paramName = paramsList[i];
					args[ args.length ] = params[ paramName ] || defaults[ paramName ];
				}

				args.unshift( type );

				event[ methodName ].apply( event, args );
			};
		};

		for ( methodName in initialiserParams ) {
			if ( initialiserParams.hasOwnProperty( methodName ) ) {
				initialisers[ methodName ] = makeInitialiser( methodName, initialiserParams[ methodName ] );
			}
		}

		initialisers.initEvent = makeInitialiser( 'initEvent', [] );
	}());

	simulant = function ( type, params ) {
		var event, group, initialiserName, initialise, isKeyboardEvent;

		group = eventGroupByType[ type ];

		if ( group === 'KeyboardEvent' ) {
			isKeyboardEvent = true;
			group = 'Event';
		}
		
		initialiserName = initialisersByGroup[ group ][1];
		initialise = initialisers[ initialiserName ];

		event = document.createEvent( group );
		initialise( event, type, params || {} );

		if ( isKeyboardEvent ) {
			extendWithKeyboardParams( event, params );
		}

		return event;
	};

	simulant.mode = 'legacy';
};


var useModern = function () {
	simulant = function ( type, params ) {
		var event, group, Constructor, paramsList, paramName, i, extendedParams, isKeyboardEvent;

		group = eventGroupByType[ type ];

		if ( group === 'KeyboardEvent' ) {
			group = 'Event'; // because you can't fake KeyboardEvents well in any browser
			isKeyboardEvent = true;
		}

		Constructor = initialisersByGroup[ group ][0];

		if ( !params ) {
			params = {};
		}

		extendedParams = {
			bubbles: true, // TODO some events don't bubble?
			cancelable: true
		};

		paramsList = initialiserParams[ initialisersByGroup[ group ][1] ];
		i = ( paramsList ? paramsList.length : 0 );

		while ( i-- ) {
			paramName = paramsList[i];
			extendedParams[ paramName ] = ( params[ paramName ] !== undefined ? params[ paramName ] : defaults[ paramName ] );
		}

		event = new Constructor( type, extendedParams );

		if ( isKeyboardEvent ) {
			extendWithKeyboardParams( event, params );
		}

		return event;
	};

	simulant.mode = 'modern';
};


var keyboardParams = [ 'which', 'keyCode', 'shiftKey', 'ctrlKey', 'altKey', 'metaKey' ];

var extendWithKeyboardParams = function ( event, params ) {
	var i = keyboardParams.length;
	while ( i-- ) {
		event[ keyboardParams[i] ] = params[ keyboardParams[i] ];
	}
};


var eventGroupByType,
	initialisers,
	modern,
	ancient,
	modifiers,
	getModifiersList;



modifiers = [
	[ 'ctrlKey',  'Control' ],
	[ 'shiftKey', 'Shift'   ],
	[ 'altKey',   'Alt'     ],
	[ 'metaKey',  'Meta'    ]
];

getModifiersList = function ( params ) {
	var list = [], i, modifier;

	i = modifiers.length;
	while ( i-- ) {
		modifier = modifiers[i];
		if ( params[ modifier[0] ] ) {
			list[ list.length ] = modifier[1];
		}
	}

	return list.join( ' ' );
};


// unpack event groups
(function () {
	var group, types, i, initMethod;

	eventGroupByType = {};

	for ( group in eventTypesByGroup ) {
		if ( eventTypesByGroup.hasOwnProperty( group ) ) {
			types = eventTypesByGroup[ group ].split( ' ' );

			i = types.length;
			while ( i-- ) {
				eventGroupByType[ types[i] ] = group;
			}
		}
	}

	for ( initMethod in initialiserParams ) {
		if ( initialiserParams.hasOwnProperty( initMethod ) ) {
			initialiserParams[ initMethod ] = initialiserParams[ initMethod ].split( ' ' );
		}
	}
}());



try {
	// event initialisersByGroup
	new MouseEvent( 'click' );
	modern = true;
}

catch ( err ) {
	if ( !document.createEvent ) {
		if ( document.createEventObject ) {
			ancient = true;
		} else {
			throw new Error( 'Events cannot be created in this browser' );
		}
	}
}

if ( modern ) {
	useModern();
}

else if ( !ancient ) {
	useLegacy();
}

else {
	useAncient();
}


simulant.params = function ( type ) {
	var group;

	group = eventGroupByType[ type ];
	return initialiserParams[ initialisersByGroup[ group ][1] ].split( ' ' );
};


if ( document.dispatchEvent ) {
	simulant.fire = function ( node, event, params ) {
		if ( typeof event === 'string' ) {
			event = simulant( event, params );
		}

		node.dispatchEvent( event );
	};
} else if ( document.fireEvent ) {
	simulant.fire = function ( node, event, params ) {
		if ( typeof event === 'string' ) {
			event = simulant( event, params );
		}

		node.fireEvent( 'on' + event.type, event );

		// Special case - checkbox inputs
		if ( node.tagName === 'INPUT' && node.type === 'checkbox' ) {
			node.click();
		}
	};
}


simulant.polyfill = function () {

	// https://gist.github.com/Rich-Harris/6010282 via https://gist.github.com/jonathantneal/2869388
	// addEventListener polyfill IE6+
	var Event, addEventListener, removeEventListener, head, style;

	Event = function ( e, element ) {
		var property, instance = this;

		for ( property in e ) {
			instance[ property ] = e[ property ];
		}

		instance.currentTarget =  element;
		instance.target = e.srcElement || element;
		instance.timeStamp = +new Date();

		instance.preventDefault = function () {
			e.returnValue = false;
		};

		instance.stopPropagation = function () {
			e.cancelBubble = true;
		};
	};

	addEventListener = function ( type, listener ) {
		var element = this, listeners, i;

		listeners = element.listeners || ( element.listeners = [] );
		i = listeners.length;
		
		listeners[i] = [ listener, function (e) {
			listener.call( element, new Event( e, element ) );
		}];

		element.attachEvent( 'on' + type, listeners[i][1] );
	};

	removeEventListener = function ( type, listener ) {
		var element = this, listeners, i;

		if ( !element.listeners ) {
			return;
		}

		listeners = element.listeners;
		i = listeners.length;

		while ( i-- ) {
			if ( listeners[i][0] === listener ) {
				element.detachEvent( 'on' + type, listeners[i][1] );
			}
		}
	};

	global.addEventListener = document.addEventListener = addEventListener;
	global.removeEventListener = document.removeEventListener = removeEventListener;

	if ( 'Element' in global ) {
		Element.prototype.addEventListener = addEventListener;
		Element.prototype.removeEventListener = removeEventListener;
	} else {
		head = document.getElementsByTagName('head')[0];
		style = document.createElement('style');

		head.insertBefore( style, head.firstChild );

		style.styleSheet.cssText = '*{-ms-event-prototype:expression(!this.addEventListener&&(this.addEventListener=addEventListener)&&(this.removeEventListener=removeEventListener))}';
	}

	addEventListener.simulant = true;

};
// export as AMD module
if ( typeof define === "function" && define.amd ) {
	define( function () {
		return simulant;
	});
}

// ... or as browser global
else {
	global.simulant = simulant;
}

}( typeof window !== 'undefined' ? window : this ));