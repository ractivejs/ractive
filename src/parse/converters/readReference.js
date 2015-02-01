import { REFERENCE } from 'config/types';

var legalReference = /^[a-zA-Z$_0-9]+(?:(?:\.[a-zA-Z$_0-9]+)|(?:\[[a-zA-Z$_0-9]+\]))*/;

export default function readReference ( parser ) {
	var ref = parser.matchPattern( legalReference );

	if ( ref ) {
		return { t: REFERENCE, n: ref };
	}
}