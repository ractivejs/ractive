export default function Section$update () {
	const rendered = this.rendered,
		  docFrag = this.docFrag,
		  unrender = this.fragmentsToUnrender,
		  splice = this.fragmentsToSplice,
		  mergeMap = this.mergeMap;

	// Remove fragments that have been marked for destruction
	if ( unrender ) {
		let fragment;
		for( let i = 0, l = unrender.length; i < l; i++ ) {
			fragment = unrender[i];
			if ( fragment && fragment.rendered ) {
				fragment.unrender( true );
			}
		}
	}

	if ( rendered ) {

		// Render new fragments (but don't insert them yet)
		if ( splice ) {
			let child;
			for( let i = 2, l = splice.length; i < l; i++ ) {
				child = splice[i].render();
				docFrag.appendChild( child );
			}
		}
		else if ( mergeMap ) {
			const fragments = this.fragments
			let fragment, child;
			for ( let i = 0, l = fragments.length; i < l; i++ ) {
				fragment = fragments[i];
				child = fragment.rendered ? fragment.detach() : fragment.render();
				docFrag.appendChild( child );
			}
		}

		// Now insert them into the DOM
		if ( docFrag.childNodes.length ) {
			const target = this.parentFragment.getNode();
			let anchor;

			if ( splice ) {
				// next fragment after end of inserts
				let next = splice[0] + splice.length - 2;
				let fragment = this.fragments[ next ];

				// TODO: not sure if this is 100% reliable
				if ( fragment ) {
					anchor = fragment.firstNode();
				}
			}

			if ( !anchor ) {
				anchor = this.parentFragment.findNextNode( this );
			}

			target.insertBefore( this.docFrag, anchor );
		}
	}

	this.fragmentsToUnrender = null;
	this.fragmentsToSplice = null;
	this.mergeMap = null;
}
