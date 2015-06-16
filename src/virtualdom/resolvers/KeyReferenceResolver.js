import { warnOnceIfDebug } from 'utils/log';

export default class KeyReferenceResolver {
	constructor ( fragment, keyRef, callback ) {
		this.deps = [];
		this.value = keyRef === '@key' ? fragment.key : fragment.keyRefs[ keyRef ];

		callback( this );

		this.resolved = true;

		// for debugging
		this.keyRef = keyRef;
		this.ractive = fragment.ractive;
	}

	get () {
		return this.value;
	}

	getKeypath () {
		return '@key';
	}

	register () {
		// noop - key can never change
	}

	registerTwowayBinding () {
		warnOnceIfDebug( 'Two-way binding does not work with %s', this.keyRef, { ractive: this.ractive });
	}

	unbind () {
		// noop
	}

	unregister () {
		// noop
	}
}
