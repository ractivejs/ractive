import { assignNewKeypath } from 'shared/keypaths';

export default function Fragment$rebind ( oldKeypath, newKeypath, newValue = true ) {

	// assign new context keypath if needed
	if ( !this.owner || this.owner.hasContext ) {
		assignNewKeypath( this, 'context', oldKeypath, newKeypath );
	}

	this.items.forEach( item => {
		if ( item.rebind ) {
			item.rebind( oldKeypath, newKeypath, newValue );
		}
	});
}
