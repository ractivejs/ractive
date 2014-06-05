import optionGroup from 'config/options/groups/optionGroup';
import parseOption from 'config/options/parseOption';

var keys, parseOptions;

keys = [
 	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters',
	'handlebars'
];

parseOptions = optionGroup( keys, key => parseOption( key ) );

export default parseOptions;
