import assignNewKeypath from 'parallel-dom/shared/utils/assignNewKeypath';

export default function Fragment$reassign ( indexRef, newIndex, oldKeypath, newKeypath ) {

	// assign new context keypath if needed
	assignNewKeypath(this, 'context', oldKeypath, newKeypath);

	if ( this.indexRefs
		&& this.indexRefs[ indexRef ] !== undefined
		&& this.indexRefs[ indexRef ] !== newIndex) {
		this.indexRefs[ indexRef ] = newIndex;
	}

	this.items.forEach(function(item){
		item.reassign( indexRef, newIndex, oldKeypath, newKeypath );
	});
}
