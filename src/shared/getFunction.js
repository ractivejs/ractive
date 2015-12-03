import { create } from '../utils/object';
import { createFunction } from '../Ractive/config/runtime-parser';

const functions = create( null );

export default function getFunction ( str, i ) {
	if ( functions[ str ] ) return functions[ str ];

	// this probably won't ever be run because
	// adding templates and partials loads functions
	return functions[ str ] = parser.createFunction( str, i );
}

export function addFunctions( template ) {
	if ( !template ) return;

	const exp = template.e;

	if ( !exp ) return;

	Object.keys( exp ).forEach( ( str ) => {
		if ( functions[ str ] ) return;
		functions[ str ] = exp[ str ];
	});
}


