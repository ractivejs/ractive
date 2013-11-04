while ( loadCircularDependency.callbacks.length ) {
	loadCircularDependency.callbacks.pop()();
}


// export as Common JS module...
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = parse__index;
}

// ... or as AMD module
else if ( typeof define === "function" && define.amd ) {
	define( function () {
		return parse__index;
	});
}

// ... or as browser global
else {
	global.parse = parse__index;
}

}( typeof window !== 'undefined' ? window : this ));