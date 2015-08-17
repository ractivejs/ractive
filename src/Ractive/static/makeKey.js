/**
 * @param {Array} argument - series of keys
 * @return {string} keypath
 */
export default function Ractive$makeKey() {
	var keypath = "";

	for ( var i = 0; i < arguments.length; i++ ) {
		keypath += arguments[i];

		if ( i !== arguments.length - 1 ) {
			keypath += ".";
		}
	}

	return keypath;
}
