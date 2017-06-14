import { missingPlugin } from '../../../../config/errors';
import { isClient } from '../../../../config/environment';
import { warnIfDebug, warnOnceIfDebug } from '../../../../utils/log';
import { createElement } from '../../../../utils/dom';
import interpolate from '../../../../shared/interpolate';
import Ticker from '../../../../shared/Ticker';
import hyphenate from './hyphenate';

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

export default createTransitions;
