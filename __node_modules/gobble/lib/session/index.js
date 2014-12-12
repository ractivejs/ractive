var EventEmitter2 = require( 'eventemitter2' ).EventEmitter2,
	currentSession,
	session;

session = {
	create: function ( options ) {
		if ( currentSession ) {
			throw new Error( 'Gobble is already running. You can only run one build/serve task per process' );
		}

		session.config = {
			gobbledir: options.gobbledir
		};

		currentSession = new EventEmitter2({ wildcard: true });
		return currentSession;
	},

	destroy: function () {
		currentSession = session.config = null;
	}
};

module.exports = session;
