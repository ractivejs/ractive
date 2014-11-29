import findIndexRefs from 'virtualdom/items/shared/Resolvers/findIndexRefs';

export default function genericHandler ( event ) {
	var storage, handler, indices, index = {};

	storage = this._ractive;
	handler = storage.events[ event.type ];

	if ( indices = findIndexRefs( handler.element.parentFragment ) ) {
		let k, ref;
		for ( k in indices.refs ) {
			ref = indices.refs[k];
			index[ ref.ref.n ] = ref.ref.t === 'k' ? ref.fragment.key : ref.fragment.index;
		}
	}

	handler.fire({
		node: this,
		original: event,
		index: index,
		keypath: storage.keypath,
		context: storage.root.get( storage.keypath )
	});
}
