export default function genericHandler ( event ) {
	var storage, handler;

	storage = this._ractive;
	handler = storage.events[ event.type ];

	handler.fire({
		node: this,
		original: event,
		index: storage.index,
		keypath: storage.keypath,
		context: storage.root.get( storage.keypath )
	});
}
