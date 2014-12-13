import 'legacy';

export default function createOptionGroup ( keys, config ) {
	var group = keys.map( config );

	keys.forEach( ( key, i ) => {
		group[ key ] = group[ i ];
	});

	return group;
}
