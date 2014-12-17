import { isClient } from 'config/environment';
import { warn } from 'utils/log';
import { createElement } from 'utils/dom';
import camelCase from 'utils/camelCase';
import interpolate from 'shared/interpolate';
import Ticker from 'shared/Ticker';
import prefix from '../../helpers/prefix';
import unprefix from '../../helpers/unprefix';
import hyphenate from '../../helpers/hyphenate';

var createTransitions,
	testStyle,
	TRANSITION,
	TRANSITIONEND,
	CSS_TRANSITIONS_ENABLED,
	TRANSITION_DURATION,
	TRANSITION_PROPERTY,
	TRANSITION_TIMING_FUNCTION,
	canUseCssTransitions = {},
	cannotUseCssTransitions = {};

if ( !isClient ) {
	createTransitions = null;
} else {
	testStyle = createElement( 'div' ).style;

	// determine some facts about our environment
	(function() {
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

	createTransitions = function ( t, to, options, changedProperties, resolve ) {

		// Wait a beat (otherwise the target styles will be applied immediately)
		// TODO use a fastdom-style mechanism?
		setTimeout( function () {

			var hashPrefix, jsTransitionsComplete, cssTransitionsComplete, checkComplete, transitionEndHandler;

			checkComplete = function () {
				if ( jsTransitionsComplete && cssTransitionsComplete ) {
					// will changes to events and fire have an unexpected consequence here?
					t.root.fire( t.name + ':end', t.node, t.isIntro );
					resolve();
				}
			};

			// this is used to keep track of which elements can use CSS to animate
			// which properties
			hashPrefix = ( t.node.namespaceURI || '' ) + t.node.tagName;

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

				t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );

				cssTransitionsComplete = true;
				checkComplete();
			};

			t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );

			setTimeout( function () {
				var i = changedProperties.length, hash, originalValue, index, propertiesToTransitionInJs = [], prop, suffix;

				while ( i-- ) {
					prop = changedProperties[i];
					hash = hashPrefix + prop;

					if ( CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[ hash ] ) {
						t.node.style[ prefix( prop ) ] = to[ prop ];

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
								t.node.style[ prefix( prop ) ] = originalValue;
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
							warn( 'Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
						} else {
							changedProperties.splice( index, 1 );
						}

						// TODO Determine whether this property is animatable at all

						suffix = /[^\d]*$/.exec( to[ prop ] )[0];

						// ...then kick off a timer-based transition
						propertiesToTransitionInJs.push({
							name: prefix( prop ),
							interpolator: interpolate( parseFloat( originalValue ), parseFloat( to[ prop ] ) ),
							suffix: suffix
						});
					}
				}


				// javascript transitions
				if ( propertiesToTransitionInJs.length ) {
					new Ticker({
						root: t.root,
						duration: options.duration,
						easing: camelCase( options.easing || '' ),
						step: function ( pos ) {
							var prop, i;

							i = propertiesToTransitionInJs.length;
							while ( i-- ) {
								prop = propertiesToTransitionInJs[i];
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

export default createTransitions;
