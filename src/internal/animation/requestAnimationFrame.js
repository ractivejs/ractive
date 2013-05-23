// https://gist.github.com/paulirish/1579671
(function( vendors, lastTime, global ) {
	
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