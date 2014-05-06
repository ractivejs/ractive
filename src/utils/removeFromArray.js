export default function ( array, member ) {
    var index = array.indexOf( member );

    if ( index !== -1 ) {
        array.splice( index, 1 );
    }
};
