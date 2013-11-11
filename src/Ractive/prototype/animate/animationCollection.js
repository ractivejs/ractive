define([ 'Ractive/prototype/animate/requestAnimationFrame' ], function ( rAF ) {
	
	'use strict';

	var animations = [];

	var animationCollection = {
		tick: function () {
			var i, animation;

			for ( i=0; i<animations.length; i+=1 ) {
				animation = animations[i];

				if ( !animation.tick() ) {
					// animation is complete, remove it from the stack, and decrement i so we don't miss one
					animations.splice( i--, 1 );
				}
			}

			if ( animations.length ) {
				rAF( animationCollection.tick );
			} else {
				this.running = false;
			}
		},

		add: function ( animation ) {
			animations[ animations.length ] = animation;

			if ( !this.running ) {
				this.running = true;
				this.tick();
			}
		},

		// TODO optimise this
		abort: function ( keypath, root ) {
			var i = animations.length, animation;

			while ( i-- ) {
				animation = animations[i];

				if ( animation.root === root && animation.keypath === keypath ) {
					animation.stop();
				}
			}
		}
	};

	return animationCollection;

});