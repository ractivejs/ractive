import { vendors, win } from '../config/environment';

let requestAnimationFrame;

// If window doesn't exist, we don't need requestAnimationFrame
if ( !win ) {
	requestAnimationFrame = null;
} else {
	// https://gist.github.com/paulirish/1579671
	(function(vendors, lastTime, win) {

		let x, setTimeout;

		if ( win.requestAnimationFrame ) {
			return;
		}

		for ( x = 0; x < vendors.length && !win.requestAnimationFrame; ++x ) {
			win.requestAnimationFrame = win[vendors[x]+'RequestAnimationFrame'];
		}

		if ( !win.requestAnimationFrame ) {
			setTimeout = win.setTimeout;

			win.requestAnimationFrame = function(callback) {
				let currTime, timeToCall, id;

				currTime = Date.now();
				timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
				id = setTimeout( () => { callback(currTime + timeToCall); }, timeToCall );

				lastTime = currTime + timeToCall;
				return id;
			};
		}

	}( vendors, 0, win ));

	requestAnimationFrame = win.requestAnimationFrame;
}

export default requestAnimationFrame;
