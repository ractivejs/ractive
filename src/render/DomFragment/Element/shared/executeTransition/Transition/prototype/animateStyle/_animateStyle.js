define([
	'utils/warn',
	'render/DomFragment/Element/shared/executeTransition/Transition/helpers/prefix',
	'render/DomFragment/Element/shared/executeTransition/Transition/helpers/unprefix',
	'render/DomFragment/Element/shared/executeTransition/Transition/prototype/animateStyle/createTransitions'
], function (
	warn,
	prefix,
	unprefix,
	createTransitions
) {

	'use strict';

	return function ( style, value, options, complete ) {
		var t = this, propertyNames, cssPropertiesToTransition, computedStyle, current, to, from, transitionEndHandler, i, prop;

		if ( typeof style === 'string' ) {
			to = {};
			to[ style ] = value;
		} else {
			to = style;

			// shuffle arguments
			complete = options;
			options = value;
		}

		// As of 0.3.9, transition authors should supply an `option` object with
		// `duration` and `easing` properties (and optional `delay`), plus a
		// callback function that gets called after the animation completes

		// TODO remove this check in a future version
		if ( !options ) {
			warn( 'The "' + t.name + '" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340' );

			options = t;
			complete = t.complete;
		}

		// Edge case - if duration is zero, set style synchronously and complete
		if ( !options.duration ) {
			t.setStyle( to );

			if ( complete ) {
				complete();
			}
		}

		// Get a list of the properties we're animating
		propertyNames = Object.keys( to );
		cssPropertiesToTransition = [];

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
				cssPropertiesToTransition.push( prop );

				// make the computed style explicit, so we can animate where
				// e.g. height='auto'
				t.node.style[ prefix( prop ) ] = current;
			}
		}

		// If we're not actually changing anything, the transitionend event
		// will never fire! So we complete early
		if ( !cssPropertiesToTransition.length ) {
			if ( complete ) {
				complete();
			}
			return;
		}

		createTransitions( t, to, options, propertyNames, cssPropertiesToTransition, transitionEndHandler, complete );
	};

});