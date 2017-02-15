import add from './shared/add';

export default function Ractive$add ( keypath, d, options ) {
	const num = typeof d === 'number' ? d : 1;
	const opts = typeof d === 'object' ? d : options;
	return add( this, keypath, num, opts );
}
