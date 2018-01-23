import escapeRegExp from '../../../utils/escapeRegExp';

const regExpCache = {};

export default function ( haystack, needles ) {
	return haystack.search( regExpCache[needles.join()] || ( regExpCache[needles.join()] = new RegExp( needles.map( escapeRegExp ).join( '|' ) ) ) );
}
