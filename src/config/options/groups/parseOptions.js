import optionGroup from 'config/options/groups/optionGroup';
import option from 'config/options/option';

var keys, parseOptions;

keys = [
 	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters',
	'handlebars'
];

parseOptions = optionGroup( keys, key => option( key ) );

export default parseOptions;
