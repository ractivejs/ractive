/*

	ractive-transitions-slide
	=========================

	Version 0.1.2.

	This transition slides an element in and out of view,
	using CSS transitions where possible.

	==========================

	Troubleshooting: If you're using a module system in your app (AMD or
	something more nodey) then you may need to change the paths below,
	where it says `require( 'ractive' )` or `define([ 'ractive' ]...)`.

	==========================

	Usage: Include this file on your page below Ractive, e.g:

	    <script src='lib/ractive.js'></script>
	    <script src='lib/ractive-transitions-slide.js'></script>

	Or, if you're using a module loader, require this module:

	    // requiring the plugin will 'activate' it - no need to use
	    // the return value
	    require( 'ractive-transitions-slide' );

	You can specify the `delay`, `duration` and `easing` properties
	using the conventional syntax:

	    <div intro='slide:{"delay":500,"easing":"ease-out"}'>content</div>

	Both `delay` and `duration` are in milliseconds. The `easing` value
	must be a valid CSS easing function (see http://cubic-bezier.com/).

*/

(function ( global, factory ) {

	'use strict';

	// Common JS (i.e. browserify) environment
	if ( typeof module !== 'undefined' && module.exports && typeof require === 'function' ) {
		factory( require( 'ractive' ) );
	}

	// AMD?
	else if ( typeof define === 'function' && define.amd ) {
		define([ 'ractive' ], factory );
	}

	// browser global
	else if ( global.Ractive ) {
		factory( global.Ractive );
	}

	else {
		throw new Error( 'Could not find Ractive! It must be loaded before the ractive-transitions-slide plugin' );
	}

}( typeof window !== 'undefined' ? window : this, function ( Ractive ) {

	'use strict';

	var slide, props, collapsed, defaults;

	defaults = {
		duration: 300,
		easing: 'easeInOut'
	};

	props = [
		'height',
		'borderTopWidth',
		'borderBottomWidth',
		'paddingTop',
		'paddingBottom',
		'marginTop',
		'marginBottom'
	];

	collapsed = {
		height: 0,
		borderTopWidth: 0,
		borderBottomWidth: 0,
		paddingTop: 0,
		paddingBottom: 0,
		marginTop: 0,
		marginBottom: 0
	};

	slide = function ( t, params ) {
		var targetStyle;

		params = t.processParams( params, defaults );

		if ( t.isIntro ) {
			targetStyle = t.getStyle( props );
			t.setStyle( collapsed );
		} else {
			// make style explicit, so we're not transitioning to 'auto'
			t.setStyle( t.getStyle( props ) );
			targetStyle = collapsed;
		}

		t.setStyle( 'overflowY', 'hidden' );

		t.animateStyle( targetStyle, params ).then( t.complete );
	};

	Ractive.transitions.slide = slide;

}));
