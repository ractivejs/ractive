proto.animate = function ( keypath, to, options ) {
	var easing, duration, animation, i, keys;

	options = options || {};

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
			if ( this.easing && this.easing[ options.easing ] ) {
				// use instance easing function first
				easing = this.easing[ options.easing ];
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

	keys = utils.splitKeypath( keypath );

	animation = new Animation({
		keys: keys,
		from: this.get( keys ),
		to: to,
		root: this,
		duration: duration,
		easing: easing,
		step: options.step,
		complete: options.complete
	});

	animationCollection.push( animation );
};