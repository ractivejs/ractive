import cleanCss from '../../utils/cleanCss';

const space = /\s+/;

export function readStyle ( css ) {
	if ( typeof css !== 'string' ) return {};

	return cleanCss( css, ( css, reconstruct ) => {
		return css.split( ';' )
			.filter( rule => !!rule.trim() )
			.map( reconstruct )
			.reduce(( rules, rule ) => {
				const i = rule.indexOf(':');
				const name = rule.substr( 0, i ).trim();
				rules[ name ] = rule.substr( i + 1 ).trim();
				return rules;
			}, {});
	});
}

export function readClass ( str ) {
	const list = str.split( space );

  // remove any empty entries
	let i = list.length;
	while ( i-- ) {
		if ( !list[i] ) list.splice( i, 1 );
	}

	return list;
}
