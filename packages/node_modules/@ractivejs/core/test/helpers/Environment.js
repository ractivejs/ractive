function appendScript(doc, src) {
	return new Promise((resolve, reject) => {
		const script = doc.createElement('script');
		doc.body.appendChild(script);
		script.onload = resolve;
		script.onerror = reject;
		script.src = src;
	});
}

export function createIsolatedEnv() {

	return new Promise((resolve, reject) => {

		const frame = document.createElement('iframe');

		// need to use onload in FF; http://stackoverflow.com/questions/9967478/iframe-content-disappears-on-firefox
		frame.onload = () => {
			frame.style.width = '0';
			frame.style.height = '0';

			const win = frame.contentWindow || frame;
			const doc = frame.contentDocument || frame.contentWindow.document;

			Promise.resolve()
				.then(() => appendScript(doc, '../../ractive.js'))
				.then(() => resolve({
					Ractive: win.Ractive,
					env: frame,
					body: doc.body
				}), reject);
		};

		document.body.appendChild(frame);
	});

}
