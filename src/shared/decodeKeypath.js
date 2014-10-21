import isNumeric from 'utils/isNumeric';

export default function decodeKeypath ( keypath ) {
	var value = keypath.slice( 1 );
	return isNumeric( value ) ? +value : value;
}