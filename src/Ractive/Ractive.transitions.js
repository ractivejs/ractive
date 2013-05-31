(function () {

	var transitionsEnabled, transition, transitionend, testDiv, hyphenate, makeTransition;

	testDiv = document.createElement( 'div' );

	if ( testDiv.style.transition !== undefined ) {
		transition = 'transition';
		transitionend = 'transitionend';
		transitionsEnabled = true;
	} else if ( testDiv.style.webkitTransition !== undefined ) {
		transition = 'webkitTransition';
		transitionend = 'webkitTransitionEnd';
		transitionsEnabled = true;
	} else {
		transitionsEnabled = false;
	}


	hyphenate = function ( str ) {
		return str.replace( /[A-Z]/g, function ( match ) {
			return '-' + match.toLowerCase()
		});
	};

	


	if ( transitionsEnabled ) {
		makeTransition = function ( options ) {
			return function ( el, complete ) {
				var transitionEndHandler, transitionStyle, duration;

				duration = options.duration || 400;
				easing = hyphenate( options.easing || 'linear' );

				// the existing transition style, to which we'll shortly revert
				transitionStyle = el.style[ transition ];

				// starting style
				el.style[ options.property ] = options.from;

				setTimeout( function () {
					el.style[ transition ] = ( duration / 1000 ) + 's ' + options.property + ' ' + easing;

					transitionEndHandler = function ( event ) {
						el.removeEventListener( transitionend, transitionEndHandler );
						el.style.transition = transitionStyle;

						complete();
					};
					
					el.addEventListener( transitionend, transitionEndHandler );
					el.style[ options.property ] = options.to;
				}, 0 );
			};
		};
	} else {
		// TODO!
		makeTransition = function () {
			return function ( el, complete ) {
				complete();
			};
		};
	}


	transitions = {
		fadeIn: makeTransition({
			property: 'opacity',
			from: 0,
			to: 1,
			duration: 4000,
			easing: 'linear'
		}),
		fadeOut: makeTransition({
			property: 'opacity',
			from: 1,
			to: 0,
			duration: 4000,
			easing: 'linear'
		})
	};


}());