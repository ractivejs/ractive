var toString = Object.prototype.toString;

// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
export default function ( thing ) {
    return toString.call( thing ) === '[object Array]';
};
