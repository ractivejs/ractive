var pattern = /^\[object (?:Array|FileList)\]$/,
	toString = Object.prototype.toString;

export default function isArrayLike ( obj ) {
	return pattern.test( toString.call( obj ) );
}
