import { getMatchingKeypaths } from 'shared/keypaths';

export default function getPattern ( ractive, pattern ) {
	var matchingKeypaths, values;

	matchingKeypaths = getMatchingKeypaths( ractive, pattern.str );

	values = {};
	matchingKeypaths.forEach( keypath => {
		values[ keypath.str ] = ractive.get( keypath.str );
	});

	return values;
}
