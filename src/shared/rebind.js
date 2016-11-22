import { splitKeypath } from './keypaths';

// this is the dry method of checking to see if a rebind applies to
// a particular keypath because in some cases, a dep may be bound
// directly to a particular keypath e.g. foo.bars.0.baz and need
// to avoid getting kicked to foo.bars.1.baz if foo.bars is unshifted
export function rebindMatch ( template, next, previous, fragment ) {
	const keypath = template.r || template;

	// no valid keypath, go with next
	if ( !keypath || typeof keypath !== 'string' ) return next;

	// completely contextual ref, go with next
	if ( keypath === '.' || keypath[0] === '@' || ( next || previous ).isKey || ( next || previous ).isKeypath ) return next;

	const parts = keypath.split( '/' );
	let keys = splitKeypath( parts[ parts.length - 1 ] );
	const last = keys[ keys.length - 1 ];

	// check the keypath against the model keypath to see if it matches
	let model = next || previous;

	// check to see if this was an alias
	if ( model && keys.length === 1 && last !== model.key && fragment ) {
		keys = findAlias( last, fragment ) || keys;
	}

	let i = keys.length;
	let match = true;
	let shuffling = false;

	while ( model && i-- ) {
		if ( model.shuffling ) shuffling = true;
		// non-strict comparison to account for indices in keypaths
		if ( keys[i] != model.key ) match = false;
		model = model.parent;
	}

	// next is undefined, but keypath is shuffling and previous matches
	if ( !next && match && shuffling ) return previous;
	// next is defined, but doesn't match the keypath
	else if ( next && !match && shuffling ) return previous;
	else return next;
}

function findAlias ( name, fragment ) {
	while ( fragment ) {
		const z = fragment.aliases;
		if ( z && z[ name ] ) {
			const aliases = ( fragment.owner.iterations ? fragment.owner : fragment ).owner.template.z;
			for ( let i = 0; i < aliases.length; i++ ) {
				if ( aliases[i].n === name ) {
					const alias = aliases[i].x;
					if ( !alias.r ) return false;
					const parts = alias.r.split( '/' );
					return splitKeypath( parts[ parts.length - 1 ] );
				}
			}
			return;
		}

		fragment = fragment.componentParent || fragment.parent;
	}
}
