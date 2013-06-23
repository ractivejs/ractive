(function () {

	var getOriginalComputedStyles, setStyle, augment, makeTransition, transform, transformsEnabled, inside, outside;

	getOriginalComputedStyles = function ( computedStyle, properties ) {
		var original = {}, i;

		i = properties.length;
		while ( i-- ) {
			original[ properties[i] ] = computedStyle[ properties[i] ];
		}

		return original;
	};

	setStyle = function ( el, properties, map, params ) {
		var i = properties.length, prop;

		while ( i-- ) {
			prop = properties[i];
			if ( map && map[ prop ] ) {
				if ( typeof map[ prop ] === 'function' ) {
					el.style[ prop ] = map[ prop ]( params );
				} else {
					el.style[ prop ] = map[ prop ];
				}
			}

			else {
				el.style[ prop ] = 0;
			}
		}
	};

	augment = function ( target, source ) {
		var key;

		if ( !source ) {
			return target;
		}

		for ( key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = source[ key ];
			}
		}

		return target;
	};

	makeTransition = function ( properties, defaults, outside, inside ) {
		if ( typeof properties === 'string' ) {
			properties = [ properties ];
		}

		return function ( el, complete, params, info, isIntro ) {
			var transitionEndHandler, transitionStyle, computedStyle, original, startTransition, originalStyle, originalOpacity, targetOpacity, duration, start, end, source, target;

			params = parseTransitionParams( params );

			duration = params.duration || defaults.duration;
			easing = hyphenate( params.easing || defaults.easing );

			start = ( isIntro ? outside : inside );
			end = ( isIntro ? inside : outside );

			computedStyle = window.getComputedStyle( el );

			// if this is an intro, we need to transition TO the original styles
			if ( isIntro ) {
				// hide, to avoid flashes
				el.style.visibility = 'hidden';

				// we need to wait a beat before we can actually get values from computedStyle.
				// Yeah, I know, WTF browsers
				setTimeout( function () {
					var i, prop;

					original = getOriginalComputedStyles( computedStyle, properties );

					start = outside;
					end = augment( original, inside );

					// starting style
					setStyle( el, properties, start, params );
					el.style.visibility = 'visible';

					setTimeout( startTransition, 0 );
				}, 0 );
			}

			// otherwise we need to transition FROM them
			else {
				setTimeout( function () {
					var i, prop;

					original = getOriginalComputedStyles( computedStyle, properties );

					start = augment( original, inside );
					end = outside;

					// ending style
					setStyle( el, properties, start, params );

					setTimeout( startTransition, 0 );
				}, 0 );
			}

			startTransition = function () {
				var i, prop;

				el.style[ transition + 'Duration' ] = ( duration / 1000 ) + 's';
				el.style[ transition + 'Properties' ] = properties.map( hyphenate ).join( ',' );
				el.style[ transition + 'TimingFunction' ] = easing;

				transitionEndHandler = function ( event ) {
					el.removeEventListener( transitionend, transitionEndHandler );

					if ( isIntro ) {
						setTimeout( function () {
							if ( originalStyle ) {
								el.setAttribute( 'style', originalStyle );
							} else {
								el.removeAttribute( 'style' );
							}
						}, 0 );
					}

					complete();
				};
				
				el.addEventListener( transitionend, transitionEndHandler );

				setStyle( el, properties, end, params );
			};
		};
	};

	transitions.slide = makeTransition([
		'height',
		'borderTopWidth',
		'borderBottomWidth',
		'paddingTop',
		'paddingBottom'/*,
		'overflowY'*/
	], { duration: 400, easing: 'easeInOut' }, { overflowY: 'hidden' });

	transitions.fade = makeTransition( 'opacity', {
		duration: 300,
		easing: 'linear'
	});

	// get prefixed transform property name
	(function ( propertyNames ) {
		var i = propertyNames.length, testDiv = document.createElement( 'div' );
		while ( i-- ) {
			if ( testDiv.style[ propertyNames[i] ] !== undefined ) {
				transform = propertyNames[i];
				transformsEnabled = true;
				break;
			}
		}
	}([ 'OTransform', 'msTransform', 'MozTransform', 'webkitTransform', 'transform' ]));

	if ( transformsEnabled ) {
		outside = {};
		outside[ transform ] = function ( params ) {
			var transformStr = 'translate(' +
				( params.x !== undefined ? params.x : 400 ) + 'px,' +
				( params.y !== undefined ? params.y : 0 ) + 'px)';

			return transformStr;
		};

		inside = {};
		inside[ transform ] = 'translate(0,0)';

		transitions.fly = makeTransition([ 'opacity', transform ], {
			duration: 400, easing: 'easeOut'
		}, outside, inside );


		transitions.fly = makeTransition([ 'opacity', 'left', 'position' ], {
			duration: 400, easing: 'easeOut'
		}, { position: 'relative', left: '-500px' }, { position: 'relative', left: 0 })
	} else {
		// TODO
	}

}());