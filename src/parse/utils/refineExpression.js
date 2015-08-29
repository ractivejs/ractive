import { REFERENCE, BRACKETED, NUMBER_LITERAL, MEMBER, REFINEMENT } from '../../config/types';
import flattenExpression from './flattenExpression';

var arrayMemberPattern = /^[0-9][1-9]*$/;

export default function refineExpression ( expression, mustache ) {
	var referenceExpression;

	if ( expression ) {
		while ( expression.t === BRACKETED && expression.x ) {
			expression = expression.x;
		}

		// special case - integers should be treated as array members references,
		// rather than as expressions in their own right
		if ( expression.t === REFERENCE ) {
			mustache.r = expression.n;
		} else {
			if ( expression.t === NUMBER_LITERAL && arrayMemberPattern.test( expression.v ) ) {
				mustache.r = expression.v;
			} else if ( referenceExpression = getReferenceExpression( expression ) ) {
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
	var members = [], refinement;

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