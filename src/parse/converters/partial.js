import types from 'config/types';

export default getPartial;

var start = /^<!--\s*(?:\{\{|\[\[)\s*>\s*([a-zA-Z_$][-a-zA-Z_$0-9]*)\s*(?:\}\}|\]\])\s*-->/;

function getPartial( parser ) {
	let template = parser.remaining();
	let startMatch = start.exec( template );

	if ( startMatch ) {
		let name = startMatch[1];
		let offset = startMatch[0].length;

		// look for the closing partial for name
		let end = new RegExp('<!--\\s*(?:\\{\\{|\\[\\[)\\s*\\/\\s*' + name + '\\s*(?:\\}\\}|\\]\\])\\s*-->');
		template = template.substr( offset );
		let endMatch = end.exec( template );

		if ( !endMatch ) {
			throw new Error( 'Inline partials must have a closing delimiter, and cannot be nested. Expected closing for "' + name +
				'", but ' + ( endMatch ? 'instead found "' + endMatch[1] + '"' : ' no closing found' ) );
		}

		let partial = {
			t: types.INLINE_PARTIAL,
			f: new parser.StandardParser( template.substr( 0, endMatch.index ), parser.options ).result,
			n: name
		};

		parser.pos += offset + endMatch.index + endMatch[0].length;

		return partial;
	}

	else {
		return null;
	}
}
