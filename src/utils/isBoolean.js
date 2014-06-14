var toString = Object.prototype.toString;

export default function ( thing ) {
	return ( typeof thing  === 'boolean' || (typeof thing === 'object' && toString.call( thing ) === '[object Boolean]') );
}
