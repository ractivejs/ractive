eventDefinitions.tap = function ( node, fire ) {
	var mousedown, touchstart, distanceThreshold, timeThreshold;

	distanceThreshold = 5; // maximum pixels pointer can move before cancel
	timeThreshold = 400;   // maximum milliseconds between down and up before cancel

	mousedown = function ( event ) {
		var currentTarget, x, y, pointerId, up, move, cancel;

		if ( event.which !== undefined && event.which !== 1 ) {
			return;
		}

		x = event.clientX;
		y = event.clientY;
		currentTarget = this;
		// This will be null for mouse events.
		pointerId = event.pointerId;

		up = function ( event ) {
			if ( event.pointerId != pointerId ) {
				return;
			}

			fire({
				node: currentTarget,
				original: event
			});

			cancel();
		};

		move = function ( event ) {
			if ( event.pointerId != pointerId ) {
				return;
			}

			if ( ( Math.abs( event.clientX - x ) >= distanceThreshold ) || ( Math.abs( event.clientY - y ) >= distanceThreshold ) ) {
				cancel();
			}
		};

		cancel = function () {
			node.removeEventListener( 'MSPointerUp', up, false );
			doc.removeEventListener( 'MSPointerMove', move, false );
			doc.removeEventListener( 'MSPointerCancel', cancel, false );
			node.removeEventListener( 'pointerup', up, false );
			doc.removeEventListener( 'pointermove', move, false );
			doc.removeEventListener( 'pointercancel', cancel, false );
			node.removeEventListener( 'click', up, false );
			doc.removeEventListener( 'mousemove', move, false );
		};

		if ( window.navigator.pointerEnabled ) {
			node.addEventListener( 'pointerup', up, false );
			doc.addEventListener( 'pointermove', move, false );
			doc.addEventListener( 'pointercancel', cancel, false );
		} else if ( window.navigator.msPointerEnabled ) {
			node.addEventListener( 'MSPointerUp', up, false );
			doc.addEventListener( 'MSPointerMove', move, false );
			doc.addEventListener( 'MSPointerCancel', cancel, false );
		} else {
			node.addEventListener( 'click', up, false );
			doc.addEventListener( 'mousemove', move, false );
		}

		setTimeout( cancel, timeThreshold );
	};

	if ( window.navigator.pointerEnabled ) {
		node.addEventListener( 'pointerdown', mousedown, false );
	} else if ( window.navigator.msPointerEnabled ) {
		node.addEventListener( 'MSPointerDown', mousedown, false );
	} else {
		node.addEventListener( 'mousedown', mousedown, false );
	}


	touchstart = function ( event ) {
		var currentTarget, x, y, touch, finger, move, up, cancel;

		if ( event.touches.length !== 1 ) {
			return;
		}

		touch = event.touches[0];

		x = touch.clientX;
		y = touch.clientY;
		currentTarget = this;

		finger = touch.identifier;

		up = function ( event ) {
			var touch;

			touch = event.changedTouches[0];
			if ( touch.identifier !== finger ) {
				cancel();
			}

			event.preventDefault();  // prevent compatibility mouse event
			fire({
				node: currentTarget,
				original: event
			});
			
			cancel();
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
			node.removeEventListener( 'touchend', up, false );
			window.removeEventListener( 'touchmove', move, false );
			window.removeEventListener( 'touchcancel', cancel, false );
		};

		node.addEventListener( 'touchend', up, false );
		window.addEventListener( 'touchmove', move, false );
		window.addEventListener( 'touchcancel', cancel, false );

		setTimeout( cancel, timeThreshold );
	};

	node.addEventListener( 'touchstart', touchstart, false );


	return {
		teardown: function () {
			node.removeEventListener( 'pointerdown', mousedown, false );
			node.removeEventListener( 'MSPointerDown', mousedown, false );
			node.removeEventListener( 'mousedown', mousedown, false );
			node.removeEventListener( 'touchstart', touchstart, false );
		}
	};
};
