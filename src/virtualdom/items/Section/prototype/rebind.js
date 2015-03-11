import Mustache from '../../shared/Mustache/_Mustache';

export default function( oldKeypath, newKeypath, newValue = true ) {
	Mustache.rebind.call( this, oldKeypath, newKeypath, newValue );
}
