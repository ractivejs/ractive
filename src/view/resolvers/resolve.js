import resolveReference from './resolveReference';
import ExpressionProxy from './ExpressionProxy';
import ReferenceExpressionProxy from './ReferenceExpressionProxy';

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
