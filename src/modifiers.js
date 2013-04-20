// A few default modifiers. Add additional modifiers to this list (e.g. 
// `Ractive.modifiers.uppercase = function ( s ) { return s.toUpperCase); }`)
// and they will become available to all Ractive instances
Ractive.modifiers = {
	equals:            function ( a, b ) { return a === b; },
	greaterThan:       function ( a, b ) { return a  >  b; },
	greaterThanEquals: function ( a, b ) { return a  >= b; },
	lessThan:          function ( a, b ) { return a  <  b; },
	lessThanEquals:    function ( a, b ) { return a  <= b; }
};