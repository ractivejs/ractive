import init from 'virtualdom/items/Element/Transition/prototype/init';
import getStyle from 'virtualdom/items/Element/Transition/prototype/getStyle';
import setStyle from 'virtualdom/items/Element/Transition/prototype/setStyle';
import animateStyle from 'virtualdom/items/Element/Transition/prototype/animateStyle/_animateStyle';
import processParams from 'virtualdom/items/Element/Transition/prototype/processParams';
import start from 'virtualdom/items/Element/Transition/prototype/start';

import circular from 'circular';

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

export default Transition;
