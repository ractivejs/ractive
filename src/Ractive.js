define([ 'Ractive/_Ractive', 'circular' ], function ( Ractive, circular ) {

	'use strict';

	// Internet Explorer derp. Methods that should be attached to Node.prototype
	// are instead attached to HTMLElement.prototype, which means SVG elements
	// can't use them. Remember kids, friends don't let friends use IE.
	//
	// This is here, rather than in legacy.js, because it affects IE9.
	if ( typeof window !== 'undefined' && window.Node && !window.Node.prototype.contains && window.HTMLElement && window.HTMLElement.prototype.contains ) {
		window.Node.prototype.contains = window.HTMLElement.prototype.contains;
	}

	// Certain modules have circular dependencies. If we were bundling a
	// module loader, e.g. almond.js, this wouldn't be a problem, but we're
	// not - we're using amdclean as part of the build process. Because of
	// this, we need to wait until all modules have loaded before those
	// circular dependencies can be required.
	while ( circular.length ) {
		circular.pop()();
	}

	return Ractive;

});