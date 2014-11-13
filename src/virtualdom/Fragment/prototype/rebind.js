import assignNewKeypath from 'virtualdom/items/shared/utils/assignNewKeypath';

export default function Fragment$rebind ( oldKeypath, newKeypath ) {

	// assign new context keypath if needed
	assignNewKeypath( this, 'context', oldKeypath, newKeypath );

	this.items.forEach( item => {
		if ( item.rebind ) {
			item.rebind( oldKeypath, newKeypath );
		}
	});
}
