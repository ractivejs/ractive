import getSpecialsReferences from 'shared/getSpecialsReferences';

export default function genericHandler ( event ) {
	const storage = this._ractive,
		  handler = storage.events[ event.type ],
		  specials = getSpecialsReferences( handler.element.parentFragment );

	handler.fire({
		node: this,
		original: event,
		index: specials.index,
		key: specials.key,
		keypath: storage.keypath.getKeypath(),
		context: storage.keypath.get()
	});
}
