import add from './shared/add';

export default function Ractive$subtract ( keypath, d ) {
	return add( this, keypath, ( d === undefined ? -1 : -d ) );
}
