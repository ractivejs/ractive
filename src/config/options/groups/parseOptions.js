import optionGroup from 'config/options/groups/optionGroup';

var keys, parseOptions;

keys = [
 	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters'
];

parseOptions = optionGroup( keys, key => key );

export default parseOptions;
