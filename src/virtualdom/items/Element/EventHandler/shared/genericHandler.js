import findIndexRefs from 'virtualdom/items/shared/Resolvers/findIndexRefs';

export default function genericHandler ( event ) {
	var storage, handler, indices, index = {};

	storage = this._ractive;
	handler = storage.events[ event.type ];

	if ( indices = findIndexRefs( handler.element.parentFragment ) ) {
		index = findIndexRefs.resolve( indices );
	}

	handler.fire({
		node: this,
		original: event,
		index: index,
		keypath: storage.keypath.str,
		context: storage.root.viewmodel.get( storage.keypath )
	});
}
