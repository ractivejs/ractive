import { splitKeypath } from '../../shared/keypaths';
import SharedModel, { GlobalModel } from '../../model/specials/SharedModel';
import { warnIfDebug } from '../../utils/log';

export default function resolveReference ( fragment, ref ) {
	const initialFragment = fragment;
	// current context ref
	if ( ref === '.' ) return fragment.findContext();

	// ancestor references
	if ( ref[0] === '~' ) return fragment.ractive.viewmodel.joinAll( splitKeypath( ref.slice( 2 ) ) );

	// scoped references
	if ( ref[0] === '.' || ref[0] === '^' ) {
		let frag = fragment;
		const parts = ref.split( '/' );
		const explicitContext = parts[0] === '^^';
		let context = explicitContext ? null : fragment.findContext();

		// account for the first context hop
		if ( explicitContext ) parts.unshift( '^^' );

		// walk up the context chain
		while ( parts[0] === '^^' ) {
			parts.shift();
			context = null;
			while ( frag && !context ) {
				context = frag.context;
				frag = frag.parent.component ? frag.parent.component.parentFragment : frag.parent;
			}
		}

		if ( !context && explicitContext ) {
			throw new Error( `Invalid context parent reference ('${ref}'). There is not context at that level.` );
		}

		// walk up the context path
		while ( parts[0] === '.' || parts[0] === '..' ) {
			const part = parts.shift();

			if ( part === '..' ) {
				context = context.parent;
			}
		}

		ref = parts.join( '/' );

		// special case - `{{.foo}}` means the same as `{{./foo}}`
		if ( ref[0] === '.' ) ref = ref.slice( 1 );
		return context.joinAll( splitKeypath( ref ) );
	}

	const keys = splitKeypath( ref );
	if ( !keys.length ) return;
	const base = keys.shift();

	// special refs
	if ( base[0] === '@' ) {
		// shorthand from outside the template
		// @this referring to local ractive instance
		if ( base === '@this' || base === '@' ) {
			return fragment.ractive.viewmodel.getRactiveModel().joinAll( keys );
		}

		// @index or @key referring to the nearest repeating index or key
		else if ( base === '@index' || base === '@key' ) {
			if ( keys.length ) badReference( base );
			const repeater = fragment.findRepeatingFragment();
			// make sure the found fragment is actually an iteration
			if ( !repeater.isIteration ) return;
			return repeater.context && repeater.context.getKeyModel( repeater[ ref[1] === 'i' ? 'index' : 'key' ] );
		}

		// @global referring to window or global
		else if ( base === '@global' ) {
			return GlobalModel.joinAll( keys );
		}

		// @global referring to window or global
		else if ( base === '@shared' ) {
			return SharedModel.joinAll( keys );
		}

		// @keypath or @rootpath, the current keypath string
		else if ( base === '@keypath' || base === '@rootpath' ) {
			const root = ref[1] === 'r' ? fragment.ractive.root : null;
			let context = fragment.findContext();

			// skip over component roots, which provide no context
			while ( root && context.isRoot && context.ractive.component ) {
				context = context.ractive.component.parentFragment.findContext();
			}

			return context.getKeypathModel( root );
		}

		else if ( base === '@context' ) {
			return new ContextModel( fragment.getContext() );
		}

		// @context-local data
		else if ( base === '@local' ) {
			return fragment.getContext()._data.joinAll( keys );
		}

		// nope
		else {
			throw new Error( `Invalid special reference '${base}'` );
		}
	}

	const context = fragment.findContext();

	// check immediate context for a match
	if ( context.has( base ) ) {
		return context.joinKey( base ).joinAll( keys );
	}

	// walk up the fragment hierarchy looking for a matching ref, alias, or key in a context
	let createMapping = false;
	const shouldWarn = fragment.ractive.warnAboutAmbiguity;

	while ( fragment ) {
		// repeated fragments
		if ( fragment.isIteration ) {
			if ( base === fragment.parent.keyRef ) {
				if ( keys.length ) badReference( base );
				return fragment.context.getKeyModel( fragment.key );
			}

			if ( base === fragment.parent.indexRef ) {
				if ( keys.length ) badReference( base );
				return fragment.context.getKeyModel( fragment.index );
			}
		}

		// alias node or iteration
		if ( fragment.aliases  && fragment.aliases.hasOwnProperty( base ) ) {
			const model = fragment.aliases[ base ];

			if ( keys.length === 0 ) return model;
			else if ( typeof model.joinAll === 'function' ) {
				return model.joinAll( keys );
			}
		}

		// check fragment context to see if it has the key we need
		if ( fragment.context && fragment.context.has( base ) ) {
			// this is an implicit mapping
			if ( createMapping ) {
				if ( shouldWarn ) warnIfDebug( `'${ref}' resolved but is ambiguous and will create a mapping to a parent component.` );
				return context.root.createLink( base, fragment.context.joinKey( base ), base, { implicit: true }).joinAll( keys );
			}

			if ( shouldWarn ) warnIfDebug( `'${ref}' resolved but is ambiguous.` );
			return fragment.context.joinKey( base ).joinAll( keys );
		}

		if ( ( fragment.componentParent || ( !fragment.parent && fragment.ractive.component ) ) && !fragment.ractive.isolated ) {
			// ascend through component boundary
			fragment = fragment.componentParent || fragment.ractive.component.parentFragment;
			createMapping = true;
		} else {
			fragment = fragment.parent;
		}
	}

	// if enabled, check the instance for a match
	const instance = initialFragment.ractive;
	if ( instance.resolveInstanceMembers && base !== 'data' && base in instance ) {
		return instance.viewmodel.getRactiveModel().joinKey( base ).joinAll( keys );
	}

	if ( shouldWarn ) {
		warnIfDebug( `'${ref}' is ambiguous and did not resolve.` );
	}

	// didn't find anything, so go ahead and create the key on the local model
	return context.joinKey( base ).joinAll( keys );
}

function badReference ( key ) {
	throw new Error( `An index or key reference (${key}) cannot have child properties` );
}

class ContextModel {
	constructor ( context ) {
		this.context = context;
	}

	get () { return this.context; }
}
