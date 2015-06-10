import ReferenceResolver from './ReferenceResolver';
import ExpressionResolver from './ExpressionResolver';
import ReferenceExpressionResolver from './ReferenceExpressionResolver';

export default function createResolver ( fragment, template, callback ) {
	if ( template.r ) {
		return new ReferenceResolver( fragment, template.r, callback );
	} else if ( template.x ) {
		return new ExpressionResolver( fragment, template.x, callback );
	} else {
		return new ReferenceExpressionResolver( fragment, template.rx, callback );
	}
}
