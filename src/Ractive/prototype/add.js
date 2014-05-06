import add from 'Ractive/prototype/shared/add';

export default function ( keypath, d ) {
    return add( this, keypath, ( d === undefined ? 1 : +d ) );
};
