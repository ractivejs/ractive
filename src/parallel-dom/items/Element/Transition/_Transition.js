import init from 'parallel-dom/items/Element/Transition/prototype/init';
import getStyle from 'parallel-dom/items/Element/Transition/prototype/getStyle';
import setStyle from 'parallel-dom/items/Element/Transition/prototype/setStyle';
import animateStyle from 'parallel-dom/items/Element/Transition/prototype/animateStyle/_animateStyle';
import processParams from 'parallel-dom/items/Element/Transition/prototype/processParams';
import start from 'parallel-dom/items/Element/Transition/prototype/start';

import circular from 'circular';

var Fragment, getValueOptions, Transition;

circular.push( function () {
	Fragment = circular.Fragment;
});

getValueOptions = { args: true };

Transition = function ( owner, template ) {
	this.init( owner, template );
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
