import circular from 'circular';
import hasOwnProperty from 'utils/hasOwnProperty';
import isArray from 'utils/isArray';
import isObject from 'utils/isObject';
import isNumeric from 'utils/isNumeric';

var interpolators, interpolate, cssLengthPattern;

circular.push( function () {
    interpolate = circular.interpolate;
});

cssLengthPattern = /^([+-]?[0-9]+\.?(?:[0-9]+)?)(px|em|ex|%|in|cm|mm|pt|pc)$/;

interpolators = {
    number: function ( from, to ) {
        var delta;

        if ( !isNumeric( from ) || !isNumeric( to ) ) {
            return null;
        }

        from = +from;
        to = +to;

        delta = to - from;

        if ( !delta ) {
            return function () { return from; };
        }

        return function ( t ) {
            return from + ( t * delta );
        };
    },

    array: function ( from, to ) {
        var intermediate, interpolators, len, i;

        if ( !isArray( from ) || !isArray( to ) ) {
            return null;
        }

        intermediate = [];
        interpolators = [];

        i = len = Math.min( from.length, to.length );
        while ( i-- ) {
            interpolators[i] = interpolate( from[i], to[i] );
        }

        // surplus values - don't interpolate, but don't exclude them either
        for ( i=len; i<from.length; i+=1 ) {
            intermediate[i] = from[i];
        }

        for ( i=len; i<to.length; i+=1 ) {
            intermediate[i] = to[i];
        }

        return function ( t ) {
            var i = len;

            while ( i-- ) {
                intermediate[i] = interpolators[i]( t );
            }

            return intermediate;
        };
    },

    object: function ( from, to ) {
        var properties, len, interpolators, intermediate, prop;

        if ( !isObject( from ) || !isObject( to ) ) {
            return null;
        }

        properties = [];
        intermediate = {};
        interpolators = {};

        for ( prop in from ) {
            if ( hasOwnProperty.call( from, prop ) ) {
                if ( hasOwnProperty.call( to, prop ) ) {
                    properties.push( prop );
                    interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] );
                }

                else {
                    intermediate[ prop ] = from[ prop ];
                }
            }
        }

        for ( prop in to ) {
            if ( hasOwnProperty.call( to, prop ) && !hasOwnProperty.call( from, prop ) ) {
                intermediate[ prop ] = to[ prop ];
            }
        }

        len = properties.length;

        return function ( t ) {
            var i = len, prop;

            while ( i-- ) {
                prop = properties[i];

                intermediate[ prop ] = interpolators[ prop ]( t );
            }

            return intermediate;
        };
    },

    cssLength: function ( from, to ) {
        var fromMatch, toMatch, fromUnit, toUnit, fromValue, toValue, unit, delta;

        if ( ( from !== 0 && typeof from !== 'string' ) || ( to !== 0 && typeof to !== 'string' ) ) {
            return null;
        }

        fromMatch = cssLengthPattern.exec( from );
        toMatch = cssLengthPattern.exec( to );

        fromUnit = fromMatch ? fromMatch[2] : '';
        toUnit = toMatch ? toMatch[2] : '';

        if ( fromUnit && toUnit && ( fromUnit !== toUnit ) ) {
            return null; // can't transition from e.g. 10px to 50%
        }

        unit = fromUnit || toUnit;

        fromValue = fromMatch ? +fromMatch[1] : 0;
        toValue = toMatch ? +toMatch[1] : 0;

        delta = toValue - fromValue;

        if ( !delta ) {
            return function () { return fromValue + unit; };
        }

        return function ( t ) {
            return ( fromValue + ( t * delta ) ) + unit;
        };
    }
};

export default interpolators;
