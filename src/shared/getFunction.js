import { create } from '../utils/object';
import { createFunction } from '../Ractive/config/runtime-parser';

const functions = create( null );

export default function getFunction ( str, i ) {
	if ( functions[ str ] ) return functions[ str ];

	// Adding templates and partials loads functions
	// so not sure this is necessary. But if there are
	// expressions that have not been converted functions,
	// this would do that.
	return functions[ str ] = createFunction( str, i );
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


