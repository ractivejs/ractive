export function findAnchors ( fragment, name = null ) {
	const res = [];

	findAnchorsIn( fragment, name, res );

	return res;
}

function findAnchorsIn ( item, name, result ) {
	if ( item.isAnchor ) {
		if ( !name || item.name === name ) {
			result.push( item );
		}
	} else if ( item.items ) {
		item.items.forEach( i => findAnchorsIn( i, name, result ) );
	} else if ( item.iterations ) {
		item.iterations.forEach( i => findAnchorsIn( i, name, result ) );
	} else if ( item.fragment && !item.component ) {
		findAnchorsIn( item.fragment, name, result );
	}
}

export function updateAnchors ( instance, name = null ) {
	const anchors = findAnchors( instance.fragment, name );
	const idxs = {};
	const children = instance._children.byName;

	anchors.forEach( a => {
		const name = a.name;
		if ( !( name in idxs ) ) idxs[name] = 0;
		const idx = idxs[name];
		const child = ( children[name] || [] )[idx];

		if ( child && child.lastBound !== a ) {
			if ( child.lastBound ) child.lastBound.removeChild( child );
			a.addChild( child );
		}

		idxs[name]++;
	});
}

export function unrenderChild ( meta ) {
	if ( meta.instance.fragment.rendered ) {
		meta.shouldDestroy = true;
		meta.instance.unrender();
	}
	meta.instance.el = null;
}
