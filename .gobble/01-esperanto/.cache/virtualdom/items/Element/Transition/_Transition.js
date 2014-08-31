define(['virtualdom/items/Element/Transition/prototype/init','virtualdom/items/Element/Transition/prototype/getStyle','virtualdom/items/Element/Transition/prototype/setStyle','virtualdom/items/Element/Transition/prototype/animateStyle/_animateStyle','virtualdom/items/Element/Transition/prototype/processParams','virtualdom/items/Element/Transition/prototype/start','circular'],function (init, getStyle, setStyle, animateStyle, processParams, start, circular) {

	'use strict';
	
	var Fragment, Transition;
	
	circular.push( function () {
		Fragment = circular.Fragment;
	});
	
	Transition = function ( owner, template, isIntro ) {
		this.init( owner, template, isIntro );
	};
	
	Transition.prototype = {
		init: init,
		start: start,
		getStyle: getStyle,
		setStyle: setStyle,
		animateStyle: animateStyle,
		processParams: processParams
	};
	
	return Transition;

});