import { INTERPOLATOR } from 'config/types';
import ExpressionProxy from './ExpressionProxy';
import ReferenceResolver from './ReferenceResolver';
import ReferenceExpressionProxy from './ReferenceExpressionProxy';
import resolveReference from './resolveReference';

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
