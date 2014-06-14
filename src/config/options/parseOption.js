import optionConfig from 'config/options/baseConfiguration';

export default function parseConfig ( name ) {

	var config = optionConfig( name );

	//TODO: Remove
	config.postInit = ( target, result ) => {
		target.parseOptions[ name ] = result;
	};

	return config;
}
