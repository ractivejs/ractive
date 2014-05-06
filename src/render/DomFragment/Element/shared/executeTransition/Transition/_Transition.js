import warn from 'utils/warn';
import StringFragment from 'render/StringFragment/_StringFragment';
import init from 'render/DomFragment/Element/shared/executeTransition/Transition/prototype/init';
import getStyle from 'render/DomFragment/Element/shared/executeTransition/Transition/prototype/getStyle';
import setStyle from 'render/DomFragment/Element/shared/executeTransition/Transition/prototype/setStyle';
import animateStyle from 'render/DomFragment/Element/shared/executeTransition/Transition/prototype/animateStyle/_animateStyle';
import processParams from 'render/DomFragment/Element/shared/executeTransition/Transition/prototype/processParams';
import resetStyle from 'render/DomFragment/Element/shared/executeTransition/Transition/prototype/resetStyle';

var getValueOptions, Transition;
getValueOptions = { args: true };

Transition = function ( descriptor, root, owner, isIntro ) {
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


    name = descriptor.n || descriptor;

    if ( typeof name !== 'string' ) {
        fragment = new StringFragment({
            descriptor:   name,
            root:         this.root,
            owner:        owner
        });

        name = fragment.toString();
        fragment.teardown();
    }

    this.name = name;

    if ( descriptor.a ) {
        this.params = descriptor.a;
    }

    else if ( descriptor.d ) {
        // TODO is there a way to interpret dynamic arguments without all the
        // 'dependency thrashing'?
        fragment = new StringFragment({
            descriptor:   descriptor.d,
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
