export default function Ractive$observeOnce ( property, callback, options ) {

	var observer = this.observe( property, function () {
		callback.apply( this, arguments );
		observer.cancel();
	}, { init: false, defer: options && options.defer });

	return observer;
}
