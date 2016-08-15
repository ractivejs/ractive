import resolveReference from './resolveReference';
import ExpressionProxy from './ExpressionProxy';
import ReferenceExpressionProxy from './ReferenceExpressionProxy';
import { splitKeypath } from '../../shared/keypaths';
import { isNumeric } from '../../utils/is';

export default function resolve ( fragment, template ) {
	if ( template.r ) {
		return resolveReference( fragment, template.r );
	}

	else if ( template.x ) {
		return new ExpressionProxy( fragment, template.x );
	}

	else {
		return new ReferenceExpressionProxy( fragment, template.rx );
	}
}

export function modelMatches( model, template ) {
	// these are always contextual, and thus always match
	if ( model.isKey || model.isKeypath ) return true;

	// check to see if the template matches the given model
	if ( template.r ) {
		const ref = template.r;

		if ( ref === '.' ) return true;
		if ( ref[0] === '@' ) return true;

		const parts = ref.split( '/' );
		const keys = splitKeypath( parts[ parts.length - 1 ] );

		let i = keys.length;
		while ( i-- ) {
			if ( isNumeric( keys[i] ) && keys[i] !== model.key ) return false;
			model = model.parent;
		}
		return true;
	} else {
		return true;
	}
}
