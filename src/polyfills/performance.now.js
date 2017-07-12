if (typeof window !== 'undefined' && window.performance && !window.performance.now) {
	window.performance = window.performance || {};

	const nowOffset = Date.now();

	window.performance.now = function () {
		return Date.now() - nowOffset;
	};
}
