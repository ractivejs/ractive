export default function registerDependant ( dependant ) {
    var depsByKeypath, deps, ractive, keypath, priority;

    ractive = dependant.root;
    keypath = dependant.keypath;
    priority = dependant.priority;

    depsByKeypath = ractive._deps[ priority ] || ( ractive._deps[ priority ] = {} );
    deps = depsByKeypath[ keypath ] || ( depsByKeypath[ keypath ] = [] );

    deps.push( dependant );
    dependant.registered = true;

    if ( !keypath ) {
        return;
    }

    updateDependantsMap( ractive, keypath );
};

function updateDependantsMap ( ractive, keypath ) {
    var keys, parentKeypath, map;

    // update dependants map
    keys = keypath.split( '.' );

    while ( keys.length ) {
        keys.pop();
        parentKeypath = keys.join( '.' );

        map = ractive._depsMap[ parentKeypath ] || ( ractive._depsMap[ parentKeypath ] = [] );

        if ( map[ keypath ] === undefined ) {
            map[ keypath ] = 0;
            map[ map.length ] = keypath;
        }

        map[ keypath ] += 1;

        keypath = parentKeypath;
    }
}
