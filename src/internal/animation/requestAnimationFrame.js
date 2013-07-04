// https://gist.github.com/paulirish/1579671
(function( vendors, lastTime, global ) {
	
	var x;

	if ( global.requestAnimationFrame ) {
		requestAnimationFrame = global.requestAnimationFrame;
		cancelAnimationFrame = global.cancelAnimationFrame;
		return;
	}

	for ( x = 0; x < vendors.length && !requestAnimationFrame; ++x ) {
		requestAnimationFrame = global[vendors[x]+'RequestAnimationFrame'];
		cancelAnimationFrame = global[vendors[x]+'CancelAnimationFrame'] || global[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if ( !requestAnimationFrame ) {
		requestAnimationFrame = function(callback) {
			var currTime, timeToCall, id;
			
			currTime = Date.now();
			timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
			id = global.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
			
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if ( !cancelAnimationFrame ) {
		cancelAnimationFrame = function( id ) {
			global.clearTimeout( id );
		};
	}
}( ['ms', 'moz', 'webkit', 'o'], 0, global ));