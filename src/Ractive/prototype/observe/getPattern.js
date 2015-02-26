import { getMatchingKeypaths } from 'shared/keypaths';

export default function getPattern ( ractive, pattern ) {
	var matchingKeypaths, values;

	matchingKeypaths = getMatchingKeypaths( ractive, pattern.str );

	values = {};
	matchingKeypaths.forEach( model => {
		var keypath = model.getKeypath();
		values[ keypath ] = ractive.get( keypath );
	});

	return values;
}
