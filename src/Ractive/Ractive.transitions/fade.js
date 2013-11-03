(function () {

	var fade, defaults;

	defaults = {
		duration: 300,
		easing: 'linear'
	};

	fade = function ( t ) {
		var targetOpacity;

		if ( t.isIntro ) {
			targetOpacity = ( t.to !== undefined ? t.to : t.getStyle( 'opacity' ) );
			t.setStyle( 'opacity', 0 );
		}

		// set defaults
		if ( t.duration === undefined ) {
			t.duration = defaults.duration;
		}

		if ( t.eaing === undefined ) {
			t.easing = defaults.easing;
		}

		t.animateStyle({
			opacity: t.isIntro ? targetOpacity : 0
		});
	};

	transitions.fade = fade;

}());