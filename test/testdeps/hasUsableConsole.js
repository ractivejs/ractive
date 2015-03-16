var hasUsableConsole;

try {
	console.warn.toString();
	hasUsableConsole = true; // this fails in IE8
} catch ( err ) {
	hasUsableConsole = false;
}

export default hasUsableConsole;