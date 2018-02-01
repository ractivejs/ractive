import { NUMBER_LITERAL } from '../../../../../config/types';

// bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
const numberPattern = /^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;

export default function readNumberLiteral ( parser ) {
	let result;

	if ( result = parser.matchPattern( numberPattern ) ) {
		return {
			t: NUMBER_LITERAL,
			v: result
		};
	}

	return null;
}
