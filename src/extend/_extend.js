import create from 'utils/create';
import defineProperty from 'utils/defineProperty';
import getGuid from 'utils/getGuid';
import extendObject from 'utils/extend';
import inheritFromParent from 'extend/inheritFromParent';
import inheritFromChildProps from 'extend/inheritFromChildProps';
import extractInlinePartials from 'extend/extractInlinePartials';
import conditionallyParseTemplate from 'extend/conditionallyParseTemplate';
import conditionallyParsePartials from 'extend/conditionallyParsePartials';
import initChildInstance from 'extend/initChildInstance';
import circular from 'circular';

var Ractive;

circular.push( function () {
    Ractive = circular.Ractive;
});

export default function extend ( childProps ) {

    var Parent = this, Child, adaptor, i;

    // if we're extending with another Ractive instance, inherit its
    // prototype methods and default options as well
    if ( childProps.prototype instanceof Ractive ) {
        childProps = ( extendObject( {}, childProps, childProps.prototype, childProps.defaults ) );
    }

    // create Child constructor
    Child = function ( options ) {
        initChildInstance( this, Child, options || {});
    };

    Child.prototype = create( Parent.prototype );
    Child.prototype.constructor = Child;
    Child.extend = extend;

    // each component needs a guid, for managing CSS etc
    defineProperty( Child, '_guid', {
        value: getGuid()
    });

    // Inherit options from parent
    inheritFromParent( Child, Parent );

    // Add new prototype methods and init options
    inheritFromChildProps( Child, childProps );

    // Special case - adaptors. Convert to function if possible
    if ( Child.adaptors && ( i = Child.defaults.adapt.length ) ) {
        while ( i-- ) {
            adaptor = Child.defaults.adapt[i];
            if ( typeof adaptor === 'string' ) {
                Child.defaults.adapt[i] = Child.adaptors[ adaptor ] || adaptor;
            }
        }
    }

    // Parse template and any partials that need it
    if ( childProps.template ) { // ignore inherited templates!
        conditionallyParseTemplate( Child );
        extractInlinePartials( Child, childProps );
        conditionallyParsePartials( Child );
    }

    return Child;
};
