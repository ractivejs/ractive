(function ( global ) {

'use strict';

var simulant;


var eventTypesByGroup, eventGroupByType, initialisersByGroup, initialiserParams, defaults, initialisers, modern, ancient;

// TODO remove the ones that aren't supported in any browser
eventTypesByGroup = {
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

initialisersByGroup = {
	UIEvent:             [ global.UIEvent,             'initUIEvent'          ],
	Event:               [ global.Event,               'initEvent'            ],
	FocusEvent:          [ global.FocusEvent,          'initUIEvent'          ],
	MouseEvent:          [ global.MouseEvent,          'initMouseEvent'       ],
	CompositionEvent:    [ global.CompositionEvent,    'initCompositionEvent' ],
	HashChangeEvent:     [ global.HashChangeEvent,     'initHashChangeEvent'  ],
	KeyboardEvent:       [ global.KeyboardEvent,       'initKeyboardEvent'    ],
	ProgressEvent:       [ global.ProgressEvent,       'initEvent'            ],
	MessageEvent:        [ global.MessageEvent,        'initMessageEvent'     ], // TODO prefixed?
	PageTransitionEvent: [ global.PageTransitionEvent, 'initEvent'            ],
	PopStateEvent:       [ global.PopStateEvent,       'initEvent'            ],
	StorageEvent:        [ global.StorageEvent,        'initStorageEvent'     ],
	TouchEvent:          [ global.TouchEvent,          'initTouchEvent'       ],
	WheelEvent:          [ global.WheelEvent,          'initWheelEvent'       ] // TODO this differs between browsers...
};

initialiserParams = {
	initEvent:            'bubbles cancelable',
	initUIEvent:          'bubbles cancelable view detail',
	initMouseEvent:       'bubbles cancelable view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget',
	initCompositionEvent: 'bubbles cancelable view detail data locale',
	initHashChangeEvent:  'bubbles cancelable oldURL newURL',
	initKeyboardEvent:    '', // TODO keyboard events are a goddamned mess
	initMessageEvent:     'bubbles cancelable data origin lastEventId source ports',
	initStorageEvent:     'bubbles cancelable key oldValue newValue url storageArea',
	initWheelEvent:       'bubbles cancelable view detail screenX screenY clientX clientY ctrlKey altKey shiftKey metaKey button relatedTarget deltaX deltaY deltaZ deltaMode'
};

defaults = {
	bubbles:       false,
	cancelable:    false,
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


// unpack event groups
(function () {
	var group, types, i;

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
	simulant = function ( type, params ) {
		var event, group, Constructor;

		group = eventGroupByType[ type ];
		Constructor = initialisersByGroup[ group ][0];

		event = new Constructor( type, params );

		return event;
	};
}

else if ( !ancient ) {
	// create initialisers
	(function () {
		var methodName, makeInitialiser;

		initialisers = {};

		makeInitialiser = function ( methodName, paramsList ) {
			return function ( event, type, params ) {
				var args, paramName, i;

				args = [];

				i = paramsList.length;
				while ( i-- ) {
					paramName = paramsList[i];
					args[i] = params[ paramName ] || defaults[ paramName ];
				}

				args.unshift( type );

				event[ methodName ].apply( event, args );
			};
		};

		for ( methodName in initialiserParams ) {
			if ( initialiserParams.hasOwnProperty( methodName ) ) {
				initialisers[ methodName ] = makeInitialiser( methodName, initialiserParams[ methodName ].split( ' ' ) );
			}
		}
	}());

	simulant = function ( type, params ) {
		var event, group, initialiserName, initialise;

		group = eventGroupByType[ type ];
		
		initialiserName = initialisersByGroup[ group ][1];
		initialise = initialisers[ initialiserName ];

		event = document.createEvent( group );
		initialise( event, type, params || {} );

		return event;
	};
}

else {
	// create initialisers
	(function () {
		var methodName, makeInitialiser;

		initialisers = {};

		makeInitialiser = function ( methodName, paramsList ) {
			return function ( event, type, params ) {
				var args, paramName, i;

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
				initialisers[ methodName ] = makeInitialiser( methodName, initialiserParams[ methodName ].split( ' ' ) );
			}
		}
	}());

	simulant = function ( type, params ) {
		var event, group, initialiserName, initialise;

		group = eventGroupByType[ type ];
		
		initialiserName = initialisersByGroup[ group ][1];
		initialise = initialisers[ initialiserName ];

		event = document.createEventObject();
		initialise( event, type, params || {} );

		return event;
	};
}


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
	};
}

simulant.params = function ( type ) {
	var group, initMethod;

	group = eventGroupByType[ type ];
	return initialiserParams[ initialisersByGroup[ group ][1] ].split( ' ' );
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