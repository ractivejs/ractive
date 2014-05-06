import normaliseKeypath from 'utils/normaliseKeypath';
import get from 'shared/get/_get';
import UnresolvedImplicitDependency from 'shared/get/UnresolvedImplicitDependency';

var options = { isTopLevel: true };

export default function Ractive_prototype_get ( keypath ) {
    var value;

    keypath = normaliseKeypath( keypath );

    value = get( this, keypath, options );

    // capture the dependency, if we're inside an evaluator
    if ( this._captured && ( this._captured[ keypath ] !== true ) ) {
        this._captured.push( keypath );
        this._captured[ keypath ] = true;

        // if we couldn't resolve the keypath, we need to make it as a failed
        // lookup, so that the evaluator updates correctly once we CAN
        // resolve the keypath
        if ( value === undefined && ( this._unresolvedImplicitDependencies[ keypath ] !== true ) ) {
            new UnresolvedImplicitDependency( this, keypath );
        }
    }

    return value;
};
