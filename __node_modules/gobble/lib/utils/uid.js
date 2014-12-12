var uid = 1;

module.exports = function ( postfix ) {
	if ( process.env.GOBBLE_RESET_UID === 'reset' ) {
		uid = 1;
		delete process.env.GOBBLE_RESET_UID;
	}

	return pad( uid++ ) + ( postfix ? '-' + postfix : '' );
};

function pad ( number ) {
	return '' + ( number < 10 ? '0' + number : number );
}
