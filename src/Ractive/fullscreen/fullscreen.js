(function ( Ractive ) {

	var requestFullscreen, cancelFullscreen, fullscreenElement;

	if ( !doc ) {
		return;
	}

	Ractive.fullscreenEnabled = doc.fullscreenEnabled || doc.mozFullScreenEnabled || doc.webkitFullscreenEnabled;

	if ( !Ractive.fullscreenEnabled ) {
		Ractive.requestFullscreen = Ractive.cancelFullscreen = noop;
		return;
	}

	// get prefixed name of requestFullscreen method
	if ( testDiv.requestFullscreen ) {
		requestFullscreen = 'requestFullscreen';
	} else if ( testDiv.mozRequestFullScreen ) {
		requestFullscreen = 'mozRequestFullScreen';
	} else if ( testDiv.webkitRequestFullscreen ) {
		requestFullscreen = 'webkitRequestFullscreen';
	}

	Ractive.requestFullscreen = function ( el ) {
		if ( el[ requestFullscreen ] ) {
			el[ requestFullscreen ]();
		}
	};

	// get prefixed name of cancelFullscreen method
	if ( doc.cancelFullscreen ) {
		cancelFullscreen = 'cancelFullscreen';
	} else if ( doc.mozCancelFullScreen ) {
		cancelFullscreen = 'mozCancelFullScreen';
	} else if ( doc.webkitCancelFullScreen ) {
		cancelFullscreen = 'webkitCancelFullScreen';
	}

	Ractive.cancelFullscreen = function () {
		doc[ cancelFullscreen ]();
	};

	// get prefixed name of fullscreenElement property
	if ( doc.fullscreenElement !== undefined ) {
		fullscreenElement = 'fullscreenElement';
	} else if ( doc.mozFullScreenElement !== undefined ) {
		fullscreenElement = 'mozFullScreenElement';
	} else if ( doc.webkitFullscreenElement !== undefined ) {
		fullscreenElement = 'webkitFullscreenElement';
	}

	Ractive.isFullscreen = function ( el ) {
		return el === doc[ fullscreenElement ];
	};

}( Ractive ));