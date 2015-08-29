import fireEvent from '../../events/fireEvent';

export default function Ractive$fire ( eventName, ...args ) {
	fireEvent( this, eventName, { args });
}
