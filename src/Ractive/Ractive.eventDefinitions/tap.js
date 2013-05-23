eventDefinitions.tap = function ( el, fire ) {
	var mousedown, touchstart, distanceThreshold, timeThreshold, target;

	distanceThreshold = 5; // maximum pixels pointer can move before cancel
	timeThreshold = 400;   // maximum milliseconds between down and up before cancel

	mousedown = function ( event ) {
		var x, y, currentTarget, up, move, cancel;

		x = event.clientX;
		y = event.clientY;
		currentTarget = this;

		up = function ( event ) {
			fire.call( currentTarget, event );
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
		x = touch.clientX;
		y = touch.clientY;
		finger = touch.identifier;

		up = function ( event ) {
			var touch;

			touch = event.changedTouches[0];
			if ( touch.identifier !== finger ) {
				cancel();
			}

			fire.call( touch.target, event );
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

		cancel = function () {
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
};