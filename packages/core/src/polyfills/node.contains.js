// NOTE: Node doesn't exist in IE8. Nothing can be done.
if (typeof window !== 'undefined' && window.Node && window.Node.prototype && !window.Node.prototype.contains) {
	Node.prototype.contains = function (node) {
		if (!node)
			throw new TypeError('node required');

		do {
			if (this === node) return true;
		} while (node = node && node.parentNode);

		return false;
	};
}
