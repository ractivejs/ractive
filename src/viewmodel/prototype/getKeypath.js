import { Keypath } from 'shared/keypaths';

export default function Viewmodel$getKeypath ( str, options = {} ) {
	var keypath;

	if ( str == null ) {
		return str;
	}

	if( this.hasKeypath( str ) ) {
		return this.keypathCache[ str ];
	}

	keypath = new Keypath( str, this );

	if( !options.noCache ) {
		this.keypathCache[ str ] = keypath;
	}

	return keypath;
}
