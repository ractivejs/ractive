import { getCSS } from '../../global/css';

export default function Ractive$toCSS() {
	const cssIds = [ this.cssId, ...this.findAllComponents().map( c => c.cssId ) ];
	const uniqueCssIds = Object.keys(cssIds.reduce( ( ids, id ) => (ids[id] = true, ids), {}));
	return getCSS( uniqueCssIds );
}
