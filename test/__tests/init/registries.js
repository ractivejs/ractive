import registries from 'Ractive/config/registries';

module( 'Registries Config' );

test( 'has globally registered', function ( t ) {
	var ractive, foo = {};

	registries.forEach( r => {
		var target = r.useDefaults ? Ractive.defaults : Ractive;
		target[ r.name ].foo = foo;
	});

	ractive = new Ractive({});

	registries.forEach( r => {
		t.equal( ractive[ r.name ].foo, foo, r.name);
	});

	registries.forEach( r => {
		var target = r.useDefaults ? Ractive.defaults : Ractive;
		delete target[ r.name ] .foo;
	});
});
