import runloop from 'global/runloop';
import resolveRef from 'shared/resolveRef';
import KeypathExpressionResolver from 'render/shared/Resolvers/KeypathExpressionResolver';
import ExpressionResolver from 'render/shared/Resolvers/ExpressionResolver';

export default function initMustache ( mustache, options ) {

    var ref, indexRefs, index, parentFragment, descriptor;

    parentFragment = options.parentFragment;
    descriptor = options.descriptor;

    mustache.root           = parentFragment.root;
    mustache.parentFragment = parentFragment;

    mustache.descriptor     = options.descriptor;
    mustache.index          = options.index || 0;
    mustache.priority       = parentFragment.priority;

    mustache.type = options.descriptor.t;

    function resolve ( keypath ) {
        mustache.resolve( keypath );
    }

    function resolveWithRef ( ref ) {
        var keypath = resolveRef( mustache.root, ref, mustache.parentFragment );

        if ( keypath !== undefined ) {
            resolve( keypath );
        } else {
            mustache.ref = ref;
            runloop.addUnresolved( mustache );
        }			
    }


    // if this is a simple mustache, with a reference, we just need to resolve
    // the reference to a keypath
    if ( ref = descriptor.r ) {
        indexRefs = parentFragment.indexRefs;

        if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
            mustache.indexRef = ref;
            mustache.value = index;
            mustache.render( mustache.value );
        }

        else {
            resolveWithRef( ref );
        }
    }

    // if it's an expression, we have a bit more work to do
    if ( options.descriptor.x ) {
        mustache.resolver = new ExpressionResolver( mustache, parentFragment, options.descriptor.x, resolve );
    }

    if ( options.descriptor.kx ) {
        mustache.resolver = new KeypathExpressionResolver( mustache, options.descriptor.kx, resolveWithRef );
    }

    // Special case - inverted sections
    if ( mustache.descriptor.n && !mustache.hasOwnProperty( 'value' ) ) {
        mustache.render( undefined );
    }
};
