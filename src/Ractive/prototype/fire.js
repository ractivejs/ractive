import fireEvent from 'Ractive/prototype/shared/fireEvent';

export default function Ractive$fire ( eventName ) {
	var options = {
		args: Array.prototype.slice.call( arguments, 1 )
		// TODO: create event object
		// event: {};
	};

	fireEvent( this, eventName, options );
}
