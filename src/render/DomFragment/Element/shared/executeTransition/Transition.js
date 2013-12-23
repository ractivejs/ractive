define([
	'config/isClient',
	'utils/warn',
	'utils/isNumeric',
	'utils/isArray',
	'utils/camelCase',
	'render/StringFragment/_StringFragment'
], function (
	isClient,
	warn,
	isNumeric,
	isArray,
	camelCase,
	StringFragment
) {

	'use strict';

	var Transition,

		testStyle,
		vendors,
		vendorPattern,
		unprefixPattern,
		prefixCache,

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
		var name, fragment, errorMessage;

		this.root = root;
		this.node = owner.node;
		this.isIntro = isIntro;

		// store original style attribute
		this.originalStyle = this.node.getAttribute( 'style' );

		name = descriptor.n || descriptor;

		if ( typeof name !== 'string' ) {
			fragment = new StringFragment({
				descriptor:   name,
				root:         this.root,
				owner:        owner,
				contextStack: contextStack
			});

			name = fragment.toString();
			fragment.teardown();
		}

		this.name = name;

		if ( descriptor.a ) {
			this.params = descriptor.a;
		}

		else if ( descriptor.d ) {
			// TODO is there a way to interpret dynamic arguments without all the
			// 'dependency thrashing'?
			fragment = new StringFragment({
				descriptor:   descriptor.d,
				root:         this.root,
				owner:        owner,
				contextStack: contextStack
			});

			this.params = fragment.toArgsList();
			fragment.teardown();
		}

		this._fn = root.transitions[ name ];
		if ( !this._fn ) {
			errorMessage = 'Missing "' + name + '" transition. You may need to download a plugin via https://github.com/RactiveJS/Ractive/wiki/Plugins#transitions';

			if ( root.debug ) {
				throw new Error( errorMessage );
			} else {
				warn( errorMessage );
			}

			return;
		}
	};

	Transition.prototype = {
		init: function () {
			if ( this._inited ) {
				throw new Error( 'Cannot initialize a transition more than once' );
			}

			this._inited = true;
			this._fn.apply( this.root, [ this ].concat( this.params ) );
		},

		complete: function () {
			this._manager.pop( this.node );
			this.node._ractive.transition = null;
		},

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
						this.node.style[ prefix( prop ) ] = style[ prop ];
					}
				}
			}

			return this;
		},

		animateStyle: function ( to ) {
			var t = this, propertyNames, changedProperties, computedStyle, current, from, transitionEndHandler, i, prop;

			// Edge case - if duration is zero, set style synchronously and complete
			if ( !t.duration ) {
				t.setStyle( to );
				t.complete();
			}

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

				transitionEndHandler = function ( event ) {
					var index;

					index = changedProperties.indexOf( camelCase( unprefix( event.propertyName ) ) );
					if ( index !== -1 ) {
						changedProperties.splice( index, 1 );
					}

					if ( changedProperties.length ) {
						// still transitioning...
						return;
					}

					t.root.fire(t.name + ':end');

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

	// get prefixed style attributes
	vendors = [ 'o', 'ms', 'moz', 'webkit' ];
	vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );
	unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );
	prefixCache = {};

	function prefix ( prop ) {
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
	}

	function unprefix ( prop ) {
		return prop.replace( unprefixPattern, '' );
	}

	function hyphenate ( str ) {
		var hyphenated;

		if ( vendorPattern.test( str ) ) {
			str = '-' + str;
		}

		hyphenated = str.replace( /[A-Z]/g, function ( match ) {
			return '-' + match.toLowerCase();
		});

		return hyphenated;
	}

	return Transition;

});
