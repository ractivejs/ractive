import basicConfig from 'config/basicConfig';


export default function parseConfig ( name ) {

	var config = basicConfig( name );

	config.config.postInit = ( target, result ) => {
		target.parseOptions[ name ] = result;
	};

	return config;
};
