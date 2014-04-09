define([
	'utils/requestAnimationFrame',
	'utils/getTime',
	'global/runloop'
], function (
	rAF,
	getTime,
	runloop
) {

	'use strict';

	var queue = [];

	var animations = {
		tick: function () {
			var i, animation, now;

			now = getTime();

			runloop.start();

			for ( i=0; i<queue.length; i+=1 ) {
				animation = queue[i];

				if ( !animation.tick( now ) ) {
					// animation is complete, remove it from the stack, and decrement i so we don't miss one
					queue.splice( i--, 1 );
				}
			}

			runloop.end();

			if ( queue.length ) {
				rAF( animations.tick );
			} else {
				animations.running = false;
			}
		},

		add: function ( animation ) {
			queue.push( animation );

			if ( !animations.running ) {
				animations.running = true;
				rAF( animations.tick );
			}
		},

		// TODO optimise this
		abort: function ( keypath, root ) {
			var i = queue.length, animation;

			while ( i-- ) {
				animation = queue[i];

				if ( animation.root === root && animation.keypath === keypath ) {
					animation.stop();
				}
			}
		}
	};

	return animations;

});
