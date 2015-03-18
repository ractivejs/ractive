import EventHandler from '../../EventHandler/_EventHandler';

export default function ( element, template ) {
	var i, name, names, handler, result = [];

	for ( name in template ) {
		if ( template.hasOwnProperty( name ) ) {
			names = name.split( '-' );
			i = names.length;

			while ( i-- ) {
				handler = new EventHandler( element, names[i], template[ name ] );
				result.push( handler );
			}
		}
	}

	return result;
}
