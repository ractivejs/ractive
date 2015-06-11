import { INTERPOLATOR } from 'config/types';
import ExpressionResolver from './ExpressionResolver';
import IndexReferenceResolver from './IndexReferenceResolver';
import ReferenceResolver from './ReferenceResolver';
import ReferenceExpressionResolver from './ReferenceExpressionResolver';
import ShadowResolver from './ShadowResolver';

export default function createResolver ( fragment, template, callback ) {
	const ref = template.r;

	if ( ref ) {
		if ( ref === '.' || ref === 'this' ) {
			return new ShadowResolver( fragment, callback );
		}

		if ( ref === '@index' || ref in fragment.indexRefs ) {
			return new IndexReferenceResolver( fragment, ref, callback );
		}

		if ( ref[0] === '@' ) {
			throw new Error( 'TODO specials' );
		}

		return new ReferenceResolver( fragment, ref, callback );
	}

	else if ( template.x ) {
		return new ExpressionResolver( fragment, template.x, callback );
	}

	else {
		return new ReferenceExpressionResolver( fragment, template.rx, callback );
	}
}
