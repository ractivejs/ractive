import optionGroup from 'config/options/groups/optionGroup';
import option from 'config/options/baseConfiguration';

var keys, parseOptions;

keys = [
 	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters',
	'handlebars'
];

parseOptions = optionGroup( keys, key => option( { name: key } ) );

export default parseOptions;
