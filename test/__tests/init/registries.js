import registries from 'Ractive/config/registries';

module( 'Registries Config' );

test( 'has globally registered', function ( t ) {
	var ractive, foo = {};

	registries.forEach( r => {
		var target = r.useDefaults ? Ractive.defaults : Ractive;
		target[ r.name ].foo = foo;
	});

	// Special case - computation signature can't be an empty object
	Ractive.defaults.computed.foo = function () {};

	ractive = new Ractive({});

	registries.forEach( r => {
		t.equal( ractive[ r.name ].foo, ( r.useDefaults ? Ractive.defaults : Ractive )[ r.name ].foo , r.name );
	});

	registries.forEach( r => {
		var target = r.useDefaults ? Ractive.defaults : Ractive;
		delete target[ r.name ] .foo;
	});
});
