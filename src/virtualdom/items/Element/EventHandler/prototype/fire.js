import fireEvent from 'Ractive/prototype/shared/fireEvent';

// This function may be overwritten, if the event directive
// includes parameters
export default function EventHandler$fire ( event ) {
	fireEvent( this.root, this.getAction(), { event: event } );
}
