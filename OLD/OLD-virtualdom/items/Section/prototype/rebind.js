import Mustache from '../../shared/Mustache/_Mustache';

export default function( oldKeypath, newKeypath ) {
	Mustache.rebind.call( this, oldKeypath, newKeypath );
}
