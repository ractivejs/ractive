import assignNewKeypath from 'shared/keypaths/assignNew';

export default function Fragment$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {

	if ( newIndex !== undefined ) {
		this.index = newIndex;
	}

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
