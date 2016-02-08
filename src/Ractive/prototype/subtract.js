import add from './shared/add';

export default function Ractive$subtract ( ...args ) {
	return add( this, args, -1 );
}
