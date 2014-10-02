export default function Section$update () {
	var fragment, rendered, nextFragment, anchor, target;

	while ( fragment = this.fragmentsToUnrender.pop() ) {
		fragment.unrender( true );
	}

	while ( fragment = this.fragmentsToRender.shift() ) {
		fragment.render();
	}

	this.fragments.forEach( f => this.docFrag.appendChild( f.detach() ) );

	if ( this.rendered && this.docFrag.childNodes.length ) {
		anchor = this.parentFragment.findNextNode( this );
		target = this.parentFragment.getNode();

		target.insertBefore( this.docFrag, anchor );
	}
}
