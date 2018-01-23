import { TEMPLATE_VERSION } from '../../config/template';
import { READERS, PARTIAL_READERS } from '../_parse';
import cleanup from '../utils/cleanup';

export default function readTemplate ( parser ) {
	const fragment = [];
	const partials = Object.create( null );
	let hasPartials = false;

	const preserveWhitespace = parser.preserveWhitespace;

	while ( parser.pos < parser.str.length ) {
		const pos = parser.pos;
		let item, partial;

		if ( partial = parser.read( PARTIAL_READERS ) ) {
			if ( partials[ partial.n ] ) {
				parser.pos = pos;
				parser.error( 'Duplicated partial definition' );
			}

			cleanup( partial.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace );

			partials[ partial.n ] = partial.f;
			hasPartials = true;
		} else if ( item = parser.read( READERS ) ) {
			fragment.push( item );
		} else  {
			parser.error( 'Unexpected template content' );
		}
	}

	const result = {
		v: TEMPLATE_VERSION,
		t: fragment
	};

	if ( hasPartials ) {
		result.p = partials;
	}

	return result;
}
