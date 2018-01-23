export default function Ractive$once ( eventName, handler ) {
	const listener = this.on( eventName, function () {
		handler.apply( this, arguments );
		listener.cancel();
	});

	// so we can still do listener.cancel() manually
	return listener;
}
