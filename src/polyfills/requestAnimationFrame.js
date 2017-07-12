if (typeof window !== 'undefined' && !(window.requestAnimationFrame && window.cancelAnimationFrame)) {
	let lastTime = 0;
	window.requestAnimationFrame = function (callback) {
		const currentTime = Date.now();
		const timeToNextCall = Math.max(0, 16 - (currentTime - lastTime));
		const id = window.setTimeout(() => { callback(currentTime + timeToNextCall); }, timeToNextCall);
		lastTime = currentTime + timeToNextCall;
		return id;
	};
	window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}
