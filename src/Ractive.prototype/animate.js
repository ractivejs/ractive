(function ( proto ) {

	var animate;

	proto.animate = function ( keypath, to, options ) {
		
		var k, animation, animations;

		options = options || {};

		// animate multiple properties
		if ( typeof keypath === 'object' ) {
			options = to;
			animations = [];

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					animations[ animations.length ] = animate( this, k, keypath[k], options );
				}
			}

			return {
				stop: function () {
					while ( animations.length ) {
						animations.pop().stop();
					}
				}
			};
		}

		animation = animate( this, keypath, to, options );

		return {
			stop: function () {
				animation.stop();
			}
		};
	};

	animate = function ( root, keypath, to, options ) {
		var easing, duration, animation, i, keys;

		// cancel any existing animation
		// TODO what about upstream/downstream keypaths?
		i = animationCollection.animations.length;
		while ( i-- ) {
			if ( animationCollection.animations[ i ].keypath === keypath ) {
				animationCollection.animations[ i ].stop();
			}
		}

		// easing function
		if ( options.easing ) {
			if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			}

			else {
				if ( root.easing && root.easing[ options.easing ] ) {
					// use instance easing function first
					easing = root.easing[ options.easing ];
				} else {
					// fallback to global easing functions
					easing = Ractive.easing[ options.easing ];
				}
			}

			if ( typeof easing !== 'function' ) {
				easing = null;
			}
		}

		// duration
		duration = ( options.duration === undefined ? 400 : options.duration );

		keys = splitKeypath( keypath );

		animation = new Animation({
			keys: keys,
			from: root.get( keys ),
			to: to,
			root: root,
			duration: duration,
			easing: easing,
			step: options.step,
			complete: options.complete
		});

		animationCollection.push( animation );
		root._animations[ root._animations.length ] = animation;

		return animation;
	};

}( proto ));