import optionConfig from 'config/options/option';


var config = optionConfig( 'debug' );

config.preExtend = config.preInit = copyFromConstructor;

function copyFromConstructor( parent, target, options ) {

	// if not explicitly set on options
	if ( !( 'debug' in options ) ) {

		// ok to use Parent.debug instead of Parent.defaults.debug
		if ( 'debug' in parent ) {

			options.debug = parent.debug;
		}
	}

}

export default config;
