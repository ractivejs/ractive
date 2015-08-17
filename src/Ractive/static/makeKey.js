/**
 * @param {Array} argument - series of keys
 * @return {string} keypath
 */
export default function Ractive$makeKey(...keys) {
	return keys.join('.');
}
