(function ( R ) {

	'use strict';

	var Animation, animationCollection, global, interpolators;

	global = ( typeof window !== 'undefined' ? window : {} );

	// https://gist.github.com/paulirish/1579671
	(function( vendors, lastTime, window ) {
		
		var x;

		for ( x = 0; x < vendors.length && !global.requestAnimationFrame; ++x ) {
			global.requestAnimationFrame = global[vendors[x]+'RequestAnimationFrame'];
			global.cancelAnimationFrame = global[vendors[x]+'CancelAnimationFrame'] || global[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if ( !global.requestAnimationFrame ) {
			global.requestAnimationFrame = function(callback) {
				var currTime, timeToCall, id;
				
				currTime = Date.now();
				timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
				id = global.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
				
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if ( !global.cancelAnimationFrame ) {
			global.cancelAnimationFrame = function( id ) {
				global.clearTimeout( id );
			};
		}
	}( ['ms', 'moz', 'webkit', 'o'], 0, global ));



	Animation = function ( options ) {
		var key;

		this.startTime = Date.now();

		// from and to
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				this[ key ] = options[ key ];
			}
		}

		this.interpolator = R.interpolate( this.from, this.to );
		this.running = true;
	};

	animationCollection = {
		animations: [],

		tick: function () {
			var i, animation;

			for ( i=0; i<this.animations.length; i+=1 ) {
				animation = this.animations[i];

				if ( !animation.tick() ) {
					// animation is complete, remove it from the stack, and decrement i so we don't miss one
					this.animations.splice( i--, 1 );
				}
			}

			if ( this.animations.length ) {
				global.requestAnimationFrame( this.boundTick );
			} else {
				this.running = false;
			}
		},

		// bind method to animationCollection
		boundTick: function () {
			animationCollection.tick();
		},

		push: function ( animation ) {
			this.animations[ this.animations.length ] = animation;

			if ( !this.running ) {
				this.running = true;
				this.tick();
			}
		}
	};

	Animation.prototype = {
		tick: function () {
			var elapsed, t, value, timeNow;

			if ( this.running ) {
				timeNow = Date.now();
				elapsed = timeNow - this.startTime;

				if ( elapsed >= this.duration ) {
					this.viewmodel.set( this.keypath, this.to );

					if ( this.complete ) {
						this.complete( 1 );
					}

					this.running = false;
					return false;
				}

				t = this.easing ? this.easing ( elapsed / this.duration ) : ( elapsed / this.duration );
				value = this.interpolator( t );

				this.viewmodel.set( this.keypath, value );

				if ( this.step ) {
					this.step( t, value );
				}

				return true;
			}

			return false;
		},

		stop: function () {
			this.running = false;
		}
	};


	R.prototype.animate = function ( keypath, to, options ) {
		var easing, from, duration, animation, i;

		options = options || {};

		// check from and to are both numeric
		to = parseFloat( to );
		if ( isNaN( to ) ) {
			throw 'Cannot animate to a non-numeric property';
		}

		from = parseFloat( this.get( keypath ) );
		if ( isNaN( to ) ) {
			throw 'Cannot animate from a non-numeric property';
		}

		// cancel any existing animation
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
					easing = R.easing[ options.easing ];
				}
			}

			if ( typeof easing !== 'function' ) {
				easing = null;
			}
		}

		// duration
		duration = ( options.duration === undefined ? 400 : options.duration );

		animation = new Animation({
			keypath: keypath,
			from: from,
			to: to,
			viewmodel: this.viewmodel,
			duration: duration,
			easing: easing,
			step: options.step,
			complete: options.complete
		});

		animationCollection.push( animation );
	};


}( Ractive ));