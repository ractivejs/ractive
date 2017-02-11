import fireEvent from '../../events/fireEvent';
import extendContext from '../../shared/extendContext';

export default function Ractive$fire ( eventName, ...args ) {
	return fireEvent( extendContext( this, this.event ), eventName, args );
}
