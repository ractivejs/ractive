define( function () {
	
	'use strict';

	// https://gist.github.com/paulirish/1579671
	(function( vendors, lastTime, window ) {
		
		var x, setTimeout;

		if ( window.requestAnimationFrame ) {
			return;
		}

		for ( x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		}

		if ( !window.requestAnimationFrame ) {
			setTimeout = window.setTimeout;

			window.requestAnimationFrame = function(callback) {
				var currTime, timeToCall, id;
				
				currTime = Date.now();
				timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
				id = setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
				
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		
	}( ['ms', 'moz', 'webkit', 'o'], 0, window ));

	return window.requestAnimationFrame;

});