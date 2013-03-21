(function ( A ) {

	'use strict';

	var Animation, animationCollection, requestAnimationFrame;

	// https://gist.github.com/paulirish/1579671
	(function( vendors, lastTime, window ) {
		
		for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if ( !window.requestAnimationFrame ) {
			window.requestAnimationFrame = function(callback, element) {
				var currTime = Date.now();
				var timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
				var id = window.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if ( !window.cancelAnimationFrame ) {
			window.cancelAnimationFrame = function( id ) {
				clearTimeout( id );
			};
		}
	}( ['ms', 'moz', 'webkit', 'o'], 0, window ));



	Animation = function ( options ) {
		var self = this, key;

		this.startTime = Date.now(); // TODO does this work everywhere?

		// from and to
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				this[ key ] = options[ key ];
			}
		}

		this.delta = this.to - this.from;
		this.running = true;
	};

	animationCollection = {
		animations: [],

		tick: function () {
			var i, animation;

			console.log( '%s animations', this.animations.length );

			for ( i=0; i<this.animations.length; i+=1 ) {
				animation = this.animations[i];

				if ( !animation.tick() ) {
					// animation is complete, remove it from the stack, and decrement i so we don't miss one
					this.animations.splice( i--, 1 );
				}
			}

			if ( this.animations.length ) {
				window.requestAnimationFrame( this.boundTick );
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
				value = this.from + ( t * this.delta );

				this.viewmodel.set( this.keypath, value );

				if ( this.step ) {
					this.step( t, value );
				}

				return true;
			}

			else {
				return false;
			}
		},

		stop: function () {
			this.running = false;
		}
	};


	A.prototype.animate = function ( keypath, to, options ) {
		var easing, from, duration, animation, i;

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
		if ( options && options.easing ) {
			if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			}

			else {
				if ( this.easing && this.easing[ options.easing ] ) {
					// use instance easing function first
					easing = this.easing[ options.easing ];
				} else {
					// fallback to global easing functions
					easing = A.easing[ options.easing ];
				}
			}

			if ( typeof easing !== 'function' ) {
				easing = null;
			}
		}

		// duration
		duration = ( !options || options.duration === undefined ? 400 : options.duration );

		animation = new Animation({
			keypath: keypath,
			from: from,
			to: to,
			viewmodel: this.viewmodel,
			duration: duration,
			easing: easing
		});

		animationCollection.push( animation );
	};



	// Easing functions
	A.easing = A.easing || {};

}( Anglebars ));