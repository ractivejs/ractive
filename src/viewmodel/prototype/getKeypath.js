import { Keypath } from 'shared/keypaths';

export default function Viewmodel$getKeypath ( str ) {
	if ( str == null ) {
		return str;
	}

	if( this.keypathCache.hasOwnProperty( str ) ) {
		return this.keypathCache[ str ];
	}

	return this.keypathCache[ str ] = new Keypath( str, this );
}
