import consolewarn from 'utils/warn';
import errors from 'config/errors';

var log = {
	warn: function ( options, passthru ) {
		if ( !options.debug && !passthru ) { return; }
		this.logger( getMessage( options), options.allowDuplicates );
	},
	error: function ( options ) {
		this.errorOnly( options );

		if ( !options.debug ) {
			this.warn( options, true );
		}
	},
	errorOnly: function ( options ) {
		if ( options.debug ) {
			this.critical( options );
		}
	},
	critical: function( options ){
		var err = options.err || new Error( getMessage( options ) );
		this.thrower( err );
	},
	logger: consolewarn,
	thrower: function ( err ) {
		throw err;
	}
};

function getMessage ( options ) {
	var message = errors[options.message] || options.message || '';
	return interpolate( message, options.args );
}

// simple interpolation. probably quicker (and better) out there,
// but log is not in golden path of execution, only exceptions
function interpolate ( message, args ) {
 	return message.replace( /{([^{}]*)}/g, (a,b) => args[b] );
}

export default log;
