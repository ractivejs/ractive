import parser from '../Ractive/config/custom/template/parser';

export let functions = {};

export default function getFunction ( str, i ) {
	if ( functions[ str ] ) return functions[ str ];

	// Could we actually end up here???
	return parser.createFunction( str, i );
}
