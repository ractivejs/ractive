import fireEvent from 'Ractive/prototype/shared/fireEvent';

export default function Ractive$fire ( eventName ) {

	// no auto-add of event arg
	// var options = {
	// 	args: Array.prototype.slice.call( arguments, 1 )
	// };

	// create event object
	var options = {
		args: Array.prototype.slice.call( arguments, 1 ),
		event: {
			component: this,
			keypath: '',
			context: this.data
		},
		changeBubbleContext: true
	};

	fireEvent( this, eventName, options );
}
