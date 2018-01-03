import { REFERENCE, BRACKETED, MEMBER, REFINEMENT } from '../../config/types';
import flattenExpression from './flattenExpression';

export default function refineExpression ( expression, mustache ) {
	let referenceExpression;

	if ( expression ) {
		while ( expression.t === BRACKETED && expression.x ) {
			expression = expression.x;
		}

		if ( expression.t === REFERENCE ) {
			const n = expression.n;
			if ( !~n.indexOf( '@context' ) ) {
				mustache.r = expression.n;
			} else {
				mustache.x = flattenExpression( expression );
			}
		} else {
			if ( referenceExpression = getReferenceExpression( expression ) ) {
				mustache.rx = referenceExpression;
			} else {
				mustache.x = flattenExpression( expression );
			}
		}

		return mustache;
	}
}

// TODO refactor this! it's bewildering
function getReferenceExpression ( expression ) {
	const members = [];
	let refinement;

	while ( expression.t === MEMBER && expression.r.t === REFINEMENT ) {
		refinement = expression.r;

		if ( refinement.x ) {
			if ( refinement.x.t === REFERENCE ) {
				members.unshift( refinement.x );
			} else {
				members.unshift( flattenExpression( refinement.x ) );
			}
		} else {
			members.unshift( refinement.n );
		}

		expression = expression.x;
	}

	if ( expression.t !== REFERENCE ) {
		return null;
	}

	return {
		r: expression.n,
		m: members
	};
}
