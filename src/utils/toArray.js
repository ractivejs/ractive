export default function toArray ( arrayLike ) {
    var array = [], i = arrayLike.length;
    while ( i-- ) {
        array[i] = arrayLike[i];
    }

    return array;
};
