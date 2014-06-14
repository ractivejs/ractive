var toString = Object.prototype.toString;

export default function ( thing ) {
	return toString.call( thing ) === '[object RegExp]';
}
