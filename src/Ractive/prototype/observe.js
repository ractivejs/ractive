import dispatchObserve from './observe/dispatchObserve';

const observe = function ( keypath, callback, options ) {
	return dispatchObserve( this, keypath, callback, options );
}

const observeList = function ( keypath, callback, options = {} ) {
	options.type = 'list';
	return this.observe( keypath, callback, options );
}

const observeOnce = function ( keypath, callback, options ) {

	var observer, cancel = function () {
		observer.cancel();
	};

	// context = options.context || this
	if ( typeof callback === 'function' ) {
		callback = wrapForOnce( this, callback, cancel );
	}
	else if ( typeof keypath === 'function' ) {
		keypath = wrapForOnce( this, keypath, cancel );
	}

	if ( options ) {
		options.init = false;
	}
	else {
		options = { init: false }
	}

	observer = dispatchObserve( this, keypath, callback, options );

	return observer;
}

const observeListOnce = function ( keypath, callback, options = {} ) {
	options.type = 'list';
	return this.observeOnce( keypath, callback, options );
}

function wrapForOnce ( ractive, callback, cancel ) {
	return function () {
		callback.apply( ractive, arguments );
		cancel();
	};
}

export { observe, observeList, observeOnce, observeListOnce };
