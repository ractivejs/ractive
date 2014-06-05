
export default function createOptionGroup ( keys, config ) {

	var group = keys.map( config );

	keys.forEach( key => {
		group[ key ] = true;
	});

	return group;
}


