import EventObject from 'virtualdom/items/Element/EventHandler/shared/EventObject';
import fireEvent from 'Ractive/prototype/shared/fireEvent';

export default function Ractive$fire ( eventName ) {

	var options = {
		args: Array.prototype.slice.call( arguments, 1 ),
		event: new EventObject({
				component: this,
				keypath: '',
				context: this.data
			}),
		isFire: true
	};

	fireEvent( this, eventName, options );
}
