import './Date.now';

// NOTE: Setup requires Date.now() to be present already.
if (window && window.performance && !window.performance.now) {
	window.performance = window.performance || {};

	const nowOffset = Date.now();

	window.performance.now = function () {
		return Date.now() - nowOffset;
	};
}
