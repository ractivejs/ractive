import set from 'shared/set';

export default function Viewmodel$set ( keypath, value, options ) {
	return set( this.ractive, keypath, value, options );
}
