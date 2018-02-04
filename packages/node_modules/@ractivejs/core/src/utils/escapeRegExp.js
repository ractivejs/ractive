const pattern = /[-/\\^$*+?.()|[\]{}]/g;

export default function escapeRegExp ( str ) {
	return str.replace( pattern, '\\$&' );
}
