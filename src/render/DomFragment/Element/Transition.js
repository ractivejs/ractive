define([
	'config/isClient',
	'utils/isNumeric',
	'utils/isArray',
	'render/StringFragment/_StringFragment'
], function (
	isClient,
	isNumeric,
	isArray,
	StringFragment
) {
	
	'use strict';

	var Transition,

		parseTransitionParams,

		testStyle,
		vendors,
		vendorPattern,
		prefix,
		prefixCache,
		hyphenate,
		
		CSS_TRANSITIONS_ENABLED,
		TRANSITION,
		TRANSITION_DURATION,
		TRANSITION_PROPERTY,
		TRANSITION_TIMING_FUNCTION,
		TRANSITIONEND;

	if ( !isClient ) {
		// not relevant server-side
		return;
	}

	testStyle = document.createElement( 'div' ).style;

	// determine some facts about our environment
	(function () {

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

	}());

	if ( TRANSITION ) {
		TRANSITION_DURATION = TRANSITION + 'Duration';
		TRANSITION_PROPERTY = TRANSITION + 'Property';
		TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
	}

	Transition = function ( descriptor, root, owner, contextStack, isIntro ) {
		var fragment, params, prop;

		this.root = root;
		this.node = owner.node;
		this.isIntro = isIntro;

		// store original style attribute
		this.originalStyle = this.node.getAttribute( 'style' );

		if ( typeof descriptor === 'string' ) {
			this.name = descriptor;
		} else {
			this.name = descriptor.n;

			if ( descriptor.a ) {
				params = descriptor.a;
			} else if ( descriptor.d ) {
				// TODO is there a way to interpret dynamic arguments without all the
				// 'dependency thrashing'?
				fragment = new StringFragment({
					descriptor:   descriptor.d,
					root:         root,
					owner:        owner,
					contextStack: owner.parentFragment.contextStack
				});

				params = fragment.toJSON();
				fragment.teardown();
			}
		}

		this._fn = root.transitions[ this.name ];
		if ( !this._fn ) {
			return;
		}

		// parse transition parameters
		params = parseTransitionParams( params );

		// TODO blacklist certain params
		for ( prop in params ) {
			if ( params.hasOwnProperty( prop ) ) {
				this[ prop ] = params[ prop ];
			}
		}
	};

	Transition.prototype = {
		init: function () {
			if ( this._inited ) {
				throw new Error( 'Cannot initialize a transition more than once' );
			}

			this._inited = true;
			this._fn.call( this.root, this );
		},

		complete: function () {
			this._manager.pop( this.node );
			this.node._ractive.transition = null;
		},

		// TODO handle prefixed styles
		getStyle: function ( props ) {
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
				prop = props[i];
				value = computedStyle[ prefix( prop ) ];
				if ( value === '0px' ) {
					value = 0;
				}
				styles[ prop ] = value;
			}

			return styles;
		},

		setStyle: function ( style, value ) {
			var prop;

			if ( typeof style === 'string' ) {
				this.node.style[ prefix( style ) ] = value;
			}

			else {
				for ( prop in style ) {
					if ( style.hasOwnProperty( prop ) ) {
						// TODO prefix
						this.node.style[ prefix( prop ) ] = style[ prop ];
					}
				}
			}
			
			return this;
		},

		animateStyle: function ( to ) {
			var t = this, propertyNames, changedProperties, computedStyle, current, from, transitionEndHandler, i, prop;

			// Get a list of the properties we're animating
			propertyNames = Object.keys( to );
			changedProperties = [];

			// Store the current styles
			computedStyle = window.getComputedStyle( t.node );

			from = {};
			i = propertyNames.length;
			while ( i-- ) {
				prop = propertyNames[i];
				current = computedStyle[ prefix( prop ) ];

				if ( current === '0px' ) {
					current = 0;
				}

				// we need to know if we're actually changing anything
				if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
					changedProperties[ changedProperties.length ] = prop;

					// make the computed style explicit, so we can animate where
					// e.g. height='auto'
					t.node.style[ prefix( prop ) ] = current;
				}
			}

			// If we're not actually changing anything, the transitionend event
			// will never fire! So we complete early
			if ( !changedProperties.length ) {
				t.resetStyle();
				t.complete();
				return;
			}

			// Wait a beat (otherwise the target styles will be applied immediately)
			// TODO use a fastdom-style mechanism?
			setTimeout( function () {

				t.node.style[ TRANSITION_PROPERTY ] = propertyNames.map( prefix ).map( hyphenate ).join( ',' );
				t.node.style[ TRANSITION_TIMING_FUNCTION ] = hyphenate( t.easing || 'linear' );
				t.node.style[ TRANSITION_DURATION ] = ( t.duration / 1000 ) + 's';

				transitionEndHandler = function () {
					t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );

					// We've abused the style attribute - we need to revert
					// it to it's natural state, if this is an intro
					if ( t.isIntro ) {
						t.resetStyle();
					}

					t.complete();
				};
				
				t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );

				setTimeout( function () {
					var i = changedProperties.length;
					
					while ( i-- ) {
						prop = changedProperties[i];
						t.node.style[ prefix( prop ) ] = to[ prop ];
					}
				}, 0 );
			}, t.delay || 0 );
		},

		resetStyle: function () {
			if ( this.originalStyle ) {
				this.node.setAttribute( 'style', this.originalStyle );
			} else {
				
				// Next line is necessary, to remove empty style attribute!
				// See http://stackoverflow.com/a/7167553
				this.node.getAttribute( 'style' );
				this.node.removeAttribute( 'style' );
			}
		}
	};

	parseTransitionParams = function ( params ) {
		if ( params === 'fast' ) {
			return { duration: 200 };
		}

		if ( params === 'slow' ) {
			return { duration: 600 };
		}

		if ( isNumeric( params ) ) {
			return { duration: +params };
		}

		return params || {};
	};

	// get prefixed style attributes
	vendors = [ 'o', 'ms', 'moz', 'webkit' ];
	vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')[A-Z]' );
	prefixCache = {};

	prefix = function ( prop ) {
		var i, vendor, capped;

		if ( !prefixCache[ prop ] ) {
			if ( testStyle[ prop ] !== undefined ) {
				prefixCache[ prop ] = prop;
			}

			else {
				// test vendors...
				capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );

				i = vendors.length;
				while ( i-- ) {
					vendor = vendors[i];
					if ( testStyle[ vendor + capped ] !== undefined ) {
						prefixCache[ prop ] = vendor + capped;
						break;
					}
				}
			}
		}

		return prefixCache[ prop ];
	};

	hyphenate = function ( str ) {
		var hyphenated;

		if ( vendorPattern.test( str ) ) {
			str = '-' + str;
		}

		hyphenated = str.replace( /[A-Z]/g, function ( match ) {
			return '-' + match.toLowerCase();
		});

		return hyphenated;
	};

	return Transition;

});