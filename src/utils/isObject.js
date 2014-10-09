var toString = Object.prototype.toString;

export default function ( thing ) {
	return ( thing && toString.call( thing ) === '[object Object]' );
}
