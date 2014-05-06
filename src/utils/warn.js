/* global console */
var warn;

if ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' ) {
    warn = function () {
        console.warn.apply( console, arguments );
    };
} else {
    warn = function () {};
}

export default warn;
