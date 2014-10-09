import optionGroup from 'config/options/groups/optionGroup';

var keys, parseOptions;

keys = [
 	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters',
	'interpolate'
];

parseOptions = optionGroup( keys, key => key );

export default parseOptions;
