Ractive.prototype = proto;

// Shared properties
Ractive.partials = {};
Ractive.delimiters = [ '{{', '}}' ];
Ractive.tripleDelimiters = [ '{{{', '}}}' ];

// Plugins
Ractive.adaptors = adaptors;
Ractive.decorators = decorators;
Ractive.eventDefinitions = Ractive.events = eventDefinitions; // TODO deprecate eventDefinitions?
Ractive.easing = easing;
Ractive.transitions = transitions;

// Static methods
Ractive.extend = extend;
Ractive.interpolate = interpolate;
Ractive.interpolators = interpolators;
Ractive.parse = parse;

Ractive.VERSION = VERSION;


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
else {
	global.Ractive = Ractive;
}

}( typeof window !== 'undefined' ? window : this ));