import staticContext, { getNodeInfo as staticInfo } from '../static/getContext';
import { isString } from 'utils/is';

export default function getContext(node, options) {
	if (isString(node)) {
		node = this.find(node, options);
	}

	return staticContext(node);
}

export function getNodeInfo(node, options) {
	if (isString(node)) {
		node = this.find(node, options);
	}

	return staticInfo(node);
}
