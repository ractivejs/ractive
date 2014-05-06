export default function ( method, superMethod ) {
    if ( /_super/.test( method ) ) {
        return function () {
            var _super = this._super, result;
            this._super = superMethod;

            result = method.apply( this, arguments );

            this._super = _super;
            return result;
        };
    }

    else {
        return method;
    }
};
