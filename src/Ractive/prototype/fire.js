import fireEvent from '../../events/fireEvent';

export default function Ractive$fire ( eventName, ...args ) {
	return fireEvent( this, eventName, { args });
}
