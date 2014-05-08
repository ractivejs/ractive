import isClient from 'config/isClient';
import updateSection from 'parallel-dom/shared/updateSection';

export default function Section$setValue ( value ) {
	var nextNode, parentNode, wrapped;

	// with sections, we need to get the fake value if we have a wrapped object
	if ( wrapped = this.root._wrapped[ this.keypath ] ) {
		value = wrapped.get();
	}

	// prevent sections from rendering multiple times (happens if
	// evaluators evaluate while update is happening)
	if ( this.rendering ) {
		return;
	}

	this.rendering = true;
	updateSection( this, value );
	this.rendering = false;

	if ( this.rendered ) {
		// if we have no new nodes to insert (i.e. the section length stayed the
		// same, or shrank), we don't need to go any further
		if ( !this.docFrag.childNodes.length ) {
			return;
		}

		// Normally this is just a case of finding the next node, and inserting
		// items before it...
		nextNode = this.parentFragment.findNextNode( this );
		parentNode = this.parentFragment.getNode();

		if ( nextNode && ( nextNode.parentNode === parentNode ) ) {
			parentNode.insertBefore( this.docFrag, nextNode );
		}

		// ...but in some edge cases the next node will not have been attached to
		// the DOM yet, in which case we append to the end of the parent node
		else {
			// TODO could there be a situation in which later nodes could have
			// been attached to the parent node, i.e. we need to find a sibling
			// to insert before?
			parentNode.appendChild( this.docFrag );
		}
	}
}
