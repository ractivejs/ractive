import { assignNewKeypath } from 'shared/keypaths';

export default function Fragment$rebind ( oldKeypath, newKeypath ) {

	// assign new context keypath if needed
	assignNewKeypath( this, 'context', oldKeypath, newKeypath );

	this.items.forEach( item => {
		if ( item.rebind ) {
			item.rebind( oldKeypath, newKeypath );
		}
	});
}
