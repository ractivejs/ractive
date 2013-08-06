eventDefinitions.tap = function ( node, fire ) {
	var mousedown, touchstart, distanceThreshold, timeThreshold;

	distanceThreshold = 5; // maximum pixels pointer can move before cancel
	timeThreshold = 400;   // maximum milliseconds between down and up before cancel

	mousedown = function ( event ) {
		var currentTarget, x, y, up, move, cancel;

		if ( event.which != 1) {
			return;
		}

		x = event.clientX;
		y = event.clientY;
		currentTarget = this;

		up = function ( event ) {
			fire({
				node: currentTarget,
				original: event
			});

			cancel();
		};

		move = function ( event ) {
			if ( ( Math.abs( event.clientX - x ) >= distanceThreshold ) || ( Math.abs( event.clientY - y ) >= distanceThreshold ) ) {
				cancel();
			}
		};

		cancel = function () {
			doc.removeEventListener( 'mousemove', move, false );
			doc.removeEventListener( 'click', up, false );
		};

		doc.addEventListener( 'mousemove', move, false );
		doc.addEventListener( 'click', up, false );

		setTimeout( cancel, timeThreshold );
	};

	node.addEventListener( 'mousedown', mousedown, false );


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
			window.removeEventListener( 'touchmove', move, false );
			window.removeEventListener( 'touchend', up, false );
			window.removeEventListener( 'touchcancel', cancel, false );
		};

		window.addEventListener( 'touchmove', move, false );
		window.addEventListener( 'touchend', up, false );
		window.addEventListener( 'touchcancel', cancel, false );

		setTimeout( cancel, timeThreshold );
	};

	node.addEventListener( 'touchstart', touchstart, false );


	return {
		teardown: function () {
			node.removeEventListener( 'mousedown', mousedown, false );
			node.removeEventListener( 'touchstart', touchstart, false );
		}
	};
};
