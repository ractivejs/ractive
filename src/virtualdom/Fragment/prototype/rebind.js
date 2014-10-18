import assignNewKeypath from 'virtualdom/items/shared/utils/assignNewKeypath';

export default function Fragment$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {

	this.index = newIndex;

	// assign new context keypath if needed
	assignNewKeypath( this, 'context', oldKeypath, newKeypath );

	if ( this.indexRefs && this.indexRefs[ indexRef ] !== undefined ) {
		this.indexRefs[ indexRef ] = newIndex;
	}

	this.items.forEach( item => {
		if ( item.rebind ) {
			item.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	});
}
