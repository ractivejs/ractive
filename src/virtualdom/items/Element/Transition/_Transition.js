import init from './prototype/init';
import getStyle from './prototype/getStyle';
import setStyle from './prototype/setStyle';
import animateStyle from './prototype/animateStyle/_animateStyle';
import processParams from './prototype/processParams';
import start from './prototype/start';

var Transition = function ( owner, template, isIntro ) {
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

export default Transition;
