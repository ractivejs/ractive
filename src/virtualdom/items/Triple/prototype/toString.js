import { decodeCharacterReferences } from 'utils/html';

export default function Triple$toString () {
	return ( this.value != undefined ? decodeCharacterReferences( '' + this.value ) : '' );
}
