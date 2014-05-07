import warn from 'utils/warn';
import init from 'parallel-dom/items/Element/shared/executeTransition/Transition/prototype/init';
import getStyle from 'parallel-dom/items/Element/shared/executeTransition/Transition/prototype/getStyle';
import setStyle from 'parallel-dom/items/Element/shared/executeTransition/Transition/prototype/setStyle';
import animateStyle from 'parallel-dom/items/Element/shared/executeTransition/Transition/prototype/animateStyle/_animateStyle';
import processParams from 'parallel-dom/items/Element/shared/executeTransition/Transition/prototype/processParams';
import resetStyle from 'parallel-dom/items/Element/shared/executeTransition/Transition/prototype/resetStyle';

import circular from 'circular';

var Fragment, getValueOptions, Transition;

circular.push( function () {
	Fragment = circular.Fragment;
});

getValueOptions = { args: true };

Transition = function ( template, root, owner, isIntro ) {
	var t = this, name, fragment, errorMessage;

	this.root = root;
	this.node = owner.node;
	this.isIntro = isIntro;

	// store original style attribute
	this.originalStyle = this.node.getAttribute( 'style' );

	// create t.complete() - we don't want this on the prototype,
	// because we don't want `this` silliness when passing it as
	// an argument
	t.complete = function ( noReset ) {
		if ( !noReset && t.isIntro ) {
			t.resetStyle();
		}

		t.node._ractive.transition = null;
		t._manager.remove( t );
	};


	name = template.n || template;

	if ( typeof name !== 'string' ) {
		fragment = new Fragment({
			template:   name,
			root:         this.root,
			owner:        owner
		});

		name = fragment.toString();
		fragment.teardown();
	}

	this.name = name;

	if ( template.a ) {
		this.params = template.a;
	}

	else if ( template.d ) {
		// TODO is there a way to interpret dynamic arguments without all the
		// 'dependency thrashing'?
		fragment = new Fragment({
			template:   template.d,
			root:         this.root,
			owner:        owner
		});

		this.params = fragment.getValue( getValueOptions );
		fragment.teardown();
	}

	this._fn = root.transitions[ name ];
	if ( !this._fn ) {
		errorMessage = 'Missing "' + name + '" transition. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#transitions';

		if ( root.debug ) {
			throw new Error( errorMessage );
		} else {
			warn( errorMessage );
		}

		return;
	}
};

Transition.prototype = {
	init: init,
	getStyle: getStyle,
	setStyle: setStyle,
	animateStyle: animateStyle,
	processParams: processParams,
	resetStyle: resetStyle
};

export default Transition;
