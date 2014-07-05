import normaliseRef from 'utils/normaliseRef';

var leadingDot = /^\.+/;

export default function normaliseKeypath ( keypath ) {
	return normaliseRef( keypath ).replace( leadingDot, '' );
}
