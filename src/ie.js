// IE shims
if ( !Date.now ) {
	Date.now = function () { return +new Date(); };
}