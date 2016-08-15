import resolveAmbiguousReference from './resolveAmbiguousReference';
import { splitKeypath } from '../../shared/keypaths';
import GlobalModel from '../../model/specials/GlobalModel';

const keypathExpr = /^@[^\(]+\(([^\)]+)\)/;

export default function resolveReference ( fragment, ref ) {
	let context = fragment.findContext();

	// special references
	// TODO does `this` become `.` at parse time?
	if ( ref === '.' || ref === 'this' ) return context;
	if ( ref.indexOf( '@keypath' ) === 0 ) {
		const match = keypathExpr.exec( ref );
		if ( match && match[1] ) {
			const model = resolveReference( fragment, match[1] );
			if ( model ) return model.getKeypathModel();
		}
		return context.getKeypathModel();
	}
	if ( ref.indexOf( '@rootpath' ) === 0 ) {
		// check to see if this is an empty component root
		while ( context.isRoot && context.ractive.component ) {
			context = context.ractive.component.parentFragment.findContext();
		}

		const match = keypathExpr.exec( ref );
		if ( match && match[1] ) {
			const model = resolveReference( fragment, match[1] );
			if ( model ) return model.getKeypathModel( fragment.ractive.root );
		}
		return context.getKeypathModel( fragment.ractive.root );
	}
	if ( ref === '@index' || ref === '@key' ) {
		const repeater = fragment.findRepeatingFragment();
		// make sure the found fragment is actually an iteration
		if ( !repeater.isIteration ) return;
		return repeater.context.getKeyModel( repeater[ ref[1] === 'i' ? 'index' : 'key' ] );
	}
	if ( ref === '@this' ) {
		return fragment.ractive.viewmodel.getRactiveModel();
	}
	if ( ref === '@global' ) {
		return GlobalModel;
	}

	// ancestor references
	if ( ref[0] === '~' ) return fragment.ractive.viewmodel.joinAll( splitKeypath( ref.slice( 2 ) ) );
	if ( ref[0] === '.' ) {
		const parts = ref.split( '/' );

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

	return resolveAmbiguousReference( fragment, ref );
}
