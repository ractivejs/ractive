var toString = Object.prototype.toString;

export default function ( thing ) {
	return ( typeof thing  === 'number' || (typeof thing === 'object' && toString.call( thing ) === '[object Number]') );
}
