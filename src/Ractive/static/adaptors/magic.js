let magicAdaptor;

try {
	Object.defineProperty({}, 'test', { value: 0 });

	magicAdaptor = {
		filter ( value ) {
			return value && typeof value === 'object';
		},
		wrap ( ractive, value, keypath ) {
			return new MagicWrapper( ractive, value, keypath );
		}
	};
} catch ( err ) {
	magicAdaptor = false;
}

export default magicAdaptor;

function createOrWrapDescriptor ( originalDescriptor, ractive, keypath ) {
	if ( originalDescriptor.set && originalDescriptor.set.__magic ) {
		originalDescriptor.set.__magic.dependants.push({ ractive, keypath });
		return originalDescriptor;
	}

	let setting;

	let dependants = [{ ractive, keypath }];

	const descriptor = {
		get: () => {
			return 'value' in originalDescriptor ? originalDescriptor.value : originalDescriptor.get();
		},
		set: value => {
			if ( setting ) return;

			if ( 'value' in originalDescriptor ) {
				originalDescriptor.value = value;
			} else {
				originalDescriptor.set( value );
			}

			setting = true;
			dependants.forEach( ({ ractive, keypath }) => {
				ractive.set( keypath, value );
			});
			setting = false;
		},
		enumerable: true
	};

	descriptor.set.__magic = { dependants, originalDescriptor };

	return descriptor;
}

function revert ( descriptor, ractive, keypath ) {
	if ( !descriptor.set || !descriptor.set.__magic ) return true;

	let dependants = descriptor.set.__magic;
	let i = dependants.length;
	while ( i-- ) {
		const dependant = dependants[i];
		if ( dependant.ractive === ractive && dependant.keypath === keypath ) {
			dependants.splice( i, 1 );
			return false;
		}
	}
}

class MagicWrapper {
	constructor ( ractive, value, keypath ) {
		this.ractive = ractive;
		this.value = value;
		this.keypath = keypath;

		this.originalDescriptors = {};

		// wrap all properties with getters
		Object.keys( value ).forEach( key => {
			const originalDescriptor = Object.getOwnPropertyDescriptor( this.value, key );
			this.originalDescriptors[ key ] = originalDescriptor;

			const childKeypath = keypath ? `${keypath}.${key}` : key;

			const descriptor = createOrWrapDescriptor( originalDescriptor, ractive, childKeypath );



			Object.defineProperty( this.value, key, descriptor );
		});
	}

	get () {
		return this.value;
	}

	reset () {
		throw new Error( 'TODO magic adaptor reset' ); // does this ever happen?
	}

	set ( key, value ) {
		this.value[ key ] = value;
	}

	teardown () {
		Object.keys( this.value ).forEach( key => {
			const descriptor = Object.getOwnPropertyDescriptor( this.value, key );
			if ( !descriptor.set || !descriptor.set.__magic ) return;

			revert( descriptor );

			if ( descriptor.set.__magic.dependants.length === 1 ) {
				Object.defineProperty( this.value, key, descriptor.set.__magic.originalDescriptor );
			}
		});
	}
}
