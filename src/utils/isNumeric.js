// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
export default function ( thing ) {
    return !isNaN( parseFloat( thing ) ) && isFinite( thing );
};
