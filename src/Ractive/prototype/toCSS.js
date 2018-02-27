import { getCSS } from 'src/global/css';
import { keys } from 'utils/object';

export default function Ractive$toCSS() {
	const cssIds = [this.cssId, ...this.findAllComponents().map(c => c.cssId)];
	const uniqueCssIds = keys(
		cssIds.reduce((ids, id) => ((ids[id] = true), ids), {})
	);
	return getCSS(uniqueCssIds);
}
