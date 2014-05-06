import circular from 'circular';
import warn from 'utils/warn';
import interpolators from 'registries/interpolators';

var interpolate = function ( from, to, ractive, type ) {
    if ( from === to ) {
        return snap( to );
    }

    if ( type ) {
        if ( ractive.interpolators[ type ] ) {
            return ractive.interpolators[ type ]( from, to ) || snap( to );
        }

        warn( 'Missing "' + type + '" interpolator. You may need to download a plugin from [TODO]' );
    }

    return interpolators.number( from, to ) ||
           interpolators.array( from, to ) ||
           interpolators.object( from, to ) ||
           interpolators.cssLength( from, to ) ||
           snap( to );
};

circular.interpolate = interpolate;
export default interpolate;

function snap ( to ) {
    return function () { return to; };
}
