import log from 'utils/log';

// TODO: depricate in future release
var deprications = {
	construct: {
		depricated: 'beforeInit',
		replacement: 'onconstruct'
	},
	render: {
		depricated: 'init',
		replacement: 'onrender'
	},
	complete: {
		depricated: 'complete',
		replacement: 'oncomplete'
	}
};

function Hook ( event ) {
	this.event = event;
	this.method = 'on' + event;
	this.depricate = deprications[ event ];
}

Hook.prototype.fire = function ( ractive, arg ) {

	function call ( method ) {
		if( ractive[ method ] ){
			arg ? ractive[ method ]( arg ) : ractive[ method ]();
			return true;
		}
	}

	call( this.method );

	if ( this.depricate && call( this.depricate.depricated ) ) {
		log.warn({
			debug: ractive.debug,
			message: 'methodDepricated',
			args: this.depricate
		});
	}

	arg ? ractive.fire( this.event, arg ) : ractive.fire( this.event );

};

export default Hook;
