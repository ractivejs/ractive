// TODO DRY this out?
export default class KeyReferenceResolver {
	constructor ( fragment, keyRef, callback ) {
		this.deps = [];
		this.value = keyRef === '@key' ? fragment.key : fragment.keyRefs[ keyRef ];

		callback( this );

		this.resolved = true;
	}

	getKeypath () {
		return '@key';
	}

	register () {
		// noop - key can never change
	}
}
