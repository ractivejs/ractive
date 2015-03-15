import { TEMPLATE_VERSION } from 'config/template';
import { create } from 'utils/object';
import { READERS } from '../_parse';
import readPartialDefinitionComment from './readPartialDefinitionComment';
import readPartialDefinitionSection from './readPartialDefinitionSection';

const PARTIAL_READERS = [ readPartialDefinitionComment, readPartialDefinitionSection ];

export default function readTemplate ( parser ) {
	let fragment = [];
	let partials = create( null );
	let hasPartials = false;

	while ( parser.pos < parser.str.length ) {
		let pos = parser.pos, item, partial;

		if ( partial = parser.read( PARTIAL_READERS ) ) {
			if ( partials[ partial.n ] ) {
				parser.pos = pos;
				parser.error( 'Duplicated partial definition' );
			}

			partials[ partial.n ] = partial.f;
			hasPartials = true;
		} else if ( item = parser.read( READERS ) ) {
			fragment.push( item );
		} else  {
			parser.error( 'Unexpected template content' );
		}
	}

	let result = {
		v: TEMPLATE_VERSION,
		t: fragment
	};

	if ( hasPartials ) {
		result.p = partials;
	}

	return result;
}
