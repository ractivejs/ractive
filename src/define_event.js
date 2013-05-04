(function ( Ractive, _internal ) {

	'use strict';

	Ractive.defineEvent = function ( eventName, definition ) {
		_internal.eventDefns[ eventName ] = definition;
	};

	Ractive.defineEvent( 'tap', function ( el, fire ) {
		var mousedown, touchstart, distanceThreshold, timeThreshold;

		distanceThreshold = 5; // maximum pixels pointer can move before cancel
		timeThreshold = 400;   // maximum milliseconds between down and up before cancel

		mousedown = function ( event ) {
			var x, y, up, move, cancel;

			x = event.clientX;
			y = event.clientY;

			up = function ( event ) {
				fire( event );
				cancel();
			};

			move = function ( event ) {
				if ( ( Math.abs( event.clientX - x ) >= distanceThreshold ) || ( Math.abs( event.clientY - y ) >= distanceThreshold ) ) {
					cancel();
				}
			};

			cancel = function () {
				window.removeEventListener( 'mousemove', move );
				window.removeEventListener( 'mouseup', up );
			};

			window.addEventListener( 'mousemove', move );
			window.addEventListener( 'mouseup', up );

			setTimeout( cancel, timeThreshold );
		};

		el.addEventListener( 'mousedown', mousedown );


		touchstart = function ( event ) {
			var x, y, touch, finger, move, up, cancel;

			if ( event.touches.length !== 1 ) {
				return;
			}

			touch = event.touches[0];
			finger = touch.identifier;

			up = function ( event ) {
				if ( event.changedTouches.length !== 1 || event.touches[0].identifier !== finger ) {
					cancel();
				} else {
					fire( event );
				}
			};

			move = function ( event ) {
				var touch;

				if ( event.touches.length !== 1 || event.touches[0].identifier !== finger ) {
					cancel();
				}

				touch = event.touches[0];
				if ( ( Math.abs( touch.clientX - x ) >= distanceThreshold ) || ( Math.abs( touch.clientY - y ) >= distanceThreshold ) ) {
					cancel();
				}
			};

			cancel = function ( event ) {
				window.removeEventListener( 'touchmove', move );
				window.removeEventListener( 'touchend', up );
				window.removeEventListener( 'touchcancel', cancel );
			};

			window.addEventListener( 'touchmove', move );
			window.addEventListener( 'touchend', up );
			window.addEventListener( 'touchcancel', cancel );

			setTimeout( cancel, timeThreshold );
		};


		return {
			teardown: function () {
				el.removeEventListener( 'mousedown', mousedown );
				el.removeEventListener( 'touchstart', touchstart );
			}
		};
	});

}( Ractive, _internal ));