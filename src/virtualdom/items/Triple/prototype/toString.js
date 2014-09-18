import decodeCharacterReferences from 'shared/decodeCharacterReferences';

export default function Triple$toString () {
	return ( this.value != undefined ? decodeCharacterReferences( '' + this.value ) : '' );
}
