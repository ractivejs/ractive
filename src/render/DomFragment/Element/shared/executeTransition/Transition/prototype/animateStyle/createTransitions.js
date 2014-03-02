define([
	'config/isClient',
	'utils/warn',
	'utils/createElement',
	'utils/camelCase',
	'shared/interpolate',
	'shared/Ticker',
	'render/DomFragment/Element/shared/executeTransition/Transition/helpers/prefix',
	'render/DomFragment/Element/shared/executeTransition/Transition/helpers/unprefix',
	'render/DomFragment/Element/shared/executeTransition/Transition/helpers/hyphenate'
], function (
	isClient,
	warn,
	createElement,
	camelCase,
	interpolate,
	Ticker,
	prefix,
	unprefix,
	hyphenate
) {

	'use strict';

	var testStyle,
		TRANSITION,
		TRANSITIONEND,
		CSS_TRANSITIONS_ENABLED,
		TRANSITION_DURATION,
		TRANSITION_PROPERTY,
		TRANSITION_TIMING_FUNCTION,
		canUseCssTransitions = {},
		cannotUseCssTransitions = {};

	if ( !isClient ) {
		return;
	}

	testStyle = createElement( 'div' ).style;

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


	return function ( t, to, options, changedProperties, transitionEndHandler, resolve ) {

		// Wait a beat (otherwise the target styles will be applied immediately)
		// TODO use a fastdom-style mechanism?
		setTimeout( function () {

			var hashPrefix, jsTransitionsComplete, cssTransitionsComplete, checkComplete;

			checkComplete = function () {
				if ( jsTransitionsComplete && cssTransitionsComplete ) {
					resolve();
				}
			};

			// this is used to keep track of which elements can use CSS to animate
			// which properties
			hashPrefix = t.node.namespaceURI + t.node.tagName;

			t.node.style[ TRANSITION_PROPERTY ] = changedProperties.map( prefix ).map( hyphenate ).join( ',' );
			t.node.style[ TRANSITION_TIMING_FUNCTION ] = hyphenate( options.easing || 'linear' );
			t.node.style[ TRANSITION_DURATION ] = ( options.duration / 1000 ) + 's';

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

				cssTransitionsComplete = true;
				checkComplete();
			};

			t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );

			setTimeout( function () {
				var i = changedProperties.length, hash, originalValue, index, propertiesToTransitionInJs = [], prop;

				while ( i-- ) {
					prop = changedProperties[i];
					hash = hashPrefix + prop;

					if ( canUseCssTransitions[ hash ] ) {
						// We can definitely use CSS transitions, because
						// we've already tried it and it worked
						t.node.style[ prefix( prop ) ] = to[ prop ];
					} else {
						// one way or another, we'll need this
						originalValue = t.getStyle( prop ); // TODO don't we already have this value?
					}


					if ( canUseCssTransitions[ hash ] === undefined ) {
						// We're not yet sure if we can use CSS transitions -
						// let's find out
						t.node.style[ prefix( prop ) ] = to[ prop ];

						// if this property is transitionable in this browser,
						// the current style will be different from the target style
						canUseCssTransitions[ hash ] = ( t.getStyle( prop ) != to[ prop ] );
						cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];
					}


					if ( cannotUseCssTransitions[ hash ] ) {
						// we need to fall back to timer-based stuff

						// need to remove this from changedProperties, otherwise transitionEndHandler
						// will get confused
						index = changedProperties.indexOf( prop );
						if ( index === -1 ) {
							warn( 'Something very strange happened with transitions. If you see this message, please let @RactiveJS know. Thanks!' );
						} else {
							changedProperties.splice( index, 1 );
						}


						// TODO Determine whether this property is animatable at all

						// for now assume it is. First, we need to set the value to what it was...
						t.node.style[ prefix( prop ) ] = originalValue;

						// ...then kick off a timer-based transition
						propertiesToTransitionInJs.push({
							name: prefix( prop ),
							interpolator: interpolate( originalValue, to[ prop ] )
						});
					}
				}


				// javascript transitions
				if ( propertiesToTransitionInJs.length ) {
					new Ticker({
						root: t.root,
						duration: options.duration,
						easing: camelCase( options.easing ),
						step: function ( pos ) {
							var prop, i;

							i = propertiesToTransitionInJs.length;
							while ( i-- ) {
								prop = propertiesToTransitionInJs[i];
								t.node.style[ prop.name ] = prop.interpolator( pos );
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

});
