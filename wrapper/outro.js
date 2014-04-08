
// export as Common JS module...
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = Ractive;
}

// ... or as AMD module
else if ( typeof define === "function" && define.amd ) {
	define( function () {
		return Ractive;
	});
}

// ... or as browser global
global.Ractive = Ractive;

Ractive.noConflict = function () {
	global.Ractive = noConflict;
	return Ractive;
};

}( typeof window !== 'undefined' ? window : this ));
