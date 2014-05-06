var create;

try {
    Object.create( null );

    create = Object.create;
} catch ( err ) {
    // sigh
    create = (function () {
        var F = function () {};

        return function ( proto, props ) {
            var obj;

            if ( proto === null ) {
                return {};
            }

            F.prototype = proto;
            obj = new F();

            if ( props ) {
                Object.defineProperties( obj, props );
            }

            return obj;
        };
    }());
}

export default create;
