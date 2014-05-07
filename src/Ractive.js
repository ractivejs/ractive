import Ractive from 'Ractive/_Ractive';
import circular from 'circular';
import 'legacy';

var FUNCTION = 'function';

// Certain modules have circular dependencies. If we were bundling a
// module loader, e.g. almond.js, this wouldn't be a problem, but we're
// not - we're using amdclean as part of the build process. Because of
// this, we need to wait until all modules have loaded before those
// circular dependencies can be required.
while ( circular.length ) {
	circular.pop()();
}

// Ractive.js makes liberal use of things like Array.prototype.indexOf. In
// older browsers, these are made available via a shim - here, we do a quick
// pre-flight check to make sure that either a) we're not in a shit browser,
// or b) we're using a Ractive-legacy.js build
if (
	typeof Date.now !== FUNCTION                 ||
	typeof String.prototype.trim !== FUNCTION    ||
	typeof Object.keys !== FUNCTION              ||
	typeof Array.prototype.indexOf !== FUNCTION  ||
	typeof Array.prototype.forEach !== FUNCTION  ||
	typeof Array.prototype.map !== FUNCTION      ||
	typeof Array.prototype.filter !== FUNCTION   ||
	( typeof window !== 'undefined' && typeof window.addEventListener !== FUNCTION )
) {
	throw new Error( 'It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.' );
}

// Internet Explorer derp. Methods that should be attached to Node.prototype
// are instead attached to HTMLElement.prototype, which means SVG elements
// can't use them. Remember kids, friends don't let friends use IE.
//
// This is here, rather than in legacy.js, because it affects IE9.
if ( typeof window !== 'undefined' && window.Node && !window.Node.prototype.contains && window.HTMLElement && window.HTMLElement.prototype.contains ) {
	window.Node.prototype.contains = window.HTMLElement.prototype.contains;
}

export default Ractive;
