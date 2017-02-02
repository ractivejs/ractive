import add from './shared/add';

export default function Ractive$add ( keypath, d, options ) {
	const num = d && typeof d !== 'object' ? +d : 1;
	const opts = typeof d === 'object' ? d : options;
	return add( this, keypath, num, opts );
}
