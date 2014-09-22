import log from 'utils/log';

// TODO: depricate in future release
var deprications = {
	render: {
		depricated: 'init',
		replacement: 'onrender'
	},
	complete: {
		depricated: 'complete',
		replacement: 'oncomplete'
	},
	teardown: {
		depricated: 'teardown',
		replacement: 'onteardown'
	}
}

function Hook ( event ) {
	this.event = event;
	this.method = 'on' + event;
	this.depricate = deprications[event]
}

Hook.prototype.fire = function ( ractive, arg ) {

	function call ( method ) {
		if(method){
			arg ? method( arg ) : method();
			return true;
		}
	}

	call( ractive[ this.method ] );

	if ( this.depricate && call( ractive[ this.depricate.depricated ] ) ) {
		log.warn({
			debug: ractive.debug,
			message: 'methodDepricated',
			args: this.depricate
		});
	}

	arg ? ractive.fire( this.event, arg ) : ractive.fire( this.event );

}

export default Hook;
