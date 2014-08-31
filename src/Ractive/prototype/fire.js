import fireEvent from 'Ractive/prototype/shared/fireEvent';

export default function Ractive$fire ( eventName ) {

	var options = {
		args: Array.prototype.slice.call( arguments, 1 )
	};

	fireEvent( this, eventName, options );
}
