import optionConfig from 'config/options/option';


var config = optionConfig( 'debug' );

config.preExtend = config.preInit = copyFromConstructor;

function copyFromConstructor( parent, target, options ) {

	if ( !options.hasOwnProperty( 'debug') && parent.hasOwnProperty( 'debug' ) ) {
		options.debug = parent.debug;
		delete parent.debug;
	}

}

export default config;
